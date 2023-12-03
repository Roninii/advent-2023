I need to read an **input**, parsing each line. In each line, I need to get both, the **first** and the **last** **digit** in **each** line. If a line only has a single digit, it is *both* the first *and* the last digit.

After parsing is complete and I have a list of 2 digit number combinations, I need to find the sum of all those numbers.

[Input](https://adventofcode.com/2023/day/1/input)

~~Going to use Node for this, since I'm most familiar with JS.~~ Jk. I'm going to use this as an excuse to try [Bun](https://bun.sh/)!

## Getting set up

Install bun
`curl -fsSL https://bun.sh/install | bash`

Make a directory and a file for the first exercise
`mkdir advent-2023`
`cd advent-2023`
`touch 1.js`

Copy the input, and throw it in a text file, `input.txt`

Run the file in watch mode so that we can see how our changes are reflected
`bun --watch run 1.js`

## Reading the input

First, we're going to read the `input.txt` file, parse it into a string, and then split that string into an array.
```js
const input = Bun.file("./input.txt")
const text = await input.text()
const lines = text.split('\n') //split the string on new line chars

console.log(lines) // should print the array of strings
```
Here I learned a couple cool things.
- Bun has reimplemented the file i/o api to optimize it, and it does seem more intuitive.
- Bun has top-level await which I love

## Parsing the digits in each line

Now, we need to turn our array of strings into an array of two digit numbers. Let's start by just grabbing the **first number** in each line. 

```js
/**
 * Loop over all lines
 * Use `.match` to find all numbers using regex
 * Use [0] to grab the first match
 * Using `?` just in case the match is undefined.
 * Use `ParseInt` to convert our string into a number
 */
 const nums = lines.map((line) => parseInt(line.match(/\d/)));
```


Now that we're grabbing the first number, refactoring this to grab the second one should be fairly straightforward. We'll just expand our arrow function into a couple more parts.
1. grab *all* numbers from the line, and throw them into a variable
2. grab the first number and parse it into a number
3. grab the last number and parse it into a number
4. return an array with both numbers

```js
const nums = lines.map((line) => {
	const allNums = line.match(/\d/g);

	const num1 = parseInt(allNums?.[0]);
	const num2 = parseInt(allNums?.[allNums?.length - 1]);  

	return [num1, num2];
});
```

We're almost there!

## Edge cases

We're so close, but there are still a couple situations we don't have covered.
- What if there are *no* numbers?
- What if there is only *one* number?

Let's take care of the first - no numbers
```js
const lines = text.split("\n").filter(Boolean);
```

Okay, this might be cheap, but I live by the simplest solution philosophy and in this case, this is the first and most simple thing that comes to mind. On the line where we are splitting our string of text into an array of "lines", we just run `filter(Boolean)` which filters out any `falsy` values, like an empty string. This probably doesn't cover _everything_, but in this case, with my input, it does!

Next up, what if there is only *one* number? Ha! just kidding, if you're following along, we actually don't have to worry about this one! `allNums?.[allNums?.length - 1]` will cover this edge case, because if there is only one value, `allNums?.length - 1` will be `0`... which is the first value!

## Get the sum

Okay, so now that we have our 2 digit combinations from every line, there is only one thing left to do: get the sum. I'm going to break this down into two steps though:
- Flatten our array into a single array where each entry is the two digit combo as a single number. e.g. `[7, 7]` becomes `77`
- Get the sum!

For step one, we can actually simplify our parsing a little and return the combined number instead.
```js
const nums = lines.map((line) => {
	const allNums = line.match(/\d/g);

	return parseInt(
	`${allNums?.[0]}${allNums?.[allNums?.length - 1]}`
	);
});
```

So here, we are combining our extraction of the first and last digits into a JavaScript template string. Then we wrap that in a `parseInt`, and we get the number value of the combined digits! This both - combines our numbers, and flattens our array.

Lastly, we just need the sum! That should be pretty straight forward if we just use the `reduce` method.
```js
const sum = nums.reduce((acc, num) => acc + num, 0);
```

That's it! This loops through each number in our `nums` array, adding the current value to the previous value. The last param, `0`, initializes our `acc` variable to `0`.

## Wait.. there's a part 2??

I thought I was done 😭

Okay, so the new twist is that we have to now accept digits that are spelled out. So `one` also counts as a digit!

Since we're not writing production-grade code here, I'm going to just proceed as if I'm solving a puzzle and not trying to write clean code that my mom would be proud of. Well.. I guess she'd be proud either way, but you get the point.

Okay, so let's start by spelling out the digits `1-9` and storing them in a variable.
```js
const digitsAsAlpha = [
"one",
"two",
"three",
"four",
"five",
"six",
"seven",
"eight",
"nine",
]
```

Now let's find a way to modify our regex to include these.. Maybe we can just update our variable to be a single string joined by `|` (pipes?)
```js
const digitsAsAlpha = "one|two|three|four|five|six|seven|eight|nine"
```

Okay.. This could work.. 

Now what if we construct a new `RegExp` that combines the `\d` token with our string? If we join the two with *another* `|`, we should *in theory* have one long *or* statement... right? Don't forget to escape the `\` with an additional `\`!
```js
const digitRegex = new RegExp(`\\d|${digitsAsAlpha}`, "g");
```

## Debugging

Okay, so we're *kind* of in business, but we're getting some `NaN`s in the console now. Hm.. Let's take a peek at one of the lines causing issues.

`four9two` Seems to result in a `NaN`, so looks like just replacing our previous regex with our new one isn't totally working. Let's take a peek inside the function to see what's going on. 

If we `console.log(allNums)`, we'll see that our regex actually *is* working, which is wonderful! So let's keep going... what if we log our `parseInt`?

Aha! JS doesn't know that `eight`, or any of the other alpha representations we have of our digits are, so `parseInt('eight')` is going to result in `NaN`. Let's add a way to map the alpha representation to a proper number!

Solely because I underutilize them in my day, to day life, I'm going to use a JS `Map` here. The keys will be the alpha representation of each digit, and the values will be the number.. and yes, I'm going to use CoPilot to do this for me.
```js
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
```

Great! Now we should be able to go back to parsing the numbers individually so that we can check if they're an alpha representation or an actual number.
```js
const num1 = parseInt(allNums?.[0]) || alphaDigitMap.get(allNums?.[0]);
const num2 =
parseInt(allNums?.[allNums?.length - 1]) ||
alphaDigitMap.get(allNums?.[allNums?.length - 1]);
```

Here, we can use the logical `||` operator to check if `parseInt` results in a `falsy` value. If it does, we'll grab the numeric value from our map!

Now update the return statement:
```js
return parseInt(`${num1}${num2}`);
```

## More debugging

Okay, this is *so* close. There is another edge case that isn't accounted for. What if the one or more letters are used in neighboring numbers? e.g. `5dsxngmpdvjhnlbhxmp7xqqtgdoneightdvm`. The last digit here should be `eight` , but our regex is grabbing `one` instead, because the `e` is a part of `one` before it's a part of `eight`. 

My solution to this was actually a little easier than I originally thought it would be, and involved a little backtracking. 

Instead of capturing the alpha representations in the regex like I was doing previously, I ended up adding a small function for just mutating the string. The function loops through all the `keys` in the map, replacing any instances of that key with the corresponding `value`. E.g. given the string `oneight`, on the first iteration of the map, the `key` would be `one` and the string would become `one1oneight`. This allows us to continue using the characters involved in the overlap, while still getting the digit we need. 

Then, I just returned to the simpler regex used in part one to grab all the digits and ignore all the alpha characters!

```js
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
		replacedStr = replacedStr.replaceAll(key, `${key}${value}${key}`
	);
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
```