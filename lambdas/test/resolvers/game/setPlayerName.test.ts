import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { resolver as setPlayerName } from "@/src/resolvers/player/setPlayerName";
import {
  mockFulfilledUpdateRequest,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayerEntity,
  mockPlayerName,
  mockPlayerTokenEntity,
  mockTableName,
  mockToken,
} from "@/test/helpers";
import { mock } from "vitest-mock-extended";

vi.mock("@/lib/environment", () => ({
  environment: () => ({
    table: mockTableName,
  }),
}));

vi.mock("@/lib/clients/dynamo");

// @ts-ignore
const mockDynamoClient = dynamoClient as MockDynamoClient;

describe("setPlayerName handler", () => {
  it("should update the player name", async () => {
    mockGetResponsesForKeys([
      {
        key: {
          pk: `PLAYERTOKEN#${mockToken}`,
          sk: `PLAYERTOKEN#${mockToken}`,
        },
        item: mockPlayerTokenEntity,
      },
    ]);

    mockDynamoClient.update.mockReturnValue(mockFulfilledUpdateRequest(mockPlayerEntity));

    const player = await setPlayerName(
      {
        ...mock(),
        arguments: {
          playerToken: mockToken,
          name: mockPlayerName,
        },
      },
      mock(),
      mock()
    );

    expect(mockDynamoClient.update).toBeCalledWith(
      expect.objectContaining({
        TableName: mockTableName,
        Key: {
          pk: `PLAYER#${mockPlayer}`,
          sk: `PLAYER#${mockPlayer}`,
        },
        UpdateExpression: "SET #key = :playerName",
        ExpressionAttributeValues: {
          ":playerName": mockPlayerName,
        },
      })
    );

    expect(player).toEqual({
      id: mockPlayer,
      name: mockPlayerName,
    });
  });
});
