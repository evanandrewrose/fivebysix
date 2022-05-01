import { GameGridHeight, GameGridWidth } from "@/lib/constants";
import { showError } from "@/lib/toasts";
import { classNames } from "@/lib/util";
import { selectGame, selectInputGrid, selectPlayerCredentials } from "@/redux/selectors";
import { useAppSelector } from "@/store";
import { AssessedCharacter, Assessment, GameState } from "@api/generated/API";
import { defaultTo, times } from "lodash";
import React, { FC, useEffect } from "react";
import { useResizeDetector } from "react-resize-detector";

const assessmentToClass = (assessment: Assessment) =>
  ({
    [Assessment.Correct]: "correct",
    [Assessment.Displaced]: "displaced",
    [Assessment.Incorrect]: "incorrect",
  }[assessment]);

interface GuessedBoardRowProps {
  characters: AssessedCharacter[];
}

const GuessedBoardRow = (props: GuessedBoardRowProps) => (
  <React.Fragment>
    {props.characters.map(({ character, result }, index) => (
      <div className={classNames("slot", assessmentToClass(result))} key={index}>
        <h2>{character.toUpperCase()}</h2>
      </div>
    ))}
  </React.Fragment>
);

interface InputRowProps {
  input: string;
  locked: boolean;
  guessRejected: boolean;
  guessPending: boolean;
}

const InputBoardRow = (props: InputRowProps) => {
  const emptyColumns = GameGridWidth - props.input.length;
  const className = classNames(
    "slot",
    "slot-input",
    props.locked && "locked",
    props.guessRejected && classNames("animate__animated", "rejected")
  );

  return (
    <React.Fragment>
      {/* render character cells */}
      {props.input.split("").map((character, index) => (
        <div key={index} className={classNames(className, props.guessPending && "sending-guess")}>
          <h2>{character.toUpperCase()}</h2>
        </div>
      ))}
      {/* render empty cells */}
      {times(emptyColumns, (index) => (
        <div className={className} key={index}></div>
      ))}
    </React.Fragment>
  );
};

interface EmptyBoardRowProps {
  locked: boolean;
}

const EmptyBoardRow = (props: EmptyBoardRowProps) => (
  <React.Fragment>
    {times(GameGridWidth, (index) => (
      <div className={classNames("slot", "empty", props.locked && "locked")} key={index}></div>
    ))}
  </React.Fragment>
);

export const Board: FC = () => {
  const { guesses, currentInput, guessPending, guessRejected } = useAppSelector(selectInputGrid);
  const game = useAppSelector(selectGame);
  const player = useAppSelector(selectPlayerCredentials);
  const { width: containerWidth, height: containerHeight, ref: fillSpaceRef } = useResizeDetector();

  useEffect(() => {
    if (guessRejected) {
      showError(
        "Invalid guess.",
        {
          autoClose: 200,
          toastId: `badGuess(${currentInput})`,
          position: "top-center",
        },
        false
      );
    }
  }, [guessRejected, currentInput]);

  const gameIsOngoing = game && game.state === GameState.Ongoing;
  const weAreInThisGame = player && game && game.playerStates.find((s) => s.player.id === player.id);
  const locked = !gameIsOngoing || !weAreInThisGame;

  const emptyRows = Math.max(GameGridHeight - guesses.length - 1, 0);
  const hasInputRow = guesses.length < GameGridHeight;

  const boardSize = Math.min(defaultTo(containerWidth, 0), defaultTo(containerHeight, 0));
  const boardCellSize = boardSize / Math.max(GameGridWidth, GameGridHeight);

  const boardDimensions = {
    width: boardCellSize * GameGridWidth,
    height: boardCellSize * GameGridHeight,
  };

  return (
    <div id="board-container">
      <div ref={fillSpaceRef} className={classNames("max-size-stud", "center-content-by-flex")}>
        <div id="board" style={boardDimensions}>
          {guesses.map((guess, index) => (
            <GuessedBoardRow characters={guess.characters} key={index} />
          ))}
          {hasInputRow ? (
            <InputBoardRow
              guessPending={guessPending}
              input={currentInput}
              locked={locked}
              guessRejected={guessRejected}
            />
          ) : null}
          {times(emptyRows, (index) => (
            <EmptyBoardRow key={index + guesses.length + 1} locked={locked} />
          ))}
        </div>
      </div>
    </div>
  );
};
