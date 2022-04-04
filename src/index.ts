#!/usr/bin/env node
import {Command} from "commander";
import init from "./createInitFile";
import syncS3 from "./syncS3";

const program = new Command();

program
  .option("-i, --init", "create setting file", false)
  .option("-d, --deploy [value]","sync s3")
program.parse(process.argv);

const option = program.opts();

if (option.init) {
  init();
} else if (option.deploy) {
  syncS3(option.deploy);
}