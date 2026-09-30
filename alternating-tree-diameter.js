// Задача: Alternating Tree Diameter
// Сложность: hard
// Дата генерации: 2026-09-30

// Условие задачи
// Дано дерево из N вершин, рёбра которого имеют целочисленные веса. Назовём простой путь (последовательность вершин, где каждая следующая соединена ребром с предыдущей, без повторений) альтернирующим, если последовательность весов его рёбер строго чередуется: либо w1 < w2 > w3 < w4 > ..., либо w1 > w2 < w3 > w4 < ... . Для путей длины 0, 1, 2 условие чередования считается выполненным автоматически (так как нет двух соседних сравнений, которые могли бы нарушить чередование). Требуется найти максимальную длину (количество рёбер) альтернирующего пути в дереве.
// 
// Формат входных данных:
// В первой строке целое число N (1 ≤ N ≤ 200000) — количество вершин.
// В следующих N-1 строках по три целых числа u, v, w (1 ≤ u, v ≤ N, u ≠ v, 1 ≤ w ≤ 10^9) — ребро между вершинами u и v с весом w. Гарантируется, что граф является деревом.
// 
// Формат выходных данных:
// Одно целое число — максимальное количество рёбер в альтернирующем пути.
// 
// Пример 1:
// Вход:
// 3
// 1 2 5
// 2 3 3
// Выход:
// 2
// Пояснение: Путь 1-2-3 имеет веса 5 и 3. Длина 2, условие выполняется.
// 
// Пример 2:
// Вход:
// 4
// 1 2 5
// 2 3 3
// 3 4 7
// Выход:
// 3
// Пояснение: Путь 1-2-3-4 имеет веса 5, 3, 7. 5 > 3 < 7 — чередование.
// 
// Пример 3:
// Вход:
// 5
// 1 2 5
// 1 3 10
// 3 4 8
// 1 5 2
// Выход:
// 3
// Пояснение: Путь 4-3-1-2 имеет веса 8, 10, 5. 8 < 10 > 5 — чередование.

/**
 * Решение задачи "Alternating Tree Diameter".
 * Принимает количество вершин n и массив рёбер edges, где каждое ребро — [u, v, w].
 * Возвращает максимальную длину (число рёбер) альтернирующего пути.
 */
