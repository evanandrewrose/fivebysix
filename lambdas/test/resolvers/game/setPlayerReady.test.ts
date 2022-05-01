import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { resolver as setPlayerReady } from "@/src/resolvers/game/setPlayerReady";
import {
  mockBatchGetResponsesForKeys,
  mockFulfilledUpdateRequest,
  mockGameEntity,
  mockGameId,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayerEntity,
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
vi.mock("@/lib/clients/appsync");

// @ts-ignore
const mockDynamoClient = dynamoClient as MockDynamoClient;

describe("setPlayerReady handler", () => {
  it("should set the player to ready", async () => {
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

    mockDynamoClient.update.mockReturnValue(mockFulfilledUpdateRequest(mockGameEntity));

    await setPlayerReady(
      {
        ...mock(),
        arguments: {
          playerToken: mockToken,
          gameId: mockGameId,
        },
      },
      mock(),
      mock()
    );

    expect(mockDynamoClient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: mockTableName,
        Key: {
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        UpdateExpression: "SET #readyPlayerIds = list_append(#readyPlayerIds, :playerList)",
        ExpressionAttributeNames: {
          "#player": mockPlayer,
          "#readyPlayerIds": "readyPlayerIds",
        },
      })
    );
  });
});
