import s3 from "s3";
import dotenv from "dotenv";
import deepMerge from "deepmerge";
import fs from "fs-extra";
import path from "path";
import {isPlainObject} from "is-plain-object";
import clearCache from "./clearCache"
import Util from "./Util";

export interface paramsInterface {
  localDir: string;
  deleteRemoved: boolean;
  s3Params: {
    Bucket: string;
    Prefix: string;
  }
}

export interface clientInterface {
  maxAsyncS3: number;
  s3RetryCount: number;
  s3RetryDelay: number;
  multipartUploadThreshold: number;
  multipartUploadSize: number;
  s3Options: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    sslEnabled?: boolean;
  }
}

const syncS3 = (envPath:string) => {
  const env = dotenv.config({
    path: `./s3/.env.${envPath}`
  }).parsed;

  const createClient = (clientParams: clientInterface, params: paramsInterface) => {
    const client = s3.createClient(clientParams);
    const uploader = client.uploadDir(params);
    return uploader;
  }

  const uploadLog = (uploader: any, cb: ()=>void = ()=>{}) => {
    const log: Array<Record<string, string>> = [];
    let uploadFilesTotalCount = 0;
    let finishFilesTotalCount = 0;
    uploader.on("fileUploadStart", (localFilePath: any, s3Key: any) => {
      uploadFilesTotalCount++;
    })
    uploader.on("fileUploadEnd", (localFilePath: any, s3Key: any) => {
      const date = new Date();
      log.push({
        local: localFilePath,
        remote: s3Key,
        date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      })
      finishFilesTotalCount++;
      if (finishFilesTotalCount === uploadFilesTotalCount) {
        const logData = []
        for (const detail of log) {
          logData.push(`local: ${detail.local}, remote: ${detail.remote}, date: ${detail.date}`);
        }
        fs.writeFileSync(path.resolve(`./s3/upload-${envPath}.log`), logData.join("\n"))
        console.table(log);
        cb();
      }
    })
    uploader.on("error", (err: any) => {
      console.error("unable to sync:", err.stack);
    })
  }

  if (env) {
    // create unique options from .env
    const envOption = {
      ...env.maxAsyncS3 ? {maxAsyncS3: Number(env.maxAsyncS3)} : {},
      ...env.s3RetryCount ? {s3RetryCount: Number(env.s3RetryCount)} : {},
      ...env.s3RetryDelay ? {s3RetryDelay: Number(env.s3RetryDelay)} : {},
      ...env.multipartUploadThreshold ? {multipartUploadThreshold: Number(env.multipartUploadThreshold)} : {},
      ...env.multipartUploadSize ? {multipartUploadSize: Number(env.multipartUploadSize)} : {},
      s3Options: {
        ...env.region ? {region: env.region} : {},
        accessKeyId: env.accessKeyId,
        secretAccessKey: env.secretAccessKey,
        ...env.endpoint ? {endpoint: env.endpoint} : {},
        ...env.sslEnabled ? {sslEnabled: env.sslEnabled === "ture" ? true : false} : {},
      }
    }

    // default options
    const defaultOptions = {
      maxAsyncS3: 20,
      s3RetryCount: 3,
      s3RetryDelay: 1000,
      multipartUploadThreshold: 20971520,
      multipartUploadSize: 15728640,
      s3Options: {
        region: 'ap-northeast-1',
      }
    }

    // create merged options from default to unique
    const s3Options = deepMerge(defaultOptions, envOption, {
      isMergeableObject: isPlainObject
    })

    // create upload option from env
    const params = {
      localDir: env.localRoot,
      deleteRemoved: env.deleteRemote === "true" ? true : false,
      s3Params: {
        Bucket: env.bucket,
        ...env.prefix ? {Prefix: env.prefix} : {}
      }
    }

    // default upload option
    const defaultParams = {
      deleteRemoved: false,
      s3Params: {
        Prefix: ""
      }
    }

    // create upload option from default to unique
    const mergedParams = deepMerge(defaultParams, params, {
      isMergeableObject: isPlainObject
    })


    // create uploader
    const uploader = createClient(s3Options, mergedParams);
    if (env.distributionID) {
      uploadLog(uploader, () => {
        clearCache(env);
      });
    } else {
      uploadLog(uploader);
    }
  } else {
    Util.logRed("Cannot found .env file");
  }
}

export default syncS3;