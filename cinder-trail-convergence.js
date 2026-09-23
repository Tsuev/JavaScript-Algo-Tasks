// Задача: Cinder Trail Convergence
// Сложность: hard
// Дата генерации: 2026-09-23

// Условие задачи
// # Cinder Trail Convergence
// 
// В лесу есть N полян, соединённых M тропинками. Каждая тропинка имеет длину. В некоторых полянах (их K) разожгли костры, которые оставляют за собой "угольный след". В момент времени 0 огонь начинает распространяться от каждого костра вдоль тропинок со скоростью 1 единица длины в секунду. Когда огонь от двух разных костров встречается в какой-то точке (на поляне или на тропинке), они сливаются и продолжают распространяться вместе. Требуется найти минимальное время T, к которому все угольные следы сольются в один связный участок. Иными словами, после времени T множество точек, достигнутых огнём, должно быть связным.
// 
// **Входные данные**:
// Первая строка содержит три целых числа N, M, K (1 ≤ N ≤ 2000, 0 ≤ M ≤ 10000, 1 ≤ K ≤ N).
// Следующие M строк содержат по три целых числа u, v, w (1 ≤ u, v ≤ N, u ≠ v, 1 ≤ w ≤ 10^9), обозначающих тропинку между полянами u и v длины w. Граф связный. Могут быть кратные рёбра.
// Следующая строка содержит K различных целых чисел — номера полян, где разожжены костры.
// 
// **Выходные данные**:
// Выведите одно число — минимальное время T (в секундах) с точностью до двух знаков после запятой. Если K = 1, выведите 0.00.
// 
// **Пример 1**:
// Вход:
// 4 4 2
// 1 2 10
// 2 3 10
// 3 4 10
// 1 4 30
// 1 4
// 
// Выход:
// 15.00
// 
// **Пример 2**:
// Вход:
// 5 6 3
// 1 2 10
// 2 3 10
// 3 4 10
// 4 5 10
// 1 5 100
// 1 3 5
// 1 3 5
// 
// Выход:
// 10.00

/**
 * Основная функция решения задачи "Cinder Trail Convergence".
 * @param {string} input - входные данные в формате задачи.
 * @returns {string} - ответ с точностью до двух знаков после запятой.
 */
function solve(input) {
    const lines = input.trim().split('\n');
    const [n, m, k] = lines[0].split(' ').map(Number);
    const edges = [];
    for (let i = 1; i <= m; i++) {
        const [u, v, w] = lines[i].split(' ').map(Number);
        edges.push([u - 1, v - 1, w]);
    }
    const sources = lines[m + 1].split(' ').map(x => Number(x) - 1);

    if (k === 1) {
        return '0.00';
    }

    // Строим граф в виде списка смежности
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
    }

    // Отмечаем, какие вершины являются источниками (кострами)
    const isSource = new Array(n).fill(false);
    for (const s of sources) isSource[s] = true;

    // Минимальная двоичная куча для алгоритма Дейкстры
    class MinHeap {
        constructor() { this.heap = []; }
        isEmpty() { return this.heap.length === 0; }
        push(item) {
            this.heap.push(item);
            this._siftUp(this.heap.length - 1);
        }
        pop() {
            if (this.heap.length === 0) return null;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this._siftDown(0);
            }
            return top;
        }
        _siftUp(i) {
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (this.heap[parent][0] <= this.heap[i][0]) break;
                [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
                i = parent;
            }
        }
        _siftDown(i) {
            const n = this.heap.length;
            while (true) {
                let smallest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
                if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
                if (smallest === i) break;
                [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
                i = smallest;
            }
        }
    }

    // Функция Дейкстры. Возвращает массив кратчайших расстояний от start до всех вершин.
    // Останавливается, как только все источники будут извлечены из очереди.
    function dijkstra(start) {
        const dist = new Array(n).fill(Infinity);
        const pq = new MinHeap();
        dist[start] = 0;
        pq.push([0, start]);
        let sourcesFound = 0;
        while (!pq.isEmpty()) {
            const [d, u] = pq.pop();
            if (d > dist[u]) continue;
            if (isSource[u]) {
                sourcesFound++;
                if (sourcesFound === k) break;
            }
            for (const [v, w] of adj[u]) {
                const nd = d + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.push([nd, v]);
                }
            }
        }
        return dist;
    }

    // Алгоритм Прима для поиска MST на графе источников.
    // Мы не строим полную матрицу расстояний, а по мере добавления источника в MST
    // запускаем Дейкстру от него и обновляем минимальные расстояния до остальных источников.
    const inMST = new Array(k).fill(false);
    const minDist = new Array(k).fill(Infinity);
    inMST[0] = true;
    let maxEdge = 0;

    let distFrom0 = dijkstra(sources[0]);
    for (let i = 1; i < k; i++) {
        minDist[i] = distFrom0[sources[i]];
    }

    for (let iter = 1; iter < k; iter++) {
        let u = -1;
        for (let i = 0; i < k; i++) {
            if (!inMST[i] && (u === -1 || minDist[i] < minDist[u])) {
                u = i;
            }
        }
        inMST[u] = true;
        if (minDist[u] > maxEdge) maxEdge = minDist[u];

        const distFromU = dijkstra(sources[u]);
        for (let i = 0; i < k; i++) {
            if (!inMST[i]) {
                const d = distFromU[sources[i]];
                if (d < minDist[i]) minDist[i] = d;
            }
        }
    }

    const answer = maxEdge / 2;
    return answer.toFixed(2);
}
