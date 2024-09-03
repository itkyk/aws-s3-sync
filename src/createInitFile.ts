import fs from "fs";

const createEnv = () => {
  if (!fs.existsSync(`./s3`)) {
    fs.mkdirSync(`./s3`);
  }
}

const templateEnvFile = () => {
  const envFile = [
    "accessKeyId=\"\"",
    "secretAccessKey=\"\"",
    "localRoot=\"\"",
    "deleteRemote=\"true\"",
    "bucket=\"\""
  ]
  fs.writeFile("./s3/.env.template", envFile.join("\n"), (err: any) => {
    if (err) {
      console.log(err);
    } else {
      console.log("create template env file");
    }
  })
}

const init = () => {
  createEnv();
  templateEnvFile();
}

export default init;