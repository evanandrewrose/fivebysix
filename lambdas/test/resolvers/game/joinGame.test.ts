import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { resolver as joinGame } from "@/src/resolvers/game/joinGame";
import {
  mockBatchGetResponsesForKeys,
  mockFulfilledUpdateRequest,
  mockGameEntity,
  mockGameId,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayer2,
  mockPlayer2Entity,
  mockPlayer2TokenEntity,
  mockPlayerEntity,
  mockPlayerTokenEntity,
  mockTableName,
  mockToken,
  mockToken2,
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

describe("joinGame handler", () => {
  it("should add player to game", async () => {
    const updatedGameEntity = {
      ...mockGameEntity,
      players: {
        [mockPlayer]: {
          guesses: [],
        },
        [mockPlayer2]: {
          guesses: [],
        },
      },
    };

    mockGetResponsesForKeys([
      {
        key: {
          pk: `PLAYERTOKEN#${mockToken}`,
          sk: `PLAYERTOKEN#${mockToken}`,
        },
        item: mockPlayerTokenEntity,
      },
      {
        key: {
          pk: `PLAYERTOKEN#${mockToken2}`,
          sk: `PLAYERTOKEN#${mockToken2}`,
        },
        item: mockPlayer2TokenEntity,
      },
      {
        key: {
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        item: updatedGameEntity,
      },
    ]);

    mockBatchGetResponsesForKeys([
      {
        keys: [
          {
            pk: `PLAYER#${mockPlayer}`,
            sk: `PLAYER#${mockPlayer}`,
          },
          {
            pk: `PLAYER#${mockPlayer2}`,
            sk: `PLAYER#${mockPlayer2}`,
          },
        ],
        items: [mockPlayerEntity, mockPlayer2Entity],
      },
    ]);

    mockDynamoClient.update.mockReturnValueOnce(mockFulfilledUpdateRequest(updatedGameEntity));

    await joinGame(
      {
        ...mock(),
        arguments: {
          playerToken: mockToken2,
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
        UpdateExpression: `SET players.#player = :initialPlayer`,
        ExpressionAttributeNames: {
          "#player": mockPlayer2,
        },
      })
    );
  });
});
