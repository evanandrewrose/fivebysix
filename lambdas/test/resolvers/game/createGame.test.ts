import { resolver as createGame } from "@/src/resolvers/game/createGame";
import {
  mockBatchGetResponsesForKeys,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayerEntity,
  mockPlayerTokenEntity,
  mockRandomWord,
  mockTableName,
  mockToken,
  mockUUIDv4,
} from "@/test/helpers";
import { client as dynamoClient } from "@/lib/clients/dynamo";
import { mock } from "vitest-mock-extended";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";

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

vi.setSystemTime(new Date(0));

// @ts-ignore
const mockDynamoClient = dynamoClient as MockDynamoClient;

describe("createGame handler", () => {
  it("should create a new game with the creator already in", async () => {
    mockGetResponsesForKeys([
      {
        key: {
          pk: `PLAYERTOKEN#${mockToken}`,
          sk: `PLAYERTOKEN#${mockToken}`,
        },
        item: mockPlayerTokenEntity,
      },
    ]);

    mockBatchGetResponsesForKeys([
      {
        keys: [
          {
            pk: `PLAYER#${mockPlayer}`,
            sk: `PLAYER#${mockPlayer}`,
          },
        ],
        items: [mockPlayerEntity],
      },
    ]);

    await createGame(
      {
        ...mock(),
        arguments: {
          playerToken: "mockToken",
        },
      },
      mock(),
      mock()
    );

    expect(mockDynamoClient.get).toHaveBeenCalledWith({
      TableName: mockTableName,
      Key: {
        pk: `PLAYERTOKEN#${mockToken}`,
        sk: `PLAYERTOKEN#${mockToken}`,
      },
    });

    const gameKey = `GAME#${mockUUIDv4}`;

    expect(mockDynamoClient.put).toHaveBeenCalledWith({
      TableName: mockTableName,
      ConditionExpression: "pk <> :newId",
      ExpressionAttributeValues: {
        ":newId": "GAME#mockUUIDv4",
      },
      Item: {
        host: mockPlayer,
        id: mockUUIDv4,
        readyPlayerIds: [],
        pk: gameKey,
        sk: gameKey,
        word: mockRandomWord,
        ttl: 60 * 60 * 24,
        players: {
          [mockPlayer]: {
            guesses: [],
            ready: false,
          },
        },
      },
    });
  });
});
