// Задача: Verdigris Patina Propagation
// Сложность: hard
// Дата генерации: 2026-10-03

// Условие задачи
// Verdigris Patina Propagation
// 
// На медной пластине размером n × m клеток растет зеленая патина. Некоторые клетки уже заражены патиной (источники). Патина распространяется на соседние клетки по стороне (вверх, вниз, влево, вправо). Одна из клеток — древний артефакт (цель). Чтобы спасти артефакт, можно покрыть некоторые клетки защитным лаком. Покрытая клетка становится непроницаемой для патины (патина не может пройти через неё). Нельзя покрывать источники и саму цель. Для каждой клетки известна стоимость нанесения лака. Требуется выбрать набор клеток для покрытия так, чтобы патина не смогла достичь цели ни по какому пути, и суммарная стоимость была минимальной. Если это невозможно, вывести -1.
// 
// Формат ввода:
// Первая строка содержит два целых числа n и m (1 ≤ n, m ≤ 50) — размеры пластины.
// Следующие n строк содержат по m символов: '.' — обычная клетка, 'S' — источник патины, 'T' — цель. Гарантируется, что есть хотя бы один 'S' и ровно один 'T'.
// Следующие n строк содержат по m целых чисел — стоимость покрытия каждой клетки. Для клеток 'S' и 'T' стоимость указана, но игнорируется (их нельзя покрывать). Для обычных клеток стоимость от 1 до 10^9.
// 
// Формат вывода:
// Одно целое число — минимальная суммарная стоимость покрытия или -1, если защитить цель невозможно.
// 
// Пример 1:
// Ввод:
// 2 2
// S.
// .T
// 1 2
// 3 4
// Вывод:
// 5
// Пояснение: нужно покрыть клетки (0,1) и (1,0) стоимостью 2 и 3.
// 
// Пример 2:
// Ввод:
// 3 3
// S..
// ...
// ..T
// 1 2 3
// 4 5 6
// 7 8 9
// Вывод:
// 6
// Пояснение: минимальный разрез — покрыть (0,1) и (1,0) стоимостью 2 и 4.
// 
// Пример 3:
// Ввод:
// 2 2
// ST
// ..
// 1 2
// 3 4
// Вывод:
// -1
// Пояснение: источник и цель соседствуют, нельзя покрыть ни одну из них, поэтому патина неизбежно достигнет цели.

function solve(input) {
  // Разбор входных данных
  const lines = input.trim().split('\n');
  let idx = 0;
  const [n, m] = lines[idx++].split(' ').map(Number);
  const grid = [];
  for (let i = 0; i < n; i++) {
    grid.push(lines[idx++].trim());
  }
  const cost = [];
  for (let i = 0; i < n; i++) {
    cost.push(lines[idx++].trim().split(' ').map(Number));
  }

  const totalCells = n * m;
  const S = totalCells * 2;      // супер-исток
  const T = S + 1;               // супер-сток
  const INF = 10 ** 15;          // бесконечность (больше любой возможной суммы)

  // Реализация алгоритма Диница для поиска максимального потока
  class Dinic {
    constructor(n) {
      this.n = n;
      this.g = Array.from({ length: n }, () => []);
    }
    addEdge(v, u, cap) {
      this.g[v].push({ to: u, cap, rev: this.g[u].length });
      this.g[u].push({ to: v, cap: 0, rev: this.g[v].length - 1 });
    }
    bfs(s, t) {
      this.level = new Array(this.n).fill(-1);
      const q = [s];
      this.level[s] = 0;
      for (let i = 0; i < q.length; i++) {
        const v = q[i];
        for (const e of this.g[v]) {
          if (e.cap > 0 && this.level[e.to] === -1) {
            this.level[e.to] = this.level[v] + 1;
            q.push(e.to);
          }
        }
      }
      return this.level[t] !== -1;
    }
    dfs(v, t, f) {
      if (v === t) return f;
      for (let i = this.it[v]; i < this.g[v].length; i++) {
        this.it[v] = i;
        const e = this.g[v][i];
        if (e.cap > 0 && this.level[v] < this.level[e.to]) {
          const ret = this.dfs(e.to, t, Math.min(f, e.cap));
          if (ret > 0) {
            e.cap -= ret;
            this.g[e.to][e.rev].cap += ret;
            return ret;
          }
        }
      }
      return 0;
    }
    maxFlow(s, t) {
      let flow = 0;
      while (this.bfs(s, t)) {
        this.it = new Array(this.n).fill(0);
        let f;
        while ((f = this.dfs(s, t, INF)) > 0) {
          flow += f;
        }
      }
      return flow;
    }
  }

  const dinic = new Dinic(T + 1);

  // Вспомогательные функции для индексации: каждая клетка разбивается на две вершины in и out
  const inId = (i, j) => (i * m + j) * 2;
  const outId = (i, j) => (i * m + j) * 2 + 1;

  // Построение графа: ребро in->out имеет пропускную способность, равную стоимости покрытия клетки.
  // Для источников и цели эта стоимость бесконечна (их нельзя покрыть).
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const cell = grid[i][j];
      const inNode = inId(i, j);
      const outNode = outId(i, j);
      let cap = INF;
      if (cell === '.') {
        cap = cost[i][j];
      } else if (cell === 'S') {
        dinic.addEdge(S, inNode, INF); // супер-исток соединяем с источниками
      } else if (cell === 'T') {
        dinic.addEdge(outNode, T, INF); // цель соединяем с супер-стоком
      }
      dinic.addEdge(inNode, outNode, cap);
    }
  }

  // Добавляем рёбра между соседними клетками (патина может перетекать в любом направлении)
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const out1 = outId(i, j);
      for (const [di, dj] of dirs) {
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && ni < n && nj >= 0 && nj < m) {
          const in2 = inId(ni, nj);
          dinic.addEdge(out1, in2, INF);
        }
      }
    }
  }

  // Максимальный поток = минимальный разрез. Если он бесконечен, защитить цель невозможно.
  const flow = dinic.maxFlow(S, T);
  const ans = flow >= INF ? -1 : flow;
  return ans.toString();
}
