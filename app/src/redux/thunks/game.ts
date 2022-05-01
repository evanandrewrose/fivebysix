import {
  CreateGameMutation,
  CreateGameMutationVariables,
  Game,
  GetGameQuery,
  GetGameQueryVariables,
  GetGuessesQuery,
  GetGuessesQueryVariables,
  GuessMutation,
  GuessMutationVariables,
  GuessResponse,
  JoinGameMutation,
  JoinGameMutationVariables,
  SetPlayerReadyMutation,
  SetPlayerReadyMutationVariables,
} from "@api/generated/API";
import { createGame, guess, joinGame as joinGameQuery, setPlayerReady } from "@api/generated/graphql/mutations";
import { getGame, getGuesses } from "@api/generated/graphql/queries";
import { client } from "@/client";
import { AppState } from "@/store";
import { gql } from "@apollo/client/core";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { guessable } from "fivebysix-words";

const apiPrefix = "5by6/game";
const namespaced = (name: string) => `${apiPrefix}/${name}`;

export const newGame = createAsyncThunk<
  Game,
  {
    token: string;
    gameId?: string;
  }
>(namespaced("newGame"), async ({ token, gameId }) => {
  const createGameResult = await client.mutate<CreateGameMutation, CreateGameMutationVariables>({
    mutation: gql(createGame),
    variables: {
      playerToken: token,
      gameId: gameId,
    },
  });

  return createGameResult.data!.createGame;
});

export const newConsecutiveGame = createAsyncThunk<
  Game,
  {
    token: string;
    previousGameId: string;
  }
>(namespaced("newConsecutiveGame"), async ({ token, previousGameId }) => {
  // todo: would be better to model this in the api
  const regex = /(?<id>.*):(?<iteration>[0-9]+)/;

  const groups = previousGameId.match(regex)?.groups;
  const previousIteration = Number(groups && groups["iteration"] ? groups["iteration"] : 0);
  const previousIdBase = groups && groups["id"] ? groups["id"] : previousGameId;

  const nextGameId = `${previousIdBase}:${previousIteration + 1}`;

  let gameState;

  try {
    gameState = (
      await client.mutate<CreateGameMutation, CreateGameMutationVariables>({
        mutation: gql(createGame),
        variables: {
          playerToken: token,
          gameId: nextGameId,
        },
      })
    ).data!.createGame;
  } catch (e) {
    // todo: better handling, but someone else probably already made the new game so we'll join it
    gameState = (
      await client.mutate<GetGameQuery, GetGameQueryVariables>({
        errorPolicy: "all",
        mutation: gql(getGame),
        variables: {
          gameId: nextGameId,
        },
      })
    ).data!.getGame;

    gameState = (
      await client.mutate<JoinGameMutation, JoinGameMutationVariables>({
        mutation: gql(joinGameQuery),
        variables: {
          gameId: nextGameId,
          playerToken: token,
        },
      })
    ).data!.joinGame;
  }

  return gameState;
});

export const setReady = createAsyncThunk<
  Game,
  {
    token: string;
    gameId: string;
  }
>(namespaced("setReady"), async ({ token, gameId }) => {
  const setPlayerReadyResult = await client.mutate<SetPlayerReadyMutation, SetPlayerReadyMutationVariables>({
    mutation: gql(setPlayerReady),
    variables: {
      gameId,
      playerToken: token,
    },
  });

  return setPlayerReadyResult.data!.setPlayerReady;
});

export const getGameState = createAsyncThunk<Game, { gameId: string }>(
  namespaced("getGame"),
  async ({ gameId }): Promise<GetGameQuery["getGame"]> => {
    const result = await client.mutate<GetGameQuery, GetGameQueryVariables>({
      errorPolicy: "all",
      mutation: gql(getGame),
      variables: {
        gameId: gameId,
      },
    });

    const gameResult = result.data!.getGame;

    return gameResult;
  }
);

export const getPreviousGuesses = createAsyncThunk<
  GuessResponse[],
  {
    playerToken: string;
    gameId: string;
  }
>(namespaced("getPreviousGuesses"), async ({ playerToken, gameId }): Promise<GuessResponse[]> => {
  const result = await client.query<GetGuessesQuery, GetGuessesQueryVariables>({
    query: gql(getGuesses),
    variables: {
      gameId: gameId,
      playerToken: playerToken,
    },
  });

  return result.data.getGuesses;
});

export const makeGuess = createAsyncThunk<GuessResponse>(namespaced("makeGuess"), async (_, thunkAPI) => {
  const state = thunkAPI.getState() as AppState;
  const credentials = state.player.credentials!;
  const word = state.inputGrid.currentInput;
  const { id } = state.game.game!;

  if (!guessable.includes(word.toLowerCase())) {
    throw new Error("Word isn't in the word list.");
  }

  const makeGuess = await client.mutate<GuessMutation, GuessMutationVariables>({
    mutation: gql(guess),
    variables: {
      gameId: id,
      playerToken: credentials.token,
      word: word.toLowerCase(),
    },
  });

  return makeGuess.data!.guess;
});

interface JoinGameParams {
  id: string;
  token: string;
}

export const joinGame = createAsyncThunk<Game, JoinGameParams>(namespaced("joinGame"), async (params) => {
  const response = await client.mutate<JoinGameMutation, JoinGameMutationVariables>({
    mutation: gql(joinGameQuery),
    variables: {
      gameId: params.id,
      playerToken: params.token,
    },
  });

  return response.data!.joinGame;
});