function alternatingTreeDiameter(n, edges) {
    // Строим список смежности
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
    }

    // Корень дерева — вершина 1. Обходим в глубину, чтобы построить список детей и порядок обхода.
    const parent = new Array(n + 1).fill(0);
    const children = Array.from({ length: n + 1 }, () => []); // {v, w}
    const order = [];
    const stack = [1];
    parent[1] = -1;
    while (stack.length) {
        const u = stack.pop();
        order.push(u);
        for (const [v, w] of adj[u]) {
            if (v !== parent[u]) {
                parent[v] = u;
                children[u].push({ v, w });
                stack.push(v);
            }
        }
    }

    // Для каждой вершины будем хранить отсортированные массивы для быстрых запросов.
    // less_weights[u] — веса первых рёбер путей, начинающихся в u, с состоянием "входящее должно быть меньше"
    // less_suffix_max[u] — суффиксные максимумы длин для этих весов.
    // greater_weights[u] — веса первых рёбер с состоянием "входящее должно быть больше"
    // greater_prefix_max[u] — префиксные максимумы длин для этих весов.
    const less_weights = Array(n + 1);
    const less_suffix_max = Array(n + 1);
    const greater_weights = Array(n + 1);
    const greater_prefix_max = Array(n + 1);

    let ans = 0;

    // Обрабатываем вершины в обратном порядке обхода (снизу вверх).
    for (let idx = order.length - 1; idx >= 0; idx--) {
        const u = order[idx];
        const f_less = new Map();   // вес -> максимальная длина пути с состоянием need_less
        const f_greater = new Map(); // вес -> максимальная длина пути с состоянием need_greater
        const childOffers = []; // для комбинирования путей через u

        for (const { v, w } of children[u]) {
            // Запрос к ребёнку v: максимальная длина пути, начинающегося в v,
            // с первым ребром весом w2 < w и состоянием need_greater.
            let less_cont = 0;
            if (greater_weights[v] && greater_weights[v].length > 0) {
                const arr = greater_weights[v];
                // Ищем последний индекс с весом < w
                let lo = 0, hi = arr.length - 1, pos = -1;
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    if (arr[mid] < w) {
                        pos = mid;
                        lo = mid + 1;
                    } else {
                        hi = mid - 1;
                    }
                }
                if (pos !== -1) {
                    less_cont = greater_prefix_max[v][pos];
                }
            }
            const L_less = Math.max(1, 1 + less_cont);

            // Запрос к ребёнку v: максимальная длина пути с первым ребром весом w2 > w
            // и состоянием need_less.
            let greater_cont = 0;
            if (less_weights[v] && less_weights[v].length > 0) {
                const arr = less_weights[v];
                // Ищем первый индекс с весом > w
                let lo = 0, hi = arr.length - 1, pos = arr.length;
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    if (arr[mid] > w) {
                        pos = mid;
                        hi = mid - 1;
                    } else {
                        lo = mid + 1;
                    }
                }
                if (pos < arr.length) {
                    greater_cont = less_suffix_max[v][pos];
                }
            }
            const L_greater = Math.max(1, 1 + greater_cont);

            // Обновляем DP для вершины u
            f_less.set(w, Math.max(f_less.get(w) || 0, L_less));
            f_greater.set(w, Math.max(f_greater.get(w) || 0, L_greater));

            // Сохраняем для комбинирования
            childOffers.push({ w, L_less, L_greater });
        }

        // Комбинирование: ищем путь, проходящий через u и использующий два разных ребра к детям.
        // Такое возможно, если у одного ребра состояние need_less и вес w1, а у другого need_greater и вес w2, причём w1 > w2.
        if (childOffers.length > 0) {
            // Собираем все "greater" предложения (ребро с состоянием need_greater)
            const greaterOffers = childOffers.map(o => ({ w: o.w, val: o.L_greater }));
            greaterOffers.sort((a, b) => a.w - b.w);
            // Префиксные максимумы длин
            const prefMax = new Array(greaterOffers.length);
            let curMax = 0;
            for (let i = 0; i < greaterOffers.length; i++) {
                curMax = Math.max(curMax, greaterOffers[i].val);
                prefMax[i] = curMax;
            }
            // Для каждого "less" предложения ищем лучший "greater" с меньшим весом
            for (const o of childOffers) {
                const w = o.w;
                const L_less = o.L_less;
                let lo = 0, hi = greaterOffers.length - 1, pos = -1;
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    if (greaterOffers[mid].w < w) {
                        pos = mid;
                        lo = mid + 1;
                    } else {
                        hi = mid - 1;
                    }
                }
                if (pos !== -1) {
                    ans = Math.max(ans, L_less + prefMax[pos]);
                }
                // Путь, начинающийся в u и уходящий только в одного ребёнка
                ans = Math.max(ans, L_less, o.L_greater);
            }
        }

        // Для любого пути длины 2 через u (два ребра к двум разным детям) условие чередования выполняется всегда.
        if (children[u].length >= 2) {
            ans = Math.max(ans, 2);
        }

        // Построение отсортированных массивов для u
        const lessEntries = Array.from(f_less.entries()).sort((a, b) => a[0] - b[0]);
        const m1 = lessEntries.length;
        const lw = new Array(m1);
        const lsm = new Array(m1);
        for (let i = 0; i < m1; i++) {
            lw[i] = lessEntries[i][0];
        }
        let cur = 0;
        for (let i = m1 - 1; i >= 0; i--) {
            cur = Math.max(cur, lessEntries[i][1]);
            lsm[i] = cur;
        }
        less_weights[u] = lw;
        less_suffix_max[u] = lsm;

        const greaterEntries = Array.from(f_greater.entries()).sort((a, b) => a[0] - b[0]);
        const m2 = greaterEntries.length;
        const gw = new Array(m2);
        const gpm = new Array(m2);
        for (let i = 0; i < m2; i++) {
            gw[i] = greaterEntries[i][0];
        }
        cur = 0;
        for (let i = 0; i < m2; i++) {
            cur = Math.max(cur, greaterEntries[i][1]);
            gpm[i] = cur;
        }
        greater_weights[u] = gw;
        greater_prefix_max[u] = gpm;
    }

    return ans;
}
