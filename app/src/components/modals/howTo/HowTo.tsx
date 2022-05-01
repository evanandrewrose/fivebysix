import { classNames } from "@/lib/util";
import {
  MiniAssessmentExampleAssessed,
  MiniAssessmentExampleInput,
} from "@/components/modals/howTo/MiniAssessmentExample";

interface HowToProps {
  active: boolean;
  onClose: () => void;
}

export const HowTo: React.FC<HowToProps> = (props: HowToProps) => {
  const close = () => {
    props.onClose();
  };

  return (
    <div className={classNames("modal", props.active && "is-active")}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-content fit-content-width how-to-content">
        <article className="message">
          <div className="message-header">
            <p>How To Play</p>
            <button className="delete" aria-label="delete" onClick={close}></button>
          </div>

          <div className="message-body">
            <p>Create a game and send the link to a friend!</p>
            <p>Every game is a search for the secret word.</p>
            <p>Guess a 5-letter word, such as:</p>
            <MiniAssessmentExampleInput />
            <p>The game will color-code your letters. You might get back:</p>
            <MiniAssessmentExampleAssessed />
            <p>This indicates:</p>
            <ul>
              <li>Q (🟩): is in the word, as you placed it.</li>
              <li>E (🟨): is in the word, but in a different location.</li>
              <li>U, R, Y (⬛): are not in the word.</li>
            </ul>
            <p>
              <strong>Use this information to guess again. Find the word before your opponents do!</strong>
            </p>
          </div>
        </article>
      </div>
      <button className="modal-close is-large" aria-label="close" onClick={close}></button>
    </div>
  );
};
