const twoSum1 = function (nums, target) {
  let k = 0;

  for (let i = 0; i <= nums.length; i++) {
    if (nums[k] + nums[i] === target) {
      return [k, i];
    }
    if (i === nums.length) {
      k++;
      i = 0;
    }
    if (i === k) continue;
  }
};

console.log(twoSum1([2, 7, 11, 15], 9));
