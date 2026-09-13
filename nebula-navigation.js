// Задача: Nebula Navigation
// Сложность: hard
// Дата генерации: 2026-09-13

// Условие задачи
// Вы — навигатор космического корабля, путешествующего через туманность. Туманность представляет собой прямоугольную сетку N x M. Каждая клетка может быть пустой ('.'), астероидом ('#'), стартовой точкой ('S') или конечной точкой ('E'). Также в туманности есть W парных червоточин. Каждая червоточина соединяет две клетки: вход A и выход B. Если корабль находится в клетке A, он может мгновенно переместиться в B (стоимость 0). Использовать каждую червоточину можно не более одного раза (после использования она исчезает). Корабль может двигаться на одну клетку вверх, вниз, влево или вправо, если целевая клетка не является астероидом. Каждый такой шаг стоит 1 единицу топлива. Требуется найти минимальное количество топлива, необходимое для достижения клетки 'E' из 'S'. Если это невозможно, выведите -1.
// 
// Входные данные:
// Первая строка содержит три целых числа N, M, W (1 ≤ N, M ≤ 100, 0 ≤ W ≤ 10).
// Далее следует N строк по M символов — описание сетки. Символы: '.', '#', 'S', 'E'. Гарантируется, что 'S' и 'E' встречаются ровно по одному разу.
// Затем следует W строк, каждая содержит четыре целых числа r1, c1, r2, c2 — координаты входа и выхода червоточины (0-индексация, r — строка, c — столбец). Гарантируется, что клетки (r1, c1) и (r2, c2) не являются астероидами и не совпадают. Червоточины могут пересекаться (одна клетка может быть входом/выходом нескольких червоточин).
// 
// Выходные данные: одно целое число — минимальное количество шагов (топлива) или -1.
// 
// Пример:
// Ввод:
// 5 5 1
// S...#
// .###.
// .....
// .####
// ....E
// 0 0 2 2
// 
// Вывод:
// 4
// 
// Пояснение:
// Старт в (0,0), финиш в (4,4). Червоточина ведет из (0,0) в (2,2). Используем червоточину и оказываемся в (2,2) за 0 шагов. Затем идем вниз до (4,2) (2 шага), вправо до (4,3) (1 шаг) и вправо до (4,4) (1 шаг). Итого 4 шага. Без червоточины путь занял бы 8 шагов.

class MinHeap {
  constructor() { this.heap = []; }
  push(item) {
    this.heap.push(item);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p][0] <= this.heap[i][0]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      const n = this.heap.length;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
        if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
        if (smallest === i) break;
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      }
    }
    return top;
  }
  isEmpty() { return this.heap.length === 0; }
}

function solve(input) {
  const lines = input.trim().split('\n');
  const [N, M, W] = lines[0].split(' ').map(Number);
  const grid = lines.slice(1, 1 + N);
  const portals = [];
  for (let i = 1 + N; i < 1 + N + W; i++) {
    const [r1, c1, r2, c2] = lines[i].split(' ').map(Number);
    portals.push({ r1, c1, r2, c2 });
  }

  // Собираем все уникальные точки: S, E и все входы/выходы червоточин
  const points = [];
  const pointToIndex = new Map();
  function addPoint(r, c) {
    const key = r + ',' + c;
    if (!pointToIndex.has(key)) {
      pointToIndex.set(key, points.length);
      points.push({ r, c });
    }
    return pointToIndex.get(key);
  }

  let S_idx = -1, E_idx = -1;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < M; c++) {
      if (grid[r][c] === 'S') S_idx = addPoint(r, c);
      if (grid[r][c] === 'E') E_idx = addPoint(r, c);
    }
  }

  const portalA = [], portalB = [];
  for (const p of portals) {
    const a = addPoint(p.r1, p.c1);
    const b = addPoint(p.r2, p.c2);
    portalA.push(a);
    portalB.push(b);
  }

  const P = points.length;

  // BFS от каждой точки интереса для вычисления кратчайших путей по сетке (без червоточин)
  function bfs(startR, startC) {
    const dist = Array.from({ length: N }, () => new Array(M).fill(Infinity));
    const queue = [[startR, startC]];
    dist[startR][startC] = 0;
    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];
      const d = dist[r][c];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < M && grid[nr][nc] !== '#' && dist[nr][nc] === Infinity) {
          dist[nr][nc] = d + 1;
          queue.push([nr, nc]);
        }
      }
    }
    return dist;
  }

  const gridDist = Array.from({ length: P }, () => new Array(P).fill(Infinity));
  for (let i = 0; i < P; i++) {
    const { r, c } = points[i];
    const distMap = bfs(r, c);
    for (let j = 0; j < P; j++) {
      const { r: r2, c: c2 } = points[j];
      gridDist[i][j] = distMap[r2][c2];
    }
  }

  // Дейкстра по состояниям (точка, маска использованных червоточин)
  const totalMasks = 1 << W;
  const dist = Array.from({ length: P }, () => new Array(totalMasks).fill(Infinity));
  dist[S_idx][0] = 0;
  const pq = new MinHeap();
  pq.push([0, S_idx, 0]);

  while (!pq.isEmpty()) {
    const [d, u, mask] = pq.pop();
    if (d > dist[u][mask]) continue;

    // Перемещение пешком
    for (let v = 0; v < P; v++) {
      if (v === u) continue;
      const cost = gridDist[u][v];
      if (cost === Infinity) continue;
      const nd = d + cost;
      if (nd < dist[v][mask]) {
        dist[v][mask] = nd;
        pq.push([nd, v, mask]);
      }
    }

    // Использование червоточины
    for (let i = 0; i < W; i++) {
      if (portalA[i] === u && (mask & (1 << i)) === 0) {
        const v = portalB[i];
        const newMask = mask | (1 << i);
        if (d < dist[v][newMask]) {
          dist[v][newMask] = d;
          pq.push([d, v, newMask]);
        }
      }
    }
  }

  let ans = Infinity;
  for (let mask = 0; mask < totalMasks; mask++) {
    ans = Math.min(ans, dist[E_idx][mask]);
  }
  return ans === Infinity ? -1 : ans;
}

// Пример вызова:
// const input = `5 5 1
// S...#
// .###.
// .....
// .####
// ....E
// 0 0 2 2`;
// console.log(solve(input)); // 4
