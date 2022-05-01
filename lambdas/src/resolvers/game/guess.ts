import { client as appsyncClient } from "@/lib/clients/appsync";
import { client as dynamoClient } from "@/lib/clients/dynamo";
import { updateGameWithGuess } from "@/lib/controller/dynamo/query/game";
import { getPlayerEntities } from "@/lib/controller/dynamo/query/player";
import { getPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { createGameType } from "@/lib/typeCreators/game";
import { getResponseMap } from "@/lib/word/assessment";
import { AppHandler } from "@/src/app";
import {
  GuessMutationVariables,
  GuessResponse,
  NotifyGameUpdateMutation,
  NotifyGameUpdateMutationVariables,
} from "@api/generated/API";
import { notifyGameUpdate } from "@api/generated/graphql/mutations";
import { gql } from "@apollo/client/core";
import { guessable } from "fivebysix-words";

export const resolver: AppHandler<GuessMutationVariables, GuessResponse> = async (event) => {
  const { gameId, word: guess, playerToken } = event.arguments;

  const playerTokenEntity = await getPlayerTokenEntity(dynamoClient, {
    token: playerToken,
  });

  const { player: playerId } = playerTokenEntity;

  if (!guessable.includes(guess)) {
    throw new Error("Invalid guess.");
  }

  const updatedGameEntity = await updateGameWithGuess(dynamoClient, {
    gameId,
    guess,
    playerId,
  });

  const playerEntities = await getPlayerEntities(dynamoClient, {
    ids: Object.keys(updatedGameEntity.players),
  });

  const game = createGameType(updatedGameEntity, playerEntities);

  await appsyncClient.mutate<NotifyGameUpdateMutation, NotifyGameUpdateMutationVariables>({
    mutation: gql(notifyGameUpdate),
    variables: {
      game,
    },
  });

  const responseMap = getResponseMap(updatedGameEntity.word, guess);

  return {
    characters: guess.split("").map((character, index) => ({
      character,
      result: responseMap[index],
    })),
  };
};

resolver.field = "guess";
