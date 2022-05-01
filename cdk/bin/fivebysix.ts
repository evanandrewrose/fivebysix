#!/usr/bin/env node
import { AppName } from "@lib/consts";
import { AppStack } from "@lib/stacks/app-stack";
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";

const app = new cdk.App();
new AppStack(app, `${AppName}Stack`, {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
});
