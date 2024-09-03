import AWS from "aws-sdk";
import dotenv from "dotenv";

const createInvalidation = (DistributionId: string, cloudFront: AWS.CloudFront, items: Array<string>):Promise< AWS.CloudFront.CreateInvalidationResult> => {
  const params: AWS.CloudFront.CreateInvalidationRequest = {
    DistributionId: DistributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: items.length,
        Items: items
      }
    }
  }
  return new Promise((resolve, reject) => {
    cloudFront.createInvalidation(params, (err, data)=>{
      if(err){
        reject(err)
      }else{
        resolve(data)
      }
    })
  })
}

const clearCache = (env: dotenv.DotenvParseOutput) => {
  const cloudFront = new AWS.CloudFront({
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
    region: env.region,
  });
  const items = env.distributionPaths ? env.distributionPaths.split(",") : ["/*"];

  createInvalidation(env.distributionID, cloudFront, items).then().catch((err)=>{
    console.log(err)
  })
}

export default clearCache;