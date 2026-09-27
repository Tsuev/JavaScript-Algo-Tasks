// Задача: Static Bloom Propagation
// Сложность: hard
// Дата генерации: 2026-09-27

// Условие задачи
// Static Bloom Propagation
// 
// Условие задачи:
// Дан ориентированный граф из n вершин и m рёбер. Каждая вершина имеет фильтр — битовую строку длины b. Фильтр задан шестнадцатеричной строкой длины L = ceil(b/4). Первый символ кодирует биты 0,1,2,3 (бит 0 — младший бит шестнадцатеричной цифры), второй — биты 4..7 и так далее. Если b не кратно 4, лишние старшие биты в последней шестнадцатеричной цифре равны нулю.
// 
// Процесс распространения: пока это возможно, для каждого ребра u → v выполняется операция v.filter = v.filter OR u.filter. Все обновления происходят одновременно. Так как операция OR только добавляет единичные биты, процесс завершается. Требуется найти конечные фильтры всех вершин и вывести для каждой вершины количество единичных бит в её конечном фильтре.
// 
// Формат входных данных:
// Первая строка: три целых числа n, m, b (1 ≤ n ≤ 50000, 0 ≤ m ≤ 200000, 1 ≤ b ≤ 1024).
// Следующие n строк: по одной шестнадцатеричной строке длины L = ceil(b/4) — начальный фильтр вершины i (1 ≤ i ≤ n).
// Следующие m строк: по два целых числа u, v (1 ≤ u, v ≤ n) — ориентированное ребро u → v.
// 
// Формат выходных данных:
// Одна строка, содержащая n целых чисел через пробел: для каждой вершины i (в порядке 1..n) количество единичных бит в её конечном фильтре.
// 
// Пример 1:
// Вход:
// 3 3 4
// 1
// 2
// 4
// 1 2
// 2 3
// 3 1
// Выход:
// 3 3 3
// Пояснение: все вершины в одном цикле, после распространения каждая получает объединение всех битов: 1|2|4 = 7, popcount(7)=3.
// 
// Пример 2:
// Вход:
// 3 2 4
// 1
// 2
// 4
// 1 2
// 2 3
// Выход:
// 1 2 3
// Пояснение: 1→2→3. Вершина 1 остаётся с фильтром 1 (1 бит). Вершина 2 получает 1|2=3 (2 бита). Вершина 3 получает 1|2|4=7 (3 бита).
// 
// Ограничения и гарантии:
// - Граф может содержать кратные рёбра и петли.
// - Время выполнения: O((n+m) * ceil(b/32)).

