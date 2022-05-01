import { SafeDocumentClient } from "@/lib/clients/dynamo";
import { mock } from "vitest-mock-extended";

export const client = mock<SafeDocumentClient>();

// @ts-ignore
client.put.mockImplementation((params) => ({
  ...mock(),
  promise: () =>
    Promise.resolve({
      ...mock(),
      Attributes: params.Item,
    }),
}));

export type MockDynamoClient = typeof client;
