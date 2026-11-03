// Задача: Mistvane Lattice Balancing
// Сложность: hard
// Дата генерации: 2026-11-03

// Условие задачи
// Дана целочисленная таблица размера n × m. За одну операцию можно выбрать любую строку или любой столбец и прибавить 1 ко всем его элементам, либо вычесть 1 из всех его элементов. Стоимость каждой операции — 1.
// 
// Требуется за минимальное суммарное число операций сделать все элементы таблицы равными друг другу (целевое значение может быть любым целым). Если это невозможно, выведите -1.
// 
// Входные данные:
// Первая строка содержит два целых числа n и m (1 ≤ n, m ≤ 1000). Далее идут n строк, в каждой по m целых чисел a[i][j] (−10^9 ≤ a[i][j] ≤ 10^9).
// 
// Выходные данные:
// Одно целое число — минимальное количество операций или -1.
// 
// Пример 1:
// Вход:
// 2 2
// 0 1
// 1 2
// Выход:
// 2
// 
// Пример 2:
// Вход:
// 2 2
// 0 1
// 2 3
// Выход:
// 3
// 
// Пример 3:
// Вход:
// 2 2
// 0 0
// 0 1
// Выход:
// -1

function solve(input) {
  let pos = 0;
  const len = input.length;

  // Быстрый парсер целых чисел без создания промежуточных массивов
  function nextInt() {
    while (pos < len && input.charCodeAt(pos) <= 32) pos++;
    let sign = 1;
    if (input.charCodeAt(pos) === 45) {
      sign = -1;
      pos++;
    }
    let num = 0;
    while (pos < len) {
      const code = input.charCodeAt(pos);
      if (code < 48 || code > 57) break;
      num = num * 10 + (code - 48);
      pos++;
    }
    return sign * num;
  }

  const n = nextInt();
  const m = nextInt();

  const row0 = new Array(m);
  for (let j = 0; j < m; j++) row0[j] = nextInt();

  const base = row0[0];

  // s[i] и t[j] такие, что s[i] + t[j] = -a[i][j]
  const s = new Array(n);
  s[0] = -base;
  const t = new Array(m);
  for (let j = 0; j < m; j++) t[j] = -row0[j] + base;

  // Проверяем совместность: a[i][j] = a[i][0] + a[0][j] - a[0][0]
  for (let i = 1; i < n; i++) {
    const ai0 = nextInt();
    s[i] = -ai0;
    for (let j = 1; j < m; j++) {
      const v = nextInt();
      if (v !== ai0 + row0[j] - base) {
        return -1;
      }
    }
  }

  // min по целому сдвигу k суммы |v[i] + k| достигается в медиане чисел -v[i]
  function minAbsSumWithShift(vals) {
    const u = new Array(vals.length);
    for (let i = 0; i < vals.length; i++) u[i] = -vals[i];
    u.sort((a, b) => a - b);
    const med = u[Math.floor(u.length / 2)];
    let total = 0;
    for (let i = 0; i < u.length; i++) total += Math.abs(u[i] - med);
    return total;
  }

  return minAbsSumWithShift(s) + minAbsSumWithShift(t);
}
