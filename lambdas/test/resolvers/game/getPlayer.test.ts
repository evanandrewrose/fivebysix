import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { resolver as getPlayer } from "@/src/resolvers/player/getPlayer";
import {
  mockFulfilledGetRequest,
  mockPlayer,
  mockPlayerEntity,
  mockPlayerName,
  mockTableName,
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

describe("getPlayer handler", () => {
  it("should create new player and token entries", async () => {
    mockDynamoClient.get.mockReturnValue(mockFulfilledGetRequest(mockPlayerEntity));

    const player = await getPlayer(
      {
        ...mock(),
        arguments: {
          playerId: mockPlayer,
        },
      },
      mock(),
      mock()
    );

    expect(player).toEqual({
      id: mockPlayer,
      name: mockPlayerName,
    });
  });
});
