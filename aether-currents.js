// Задача: Aether Currents
// Сложность: medium
// Дата генерации: 2026-09-12

// Условие задачи
// В волшебном мире Аэтерии между узлами текут направленные потоки эфира. Каждый канал из u в v имеет целочисленную пропускную способность c: за единицу времени по нему можно передать не более c единиц эфира. В промежуточных узлах эфир не накапливается: сколько в узел втекает, столько и должно вытекать. Нужно определить максимальное количество эфира, которое можно передать из источника s в сток t за единицу времени.
// 
// Формат входных данных:
// Первая строка содержит n, m, s, t — количество узлов, количество каналов, источник и сток. Узлы нумеруются с 1.
// Следующие m строк содержат u, v, c — направленный канал из u в v с пропускной способностью c. Кратные каналы допускаются.
// 
// Формат результата:
// Выведите одно целое число — величину максимального потока из s в t.
// 
// Ограничения:
// 2 <= n <= 2000
// 0 <= m <= 10000
// 1 <= s, t <= n, s != t
// 0 <= c <= 10^9
// Ответ не превосходит 10^14.
// 
// Пример:
// Вход:
// 4 5 1 4
// 1 2 10
// 1 3 5
// 2 3 2
// 2 4 7
// 3 4 8
// 
// Выход:
// 14
// 
// Пояснение: можно отправить 5 единиц по пути 1 -> 3 -> 4, 7 единиц по пути 1 -> 2 -> 4 и ещё 2 единицы по пути 1 -> 2 -> 3 -> 4. Суммарно 14.

function maxAetherCurrents(n, edges, source, sink) {
  // Переводим номера вершин в 0-индексацию, так удобнее для массивов.
  const s = source - 1;
  const t = sink - 1;

  // Если источник совпадает со стоком, передавать эфир некуда.
  if (s === t) return 0;

  // Граф для алгоритма Диница: для каждого ребра храним прямое ребро
  // с остаточной пропускной способностью и обратное ребро с нулём.
  const graph = Array.from({ length: n }, () => []);

  const addEdge = (from, to, cap) => {
    const forward = { to, cap, rev: graph[to].length };
    const backward = { to: from, cap: 0, rev: graph[from].length };
    graph[from].push(forward);
    graph[to].push(backward);
  };

  for (const [u, v, cap] of edges) {
    addEdge(u - 1, v - 1, cap);
  }

  // level хранит расстояния от источника в остаточной сети.
  // iter помогает не перебирать одни и те же рёбра повторно на каждом шаге.
  const level = new Array(n);
  const iter = new Array(n);

  // Поиск в ширину строит слоистую сеть по рёбрам с положительной пропускной способностью.
  const bfs = () => {
    level.fill(-1);
    level[s] = 0;
    const queue = [s];

    for (let head = 0; head < queue.length; head++) {
      const v = queue[head];
      for (const e of graph[v]) {
        if (e.cap > 0 && level[e.to] === -1) {
          level[e.to] = level[v] + 1;
          queue.push(e.to);
        }
      }
    }

    return level[t] !== -1;
  };

  // Поиск блокирующего потока в слоистой сети.
  const dfs = (v, pushed) => {
    if (v === t) return pushed;

    for (; iter[v] < graph[v].length; iter[v]++) {
      const e = graph[v][iter[v]];

      // Идём только по рёбрам, которые ведут на следующий слой.
      if (e.cap <= 0 || level[v] + 1 !== level[e.to]) continue;

      const flow = dfs(e.to, Math.min(pushed, e.cap));
      if (flow > 0) {
        e.cap -= flow;
        graph[e.to][e.rev].cap += flow;
        return flow;
      }
    }

    return 0;
  };

  let total = 0;
  const INF = Number.MAX_SAFE_INTEGER;

  // Пока в остаточной сети есть путь из s в t, увеличиваем поток.
  while (bfs()) {
    iter.fill(0);

    while (true) {
      const pushed = dfs(s, INF);
      if (pushed === 0) break;
      total += pushed;
    }
  }

  return total;
}