function solve(input) {
  const tokens = input.trim().split(/\s+/);
  let ptr = 0;
  const n = parseInt(tokens[ptr++], 10);
  const m = parseInt(tokens[ptr++], 10);
  const b = parseInt(tokens[ptr++], 10);
  const L = Math.ceil(b / 4);
  const hexStrings = [];
  for (let i = 0; i < n; i++) {
    hexStrings.push(tokens[ptr++]);
  }
  const U = new Int32Array(m);
  const V = new Int32Array(m);
  for (let i = 0; i < m; i++) {
    U[i] = parseInt(tokens[ptr++], 10) - 1;
    V[i] = parseInt(tokens[ptr++], 10) - 1;
  }

  // Построение CSR для исходного графа и обратного графа
  const outDeg = new Int32Array(n);
  const inDeg = new Int32Array(n);
  for (let i = 0; i < m; i++) {
    outDeg[U[i]]++;
    inDeg[V[i]]++;
  }
  const startOut = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) startOut[i + 1] = startOut[i] + outDeg[i];
  const adj = new Int32Array(m);
  const posOut = startOut.slice(0, n);
  for (let i = 0; i < m; i++) {
    const u = U[i];
    adj[posOut[u]++] = V[i];
  }

  const startRev = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) startRev[i + 1] = startRev[i] + inDeg[i];
  const radj = new Int32Array(m);
  const posRev = startRev.slice(0, n);
  for (let i = 0; i < m; i++) {
    const v = V[i];
    radj[posRev[v]++] = U[i];
  }

  // Первый проход Косараю: порядок завершения DFS на исходном графе
  const visited = new Uint8Array(n);
  const order = new Int32Array(n);
  let orderLen = 0;
  const stack = new Int32Array(n);
  const edgeStack = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (visited[s]) continue;
    let top = 0;
    stack[top] = s;
    edgeStack[top] = startOut[s];
    visited[s] = 1;
    while (top >= 0) {
      const v = stack[top];
      const e = edgeStack[top];
      if (e < startOut[v + 1]) {
        const to = adj[e];
        edgeStack[top] = e + 1;
        if (!visited[to]) {
          visited[to] = 1;
          top++;
          stack[top] = to;
          edgeStack[top] = startOut[to];
        }
      } else {
        order[orderLen++] = v;
        top--;
      }
    }
  }

  // Второй проход: компоненты сильной связности на обратном графе
  const comp = new Int32Array(n).fill(-1);
  let compCnt = 0;
  const revStack = new Int32Array(n);
  for (let i = orderLen - 1; i >= 0; i--) {
    const v = order[i];
    if (comp[v] !== -1) continue;
    let top = 0;
    revStack[top] = v;
    comp[v] = compCnt;
    while (top >= 0) {
      const cur = revStack[top--];
      for (let e = startRev[cur]; e < startRev[cur + 1]; e++) {
        const to = radj[e];
        if (comp[to] === -1) {
          comp[to] = compCnt;
          revStack[++top] = to;
        }
      }
    }
    compCnt++;
  }

  // Разбор начальных фильтров в битсеты
  const W = Math.ceil(b / 32);
  const initialBits = new Uint32Array(n * W);

  function hexVal(ch) {
    if (ch >= 48 && ch <= 57) return ch - 48;
    if (ch >= 97 && ch <= 102) return ch - 87;
    if (ch >= 65 && ch <= 70) return ch - 55;
    return 0;
  }

  for (let i = 0; i < n; i++) {
    const str = hexStrings[i];
    const off = i * W;
    for (let w = 0; w < W; w++) {
      let word = 0;
      const base = w * 8;
      for (let k = 0; k < 8; k++) {
        const j = base + k;
        if (j >= L) break;
        const val = hexVal(str.charCodeAt(j));
        word |= (val << (4 * k));
      }
      initialBits[off + w] = word;
    }
    if (b % 32 !== 0) {
      const last = W - 1;
      const mask = (1 << (b % 32)) - 1;
      initialBits[off + last] &= mask;
    }
  }

  // Объединение фильтров внутри компонент
  const compBits = new Array(compCnt);
  for (let i = 0; i < compCnt; i++) compBits[i] = new Uint32Array(W);
  for (let v = 0; v < n; v++) {
    const c = comp[v];
    const off = v * W;
    const cb = compBits[c];
    for (let w = 0; w < W; w++) {
      cb[w] |= initialBits[off + w];
    }
  }

  // Построение DAG компонент
  const dagOutDeg = new Int32Array(compCnt);
  for (let i = 0; i < m; i++) {
    const cu = comp[U[i]];
    const cv = comp[V[i]];
    if (cu !== cv) dagOutDeg[cu]++;
  }
  const startDag = new Int32Array(compCnt + 1);
  for (let i = 0; i < compCnt; i++) startDag[i + 1] = startDag[i] + dagOutDeg[i];
  const dagAdj = new Int32Array(startDag[compCnt]);
  const posDag = startDag.slice(0, compCnt);
  for (let i = 0; i < m; i++) {
    const cu = comp[U[i]];
    const cv = comp[V[i]];
    if (cu !== cv) {
      dagAdj[posDag[cu]++] = cv;
    }
  }

  // Распространение по DAG в топологическом порядке
  for (let c = 0; c < compCnt; c++) {
    const cb = compBits[c];
    for (let e = startDag[c]; e < startDag[c + 1]; e++) {
      const d = dagAdj[e];
      const db = compBits[d];
      for (let w = 0; w < W; w++) {
        db[w] |= cb[w];
      }
    }
  }

  // Подсчёт битов для каждой вершины
  const results = new Int32Array(n);
  for (let v = 0; v < n; v++) {
    const cb = compBits[comp[v]];
    let cnt = 0;
    for (let w = 0; w < W; w++) {
      let x = cb[w];
      x = x - ((x >>> 1) & 0x55555555);
      x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
      x = (x + (x >>> 4)) & 0x0f0f0f0f;
      x = x + (x >>> 8);
      x = x + (x >>> 16);
      cnt += x & 0x3f;
    }
    results[v] = cnt;
  }

  return results.join(' ');
}
