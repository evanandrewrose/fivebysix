import { client } from "@/lib/clients/dynamo";
import { getPlayerEntity } from "@/lib/controller/dynamo/query/player";
import { AppHandler } from "@/src/app";
import { GetPlayerQueryVariables, Player } from "@api/generated/API";

export const resolver: AppHandler<GetPlayerQueryVariables, Player> = async (event) => {
  const { playerId } = event.arguments;

  const playerEntity = await getPlayerEntity(client, {
    id: playerId,
  });

  return {
    id: playerEntity.id,
    name: playerEntity.name,
  };
};

resolver.field = "getPlayer";
