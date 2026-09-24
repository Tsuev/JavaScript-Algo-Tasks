// Задача: Aurora Pulse Synchronization
// Сложность: hard
// Дата генерации: 2026-09-24

// Условие задачи
// В сети полярных станций "Аврора" есть N станций и M направленных каналов связи. Каждый канал i идет от станции u_i к станции v_i и имеет задержку w_i (целое положительное число). Когда станция u отправляет импульс в момент времени x_u, он достигает станции v в момент времени x_u + w_i. Для идеальной синхронизации мы хотим, чтобы время прихода импульса на станцию v совпадало со временем отправки импульса станцией v, то есть x_v = x_u + w_i. Однако из-за циклов в сети это не всегда возможно. Мы можем выбрать целочисленные моменты отправки x_i для каждой станции. Ошибка на канале (u, v, w) равна |x_u - x_v + w|. Требуется минимизировать максимальную ошибку по всем каналам. Найдите минимальное возможное значение K, такое что можно выбрать x_i так, чтобы для всех каналов выполнялось |x_u - x_v + w| <= K.
// 
// Формат входных данных:
// Первая строка содержит два целых числа N (1 <= N <= 1000) и M (0 <= M <= 10000) — количество станций и каналов.
// Следующие M строк содержат по три целых числа u, v, w (1 <= u, v <= N, u != v, 1 <= w <= 10^9) — описание канала.
// 
// Формат выходных данных:
// Одно целое число — минимальное возможное значение K.
// 
// Пример:
// Вход:
// 3 3
// 1 2 2
// 2 3 3
// 3 1 4
// Выход:
// 3
// 
// Пояснение:
// Можно выбрать x_1 = 0, x_2 = -1, x_3 = -1. Тогда ошибки: |0 - (-1) + 2| = 3, |-1 - (-1) + 3| = 3, |-1 - 0 + 4| = 3. Максимальная ошибка равна 3. Меньше 3 сделать нельзя.

function solve(N, M, edges) {
  if (M === 0) return 0;
  let maxW = 0;
  for (const [u, v, w] of edges) {
    if (w > maxW) maxW = w;
  }
  const feasible = (K) => {
    const head = new Array(N + 1).fill(-1);
    const to = [];
    const wt = [];
    const nxt = [];
    const addEdge = (u, v, w) => {
      to.push(v);
      wt.push(w);
      nxt.push(head[u]);
      head[u] = to.length - 1;
    };
    for (let i = 1; i <= N; i++) {
      addEdge(0, i, 0);
    }
    for (const [u, v, w] of edges) {
      addEdge(u, v, w + K);
      addEdge(v, u, -w + K);
    }
    const dist = new Array(N + 1).fill(Infinity);
    const cnt = new Array(N + 1).fill(0);
    const inQueue = new Array(N + 1).fill(false);
    const queue = [0];
    let qHead = 0;
    inQueue[0] = true;
    dist[0] = 0;
    while (qHead < queue.length) {
      const u = queue[qHead++];
      inQueue[u] = false;
      for (let e = head[u]; e !== -1; e = nxt[e]) {
        const v = to[e];
        const w = wt[e];
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          cnt[v]++;
          if (cnt[v] > N) return false;
          if (!inQueue[v]) {
            queue.push(v);
            inQueue[v] = true;
          }
        }
      }
    }
    return true;
  };
  let low = 0;
  let high = maxW;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (feasible(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}
