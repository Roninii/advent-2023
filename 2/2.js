const puzzleInput = Bun.file("./input.txt");
const input = await puzzleInput.text();
const lines = input.split("\n").filter(Boolean);

const cubeCount = new Map([
  ["red", 12],
  ["green", 13],
  ["blue", 14],
]);

/**
 * Parses a combination of random cubes
 * @param {string} combo
 * @returns {Map<string, number>} A map of the cube color and the number of cubes
 */
const checkCombo = (combo, regex = /(?<number>\d+) (?<color>\w+)/g) => {
  // if we've reached the end of the string, return early
  if (regex.lastIndex >= combo.length) return true;

  const { number, color } = regex.exec(combo.split(","))?.groups ?? {};
  if (cubeCount.get(color) < number) return false;

  if (regex.lastIndex) {
    return checkCombo(combo, regex);
  }
};

const possibleGames = lines
  .map((line) => {
    let possible = true;

    const [game, ...draws] = line.split(":");
    const gameID = game.match(/\d+/)[0]; // Get the game ID

    /** For Each game:
     * 1. Get the 3 diffferent combinations of randome cubes the elf pulls from the bag
     * 2. Verify that each draw is valid
     * 3. If all draws are valid, return the game ID
     */

    draws[0].split(";").forEach((combo) => {
      if (!possible) return;
      checkCombo(combo) ? (possible = true) : (possible = false);
    });

    return possible ? gameID : false;
  })
  .filter(Boolean);

// console.log(possibleGames.reduce((acc, cur) => acc + parseInt(cur, 10), 0));

/**
 * Part 2:
 * 1. Check the *minimum* number of cubes, per color, that would be needed in each game
 * 2. Get the power of each set of cubes per game (the numbers of all colors multiplied together)
 * 3. Return the sum of all the powers
 */

const getMinCubes = (
  combo,
  minCubesMap,
  regex = /(?<number>\d+) (?<color>\w+)/g
) => {
  // if we've reached the end of the string, return early
  if (regex.lastIndex >= combo.length) return minCubesMap;

  const { number, color } = regex.exec(combo)?.groups;
  if (minCubesMap.get(color) < parseInt(number)) {
    minCubesMap.set(color, parseInt(number));
  }

  // If there is more to parse, call the function recursively
  if (regex.lastIndex) {
    return getMinCubes(combo, minCubesMap, regex);
  }
};

const sumOfAllPowers = lines.reduce((acc, currentLine) => {
  // Separate the game ID from the random "draw" of cubes
  const [game, ...draws] = currentLine.split(":");
  const gameID = game.match(/\d+/)[0];

  // Create a map of each possible color with an initial value of 0
  const minCubesMap = new Map([
    ["blue", 0],
    ["red", 0],
    ["green", 0],
  ]);

  // Loop through each "draw" and get the minimum number of cubes needed for each color
  draws[0].split(";").forEach((combo) => {
    getMinCubes(combo, minCubesMap);
  });

  // Get the power of each set by grabbing the value of each cube color and multiplying them together
  const power = [...minCubesMap.values()].reduce((acc, cur) => acc * cur, 1);

  // Add the power to the accumulator
  return acc + power;
}, 0);

console.log(sumOfAllPowers);
