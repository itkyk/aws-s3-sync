import * as path from "node:path";
import * as fs from "node:fs";
import type {Option} from "../index";
import esbuild from "esbuild";
import * as process from "node:process";

export const OUT_CONFIG_DIR = path.resolve("./node_modules/.aws-s3-sync/");
export const CONFIG_PATH = [
  path.resolve("./s3.config.ts"),
  path.resolve("./s3.config.mts"),
  path.resolve("./s3.config.js"),
  path.resolve("./s3.config.mjs")
];

const compileConfig = async(configPath: string, outDir: string) => {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, {recursive: true});
  }
  await esbuild.build({
    entryPoints: [configPath],
    outdir: outDir,
    bundle: true,
    write: true,
    format: "cjs",
    platform: "node",
    outExtension: {".js": ".cjs"}
  });
}


const checkError = (config: {[key: string]: Option}, key: string) => {
  if (!(key in config)) {
    console.error(`Cannot find option: ${key}`);
    process.exit(1);
  }
}

export const getConfig = async(target: string): Promise<Option> => {
  const configFile = CONFIG_PATH.filter((item) => fs.existsSync(item))[0];
  if (!configFile) {
    console.error("Cannot find config file.\nPlease run `s3Sync --init`");
    process.exit(1);
  }
  if ([".js", ".mjs"].includes(path.extname(configFile))) {
    const config = await import(configFile);
    checkError(config, target);
    return config[target];
  } else {
    await compileConfig(configFile, OUT_CONFIG_DIR);
    const {default: config} = (await import(path.join(OUT_CONFIG_DIR, "s3.config.cjs")));
    checkError(config, target);
    return config[target];
  }
}