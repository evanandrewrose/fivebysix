import { client } from "@/lib/clients/dynamo";
import { getGameEntity } from "@/lib/controller/dynamo/query/game";
import { getPlayerTokenEntity } from "@/lib/controller/dynamo/query/token";
import { getResponseMap } from "@/lib/word/assessment";
import { AppHandler } from "@/src/app";
import { GetGuessesQueryVariables, GuessResponse } from "@api/generated/API";

export const resolver: AppHandler<GetGuessesQueryVariables, GuessResponse[]> = async (event) => {
  const { gameId, playerToken } = event.arguments;

  const playerTokenEntity = await getPlayerTokenEntity(client, {
    token: playerToken,
  });

  const gameResult = await getGameEntity(client, {
    name: gameId,
  });

  return gameResult.players[playerTokenEntity.player].guesses.map((guess) => {
    const responseMap = getResponseMap(gameResult.word, guess);
    return {
      characters: guess.split("").map((character, index) => ({
        character,
        result: responseMap[index],
      })),
    };
  });
};

resolver.field = "getGuesses";
