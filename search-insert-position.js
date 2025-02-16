var searchInsert = function (nums, target) {
  let leftIndex = 0;
  let rightIndex = nums.length - 1;
  let middle = 0;
  let currentValue = 0;

  for (let i = 0; i <= nums.length; i++) {
    middle = Math.floor((leftIndex + rightIndex) / 2);
    currentValue = nums[middle];
    if (target === nums[middle]) {
      return middle;
    } else if (target < nums[middle]) {
      rightIndex = middle - 1;
    } else if (target > nums[middle]) {
      leftIndex = middle + 1;
    }
  }

  return middle + 1;
};

const case1 = [1, 3];
const case2 = [1, 3, 5, 6];

console.log(searchInsert(case2, 2));
