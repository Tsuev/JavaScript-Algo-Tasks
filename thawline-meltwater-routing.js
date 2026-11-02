// Задача: Thawline Meltwater Routing
// Сложность: hard
// Дата генерации: 2026-11-02

// Условие задачи
// Весной в горах тает снег, и талая вода стекает вниз по склону. Склон представлен сеткой R×C. Каждая клетка (r, c) имеет время оттаивания T[r][c] (целое число ≥ 0) — момент, начиная с которого по клетке можно перемещаться. Если T[r][c] = -1, клетка непроходима (скала). Вода начинает свой путь из клетки (0,0) в момент времени 0. В каждый момент времени вода может переместиться в соседнюю по стороне клетку (вверх, вниз, влево, вправо), если эта клетка проходима. Перемещение занимает 1 единицу времени. Войти в клетку можно только в момент времени не раньше её времени оттаивания. То есть, если вода находится в клетке A в момент t и хочет перейти в клетку B, то она может выйти из A в момент max(t, T[B]) (при необходимости подождав в A), и окажется в B в момент max(t, T[B]) + 1. Нужно найти минимальное время, в которое вода может достичь клетки (R-1, C-1). Если это невозможно, вывести -1.
// 
// Формат входных данных:
// Первая строка содержит два целых числа R и C (1 ≤ R, C ≤ 1000).
// Следующие R строк содержат по C целых чисел — значения T[r][c] (-1 или 0 ≤ T ≤ 10^9).
// 
// Формат выходных данных:
// Одно целое число — минимальное время прибытия в правый нижний угол, или -1, если путь невозможен.
// 
// Пример 1:
// Вход:
// 3 3
// 0 1 2
// 1 2 3
// 2 3 4
// Выход:
// 5
// 
// Пример 2:
// Вход:
// 2 2
// 0 -1
// -1 0
// Выход:
// -1

function solve(R, C, T) {
  const target = R * C - 1;
  // Если стартовая клетка непроходима, вода не может начать движение.
  if (T[0][0] === -1) return -1;
  
  const INF = 2**31 - 1;
  // Массив минимальных времён прибытия в каждую клетку.
  const dist = new Int32Array(R * C).fill(INF);
  dist[0] = 0;
  
  // Куча для алгоритма Дейкстры. Храним пары (время, номер клетки).
  // Максимальное число добавлений не превышает число рёбер, т.е. 4*R*C.
  const maxHeapSize = R * C * 4 + 10;
  const heapTimes = new Int32Array(maxHeapSize);
  const heapNodes = new Int32Array(maxHeapSize);
  let heapSize = 0;
  
  function heapPush(time, node) {
    let i = heapSize++;
    heapTimes[i] = time;
    heapNodes[i] = node;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heapTimes[p] <= heapTimes[i]) break;
      const tt = heapTimes[p];
      heapTimes[p] = heapTimes[i];
      heapTimes[i] = tt;
      const nn = heapNodes[p];
      heapNodes[p] = heapNodes[i];
      heapNodes[i] = nn;
      i = p;
    }
  }
  
  function heapPop() {
    const t = heapTimes[0];
    const n = heapNodes[0];
    heapSize--;
    if (heapSize > 0) {
      heapTimes[0] = heapTimes[heapSize];
      heapNodes[0] = heapNodes[heapSize];
      let i = 0;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < heapSize && heapTimes[l] < heapTimes[smallest]) smallest = l;
        if (r < heapSize && heapTimes[r] < heapTimes[smallest]) smallest = r;
        if (smallest === i) break;
        const tt = heapTimes[i];
        heapTimes[i] = heapTimes[smallest];
        heapTimes[smallest] = tt;
        const nn = heapNodes[i];
        heapNodes[i] = heapNodes[smallest];
        heapNodes[smallest] = nn;
        i = smallest;
      }
    }
    return [t, n];
  }
  
  heapPush(0, 0);
  
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];
  
  while (heapSize > 0) {
    const [t, idx] = heapPop();
    // Пропускаем устаревшие записи в куче.
    if (t > dist[idx]) continue;
    if (idx === target) return t;
    const r = Math.floor(idx / C);
    const c = idx % C;
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d];
      const nc = c + dc[d];
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
      const thaw = T[nr][nc];
      if (thaw === -1) continue;
      // Ждём до оттаивания соседней клетки, если нужно, и тратим 1 на переход.
      const nt = Math.max(t, thaw) + 1;
      const nidx = nr * C + nc;
      if (nt < dist[nidx]) {
        dist[nidx] = nt;
        heapPush(nt, nidx);
      }
    }
  }
  
  return -1;
}
