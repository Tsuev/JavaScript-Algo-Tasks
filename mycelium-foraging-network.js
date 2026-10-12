// Задача: Mycelium Foraging Network
// Сложность: hard
// Дата генерации: 2026-10-12

// Условие задачи
// Mycelium Foraging Network
// 
// У грибницы есть n узлов, пронумерованных от 0 до n-1, и m каналов между ними. Каждый канал задан тройкой [u, v, w]: он соединяет узлы u и v и имеет длину w. В некоторых узлах находятся плодовые тела — это массив important. Нужно вырастить связную сеть мицелия, которая содержит все узлы из important. Сеть может проходить через любые другие узлы, а лишние каналы использовать не обязательно. Требуется минимизировать суммарную длину использованных каналов. Если соединить все important-узлы невозможно, вернуть -1.
// 
// Формат входа: функция solveMycelium(n, edges, important). edges — массив троек [u, v, w]. important — массив различных номеров обязательных узлов.
// 
// Формат результата: число — минимальная возможная суммарная длина сети, или -1, если все обязательные узлы нельзя соединить.
// 
// Ограничения: 1 ≤ n ≤ 15, 0 ≤ m ≤ n(n-1)/2, 1 ≤ w ≤ 10^6, 1 ≤ important.length ≤ n.
// 
// Пример 1:
// n = 5
// edges = [[0,1,2], [1,2,2], [2,3,2], [3,4,2], [0,4,10]]
// important = [0,2,4]
// Ответ: 8. Можно взять каналы 0-1, 1-2, 2-3, 3-4.
// 
// Пример 2:
// n = 4
// edges = [[0,1,5]]
// important = [0,2]
// Ответ: -1, потому что узел 2 недостижим.

function solveMycelium(n, edges, important) {
  const INF = Number.POSITIVE_INFINITY;

  // Матрица кратчайших путей между всеми узлами.
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );

  for (const [u, v, w] of edges) {
    if (w < dist[u][v]) {
      dist[u][v] = w;
      dist[v][u] = w;
    }
  }

  // Флойд–Уоршелл: нужен, чтобы уметь «дотягивать» сеть до любого узла
  // по кратчайшему пути, используя промежуточные узлы.
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (dist[i][k] === INF) continue;
      for (let j = 0; j < n; j++) {
        const nd = dist[i][k] + dist[k][j];
        if (nd < dist[i][j]) dist[i][j] = nd;
      }
    }
  }

  const k = important.length;
  if (k === 0) return 0;

  const full = (1 << k) - 1;
  const dp = Array.from({ length: 1 << k }, () => Array(n).fill(INF));

  // База: сеть из одного важного узла имеет длину 0 и находится в этом узле.
  for (let i = 0; i < k; i++) {
    dp[1 << i][important[i]] = 0;
  }

  for (let mask = 1; mask <= full; mask++) {
    // Соединяем два меньших множества обязательных узлов в одном узле v.
    if ((mask & (mask - 1)) !== 0) {
      const low = mask & -mask; // фиксируем младший бит, чтобы не перебирать пары дважды
      for (let sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
        if ((sub & low) === 0) continue;
        const rest = mask ^ sub;
        if (rest === 0) continue;
        for (let v = 0; v < n; v++) {
          const cand = dp[sub][v] + dp[rest][v];
          if (cand < dp[mask][v]) dp[mask][v] = cand;
        }
      }
    }

    // Релаксация: от готовой сети в узле u можно дорастить путь до v.
    // Так необязательные узлы становятся транзитными.
    const base = dp[mask].slice();
    for (let v = 0; v < n; v++) {
      let best = base[v];
      for (let u = 0; u < n; u++) {
        if (base[u] === INF || dist[u][v] === INF) continue;
        const cand = base[u] + dist[u][v];
        if (cand < best) best = cand;
      }
      dp[mask][v] = best;
    }
  }

  let answer = INF;
  for (let v = 0; v < n; v++) {
    if (dp[full][v] < answer) answer = dp[full][v];
  }

  return answer === INF ? -1 : answer;
}
