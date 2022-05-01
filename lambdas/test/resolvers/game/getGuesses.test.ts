import { resolver as getGuesses } from "@/src/resolvers/game/getGuesses";
import {
  mockGameEntity,
  mockGameId,
  mockGetResponsesForKeys,
  mockPlayer,
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

describe("getGuesses handler", () => {
  it("should return a player's previous guesses analyzed", async () => {
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
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        item: {
          ...mockGameEntity,
          word: "wages",
          players: {
            [mockPlayer]: {
              guesses: ["cupid", "gases"],
            },
          },
        },
      },
    ]);

    const guesses = await getGuesses(
      {
        ...mock(),
        arguments: {
          gameId: mockGameId,
          playerToken: mockToken,
        },
      },
      mock(),
      mock()
    );

    expect(guesses).toEqual([
      {
        characters: [
          {
            character: "c",
            result: "INCORRECT",
          },
          {
            character: "u",
            result: "INCORRECT",
          },
          {
            character: "p",
            result: "INCORRECT",
          },
          {
            character: "i",
            result: "INCORRECT",
          },
          {
            character: "d",
            result: "INCORRECT",
          },
        ],
      },
      {
        characters: [
          {
            character: "g",
            result: "DISPLACED",
          },
          {
            character: "a",
            result: "CORRECT",
          },
          {
            character: "s",
            result: "INCORRECT",
          },
          {
            character: "e",
            result: "CORRECT",
          },
          {
            character: "s",
            result: "CORRECT",
          },
        ],
      },
    ]);
  });
});
