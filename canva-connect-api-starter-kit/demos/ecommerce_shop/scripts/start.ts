#!/usr/bin/env node
import * as path from "path";
import * as dotenv from "dotenv";
// 直接从 ecommerce_shop 目录加载 .env（scripts/ 的上一级目录）
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { AppRunner } from "../../common/scripts/app-runner";
import { validateEnvironmentVariables } from "../../common/scripts/env";
import { Context } from "../../common/scripts/context";
import { buildConfig } from "../frontend/webpack.config";

const appRunner = new AppRunner();

validateEnvironmentVariables();

yargs(hideBin(process.argv))
  .version(false)
  .help()
  .command(
    "$0",
    "Starts local development",
    () => {},
    () => {
      const ctx = new Context(path.join(__dirname, ".."));
      appRunner.run(ctx, buildConfig);
    },
  )
  .parse();
