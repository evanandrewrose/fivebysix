import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { resolver as createPlayer } from "@/src/resolvers/player/createPlayer";
import { mockRandomWord, mockTableName } from "@/test/helpers";
import { mock } from "vitest-mock-extended";

vi.mock("@/lib/environment", () => ({
  environment: () => ({
    table: mockTableName,
  }),
}));

vi.mock("lib/word/random", () => ({
  randomWord: () => mockRandomWord,
}));

vi.mock("uuid", () => ({
  v4: () => "mockUUIDv4",
}));

vi.mock("@/lib/clients/dynamo");

// @ts-ignore
const mockDynamoClient = dynamoClient as MockDynamoClient;

describe("createPlayer handler", () => {
  it("should create new player and token entries", async () => {
    mockDynamoClient.batchWrite.mockReturnValue(mock());

    await createPlayer(
      {
        ...mock(),
      },
      mock(),
      mock()
    );

    expect(mockDynamoClient.batchWrite).toHaveBeenCalledWith({
      RequestItems: {
        mockTableName: [
          {
            PutRequest: {
              Item: {
                id: "mockUUIDv4",
                pk: "PLAYER#mockUUIDv4",
                sk: "PLAYER#mockUUIDv4",
                token: "mockUUIDv4",
              },
            },
          },
          {
            PutRequest: {
              Item: {
                pk: "PLAYERTOKEN#mockUUIDv4",
                player: "mockUUIDv4",
                sk: "PLAYERTOKEN#mockUUIDv4",
                token: "mockUUIDv4",
              },
            },
          },
        ],
      },
    });
  });
});
