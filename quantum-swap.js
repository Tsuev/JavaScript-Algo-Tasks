// Задача: Quantum Swap
// Сложность: hard
// Дата генерации: 2026-09-19

// Условие задачи
// Дана последовательность a длины n. Нужно поддерживать четыре типа операций:
// 
// 1 i j — Quantum Swap: поменять местами элементы на позициях i и j (позиции считаются в текущей последовательности).
// 2 l r — Quantum Reverse: развернуть отрезок [l, r].
// 3 l r x — Quantum Shift: прибавить x к каждому элементу отрезка [l, r].
// 4 l r — запрос суммы элементов отрезка [l, r] по модулю 10^9+7.
// 
// Формат входа:
// Первая строка: n q (1 ≤ n, q ≤ 2*10^5).
// Вторая строка: n целых чисел a_i (0 ≤ a_i < 10^9+7).
// Далее q строк с операциями:
// 1 i j (1 ≤ i, j ≤ n, i ≠ j)
// 2 l r (1 ≤ l ≤ r ≤ n)
// 3 l r x (1 ≤ l ≤ r ≤ n, |x| ≤ 10^9)
// 4 l r (1 ≤ l ≤ r ≤ n)
// 
// Все операции и суммы вычисляются по модулю MOD = 10^9+7.
// 
// Формат выхода:
// Для каждого запроса типа 4 вывести одно целое число — сумму по модулю MOD.
// 
// Пример:
// Вход:
// 5 5
// 1 2 3 4 5
// 1 1 5
// 2 2 4
// 3 1 3 10
// 4 1 5
// 4 2 4
// 
// Выход:
// 45
// 29
// 
// Пояснение к примеру:
// Исходный массив: [1, 2, 3, 4, 5].
// После swap 1 5: [5, 2, 3, 4, 1].
// После reverse 2 4: [5, 4, 3, 2, 1].
// После add 1 3 10: [15, 14, 13, 2, 1].
// Сумма [1, 5] = 45, сумма [2, 4] = 29.

function quantumSwap(input) {
  const MOD = 1000000007;

  class Node {
    constructor(val) {
      this.val = ((val % MOD) + MOD) % MOD;
      this.prio = Math.random();
      this.left = null;
      this.right = null;
      this.size = 1;
      this.sum = this.val;
      this.add = 0;
      this.rev = false;
    }
  }

  const size = (t) => t ? t.size : 0;
  const sum = (t) => t ? t.sum : 0;

  function pull(t) {
    if (!t) return;
    t.size = 1 + size(t.left) + size(t.right);
    t.sum = (t.val + sum(t.left) + sum(t.right)) % MOD;
  }

  function applyAdd(t, x) {
    if (!t) return;
    const add = ((x % MOD) + MOD) % MOD;
    t.val = (t.val + add) % MOD;
    t.sum = (t.sum + add * t.size) % MOD;
    t.add = (t.add + add) % MOD;
  }

  function applyRev(t) {
    if (!t) return;
    const tmp = t.left;
    t.left = t.right;
    t.right = tmp;
    t.rev = !t.rev;
  }

  function push(t) {
    if (!t) return;
    if (t.rev) {
      applyRev(t.left);
      applyRev(t.right);
      t.rev = false;
    }
    if (t.add !== 0) {
      applyAdd(t.left, t.add);
      applyAdd(t.right, t.add);
      t.add = 0;
    }
  }

  function split(t, k) {
    if (!t) return [null, null];
    push(t);
    if (size(t.left) >= k) {
      const [l, r] = split(t.left, k);
      t.left = r;
      pull(t);
      return [l, t];
    } else {
      const [l, r] = split(t.right, k - size(t.left) - 1);
      t.right = l;
      pull(t);
      return [t, r];
    }
  }

  function merge(a, b) {
    if (!a || !b) return a || b;
    if (a.prio > b.prio) {
      push(a);
      a.right = merge(a.right, b);
      pull(a);
      return a;
    } else {
      push(b);
      b.left = merge(a, b.left);
      pull(b);
      return b;
    }
  }

  function swapPositions(root, i, j) {
    if (i === j) return root;
    if (i > j) [i, j] = [j, i];

    let A, rest, X, rest2, B, rest3, Y, C;
    [A, rest] = split(root, i - 1);
    [X, rest2] = split(rest, 1);
    [B, rest3] = split(rest2, j - i - 1);
    [Y, C] = split(rest3, 1);

    let res = merge(A, Y);
    res = merge(res, B);
    res = merge(res, X);
    res = merge(res, C);
    return res;
  }

  const data = input.trim().split(/\s+/);
  let ptr = 0;
  const n = parseInt(data[ptr++], 10);
  const q = parseInt(data[ptr++], 10);

  let root = null;
  for (let i = 0; i < n; i++) {
    const val = parseInt(data[ptr++], 10);
    root = merge(root, new Node(val));
  }

  const out = [];

  for (let _ = 0; _ < q; _++) {
    const type = parseInt(data[ptr++], 10);
    if (type === 1) {
      const i = parseInt(data[ptr++], 10);
      const j = parseInt(data[ptr++], 10);
      root = swapPositions(root, i, j);
    } else if (type === 2) {
      const l = parseInt(data[ptr++], 10);
      const r = parseInt(data[ptr++], 10);
      let A, rest, B, C;
      [A, rest] = split(root, l - 1);
      [B, C] = split(rest, r - l + 1);
      applyRev(B);
      root = merge(A, merge(B, C));
    } else if (type === 3) {
      const l = parseInt(data[ptr++], 10);
      const r = parseInt(data[ptr++], 10);
      const x = parseInt(data[ptr++], 10);
      let A, rest, B, C;
      [A, rest] = split(root, l - 1);
      [B, C] = split(rest, r - l + 1);
      applyAdd(B, x);
      root = merge(A, merge(B, C));
    } else if (type === 4) {
      const l = parseInt(data[ptr++], 10);
      const r = parseInt(data[ptr++], 10);
      let A, rest, B, C;
      [A, rest] = split(root, l - 1);
      [B, C] = split(rest, r - l + 1);
      out.push(sum(B) % MOD);
      root = merge(A, merge(B, C));
    }
  }

  return out.join('\n');
}
