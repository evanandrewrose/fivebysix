import { Key, KeyType } from "@/lib/keyEvent";
import { classNames } from "@/lib/util";
import { selectGameIsOngoing, selectInputGrid } from "@/redux/selectors";
import { inputGridActions } from "@/redux/slices/inputGrid";
import { makeGuess } from "@/redux/thunks/game";
import { AppDispatch, useAppSelector } from "@/store";
import { Assessment, GuessResponse } from "@api/generated/API";
import { defaultTo, flatMap } from "lodash";
import { useDispatch } from "react-redux";
import { useResizeDetector } from "react-resize-detector";
import { KeyboardKey } from "@/components/keyboard/Key";

const K = KeyType;

export const QwertyLayout = [
  [K.Q, K.W, K.E, K.R, K.T, K.Y, K.U, K.I, K.O, K.P],
  [K.A, K.S, K.D, K.F, K.G, K.H, K.J, K.K, K.L],
  [K.Enter, K.Z, K.X, K.C, K.V, K.B, K.N, K.M, K.Backspace],
].map((row) => row.map((keyType) => new Key(keyType)));

const QwertyLayoutRows = QwertyLayout.length;
const QwertyLayoutMaxKeysInRow = Math.max(...QwertyLayout.map((row) => row.length));

const keyClass = (assessment?: Assessment) =>
  assessment &&
  {
    [Assessment.Correct]: "correct",
    [Assessment.Displaced]: "displaced",
    [Assessment.Incorrect]: "incorrect",
  }[assessment];

/**
 * Determine the priority at which a given assessment should present itself on the keyboard. If a user guesses a correct
 * "E" and later a displaced "E", the "correct" style (green) should continue to present on the keyboard.
 */
const assessmentPriority = (assessment: Assessment) =>
  ({
    [Assessment.Correct]: 3,
    [Assessment.Displaced]: 2,
    [Assessment.Incorrect]: 1,
  }[assessment]);

/**
 * Given a list of guesses, return a mapping of character to assessment, accounting for the priority of the assessment.
 */
const makeCharacterToAssessmentMap = (guesses: GuessResponse[]) =>
  flatMap(guesses, "characters").reduce<Record<string, Assessment>>((mapping, { character, result }) => {
    const char = character.toUpperCase();
    if (!mapping?.[char] || assessmentPriority(result) > assessmentPriority(mapping[char])) {
      mapping[char] = result;
    }
    return mapping;
  }, {});

export const Keyboard: React.FC = () => {
  const keysDown = useAppSelector((state) => state.keyboard.keysDown);
  const guesses = useAppSelector(selectInputGrid).guesses;
  const characterToAssessment = makeCharacterToAssessmentMap(guesses);
  const gameIsOngoing = useAppSelector(selectGameIsOngoing);

  const dispatch = useDispatch<AppDispatch>();

  const { width: containerWidth, height: containerHeight, ref: fillSpaceRef } = useResizeDetector();
  const rowHeight = defaultTo(containerHeight, 0) / QwertyLayoutRows;

  const maximumKeyboardWidth = 700;
  const keyboardWidth = Math.min(defaultTo(containerWidth, maximumKeyboardWidth), maximumKeyboardWidth);
  const characterKeyWidth = defaultTo(keyboardWidth, 0) / QwertyLayoutMaxKeysInRow;
  const actionKeyWidth = characterKeyWidth * 1.4;

  const characterKeyDimensions = {
    width: characterKeyWidth,
    height: rowHeight,
  };

  const actionKeyDimensions = {
    width: actionKeyWidth,
    height: rowHeight,
  };

  return (
    <div className="keyboard-container">
      <div ref={fillSpaceRef} className="max-size-stud">
        <div className="keyboard" style={{ height: rowHeight }}>
          {QwertyLayout.map((row, index) => (
            <div className="keyboard-row" key={index}>
              {row.map((key) => (
                <KeyboardKey
                  style={key.isCharacter() ? characterKeyDimensions : actionKeyDimensions}
                  className={classNames(key.isCharacter() && keyClass(characterToAssessment[key.asCharacter()]))}
                  key={key.type}
                  keyInstance={key}
                  onClick={(key) => {
                    if (!gameIsOngoing) {
                      return;
                    }

                    if (key.isCharacter()) {
                      dispatch(inputGridActions.addCharacterInput(key.asCharacter()));
                    } else if (key.isBackspace()) {
                      dispatch(inputGridActions.removeCharacterInput());
                    } else if (key.isEnter()) {
                      dispatch(makeGuess());
                    }
                  }}
                  down={keysDown.includes(key.type)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
