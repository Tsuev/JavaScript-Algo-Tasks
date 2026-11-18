// Задача: Rimeglass Avalanche Channelling
// Сложность: hard
// Дата генерации: 2026-11-18

// Условие задачи
// В ледяных горах Римгласс лавины из редкого стекловидного льда (римгласса) стекают по сети каналов. Есть N станций, пронумерованных от 1 до N. Станция 1 — вершина (источник), станция N — долина (сток). Между станциями проложены M направленных каналов. По каналу i из u_i в v_i за секунду может протечь не более c_i единиц римгласса. Кроме того, каждая промежуточная станция j (2 ≤ j ≤ N-1) имеет ограничение на пропускную способность: через неё за секунду может пройти не более b_j единиц римгласса (суммарно по всем входящим и выходящим каналам; в силу сохранения потока это одно и то же). Станции 1 и N не имеют ограничений.
// 
// Требуется найти максимальное количество римгласса, которое может быть пропущено через сеть из станции 1 в станцию N за одну секунду.
// 
// Формат входных данных (параметры функции):
// Функция maxRimeglassFlow(N, M, edges, vertexCaps) принимает:
// - N — целое число, количество станций (2 ≤ N ≤ 200).
// - M — целое число, количество каналов (0 ≤ M ≤ 5000).
// - edges — массив из M троек [u, v, c], где u и v — номера станций (1 ≤ u, v ≤ N, u ≠ v), c — целая пропускная способность канала (1 ≤ c ≤ 10^9).
// - vertexCaps — массив длины N+1, где vertexCaps[j] — пропускная способность станции j (1 ≤ vertexCaps[j] ≤ 10^9 для 2 ≤ j ≤ N-1; для j=1 и j=N значение игнорируется).
// 
// Формат результата:
// Функция должна вернуть одно целое число — максимальный поток римгласса из станции 1 в станцию N.
// 
// Пример:
// Вход:
// N = 4, M = 5
// edges = [[1,2,10],[1,3,5],[2,3,4],[2,4,8],[3,4,10]]
// vertexCaps = [0, 0, 6, 10, 0]  (индексы 0..4, используются 2 и 3)
// 
// Выход: 11
// 
// Объяснение: можно направить 6 единиц по пути 1→2→4 и 5 единиц по пути 1→3→4, итого 11. Станция 2 ограничивает поток через себя шестью единицами.

function maxRimeglassFlow(N, M, edges, vertexCaps) {
  const INF = 1e15; // достаточно большое число (бесконечность)
  const V = 2 * N; // каждая станция раздваивается на in и out
  const graph = Array.from({ length: V }, () => []);
  // добавление ребра с обратным ребром нулевой пропускной способности
  function addEdge(u, v, cap) {
    graph[u].push({ to: v, cap, rev: graph[v].length });
    graph[v].push({ to: u, cap: 0, rev: graph[u].length - 1 });
  }
  // раздвоение станций: in(i) -> out(i) с ограничением vertexCaps[i]
  for (let i = 1; i <= N; i++) {
    const inNode = 2 * (i - 1);
    const outNode = inNode + 1;
    let cap;
    if (i === 1 || i === N) {
      cap = INF; // источник и сток без ограничений
    } else {
      cap = vertexCaps[i];
    }
    addEdge(inNode, outNode, cap);
  }
  // добавление каналов: из out(u) в in(v) с пропускной способностью c
  for (const [u, v, c] of edges) {
    const outU = 2 * (u - 1) + 1;
    const inV = 2 * (v - 1);
    addEdge(outU, inV, c);
  }
  const source = 0; // in(1)
  const sink = 2 * N - 1; // out(N)
  const level = new Array(V);
  const iter = new Array(V);
  // построение уровневого графа (BFS)
  function bfs() {
    level.fill(-1);
    const queue = [source];
    level[source] = 0;
    for (let i = 0; i < queue.length; i++) {
      const u = queue[i];
      for (const e of graph[u]) {
        if (e.cap > 0 && level[e.to] === -1) {
          level[e.to] = level[u] + 1;
          queue.push(e.to);
        }
      }
    }
    return level[sink] !== -1;
  }
  // поиск блокирующего потока (DFS с итераторами)
  function dfs(u, f) {
    if (u === sink) return f;
    for (; iter[u] < graph[u].length; iter[u]++) {
      const e = graph[u][iter[u]];
      if (e.cap > 0 && level[e.to] === level[u] + 1) {
        const d = dfs(e.to, Math.min(f, e.cap));
        if (d > 0) {
          e.cap -= d;
          graph[e.to][e.rev].cap += d;
          return d;
        }
      }
    }
    return 0;
  }
  let flow = 0;
  while (bfs()) {
    iter.fill(0);
    let f;
    while ((f = dfs(source, INF)) > 0) {
      flow += f;
    }
  }
  return flow;
}
