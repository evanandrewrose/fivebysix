import { SafeDocumentClient } from "@/lib/clients/dynamo";
import { GameEntity, GameEntityPK } from "@/lib/controller/dynamo/model";
import { environment as env } from "@/lib/environment";
import { dateToSeconds, tomorrow } from "@/lib/utils";

export interface GetGameEntityProps {
  name: string;
}

export const getGameEntity = async (client: SafeDocumentClient, props: GetGameEntityProps) => {
  const key: GameEntityPK = `GAME#${props.name}`;

  const game = await client
    .get({
      TableName: env().table,
      Key: {
        pk: key,
        sk: key,
      },
    })
    .promise();

  if (game.Item === undefined) {
    throw new Error("Game not found.");
  }

  return game.Item;
};

export interface PutGameEntityProps {
  name: string;
  word: string;
  creatorId: string;
}

export const putGameEntity = async (client: SafeDocumentClient, props: PutGameEntityProps) => {
  const { name, word, creatorId } = props;

  const key: GameEntityPK = `GAME#${props.name}`;

  const gameEntity = {
    id: name,
    pk: key,
    sk: key,
    word,
    host: creatorId,
    players: {
      [creatorId]: {
        guesses: [],
        ready: false,
      },
    },
    readyPlayerIds: [],
    ttl: dateToSeconds(tomorrow()),
  };

  await client
    .put({
      TableName: env().table,
      Item: gameEntity,
      ConditionExpression: "pk <> :newId", // check for uniqueness
      ExpressionAttributeValues: {
        ":newId": key,
      },
    })
    .promise();

  return gameEntity;
};

export interface UpdateGameAddGuessProps {
  gameId: string;
  playerId: string;
  guess: string;
}

export const updateGameWithGuess = async (
  client: SafeDocumentClient,
  props: UpdateGameAddGuessProps
): Promise<GameEntity> => {
  const key: GameEntityPK = `GAME#${props.gameId}`;

  const updatedGameResponse = await client
    .update({
      TableName: env().table,
      Key: {
        pk: key,
        sk: key,
      },
      UpdateExpression: `SET players.#player.guesses = list_append(players.#player.guesses, :guessList)`,
      ConditionExpression: `
        attribute_exists(players.#player)
        AND NOT contains(players.#player.guesses, :guess)
        AND size(readyPlayerIds) = size(players)
        AND size(players.#player.guesses) <= :maxGuesses`,
      ExpressionAttributeNames: {
        "#player": props.playerId,
      },
      ExpressionAttributeValues: {
        ":guess": props.guess,
        ":guessList": [props.guess],
        ":maxGuesses": 6,
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();

  return updatedGameResponse.Attributes!;
};

interface UpdateGameAddPlayerProps {
  gameId: string;
  playerId: string;
}

export const updateGameAddPlayer = async (
  client: SafeDocumentClient,
  props: UpdateGameAddPlayerProps
): Promise<GameEntity> => {
  const key: GameEntityPK = `GAME#${props.gameId}`;

  // The condition below, `AND (len(players) != len(readyPlayerIds))`, is a way of indicating that
  // the game hasn't started. When the final player has marked themselves as ready, the game begins
  // and joining is no longer allowed.
  const updatedGameResponse = await client
    .update({
      TableName: env().table,
      Key: {
        pk: key,
        sk: key,
      },
      UpdateExpression: `SET players.#player = :initialPlayer`,
      ConditionExpression: `
        (NOT contains(players, #player))
        AND (size(players) < :maxPlayers)
        AND NOT (size(players) = size(readyPlayerIds))
        `,
      ExpressionAttributeNames: {
        "#player": props.playerId,
      },
      ExpressionAttributeValues: {
        ":maxPlayers": 10,
        ":initialPlayer": {
          ready: false,
          guesses: [],
        },
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();

  return updatedGameResponse.Attributes!;
};

interface UpdateGameSetPlayerReadyProps {
  playerId: string;
  gameId: string;
}

export const updateGameSetPlayerReady = async (
  client: SafeDocumentClient,
  props: UpdateGameSetPlayerReadyProps
): Promise<GameEntity> => {
  const key: GameEntityPK = `GAME#${props.gameId}`;

  const updatedGameState = await client
    .update({
      TableName: env().table,
      Key: {
        pk: key,
        sk: key,
      },
      UpdateExpression: `SET #readyPlayerIds = list_append(#readyPlayerIds, :playerList)`,
      ConditionExpression: `
        attribute_exists(players.#player) 
        AND (NOT contains(#readyPlayerIds, :player))
      `,
      ExpressionAttributeNames: {
        "#readyPlayerIds": "readyPlayerIds",
        "#player": props.playerId,
      },
      ExpressionAttributeValues: {
        ":player": props.playerId,
        ":playerList": [props.playerId],
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();

  return updatedGameState.Attributes!;
};
