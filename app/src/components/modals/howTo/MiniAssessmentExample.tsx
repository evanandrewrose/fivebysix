import { assessmentToString } from "@/lib/assessments";
import { Assessment } from "@api/generated/API";
import { cond, matches, constant, stubTrue } from "lodash";
import React from "react";

export const assessmentToClass = (assessment?: Assessment) =>
  assessment
    ? {
        [Assessment.Correct]: "correct",
        [Assessment.Displaced]: "displaced",
        [Assessment.Incorrect]: "incorrect",
      }[assessment]
    : "input";

cond([
  [matches(Assessment.Correct), constant("correct")],
  [matches(Assessment.Displaced), constant("displaced")],
  [matches(Assessment.Incorrect), constant("incorrect")],
  [stubTrue, constant("input")],
]);

interface SquareProps {
  assessment?: Assessment;
  character: string;
}

const Square: React.FC<SquareProps> = (props: SquareProps) => {
  const classSuffix = assessmentToClass(props.assessment);
  const backgroundCharacter = assessmentToString(props.assessment);

  return (
    <React.Fragment>
      <div className="mini-assessment-square">
        <div className="mini-assessment-square-background">{backgroundCharacter}</div>
        <div className={`mini-assessment-square-character mini-${classSuffix}`}>{props.character}</div>
      </div>
    </React.Fragment>
  );
};

export const MiniAssessmentExampleAssessed = () => {
  return (
    <div className="mini-assessment-example">
      <div className="mini-assessment-example-content">
        <Square assessment={Assessment.Correct} character="Q" />
        <Square assessment={Assessment.Incorrect} character="U" />
        <Square assessment={Assessment.Displaced} character="E" />
        <Square assessment={Assessment.Incorrect} character="R" />
        <Square assessment={Assessment.Incorrect} character="Y" />
      </div>
    </div>
  );
};

export const MiniAssessmentExampleInput = () => {
  return (
    <div className="mini-assessment-example">
      <div className="mini-assessment-example-content">
        <Square character="Q" />
        <Square character="U" />
        <Square character="E" />
        <Square character="R" />
        <Square character="Y" />
      </div>
    </div>
  );
};
