import { HowTo } from "@/components/modals/howTo/HowTo";
import React, { useState } from "react";

export const HowToButton: React.FC = () => {
  const [howToActive, setHowToActive] = useState(false);

  return (
    <React.Fragment>
      <button className="button is-rounded" onClick={() => setHowToActive(true)}>
        <span className="icon">
          <i className="fa fa-question"></i>
        </span>
      </button>
      <HowTo active={howToActive} onClose={() => setHowToActive(false)} />
    </React.Fragment>
  );
};
