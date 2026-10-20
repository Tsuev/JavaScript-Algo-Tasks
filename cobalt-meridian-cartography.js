// Задача: Cobalt Meridian Cartography
// Сложность: hard
// Дата генерации: 2026-10-20

// Условие задачи
// Картографическая служба станции «Кобальтовый меридиан» получила новую карту рельефа — прямоугольную сетку n×m, в клетке (i, j) которой записана высота h[i][j] над уровнем моря (значение может быть отрицательным, если это впадина).
// 
// После долгих дождей в понижениях скапливается вода. Вода перемещается между соседними по стороне клетками и стекает с карты, как только достигает любой граничной клетки (с границы она свободно уходит наружу). Через гребень выше уже установившегося уровня вода не переливается.
// 
// Формально уровень воды L(c) над клеткой c — это минимум по всем путям из c до границы сетки (путь — последовательность клеток, соседних по стороне, начинающаяся в c и заканчивающаяся граничной клеткой) величины «максимальная высота клетки на этом пути». Глубина воды над клеткой равна depth(c) = L(c) − h(c) ≥ 0 (неравенство верно всегда, так как путь проходит через саму клетку c).
// 
// Требуется найти:
// — volume — суммарный объём воды, то есть сумму depth(c) по всем клеткам (площадь каждой клетки равна 1);
// — lakes — количество озёр, то есть максимальных связных по стороне множеств клеток с depth(c) > 0;
// — largestLake — объём самого большого озера (0, если воды нет).
// 
// Формат входных данных: функция solve(heights), где heights — массив из n строк, каждая строка — массив из m целых чисел. Ограничения: 0 ≤ n, m ≤ 500, |h[i][j]| ≤ 10^9.
// 
// Формат результата: объект { volume, lakes, largestLake } с целыми числами.
// 
// Пример 1:
// heights = [[3,3,3],[3,0,3],[3,3,3]]
// Ответ: { volume: 3, lakes: 1, largestLake: 3 }
// 
// Пример 2:
// heights = [[5,5,5,5,5],[5,1,5,1,5],[5,5,5,5,5]]
// Ответ: { volume: 8, lakes: 2, largestLake: 4 }
// 
// Пример 3:
// heights = [[0,5,0]]
// Ответ: { volume: 0, lakes: 0, largestLake: 0 }
// 
// Пример 4:
// heights = [[5,5,5,5,5],[5,1,1,5,5],[5,1,1,5,5],[5,5,5,5,5]]
// Ответ: { volume: 16, lakes: 1, largestLake: 16 }
// 
// Ожидаемая сложность — O(n·m·log(n·m)) по времени и O(n·m) по памяти.

function solve(heights) {
  // Пустая карта — воды нет.
  const n = heights.length;
  const m = n > 0 ? heights[0].length : 0;
  if (n === 0 || m === 0) return { volume: 0, lakes: 0, largestLake: 0 };

  const total = n * m;
  const height = new Float64Array(total);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) height[i * m + j] = heights[i][j];
  }

  // level[k] — установившийся уровень воды над клеткой k. Он равен минимуму
  // по всем путям оттока к границе от максимума высот вдоль пути.
  const level = new Float64Array(total);
  const seen = new Uint8Array(total);

  // Двоичная мин-куча из индексов клеток; ключом сравнения служит level[idx].
  const heap = [];

  const push = (idx) => {
    heap.push(idx);
    let c = heap.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (level[heap[p]] <= level[heap[c]]) break;
      const t = heap[p]; heap[p] = heap[c]; heap[c] = t;
      c = p;
    }
  };

  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let c = 0;
      const len = heap.length;
      for (;;) {
        const l = 2 * c + 1;
        const r = l + 1;
        let s = c;
        if (l < len && level[heap[l]] < level[heap[s]]) s = l;
        if (r < len && level[heap[r]] < level[heap[s]]) s = r;
        if (s === c) break;
        const t = heap[s]; heap[s] = heap[c]; heap[c] = t;
        c = s;
      }
    }
    return top;
  };

  // С граничных клеток вода стекает наружу, поэтому их уровень равен их высоте.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (i === 0 || j === 0 || i === n - 1 || j === m - 1) {
        const idx = i * m + j;
        if (!seen[idx]) {
          seen[idx] = 1;
          level[idx] = height[idx];
          push(idx);
        }
      }
    }
  }

  const di = [-1, 1, 0, 0];
  const dj = [0, 0, -1, 1];

  // Волна идёт от границы внутрь: всегда обрабатываем клетку с наименьшим
  // уже известным уровнем, поэтому уровень соседа — максимум из его высоты
  // и уровня текущей клетки (вода не поднимется выше уровня, с которого пришла).
  while (heap.length > 0) {
    const cur = pop();
    const ci = (cur / m) | 0;
    const cj = cur - ci * m;
    for (let d = 0; d < 4; d++) {
      const ni = ci + di[d];
      const nj = cj + dj[d];
      if (ni < 0 || nj < 0 || ni >= n || nj >= m) continue;
      const nIdx = ni * m + nj;
      if (seen[nIdx]) continue;
      seen[nIdx] = 1;
      level[nIdx] = Math.max(height[nIdx], level[cur]);
      push(nIdx);
    }
  }

  // Осталось разбить затопленные клетки на связные по стороне компоненты — озёра.
  const visited = new Uint8Array(total);
  const stack = [];
  let volume = 0;
  let lakes = 0;
  let largestLake = 0;

  for (let start = 0; start < total; start++) {
    if (visited[start]) continue;
    visited[start] = 1;
    if (level[start] - height[start] <= 0) continue; // сухая клетка

    let lakeVolume = 0;
    stack.length = 0;
    stack.push(start);
    while (stack.length > 0) {
      const cur = stack.pop();
      lakeVolume += level[cur] - height[cur];
      const ci = (cur / m) | 0;
      const cj = cur - ci * m;
      for (let d = 0; d < 4; d++) {
        const ni = ci + di[d];
        const nj = cj + dj[d];
        if (ni < 0 || nj < 0 || ni >= n || nj >= m) continue;
        const nIdx = ni * m + nj;
        if (visited[nIdx]) continue;
        visited[nIdx] = 1;
        if (level[nIdx] - height[nIdx] <= 0) continue; // сухие клетки в озеро не входят
        stack.push(nIdx);
      }
    }

    lakes++;
    volume += lakeVolume;
    if (lakeVolume > largestLake) largestLake = lakeVolume;
  }

  return { volume, lakes, largestLake };
}
