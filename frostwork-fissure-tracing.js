// Задача: Frostwork Fissure Tracing
// Сложность: medium
// Дата генерации: 2026-10-05

// Условие задачи
// Frostwork Fissure Tracing (Трассировка морозных трещин)
// 
// На стекле после мороза образовался узор из трещин. Стекло можно представить как прямоугольную сетку n×m, где каждая клетка либо покрыта трещиной ('#'), либо нет ('.'). Трещины распространяются только по сторонам клеток (вверх, вниз, влево, вправо). Набор клеток с трещинами, связанных сторонами, называется трещиной (fissure). Гарантируется, что каждая трещина не содержит циклов, то есть является деревом. Длина трещины — это количество клеток в самом длинном простом пути внутри этой трещины. Найдите максимальную длину трещины среди всех трещин на стекле. Если трещин нет, выведите 0.
// 
// Входные данные:
// Первая строка содержит два целых числа n и m (1 ≤ n, m ≤ 1000) — размеры сетки.
// Далее следуют n строк, каждая длиной m, состоящая из символов '.' и '#'.
// 
// Выходные данные:
// Одно целое число — максимальная длина трещины (количество клеток в самом длинном пути). Если трещин нет, выведите 0.
// 
// Пример 1:
// Вход:
// 5 5
// .....
// ..#..
// .###.
// ..#..
// .....
// Выход:
// 3
// 
// Пример 2:
// Вход:
// 3 3
// ...
// ...
// ...
// Выход:
// 0
// 
// Пример 3:
// Вход:
// 1 5
// #####
// Выход:
// 5
// 
// Пример 4:
// Вход:
// 4 4
// .#..
// .##.
// ..#.
// ....
// Выход:
// 4

function solve(n, m, grid) {
  if (n === 0 || m === 0) return 0;
  const visited = new Uint8Array(n * m);
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let maxLen = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const startIdx = i * m + j;
      if (grid[i][j] !== '#' || visited[startIdx]) continue;

      // Первый BFS: собираем все клетки трещины и находим одну из самых удалённых.
      const queue = [startIdx];
      visited[startIdx] = 1;
      const component = [];
      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        component.push(idx);
        const x = Math.floor(idx / m);
        const y = idx % m;
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < m) {
            const nidx = nx * m + ny;
            if (grid[nx][ny] === '#' && visited[nidx] === 0) {
              visited[nidx] = 1;
              queue.push(nidx);
            }
          }
        }
      }
      // Последняя добавленная клетка — самая удалённая от старта.
      const farthest = queue[queue.length - 1];

      // Второй BFS: от самой удалённой клетки находим максимальное расстояние.
      const compSet = new Set(component);
      let currentLevel = [farthest];
      compSet.delete(farthest);
      let depth = 0;
      while (currentLevel.length > 0) {
        const nextLevel = [];
        for (const idx of currentLevel) {
          const x = Math.floor(idx / m);
          const y = idx % m;
          for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < n && ny >= 0 && ny < m) {
              const nidx = nx * m + ny;
              if (compSet.has(nidx)) {
                compSet.delete(nidx);
                nextLevel.push(nidx);
              }
            }
          }
        }
        if (nextLevel.length > 0) depth++;
        currentLevel = nextLevel;
      }
      const len = depth + 1;
      if (len > maxLen) maxLen = len;
    }
  }
  return maxLen;
}
