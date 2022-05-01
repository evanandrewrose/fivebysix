import { assessmentToString } from "@/lib/assessments";
import { playerDisplayName } from "@/lib/player";
import { sequentialToast } from "@/lib/toasts";
import { unwrapGame, unwrapPlayerId } from "@/redux/selectors";
import { useAppSelector } from "@/store";
import { Assessment } from "@api/generated/API";
import { chain, join, keyBy, map, matchesProperty, negate, property, slice } from "lodash";
import React, { useState } from "react";
import { Flip, ToastOptions } from "react-toastify";
import useDeepCompareEffect from "use-deep-compare-effect";

const convertToOrdinal = (value: number) =>
  ({
    1: "first",
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    6: "final",
  }[value]);

export const wordAssessmentToString = (assessment: Assessment[]): string =>
  join(map(assessment, assessmentToString), "");

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

export const PlayerMoveNotifier: React.FC = () => {
  const game = useAppSelector(unwrapGame);
  const ourPlayerId = useAppSelector(unwrapPlayerId);
  const playerStatesById = keyBy(game.playerStates, property("player.id"));

  const [previousPlayerStates, setPreviousPlayerStates] = useState(playerStatesById);

  const playerStatesByIdAsString = JSON.stringify(playerStatesById);

  useDeepCompareEffect(() => {
    const currentStates: typeof playerStatesById = JSON.parse(playerStatesByIdAsString);

    chain(currentStates)
      .filter(negate(matchesProperty(["player", "id"], ourPlayerId)))
      .each((playerState) => {
        const oldGuesses = previousPlayerStates[playerState.player.id].guesses;
        const newGuesses = slice(playerState.guesses, oldGuesses.length);
        const playerName = playerDisplayName(playerState.player);

        newGuesses.forEach(
          async (newGuess) =>
            await sequentialToast(
              `${playerName} played ${wordAssessmentToString(newGuess)} as their ${convertToOrdinal(
                playerState.guesses.length
              )} move!`,
              {
                ...toastOptions,
                toastId: `move(${playerName}, ${playerState.guesses.length})`,
              }
            )
        );
      })
      .value();

    setPreviousPlayerStates(currentStates);
  }, [playerStatesByIdAsString, ourPlayerId, previousPlayerStates]);

  return <React.Fragment></React.Fragment>;
};
