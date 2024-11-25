#!/usr/bin/env node
"use strict"

import {S3ClientConfig} from "@aws-sdk/client-s3/dist-types/S3Client";
import {CloudFrontClientConfig} from "@aws-sdk/client-cloudfront/dist-types/CloudFrontClient";
import syncS3 from "./utils/s3.js";
import deleteInvalidation from "./utils/cloudfront.js";
import {getConfig} from "./utils/getConfig";
import {Command} from "commander";
import {createConfigTemplate} from "./utils/initializeConfig";

interface CommandOption {
  deploy: string;
  init: boolean;
}

const program = new Command();

program
  .option("-d, --deploy <value>", "deployment target", "")
  .option("-i --init", "create config file.", "");

program.parse();

const opts = program.opts() as CommandOption;


export const log: string[]  = new Proxy([], {
  set(target: string[], p: string | symbol, newValue: any, receiver: any): boolean {
    if (typeof newValue === "string") {
      console.log(newValue)
    }
    return Reflect.set(target, p, newValue, receiver);
  }
});

export interface CacheOption {
  distributionId: string,
  paths: string[]
}


export interface Option {
  configure: S3ClientConfig & CloudFrontClientConfig,
  localTarget: string;
  bucketName: string;
  includes?: string;
  maxAsyncS3?: number;
  sync?: boolean;
  outputLog?: boolean  | {
    outDir?: string;
    filename?: string;
  },
  clearCache?: CacheOption
}


(async() => {
  const {deploy, init} = opts;
  if (init) {
    createConfigTemplate();
  } else if (deploy) {
    const config = await getConfig(deploy);
    await syncS3(config)
    if (config.clearCache) {
      await deleteInvalidation(config.clearCache);
    }
  } else {
    log.push("Please set and rerun `--deploy` OR `--init` option.")
  }
})();