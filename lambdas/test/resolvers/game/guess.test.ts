import { resolver as guess } from "@/src/resolvers/game/guess";
import {
  mockBatchGetResponsesForKeys,
  mockGameEntity,
  mockGameId,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayerEntity,
  mockPlayerTokenEntity,
  mockTableName,
  mockToken,
  mockUpdateResponsesForKeys,
} from "@/test/helpers";
import { mock } from "vitest-mock-extended";

vi.mock("@/lib/environment", () => ({
  environment: () => ({
    table: mockTableName,
  }),
}));

vi.mock("@/lib/clients/dynamo");
vi.mock("@/lib/clients/appsync");

describe("guess handler", () => {
  it("should return the user's guess evaluated", async () => {
    mockGetResponsesForKeys([
      {
        key: {
          pk: `PLAYERTOKEN#${mockToken}`,
          sk: `PLAYERTOKEN#${mockToken}`,
        },
        item: mockPlayerTokenEntity,
      },
    ]);

    mockUpdateResponsesForKeys([
      {
        key: {
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        item: {
          ...mockGameEntity,
          word: "share",
          players: {
            [mockPlayer]: {
              guesses: [],
            },
          },
        },
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

    const response = await guess(
      {
        ...mock(),
        arguments: {
          gameId: mockGameId,
          playerToken: mockToken,
          word: "pride",
        },
      },
      mock(),
      mock()
    );

    expect(response).toEqual({
      characters: [
        {
          character: "p",
          result: "INCORRECT",
        },
        {
          character: "r",
          result: "DISPLACED",
        },
        {
          character: "i",
          result: "INCORRECT",
        },
        {
          character: "d",
          result: "INCORRECT",
        },
        {
          character: "e",
          result: "CORRECT",
        },
      ],
    });
  });
});
