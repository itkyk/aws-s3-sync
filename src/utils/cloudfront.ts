import {CloudFront, CreateInvalidationCommand} from "@aws-sdk/client-cloudfront";
import {CacheOption} from "../index.js";
import {log} from "../index.js";


const deleteInvalidation = async(cacheOption: CacheOption) => {
  const client = new CloudFront();
  const command = new CreateInvalidationCommand({
    DistributionId: cacheOption.distributionId,
    InvalidationBatch: {
      CallerReference: `invalidate-${Date.now()}`,
      Paths: {
        Quantity: cacheOption.paths.length,
        Items: cacheOption.paths
      }
    }
  });
  await client.send(command);
  log.push(`delete invalidation: ${cacheOption.distributionId}(${cacheOption.paths.join(",")})`)
}


export default deleteInvalidation;