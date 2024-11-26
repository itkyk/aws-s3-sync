import {S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import type {_Object} from "@aws-sdk/client-s3";
import type {Option} from "../index.js";
import {log} from "../index.js";
import * as glob from "glob";
import type {IgnoreLike} from "glob";
import path from "path";
import fs, {type Stats} from "fs";
import mime from "mime-types";

type LocalFile = {[filename: string]: {stat: Stats, skip: boolean, fullPath: string}};
type RemoteFile = {[filename: string]: _Object};


const getRemoteFiles = async(client: S3Client, bucketName: string) => {
  let continuationToken: {
    ContinuationToken?: string
  } = {ContinuationToken: undefined};
  let ResultContents: _Object[] = [];
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ...continuationToken,
    });
    const response = await client.send(command);
    continuationToken.ContinuationToken = response.NextContinuationToken;
    ResultContents = ResultContents.concat(response.Contents || []);
  } while (continuationToken.ContinuationToken)
  if (ResultContents) {
    return ResultContents.reduce((mem, item) => {
      if (item.Key) {
        mem[item.Key] = item;
      }
      return  mem;
    }, {} as RemoteFile)
  } else {
    return  {} as RemoteFile;
  }
}

const getLocalFiles = (localTarget: string, pattern: string | string[], ignore?: string | string[] | IgnoreLike) => {
  return glob.sync(pattern, {
    nodir: true,
    cwd: path.resolve(localTarget),
    ignore: ignore
  }).reduce((mem, item) => {
    mem[item] = {
      stat: fs.statSync(path.join(localTarget, item)),
      skip: false,
      fullPath: path.resolve(localTarget, item)
    };
    return mem;
  }, {} as LocalFile)
}

const getDeleteList = (localFiles: LocalFile, remoteFiles: RemoteFile) => {
  const deleteTargets: RemoteFile = {};
  for (const [key, item] of Object.entries(remoteFiles)) {
    if (!item.Key) continue;
    if (!Object.keys(localFiles).includes(item.Key)) {
      deleteTargets[key] = item;
    }
  }
  return deleteTargets;
};

const checkUpdateList = (localFiles: LocalFile, remoteFiles: RemoteFile) => {
  const keys = Object.keys(localFiles);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!remoteFiles[key]) {
      continue
    };
    if (localFiles[key].stat.size === remoteFiles[key].Size) {
      localFiles[key].skip = true
    }
  }
}

const deleteFiles = async(client: S3Client, deleteTargets: RemoteFile, bucketName: string) => {
  const deletes = Object.entries(deleteTargets).map(([key, item]) => {
    return new Promise(resolve => {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: item.Key
      });
      client.send(command).then(() => {
        log.push(`delete file(${new Date().toISOString()}): s3://${bucketName}/${item.Key}`);
        resolve(null);
      });
    });
  });
  await Promise.all(deletes);
}

const chunkArray = <T extends object>(obj: T, size: number): T[] => {
  const keys = Object.keys(obj) as (keyof T)[];
  const result: T[] = [];
  for (let i = 0; i < keys.length; i += size) {
    const splitKeys = keys.slice(i, i + size);
    const tempObj = {} as T;
    for (const key of splitKeys) {
      tempObj[key] = obj[key];
    }
    result.push(tempObj);
  }
  return result;
}


const uploadFiles = async(client: S3Client, uploadTargets: LocalFile[], bucketName: string, index: number = 0) => {
  const uploads = Object.entries(uploadTargets[index]).map(([key, item]) => {
    return new Promise((resolve, reject) => {
      if (!item.skip) {
        const fileContent = fs.readFileSync(item.fullPath);
        try {
          const type = mime.lookup(item.fullPath);
          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: type || ""
          });
          client.send(command).then(() => {
            log.push(`upload file(${new Date().toISOString()}): ${item.fullPath} -> s3://${bucketName}/${key}`);
            resolve(null);
          });
        } catch (e) {
          reject(e);
        }
      } else {
        log.push(`skip upload file(${new Date().toISOString()}): ${item.fullPath} -> s3://${bucketName}/${key}`);
      }
    })
  });
  await Promise.all(uploads);
  if (index < uploadTargets.length -1 ) {
    await uploadFiles(client, uploadTargets, bucketName, index+1);
  }
}

const syncS3 = async (options: Option) => {
  try {
    // S3Client作成
    const client = new S3Client(options.configure);
    // リモートファイルのデータを全て取得
    const remoteFiles = await getRemoteFiles(client, options.bucketName) || [];
    // targetのローカルファイルを全て取得
    const localFiles = getLocalFiles(options.localTarget, options.includes || "**/*", options.excludes);

    // forceじゃなかったらチェックする
    if (!options.force) {
      checkUpdateList(localFiles, remoteFiles);
    }

    if (options.sync) {
      // localに存在していないファイルをリストアップ
      const deleteTargets = getDeleteList(localFiles, remoteFiles);

      if (Object.keys(deleteTargets).length !== 0) {
        await deleteFiles(client, deleteTargets, options.bucketName);
      }
    }
    const splitChunk = chunkArray(localFiles, options.maxAsyncS3 || 30);
    await uploadFiles(client, splitChunk, options.bucketName);
    if (options.outputLog) {
      const date = new Date();
      const fileLogDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}-${date.getHours().toString().padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}-${date.getSeconds().toString().padStart(2, "0")}`
      const dir = typeof options.outputLog === "boolean" ? path.resolve("./.s3") : "outDir" in options.outputLog ? path.resolve(options.outputLog.outDir!) : path.resolve("./.s3");
      const filename = typeof options.outputLog === "boolean" ? `log-${fileLogDate}.json` : "filename" in options.outputLog ? options.outputLog.filename! : `log-${fileLogDate}.json`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
      }
      fs.writeFileSync(path.join(dir, filename), log.join(",\n"));
      console.log("put logfile -> "+ path.join(dir, filename));
    }
  } catch (e) {
    console.log(e);
  }
}

export default syncS3;