import { client as appsyncClient } from "@/lib/clients/appsync";
import { client } from "@/lib/clients/dynamo";
import { updateGameAddPlayer } from "@/lib/controller/dynamo/query/game";
import { getPlayerEntities } from "@/lib/controller/dynamo/query/player";
import { getPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { createGameType } from "@/lib/typeCreators/game";
import { AppHandler } from "@/src/app";
import {
  Game,
  JoinGameMutationVariables,
  NotifyGameUpdateMutation,
  NotifyGameUpdateMutationVariables,
} from "@api/generated/API";
import { notifyGameUpdate } from "@api/generated/graphql/mutations";
import { gql } from "@apollo/client/core";

export const resolver: AppHandler<JoinGameMutationVariables, Game> = async (event) => {
  const { playerToken, gameId } = event.arguments;

  const playerTokenEntity = await getPlayerTokenEntity(client, {
    token: playerToken,
  });

  const updatedGameEntity = await updateGameAddPlayer(client, {
    gameId: gameId,
    playerId: playerTokenEntity.player,
  });

  const playerEntities = await getPlayerEntities(client, {
    ids: Object.keys(updatedGameEntity.players),
  });

  const game = createGameType(updatedGameEntity, playerEntities);

  await appsyncClient.mutate<NotifyGameUpdateMutation, NotifyGameUpdateMutationVariables>({
    mutation: gql(notifyGameUpdate),
    variables: {
      game,
    },
  });

  return game;
};

resolver.field = "joinGame";
