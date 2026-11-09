// Задача: Marrowlight Lattice Reweaving
// Сложность: hard
// Дата генерации: 2026-11-09

// Условие задачи
// В решётке Марроулайта n светящихся нитей выстроены в ряд. У каждой нити есть целочисленная яркость a_i. Решётку можно переплетать запросами двух видов.
// 
// 1. ["sum", l, r] — найти сумму яркостей нитей на позициях l..r (1-индексация, обе границы включительно).
// 2. ["shift", l, r, k] — циклически сдвинуть нити на отрезке l..r вправо на k позиций. Если k отрицательно, сдвиг идёт влево. Сдвиг циклический: элементы, ушедшие за правый край отрезка, возвращаются в начало, и наоборот. Величина сдвига берётся по модулю длины отрезка.
// 
// Нужно реализовать функцию solve(n, a, queries), которая возвращает массив ответов на все запросы sum в порядке их поступления. Запросы shift ответа не дают.
// 
// Ограничения: 1 <= n <= 200000; |a_i| <= 10^9; 1 <= количество запросов <= 200000; 1 <= l <= r <= n; k — любое целое число (может быть больше длины отрезка по модулю).
// 
// Формат входа:
// - n — длина решётки;
// - a — массив из n целых чисел;
// - queries — массив запросов, каждый запрос — массив ["sum", l, r] или ["shift", l, r, k].
// 
// Формат результата:
// - массив целых чисел — суммы для каждого запроса sum в порядке их следования.
// 
// Пример:
// solve(5, [1, 2, 3, 4, 5], [
//   ["sum", 1, 5],
//   ["shift", 2, 4, 1],
//   ["sum", 2, 3],
//   ["shift", 1, 5, -2],
//   ["sum", 1, 2],
//   ["sum", 4, 5]
// ])
// Возвращает [15, 6, 5, 5].
// 
// Пояснение к примеру:
// - Исходно [1,2,3,4,5], sum(1,5)=15.
// - shift(2,4,1) сдвигает [2,3,4] вправо на 1: получаем [1,4,2,3,5].
// - sum(2,3)=4+2=6.
// - shift(1,5,-2) — это сдвиг влево на 2: получаем [2,3,5,1,4].
// - sum(1,2)=2+3=5.
// - sum(4,5)=1+4=5.

function solve(n, a, queries) {
  // Детерминированный генератор приоритетов для декартова дерева.
  let seed = 0x9e3779b9;
  function rnd() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }

  function newNode(val) {
    return { val, sum: val, size: 1, left: null, right: null, prio: rnd() };
  }

  function size(t) { return t ? t.size : 0; }
  function getSum(t) { return t ? t.sum : 0; }

  function update(t) {
    if (!t) return;
    t.size = 1 + size(t.left) + size(t.right);
    t.sum = t.val + getSum(t.left) + getSum(t.right);
  }

  function merge(left, right) {
    if (!left) return right;
    if (!right) return left;
    if (left.prio > right.prio) {
      left.right = merge(left.right, right);
      update(left);
      return left;
    } else {
      right.left = merge(left, right.left);
      update(right);
      return right;
    }
  }

  // Возвращает [первые k элементов, остальные].
  function split(t, k) {
    if (!t) return [null, null];
    if (size(t.left) >= k) {
      const [l, r] = split(t.left, k);
      t.left = r;
      update(t);
      return [l, t];
    } else {
      const [l, r] = split(t.right, k - size(t.left) - 1);
      t.right = l;
      update(t);
      return [t, r];
    }
  }

  function shiftRange(root, l, r, k) {
    const len = r - l + 1;
    k = ((k % len) + len) % len;
    if (k === 0) return root;
    const [A, rest] = split(root, l);
    const [B, C] = split(rest, len);
    const [B1, B2] = split(B, len - k);
    const newB = merge(B2, B1);
    return merge(A, merge(newB, C));
  }

  let root = null;
  for (let i = 0; i < n; i++) root = merge(root, newNode(a[i]));

  const answers = [];
  for (const q of queries) {
    if (q[0] === 'sum') {
      const l = q[1] - 1;
      const r = q[2] - 1;
      const [A, rest] = split(root, r + 1);
      const [B, C] = split(A, l);
      answers.push(getSum(C));
      root = merge(B, merge(C, rest));
    } else if (q[0] === 'shift') {
      const l = q[1] - 1;
      const r = q[2] - 1;
      const k = q[3];
      root = shiftRange(root, l, r, k);
    }
  }
  return answers;
}
