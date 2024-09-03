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

2. Execute init command.<br/>This command makes `.env.template` in `./s3`.
```shell
$ npm run init
```

3. Open `.env.template`, then write AWS/S3 settings.

4. Rename `.env.template` from `.template` to target name.<br/> ex) .env.template → .env.preview
5. Add deploy command to script in package.json<br/>The location of "preview" will be the name you changed from template earlier.
```json
{
  "script": {
      "init": "sync --init",
      "deploy": "sync --deploy preview"
  }
}
```
6. If execute `npm run deploy`, sync s3 bucket.


## setting env
| key | description | default | 
|------|---------|-----------|
| maxAsyncS3 | | 30 |
| s3RetryCount | | 3 |
| s3RetryDelay | | 1000 |
| multipartUploadThreshold | | 20971520 |
| multipartUploadSize | | 15728640 |
| region | | ap-northeast-1 |
| accessKeyId | Your IAM access key | none |
| secretAccessKey | Your IAM secret access key | none(required) |
| localRoot | Target directory to upload |none(required) | 
| deleteRemote | Whether to delete unnecessary files in bucket when uploading. | false |
| bucket | Yout S3 Bucket Name | none(required) |
| prefix | Your Bucket prefix path | none(not required) |
| distributionID | Your CloudFront distribution ID.<br/>If set distributionID, when finished S3 sync, create invalidation. | none(not required) |
| distributionPaths | When create invalidation, set object path from this param .<br/>If need two or more paths, please put `,` between path. | /* |