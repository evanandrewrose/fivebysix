import { Assessment } from "@api/generated/API";

// Return the original word, but replace any letters that are in the correct position with ✓.
const maskSolvedLetters = (word: string, guess: string) => {
  let final = "";

  [...word].forEach((letter, index) => {
    if (letter == guess.charAt(index)) {
      final += "✓";
    } else {
      final += letter;
    }
  });

  return final;
};

// Return a list of characters corresponding to each letter in the guess.
// ✓ -> correct letter, correct spot
// ! -> correct letter, but not in the right spot
// - -> incorrect letter
export const getResponseMap = (word: string, guess: string): Assessment[] => {
  const cells: Assessment[] = [];

  // Mask the solved letters with ✓. This lets us 'ignore' them when checking for displaced letters (correct letter,
  // but in the wrong spot).
  let wordSolvedMask = maskSolvedLetters(word, guess);

  [...guess].forEach((letter, index) => {
    if (word[index] == guess[index]) {
      // indicate correct letter in correct spot
      cells.push(Assessment.Correct);
    } else if (wordSolvedMask.includes(letter)) {
      // "consume" the letter by replacing it with !, indicating that we already acknowledged this letter being
      // correct, but it's in the wrong position
      wordSolvedMask = wordSolvedMask.replace(letter, "!");
      cells.push(Assessment.Displaced);
    } else {
      // indicate wrong letter
      cells.push(Assessment.Incorrect);
    }
  });

  return cells;
};

export const getResponseMaps = (
  guesses: string[],
  word: string
): Assessment[][] => {
  return guesses.map((guess) => getResponseMap(word, guess));
};
