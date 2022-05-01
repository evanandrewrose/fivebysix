import { Game, GameState } from "@api/generated/API";
import { GameEntity, PlayerEntities } from "@/lib/controller/dynamo/model";
import { createPlayerIdToNameMapping } from "@/lib/typeCreators/player";
import { getResponseMaps } from "@/lib/word/assessment";

const gameIdFromPrimaryKey = (key: string) => key.slice("GAME#".length);

export const createGameType = (game: GameEntity, players: PlayerEntities): Game => {
  const playerIdsToNames = createPlayerIdToNameMapping(players);

  const winnerPlayerId = Object.keys(game.players).find((playerId) =>
    game.players[playerId].guesses.find((guess) => guess === game.word)
  );

  const allPlayersReady = Object.keys(game.players).every((player) =>
    game.readyPlayerIds.includes(player)
  );

  const allGuessesUsed = Object.values(game.players).every((player) => player.guesses.length == 6);

  const gameOver = allGuessesUsed || winnerPlayerId;

  let state;

  if (gameOver) {
    state = GameState.Finished;
  } else if (allPlayersReady) {
    state = GameState.Ongoing;
  } else {
    state = GameState.Waiting;
  }

  const results = {
    word: game.word,
    winnerPlayerId,
  };

  return {
    id: gameIdFromPrimaryKey(game.pk),
    state,
    host: game.host,
    ...(gameOver ? results : {}),
    playerStates: Object.entries(game.players).map(([playerId, player]) => ({
      player: {
        id: playerId,
        name: playerIdsToNames[playerId],
      },
      ready: game.readyPlayerIds.includes(playerId),
      guesses: getResponseMaps(player.guesses, game.word),
    })),
  };
};
