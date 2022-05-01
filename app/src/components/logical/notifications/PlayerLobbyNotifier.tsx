import { playerDisplayName } from "@/lib/player";
import { sequentialToast } from "@/lib/toasts";
import { unwrapGame, unwrapPlayerId } from "@/redux/selectors";
import { useAppSelector } from "@/store";
import { curry, difference, filter, forEach, isEqual, keyBy, map, negate, property } from "lodash";
import React, { useState } from "react";
import { Flip, ToastOptions } from "react-toastify";
import useDeepCompareEffect from "use-deep-compare-effect";

const toastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 200,
  theme: "colored",
  hideProgressBar: false,
  transition: Flip,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const PlayerLobbyNotifier: React.FC = () => {
  const ourPlayerId = useAppSelector(unwrapPlayerId);
  const { playerStates } = useAppSelector(unwrapGame);

  const readyPlayers: string[] = map(filter(playerStates, property("ready")), property("player.id"));
  const [previousReadyPlayers, setPreviousReadyPlayers] = useState(readyPlayers);

  const players: string[] = map(playerStates, property("player.id"));
  const [previousJoinedPlayers, setPreviousJoinedPlayers] = useState(players);

  const playerStateLookup = keyBy(playerStates, "player.id");

  const playerName = (player: string) => playerDisplayName(playerStateLookup[player].player);

  useDeepCompareEffect(() => {
    const newlyJoinedPlayers = difference(players, previousJoinedPlayers);
    const newlyReadyPlayers = difference(readyPlayers, previousReadyPlayers);

    if (players.length === readyPlayers.length) {
      return; // no more notifications if the game is going to start
    }

    forEach(filter(newlyReadyPlayers, negate(curry(isEqual)(ourPlayerId))), async (player) => {
      await sequentialToast(`🔥 ${playerName(player)} is ready!`, {
        ...toastOptions,
        toastId: `ready(${playerName(player)})`,
      });
    });

    newlyJoinedPlayers.filter(negate(curry(isEqual)(ourPlayerId))).forEach(async (player) => {
      await sequentialToast(`💥 ${playerName(player)} has joined!`, {
        ...toastOptions,
        toastId: `joined(${playerName(player)})`,
      });
    });

    setPreviousJoinedPlayers(players);
    setPreviousReadyPlayers(readyPlayers);
  }, [playerStates, playerStateLookup]);

  return <React.Fragment></React.Fragment>;
};
