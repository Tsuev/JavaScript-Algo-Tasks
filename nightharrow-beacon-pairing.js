// Задача: Nightharrow Beacon Pairing
// Сложность: medium
// Дата генерации: 2026-11-13

// Условие задачи
// В долине Найтхарроу установлено n маяков. Каждый маяк i имеет координату x_i на прямой и радиус действия p_i. Два маяка i и j могут образовать пару, если их зоны сигнала пересекаются или касаются, то есть |x_i - x_j| ≤ p_i + p_j. Найдите количество таких пар.
// 
// Реализуйте функцию countBeaconPairs(x, p), которая принимает:
// - x — массив из n целых чисел (координаты маяков),
// - p — массив из n целых чисел (радиусы действия маяков),
// и возвращает целое число — количество пар маяков, удовлетворяющих условию.
// 
// Ограничения: 1 ≤ n ≤ 200000, -10^9 ≤ x_i ≤ 10^9, 0 ≤ p_i ≤ 10^9.
// 
// Пример:
// x = [0, 4, 9], p = [2, 2, 2]
// Ответ: 1
// Объяснение: маяки 0 и 1 находятся на расстоянии 4, сумма радиусов 4, поэтому они соединены. Остальные пары — нет.

/**
 * Считает количество пар маяков, зоны сигнала которых пересекаются или касаются.
 * @param {number[]} x - координаты маяков
 * @param {number[]} p - радиусы действия маяков
 * @returns {number} количество соединённых пар
 */
function countBeaconPairs(x, p) {
  const n = x.length;
  // Каждый маяк превращаем в отрезок [x_i - p_i, x_i + p_i].
  // Два маяка соединены, если их отрезки пересекаются (включая касание).
  const intervals = new Array(n);
  for (let i = 0; i < n; i++) {
    intervals[i] = [x[i] - p[i], x[i] + p[i]];
  }

  // Сортируем отрезки по левой границе. При равных левых порядок не важен.
  intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  // Минимальная двоичная куча для правых границ.
  class MinHeap {
    constructor() {
      this.data = [];
    }
    push(val) {
      this.data.push(val);
      this._siftUp(this.data.length - 1);
    }
    pop() {
      const top = this.data[0];
      const last = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = last;
        this._siftDown(0);
      }
      return top;
    }
    peek() {
      return this.data[0];
    }
    get size() {
      return this.data.length;
    }
    _siftUp(i) {
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (this.data[parent] <= this.data[i]) break;
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      }
    }
    _siftDown(i) {
      const n = this.data.length;
      while (true) {
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        let smallest = i;
        if (left < n && this.data[left] < this.data[smallest]) smallest = left;
        if (right < n && this.data[right] < this.data[smallest]) smallest = right;
        if (smallest === i) break;
        [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
        i = smallest;
      }
    }
  }

  const heap = new MinHeap();
  let disjointPairs = 0;
  let poppedCount = 0; // сколько отрезков уже «выпало» левее текущего

  for (const [l, r] of intervals) {
    // Удаляем из кучи все отрезки, которые заканчиваются строго левее l.
    // Каждый такой отрезок образует непересекающуюся пару с текущим и со всеми
    // последующими отрезками (их левые границы не меньше l).
    while (heap.size > 0 && heap.peek() < l) {
      heap.pop();
      poppedCount++;
    }
    // Все ранее извлечённые отрезки (poppedCount штук) и текущий отрезок
    // образуют непересекающиеся пары. Учитываем их.
    disjointPairs += poppedCount;
    heap.push(r);
  }

  // Общее число пар минус число непересекающихся пар.
  const totalPairs = (n * (n - 1)) / 2;
  return totalPairs - disjointPairs;
}
