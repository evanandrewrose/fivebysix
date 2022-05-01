import { client } from "@/lib/clients/dynamo";
import { putGameEntity } from "@/lib/controller/dynamo/query/game";
import { getPlayerEntities } from "@/lib/controller/dynamo/query/player";
import { getPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { createGameType } from "@/lib/typeCreators/game";
import { randomWord } from "@/lib/word/random";
import { AppHandler } from "@/src/app";
import { CreateGameMutationVariables, Game } from "@api/generated/API";
import { v4 as uuidv4 } from "uuid";

export const resolver: AppHandler<CreateGameMutationVariables, Game> = async (event) => {
  const { playerToken, gameId } = event.arguments;

  const playerTokenResult = await getPlayerTokenEntity(client, {
    token: playerToken,
  });

  const createGameResult = await putGameEntity(client, {
    name: gameId ?? uuidv4(),
    creatorId: playerTokenResult.player,
    word: randomWord(),
  });

  const playersResult = await getPlayerEntities(client, {
    ids: Object.keys(createGameResult.players),
  });

  return createGameType(createGameResult, playersResult);
};

resolver.field = "createGame";
