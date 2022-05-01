import { client } from "@/client";
import { playerDisplayName } from "@/lib/player";
import { Mutex } from "async-mutex";
import {
  CreatePlayerMutation,
  CreatePlayerMutationVariables,
  Player,
  SetPlayerNameMutation,
  SetPlayerNameMutationVariables,
} from "@api/generated/API";
import { createPlayer, setPlayerName } from "@api/generated/graphql/mutations";
import { gql } from "@apollo/client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PlayerState } from "@/redux/slices/player";
import { AppState } from "@/store";

const apiPrefix = "5by6/player";
const namespaced = (name: string) => `${apiPrefix}/${name}`;

const PlayerInfoKeyPrefix = "PlayerInfo";
const PlayerIdKey = `${PlayerInfoKeyPrefix}::PlayerId`;
const PlayerTokenKey = `${PlayerInfoKeyPrefix}::PlayerToken`;
const PlayerNameKey = `${PlayerInfoKeyPrefix}::PlayerName`;

export const setName = createAsyncThunk<
  Player,
  {
    token: string;
    name: string;
  }
>(namespaced("setName"), async ({ token, name }) => {
  const result = await client.mutate<SetPlayerNameMutation, SetPlayerNameMutationVariables>({
    mutation: gql(setPlayerName),
    variables: {
      playerToken: token,
      name,
    },
  });

  const player = result.data!.setPlayerName;

  window.localStorage.setItem(PlayerNameKey, playerDisplayName(player));

  return player;
});

export const getPlayerCachedName = () => window.localStorage.getItem(PlayerNameKey);

interface GetPlayerStateResponse {
  credentials: {
    id: string;
    token: string;
  };
  name: string;
}

const playerStateMutex = new Mutex();

export const getPlayerState = createAsyncThunk<GetPlayerStateResponse>(namespaced("getPlayerState"), () =>
  playerStateMutex.runExclusive(async () => {
    const playerId = window.localStorage.getItem(PlayerIdKey);
    const playerToken = window.localStorage.getItem(PlayerTokenKey);
    const playerName = getPlayerCachedName();

    if (playerToken && playerId && playerName) {
      return {
        credentials: {
          id: playerId,
          token: playerToken,
        },
        name: playerName,
      };
    } else {
      const createPlayerResult = await client.mutate<CreatePlayerMutation, CreatePlayerMutationVariables>({
        mutation: gql(createPlayer),
      });

      const result = createPlayerResult.data!.createPlayer;

      // todo: need to invalidate these if we're ever told by the server that the player doesn't exist
      window.localStorage.setItem(PlayerIdKey, result.player.id);
      window.localStorage.setItem(PlayerTokenKey, result.token);
      window.localStorage.setItem(PlayerNameKey, playerDisplayName(result.player));

      return {
        credentials: {
          id: result.player.id,
          token: result.token,
        },
        name: result.player.name || playerDisplayName(result.player),
      };
    }
  })
);
