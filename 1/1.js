const input = Bun.file("./input.txt");
const text = await input.text();
const lines = text.split("\n").filter(Boolean);

const alphaDigitMap = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
]);
const digitsAsAlpha = "one|two|three|four|five|six|seven|eight|nine";
const digitRegex = new RegExp(`\\d`, "g");

const replaceAlphaDigit = (line) => {
  let replacedStr = line;
  alphaDigitMap.forEach((value, key) => {
    replacedStr = replacedStr.replaceAll(key, `${key}${value}${key}`);
  });

  return replacedStr;
};

const nums = lines.map((line) => {
  line = replaceAlphaDigit(line);
  const allNums = line.match(digitRegex);

  return parseInt(`${allNums?.[0]}${allNums?.[allNums?.length - 1]}`);
});

const sum = nums.reduce((acc, num) => acc + num, 0);

console.log(sum);
