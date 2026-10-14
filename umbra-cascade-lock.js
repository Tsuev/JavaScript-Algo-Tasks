// Задача: Umbra Cascade Lock
// Сложность: hard
// Дата генерации: 2026-10-14

// Условие задачи
// Замок «Umbra Cascade» состоит из n тумблеров, соединённых в корневое дерево с корнем в вершине 1. У каждого тумблера есть уровень тени — целое число, изначально равное 0.
// 
// Глубиной вершины назовём число рёбер на пути от корня до неё; глубина корня равна 0. Поддеревом вершины v считаем саму v и всех её потомков.
// 
// Поддерживаются запросы двух типов:
// • «каскад»: 1 v k x — прибавить x к уровню тени каждой вершины u из поддерева v, для которой depth(u) = depth(v) + k;
// • «тень»: 2 v — вывести текущий уровень тени вершины v.
// 
// Формат ввода:
// Первая строка содержит два целых числа n и q (1 ≤ n, q ≤ 2·10^5) — количество вершин и количество запросов.
// Следующие n − 1 строк задают рёбра дерева: по два числа a и b (1 ≤ a, b ≤ n, a ≠ b).
// Следующие q строк задают запросы:
// • 1 v k x (1 ≤ v ≤ n, 0 ≤ k ≤ n, |x| ≤ 10^9) — каскад;
// • 2 v (1 ≤ v ≤ n) — запрос тени.
// 
// Формат вывода:
// Для каждого запроса типа 2 вывести одно целое число — текущий уровень тени соответствующей вершины, каждое на отдельной строке.
// 
// Пример 1.
// Ввод:
// 5 4
// 1 2
// 1 3
// 2 4
// 2 5
// 1 2 1 5
// 2 4
// 2 5
// 2 3
// Вывод:
// 5
// 5
// 0
// Пояснение: каскад из вершины 2 на расстояние k = 1 задевает только вершины 4 и 5 (глубина 2), поэтому у них тень стала 5, а у вершины 3 осталась 0.
// 
// Пример 2.
// Ввод:
// 6 5
// 1 2
// 1 3
// 2 4
// 3 5
// 3 6
// 1 1 2 7
// 2 5
// 2 6
// 1 3 0 -7
// 2 5
// Вывод:
// 7
// 7
// 7
// Пояснение: сначала каскад из корня на расстояние 2 добавляет 7 вершинам 4, 5, 6. Затем каскад из вершины 3 на расстояние 0 меняет только саму вершину 3 (на −7), поэтому тень вершины 5 остаётся равной 7.
// 
// Ограничения: суммарное время работы должно быть порядка O((n + q) log n), память O(n). Ответы могут достигать 2·10^14, поэтому используйте 64-битные числа (в JS — обычный Number, точный до 2^53) или длинную арифметику.

function umbraCascadeLock(n, edges, operations) {
  // Списки смежности неориентированного дерева.
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  // Итеративный DFS: считаем tin/tout (эйлеров обход), глубины и порядок preorder.
  // Рекурсия не подходит из-за глубины дерева до 2·10^5.
  const tin = new Int32Array(n + 1);
  const tout = new Int32Array(n + 1);
  const depth = new Int32Array(n + 1);
  const parent = new Int32Array(n + 1);
  const ptr = new Int32Array(n + 1);
  const order = []; // вершины в порядке preorder
  const stack = [1];
  let timer = 0;
  tin[1] = timer++;
  order.push(1);
  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    if (ptr[v] < adj[v].length) {
      const u = adj[v][ptr[v]++];
      if (u === parent[v]) continue; // не возвращаемся к предку
      parent[u] = v;
      depth[u] = depth[v] + 1;
      tin[u] = timer++;
      order.push(u);
      stack.push(u);
    } else {
      tout[v] = timer - 1; // максимальный tin внутри поддерева v
      stack.pop();
    }
  }

  // Раскладываем вершины по уровням глубины. Поскольку order — это preorder,
  // внутри каждого уровня tin возрастает, и поддерево любой вершины даёт
  // непрерывный отрезок в списке того уровня, к которому мы обращаемся.
  let maxDepth = 0;
  for (let v = 1; v <= n; v++) if (depth[v] > maxDepth) maxDepth = depth[v];
  const byDepth = Array.from({ length: maxDepth + 1 }, () => []);
  const posInLevel = new Int32Array(n + 1);
  for (const v of order) {
    posInLevel[v] = byDepth[depth[v]].length;
    byDepth[depth[v]].push(v);
  }

  // Для каждого уровня — своё дерево Фенвика на диапазонное добавление
  // и точечный запрос. Суммарный размер всех деревьев равен n.
  const bits = byDepth.map((list) => new Float64Array(list.length + 1));

  const bitAdd = (level, idx, delta) => {
    const tree = bits[level];
    for (let i = idx + 1; i < tree.length; i += i & -i) tree[i] += delta;
  };

  const bitSum = (level, idx) => {
    const tree = bits[level];
    let s = 0;
    for (let i = idx + 1; i > 0; i -= i & -i) s += tree[i];
    return s;
  };

  // Прибавить delta ко всем позициям [l, r] уровня level (0-индексация).
  const rangeAdd = (level, l, r, delta) => {
    if (l > r) return;
    bitAdd(level, l, delta);
    const size = byDepth[level].length;
    if (r + 1 < size) bitAdd(level, r + 1, -delta);
  };

  // Первый индекс уровня level с tin >= key (границы поддерева ищем бинарным поиском).
  const lowerBound = (level, key) => {
    const list = byDepth[level];
    let lo = 0, hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tin[list[mid]] < key) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  // Первый индекс уровня level с tin > key.
  const upperBound = (level, key) => {
    const list = byDepth[level];
    let lo = 0, hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tin[list[mid]] <= key) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const answers = [];
  for (const op of operations) {
    if (op[0] === 1) {
      // Каскад: нужна ровно глубина depth[v] + k.
      const v = op[1], k = op[2], x = op[3];
      const level = depth[v] + k;
      if (level > maxDepth) continue; // на такой глубине вершин нет
      const l = lowerBound(level, tin[v]);           // первая вершина уровня внутри поддерева
      const r = upperBound(level, tout[v]) - 1;      // последняя вершина уровня внутри поддерева
      rangeAdd(level, l, r, x);
    } else {
      // Запрос тени: точечное значение в дереве Фенвика своего уровня.
      const v = op[1];
      answers.push(bitSum(depth[v], posInLevel[v]));
    }
  }
  return answers;
}
