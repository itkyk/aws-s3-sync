# @itkyk/aws-s3-sync


## install
```shell
$ npm i -D @itkyk/aws-s3-sync
```

## Introduce
1. Add init command to script in package.json.

```json
{
  "script": {
    "init": "sync --init"
  }
}
```

2. Execute init command.<br/>This command makes `s3.config.ts` in `root`.
```shell
$ npm run init
```

3. Open `s3.config.ts`, then write AWS/S3 settings.

4. Add deploy command to script in package.json<br/>The location of "preview" will be the name you changed from template earlier.
```json
{
  "script": {
      "deploy": "sync --deploy example"
  }
}
```
6. If execute `npm run deploy`, sync s3 bucket.


## setting options
| key                       | description                                                                                                             | default                      | 
|---------------------------|-------------------------------------------------------------------------------------------------------------------------|------------------------------|
| configure                 | `AWS.S3ClientConfig` & `AWS.CloudFrontClientConfig` settings.                                                           |                              |
| localTarget               | Dir name of traget local files.                                                                                         |                              |
| bucketName                | Name of Target Bucket.                                                                                                  |                              |
| includes                  | Glob pattern of `localTarget`.                                                                                          | `/**/*`                      |
| maxAsyncS3                |                                                                                                                         | 30                           |
| sync                      | Delete file when syncing.                                                                                               | false                        |
| outputLog                 | Log file settings.(`boolean` OR `{outDir: string, filename?: string}`)                                                  | false                        |
| outputLog.outDir          | Output log file directory.                                                                                              | `./s3`                       | 
| outputLog.filename        | Output log filename.                                                                                                    | `log-[yy-mm-dd-hh-mm-ss].json` | 
| clearCache.distributionId | Target CloudFront distoributionId.                                                                                      |                         |
| clearCache.paths               | distoribution paths.`string[]`                                                                                          |                |
