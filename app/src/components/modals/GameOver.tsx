import { Player } from "@api/generated/API";
import { classNames } from "@/lib/util";
import { selectPlayerId, unwrapGame } from "@/redux/selectors";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { playerDisplayName } from "@/lib/player";

interface WinnerPromptConfig {
  title: string;
  theme: string;
  content: string;
}

const getPromptConfig = (weWon: boolean, playingSolo: boolean, word: string, winner?: Player): WinnerPromptConfig => {
  if (weWon) {
    return {
      theme: "is-success",
      title: "You won! 😀",
      content: "Congratulations! You're victorious!",
    };
  } else if (winner) {
    return {
      theme: "is-danger",
      title: "You lost! 😞",
      content: `${playerDisplayName(winner)} won. The secret word was "${word}".`,
    };
  } else {
    if (playingSolo) {
      return {
        theme: "is-danger",
        title: "You lost! 😞",
        content: `Game over. The secret word was "${word}".`,
      };
    } else {
      return {
        theme: "is-dark",
        title: "Draw!",
        content: `Nobody won. The secret word was "${word}".`,
      };
    }
  }
};

export const GameOverPrompt: React.FC = () => {
  const game = useAppSelector(unwrapGame);
  const playerId = useAppSelector(selectPlayerId);
  const [active, setActive] = useState(false);

  const close = () => setActive(false);

  useEffect(() => {
    setActive(game?.winnerPlayerId !== undefined);
  }, [game?.winnerPlayerId]);

  const weWon = game.winnerPlayerId !== null && game.winnerPlayerId === playerId;
  const winner = game.playerStates.find((player) => player.player.id === game.winnerPlayerId)?.player;
  const config = getPromptConfig(weWon, game.playerStates.length === 1, game.word ?? "?", winner);

  return (
    <div className={classNames("modal", active && "is-active")}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-content fit-content-width game-over-content">
        <article className={classNames("message", config.theme)}>
          <div className="message-header">
            <p>{config.title}</p>
            <button className="delete" aria-label="delete" onClick={close}></button>
          </div>

          <div className="message-body">{config.content}</div>
        </article>
      </div>
      <button className="modal-close is-large" aria-label="close" onClick={close}></button>
    </div>
  );
};
