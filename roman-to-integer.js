var romanToInt = function (s) {
  let sum = 0;
  const romeNums = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
    IV: 4,
    XC: 90,
    XL: 40,
    CD: 400,
    CM: 900,
  };

  for (let i = 0; i < s.length; i++) {
    if (Object.keys(romeNums).includes(s[i] + s[i + 1])) {
      sum += romeNums[s[i] + s[i + 1]];
      i++;
      continue;
    }
    sum += romeNums[s[i]];
  }

  return sum;
};

const case2 = "MCMXCIV";

// 3 - 1994
console.log(romanToInt(case2));
