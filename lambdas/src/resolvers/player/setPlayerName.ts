import { client } from "@/lib/clients/dynamo";
import { updatePlayerName } from "@/lib/controller/dynamo/query/player";
import { getPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { AppHandler } from "@/src/app";
import { Player, SetPlayerNameMutationVariables } from "@api/generated/API";

export const resolver: AppHandler<SetPlayerNameMutationVariables, Player> = async (event) => {
  const { name, playerToken } = event.arguments;

  if (!name.match(/^[a-zA-Z0-9-]{1,12}$/)) {
    throw new Error("Invalid name provided. Must be alphanumeric and between 1 and 12 characters.");
  }

  const playerIdRequest = await getPlayerTokenEntity(client, {
    token: playerToken,
  });

  const playerEntity = await updatePlayerName(client, {
    id: playerIdRequest.player,
    name: name,
  });

  return {
    id: playerEntity.id,
    name: playerEntity.name ?? playerEntity.id,
  };
};

resolver.field = "setPlayerName";
