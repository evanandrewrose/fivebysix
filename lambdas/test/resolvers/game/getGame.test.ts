import { resolver as getGame } from "@/src/resolvers/game/getGame";
import {
  mockBatchGetResponsesForKeys,
  mockGameEntity,
  mockGameId,
  mockGetResponsesForKeys,
  mockPlayer,
  mockPlayer2,
  mockPlayer2Entity,
  mockPlayer2Name,
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

describe("getGame handler", () => {
  it("should return game info", async () => {
    mockGetResponsesForKeys([
      {
        key: {
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        item: mockGameEntity,
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

    const game = await getGame(
      {
        ...mock(),
        arguments: {
          gameId: mockGameId,
        },
      },
      mock(),
      mock()
    );

    expect(game).toEqual({
      host: mockPlayer,
      id: mockGameId,
      playerStates: [
        {
          guesses: [],
          player: {
            id: mockPlayer,
            name: mockPlayerName,
          },
          ready: false,
        },
      ],
      state: "WAITING",
    });
  });

  it("should return game info with player names joined", async () => {
    mockGetResponsesForKeys([
      {
        key: {
          pk: `GAME#${mockGameId}`,
          sk: `GAME#${mockGameId}`,
        },
        item: {
          ...mockGameEntity,
          players: {
            [mockPlayer]: {
              guesses: [],
            },
            [mockPlayer2]: {
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
          {
            pk: `PLAYER#${mockPlayer2}`,
            sk: `PLAYER#${mockPlayer2}`,
          },
        ],
        items: [mockPlayerEntity, mockPlayer2Entity],
      },
    ]);

    const game = await getGame(
      {
        ...mock(),
        info: {
          ...mock(),
          fieldName: "createGame",
        },
        arguments: {
          gameId: mockGameId,
        },
      },
      mock(),
      mock()
    );

    expect(game).toEqual({
      host: mockPlayer,
      id: mockGameId,
      playerStates: [
        {
          guesses: [],
          player: {
            id: mockPlayer,
            name: mockPlayerName,
          },
          ready: false,
        },
        {
          guesses: [],
          player: {
            id: mockPlayer2,
            name: mockPlayer2Name,
          },
          ready: false,
        },
      ],
      state: "WAITING",
    });
  });
});
