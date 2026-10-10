// Задача: Termite Mound Ventilation
// Сложность: hard
// Дата генерации: 2026-10-10

// Условие задачи
// Termite Mound Ventilation
// 
// Термитник — это сеть из n камер, соединённых m тоннелями. Вентиляцию создаёт ветер: свежий воздух входит через главное отверстие (камера 1) и выходит наружу через дымоход (камера n). Каждую секунду через термитник протекает некоторый поток воздуха; прокачка воздуха по тоннелю требует энергии, а каждая камера способна пропустить лишь ограниченный объём воздуха в секунду.
// 
// Формально:
// - Камера i (1 ≤ i ≤ n) имеет пропускную способность t_i: суммарный поток воздуха через камеру не превосходит t_i.
// - Тоннель соединяет камеры u и v. Он неориентированный (воздух может течь в любую сторону), имеет пропускную способность c (максимум единиц воздуха в секунду) и удельную стоимость w (энергия на прокачку одной единицы воздуха по этому тоннелю).
// - Проход воздуха через камеру энергии не требует.
// 
// Требуется:
// 1. Найти максимально возможный суммарный поток F из камеры 1 в камеру n.
// 2. Среди всех потоков величины ровно F выбрать поток с минимальной суммарной энергией C.
// 
// Формат ввода:
// - Первая строка: n и m — число камер и тоннелей.
// - Вторая строка: n целых чисел t_1 … t_n — пропускные способности камер.
// - Далее m строк, в каждой четыре целых числа u v c w — тоннель между камерами u и v.
// 
// Формат вывода:
// Два целых числа через пробел: F (максимальный поток) и C (минимальная энергия для потока F). Если прокачать воздух невозможно, вывести «0 0».
// 
// Ограничения:
// 2 ≤ n ≤ 200, 0 ≤ m ≤ 2000, 1 ≤ t_i ≤ 10^6, 1 ≤ c ≤ 10^6, 0 ≤ w ≤ 10^6, u ≠ v. Ответ помещается в 64-битное целое.
// 
// Пример:
// Вход:
// 4 4
// 10 5 5 10
// 1 2 3 1
// 1 3 6 2
// 2 4 4 1
// 3 4 2 3
// 
// Выход:
// 5 16
// 
// Пояснение к примеру. Камеры 1 и 4 — это вход и дымоход. Через камеру 2 можно прокачать не более 5 единиц, через камеру 3 — не более 5. Путь 1→2→4 ограничен тоннелем 1–2 (c = 3): по нему идут 3 единицы воздуха, энергия 3·(1+1) = 6. Путь 1→3→4 ограничен тоннелем 3–4 (c = 2): по нему идут 2 единицы, энергия 2·(2+3) = 10. Итого поток 5, энергия 16.

// ====== Termite Mound Ventilation ======

// Двоичная куча для алгоритма Дейкстры.
class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

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
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      const n = this.heap.length;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let best = i;
        if (l < n && this.heap[l][0] < this.heap[best][0]) best = l;
        if (r < n && this.heap[r][0] < this.heap[best][0]) best = r;
        if (best === i) break;
        [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
        i = best;
      }
    }
    return top;
  }
}

// Поток минимальной стоимости: метод последовательных кратчайших путей
// с потенциалами Джонсона (Дейкстра корректно работает при неотрицательных
// приведённых стоимостях).
class MinCostFlow {
  constructor(n) {
    this.n = n;
    this.graph = Array.from({ length: n }, () => []);
  }

  addEdge(from, to, cap, cost) {
    this.graph[from].push({ to, cap, cost, rev: this.graph[to].length });
    this.graph[to].push({ to: from, cap: 0, cost: -cost, rev: this.graph[from].length - 1 });
  }

  // Возвращает [максимальный поток, минимальную стоимость этого потока].
  minCostMaxFlow(s, t) {
    const n = this.n;
    const INF = Number.MAX_SAFE_INTEGER;
    const potential = new Array(n).fill(0);

    let totalFlow = 0;
    let totalCost = 0;

    while (true) {
      const dist = new Array(n).fill(INF);
      const prevV = new Array(n).fill(-1);
      const prevE = new Array(n).fill(-1);
      dist[s] = 0;

      const heap = new MinHeap();
      heap.push([0, s]);
      while (heap.size > 0) {
        const [d, v] = heap.pop();
        if (d > dist[v]) continue;
        const edges = this.graph[v];
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.cap <= 0) continue;
          // Приведённая стоимость ребра — с потенциалами она неотрицательна.
          const nd = d + e.cost + potential[v] - potential[e.to];
          if (nd < dist[e.to]) {
            dist[e.to] = nd;
            prevV[e.to] = v;
            prevE[e.to] = i;
            heap.push([nd, e.to]);
          }
        }
      }

      if (dist[t] === INF) break; // пути больше нет — значит, поток максимален

      for (let v = 0; v < n; v++) {
        if (dist[v] < INF) potential[v] += dist[v];
      }

      // Ищем узкое место найденного пути и проталкиваем по нему поток.
      let pushed = INF;
      for (let v = t; v !== s; v = prevV[v]) {
        pushed = Math.min(pushed, this.graph[prevV[v]][prevE[v]].cap);
      }
      for (let v = t; v !== s; v = prevV[v]) {
        const e = this.graph[prevV[v]][prevE[v]];
        e.cap -= pushed;
        this.graph[e.to][e.rev].cap += pushed;
      }

      totalFlow += pushed;
      totalCost += pushed * potential[t]; // potential[t] — реальная стоимость пути
    }

    return [totalFlow, totalCost];
  }
}

/**
 * Основная функция решения.
 * @param {number} n число камер (1..n)
 * @param {number[]} chamberThroughput t[i] — сколько воздуха в секунду может
 *        пройти через камеру i (индексация с нуля)
 * @param {number[][]} tunnels список тоннелей [u, v, c, w], камеры нумеруются с 1
 * @returns {[number, number]} максимальный поток и минимальная энергия для него
 */
function maxVentilation(n, chamberThroughput, tunnels) {
  // Каждую камеру раздваиваем на «вход» и «выход». Любой поток обязан пройти
  // по внутреннему ребру вход->выход, чья пропускная способность как раз
  // равна пропускной способности самой камеры.
  const inNode = (v) => 2 * v;
  const outNode = (v) => 2 * v + 1;

  const source = inNode(0);      // вход главной камеры
  const sink = outNode(n - 1);   // выход дымохода

  const net = new MinCostFlow(2 * n);

  // Ограничение по пропускной способности каждой камеры.
  for (let v = 0; v < n; v++) {
    net.addEdge(inNode(v), outNode(v), chamberThroughput[v], 0);
  }

  // Тоннель двусторонний: воздух может идти в любую сторону,
  // поэтому добавляем два противоположных направленных ребра.
  for (const [u, v, capacity, cost] of tunnels) {
    const a = u - 1;
    const b = v - 1;
    net.addEdge(outNode(a), inNode(b), capacity, cost);
    net.addEdge(outNode(b), inNode(a), capacity, cost);
  }

  return net.minCostMaxFlow(source, sink);
}
