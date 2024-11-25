import fs from "fs";
import path from "path";

export const createConfigTemplate = () => {
  const template = `import { defineConfig } from "@itkyk/aws-s3-sync/config";
export default defineConfig({
  example: {}
})
  `
  fs.writeFileSync(path.resolve("./s3.config.ts"), template, "utf-8");
}