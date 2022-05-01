import { client as dynamoClient } from "@/lib/clients/dynamo";
import { MockDynamoClient } from "@/lib/clients/dynamo/__mocks__";
import { Entity, GameEntity, PlayerEntity, PlayerTokenEntity } from "@/lib/controller/dynamo/model";
import { mock } from "vitest-mock-extended";

export const mockPlayer = "mockPlayer";
export const mockPlayer2 = "mockPlayer2";
export const mockPlayerName = "mockName";
export const mockPlayer2Name = "mock2Name";
export const mockToken = "mockToken";
export const mockToken2 = "mockToken2";
export const mockTableName = "mockTableName";
export const mockRandomWord = "mockRandomWord";
export const mockUUIDv4 = "mockUUIDv4";
export const mockGameId = "mockGameId";

type EntityKeys = Pick<Entity, "pk" | "sk">;

vi.mock("@/lib/clients/dynamo");

const mockDynamoClient = dynamoClient as MockDynamoClient;

export const mockFulfilledPutRequest = (
  item: Entity
): ReturnType<typeof mockDynamoClient["put"]> => ({
  ...mock(),
  promise: () =>
    Promise.resolve({
      ...mock(),
      Attributes: {
        ...mock(),
        ...item,
      },
    }),
});

export const mockFulfilledGetRequest = (
  item: Entity
): ReturnType<typeof mockDynamoClient["get"]> => ({
  ...mock(),
  promise: () =>
    Promise.resolve({
      ...mock(),
      Item: {
        ...mock(),
        ...item,
      },
    }),
});

export const mockFulfilledUpdateRequest = (
  item: Entity
): ReturnType<typeof mockDynamoClient["update"]> => ({
  ...mock(),
  promise: () =>
    Promise.resolve({
      ...mock(),
      Attributes: item,
    }),
});

export const mockFulfilledBatchGetRequest = (
  items: Entity[]
): ReturnType<typeof mockDynamoClient["batchGet"]> => ({
  ...mock(),
  promise: () =>
    Promise.resolve({
      ...mock(),
      Responses: {
        [mockTableName]: items.map((item) => ({
          ...mock(),
          ...item,
        })),
      },
    }),
});

export const mockGetResponsesForKeys = (mapping: { key: EntityKeys; item: Entity }[]) => {
  mockDynamoClient.get.mockImplementation((params) => {
    for (const entry of mapping) {
      const { key, item } = entry;
      if (JSON.stringify(key) === JSON.stringify(params.Key)) {
        return mockFulfilledGetRequest(item);
      }
    }

    throw new Error(`No mock mapping found for ${JSON.stringify(params.Key)}.`);
  });
};

export const mockPutResponsesForItem = (mapping: { inputItem: Entity; outputItem: Entity }[]) => {
  mockDynamoClient.put.mockImplementation((params) => {
    for (const entry of mapping) {
      const { inputItem, outputItem } = entry;
      if (JSON.stringify(inputItem) === JSON.stringify(params.Item)) {
        return mockFulfilledPutRequest(outputItem);
      }
    }

    throw new Error(`No mock mapping found for ${JSON.stringify(params.Item)}.`);
  });
};

export const mockUpdateResponsesForKeys = (mapping: { key: EntityKeys; item: Entity }[]) => {
  mockDynamoClient.update.mockImplementation((params) => {
    for (const entry of mapping) {
      const { key, item } = entry;
      if (JSON.stringify(key) === JSON.stringify(params.Key)) {
        return mockFulfilledUpdateRequest(item);
      }
    }

    throw new Error(`No mock mapping found for ${JSON.stringify(params.Key)}.`);
  });
};

export const mockBatchGetResponsesForKeys = (
  mapping: { keys: EntityKeys[]; items: Entity[] }[]
) => {
  mockDynamoClient.batchGet.mockImplementation((params) => {
    for (const entry of mapping) {
      const { keys, items } = entry;
      if (JSON.stringify(keys) === JSON.stringify(params.RequestItems[mockTableName]["Keys"])) {
        return mockFulfilledBatchGetRequest(items);
      }
    }

    throw new Error(
      `No mock mapping found for ${JSON.stringify(params.RequestItems[mockTableName]["Keys"])}.`
    );
  });
};

export const mockPlayerTokenEntity: PlayerTokenEntity = {
  pk: `PLAYERTOKEN#${mockToken}`,
  sk: `PLAYERTOKEN#${mockToken}`,
  player: mockPlayer,
  token: mockToken,
};

export const mockPlayer2TokenEntity: PlayerTokenEntity = {
  pk: `PLAYERTOKEN#${mockToken2}`,
  sk: `PLAYERTOKEN#${mockToken2}`,
  player: mockPlayer2,
  token: mockToken2,
};

export const mockGameEntity: GameEntity = {
  pk: `GAME#${mockGameId}`,
  sk: `GAME#${mockGameId}`,
  host: mockPlayer,
  id: mockGameId,
  players: {
    [mockPlayer]: {
      guesses: [],
    },
  },
  readyPlayerIds: [],
  word: mockRandomWord,
  ttl: 0,
};

export const mockPlayerEntity: PlayerEntity = {
  pk: `PLAYER#${mockPlayer}`,
  sk: `PLAYER#${mockPlayer}`,
  id: mockPlayer,
  token: mockToken,
  name: mockPlayerName,
};

export const mockPlayer2Entity: PlayerEntity = {
  pk: `PLAYER#${mockPlayer2}`,
  sk: `PLAYER#${mockPlayer2}`,
  id: mockPlayer2,
  token: mockToken2,
  name: mockPlayer2Name,
};
