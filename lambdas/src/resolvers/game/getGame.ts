import { client } from "@/lib/clients/dynamo";
import { getGameEntity } from "@/lib/controller/dynamo/query/game";
import { getPlayerEntities } from "@/lib/controller/dynamo/query/player";
import { createGameType } from "@/lib/typeCreators/game";
import { AppHandler } from "@/src/app";
import { Game, GetGameQueryVariables } from "@api/generated/API";

export const resolver: AppHandler<GetGameQueryVariables, Game> = async (event) => {
  const { gameId } = event.arguments;

  const gameResult = await getGameEntity(client, {
    name: gameId,
  });

  const playersResult = await getPlayerEntities(client, {
    ids: Object.keys(gameResult.players),
  });

  return createGameType(gameResult, playersResult);
};

resolver.field = "getGame";
