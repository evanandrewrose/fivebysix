import { client } from "@/lib/clients/dynamo";
import { putPlayerEntity } from "@/lib/controller/dynamo/query/player";
import { putPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { AppHandler } from "@/src/app";
import { CreatePlayerResponse } from "@api/generated/API";
import { v4 as uuidv4 } from "uuid";

export const resolver: AppHandler<null, CreatePlayerResponse> = async () => {
  const playerId = uuidv4();
  const playerToken = uuidv4();

  await putPlayerEntity(client, {
    id: playerId,
    token: playerToken,
  });

  await putPlayerTokenEntity(client, {
    player: playerId,
    token: playerToken,
  });

  return {
    token: playerToken,
    player: {
      id: playerId,
      name: null,
    },
  };
};

resolver.field = "createPlayer";
