import { AWSError } from "aws-sdk";
import { BatchGetItemOutput, GetItemOutput, PutItemOutput } from "aws-sdk/clients/dynamodb";
import { PromiseResult } from "aws-sdk/lib/request";

type TypedGetItemOutput<T> = Omit<GetItemOutput, "Item"> & {
  Item: T;
};

export const unwrapGetResult = <T>(
  result: PromiseResult<GetItemOutput, AWSError>
): TypedGetItemOutput<T> => ({
  ...result,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Item: result.Item as any as T,
});

type TypedBatchGetItemOutput<T> = Omit<BatchGetItemOutput, "Responses"> & {
  Responses: Record<string, Array<T>>;
};

export const unwrapGetBatchResult = <T>(
  result: PromiseResult<BatchGetItemOutput, AWSError>
): TypedBatchGetItemOutput<T> => ({
  ...result,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Responses: result.Responses as any as Record<string, Array<T>>,
});

type TypedPutItemOutput<T> = Omit<PutItemOutput, "Attributes"> & {
  Attributes: T;
};

export const unwrapPutResult = <T>(
  result: PromiseResult<PutItemOutput, AWSError>
): TypedPutItemOutput<T> => ({
  ...result,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Attributes: result.Attributes as any as T,
});
