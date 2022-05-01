import { Entity } from "@/lib/controller/dynamo/model";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { TypeSafeDocumentClientV2 } from "typesafe-dynamodb/lib/document-client-v2";

export type SafeDocumentClient = TypeSafeDocumentClientV2<Entity, "pk", "sk">;

export const client = new DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
}) as SafeDocumentClient;
