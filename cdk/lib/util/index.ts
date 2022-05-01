import * as path from "path";

const util = path.resolve(__dirname);
const lib = path.resolve(util, "..");
const cdk = path.resolve(lib, "..");
const root = path.resolve(cdk, "..");

const lambdas = path.resolve(root, "lambdas");
const lambdasSource = path.resolve(lambdas, "src");

export const api = path.resolve(root, "api");

export const paths = {
  api,
  lambdas,
  lambdasSource,
};
