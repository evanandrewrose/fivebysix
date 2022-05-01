import { showError, showSuccess } from "@/lib/toasts";
import { classNames } from "@/lib/util";
import { selectGameState, unwrapGame, unwrapPlayerCredential } from "@/redux/selectors";
import { setReady } from "@/redux/thunks/game";
import { useAppDispatch, useAppSelector } from "@/store";
import copy from "copy-to-clipboard";
import React from "react";

export const GameLobbyOverlay = () => {
  const dispatch = useAppDispatch();
  const { id: playerId, token } = useAppSelector(unwrapPlayerCredential);
  const { playerStates, host, id: gameId } = useAppSelector(unwrapGame);
  const { readyPending } = useAppSelector(selectGameState);

  const weAreHost = host === playerId;
  const weAreGuest = !weAreHost;
  const weAreReady = playerStates.find((player) => player.player.id === playerId)?.ready;

  const numOtherPlayersReady = playerStates.filter((player) => player.ready).length;
  const numOtherPlayers = playerStates.length - 1;
  const allOtherPlayersReady = numOtherPlayers === numOtherPlayersReady;

  const waitingForOtherPlayersToReady =
    (weAreGuest && !allOtherPlayersReady && weAreReady) || (weAreHost && !allOtherPlayersReady);

  const waitingForHostToReady = weAreGuest && allOtherPlayersReady && weAreReady;

  const waitingForUsToReady = (weAreHost && allOtherPlayersReady) || (weAreGuest && !weAreReady);

  return (
    <div id="game-lobby-overlay-container">
      <div id="game-lobby-overlay-content">
        <h5 className="subtitle is-5">
          Other Players Ready: ({numOtherPlayersReady}/{numOtherPlayers})
        </h5>

        {waitingForOtherPlayersToReady && (
          <article className="message is-info">
            <div className="message-body">Waiting for other players to be ready.</div>
          </article>
        )}

        {waitingForHostToReady && (
          <article className="message is-info">
            <div className="message-body">Waiting for host to start game.</div>
          </article>
        )}

        {waitingForUsToReady && (
          <React.Fragment>
            <button
              className={classNames("button", "is-success", readyPending && "is-loading")}
              onClick={() => {
                dispatch(
                  setReady({
                    gameId,
                    token,
                  })
                );
              }}
            >
              <span className="icon">
                <i className={classNames("fa", "fa-check")}></i>
              </span>
              <span>{weAreHost ? "Start Game" : "Ready"}</span>
            </button>
          </React.Fragment>
        )}
        <button
          className="button"
          onClick={() => {
            if (copy(`${window.location.host}/game/${gameId}`)) {
              showSuccess("Invite copied to clipboard.");
            } else {
              showError("Failed to copy. Manually send your current URL to invite a player.");
            }
          }}
        >
          <span className="icon">
            <i className="fa fa-clipboard"></i>
          </span>
          <span>Copy Invite</span>
        </button>
      </div>
    </div>
  );
};
