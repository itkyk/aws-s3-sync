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

3. Open `.env.tenolate`, then write AWS/S3 settings.

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