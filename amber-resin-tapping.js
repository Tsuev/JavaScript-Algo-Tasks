// Задача: Amber Resin Tapping
// Сложность: hard
// Дата генерации: 2026-10-03

// Условие задачи
// Amber Resin Tapping
// Сложность: hard
// 
// Вы — сборщик амбровой смолы в волшебном лесу. Лес состоит из N деревьев, соединённых N-1 тропами так, что образуется дерево. Деревья пронумерованы от 1 до N. В каждом дереве i изначально содержится A_i единиц смолы.
// 
// Вы можете совершать операции подсечки. За одну операцию вы выбираете любое ещё не подсечённое дерево и собираете всю его текущую смолу. После этого у всех соседних деревьев (соединённых тропой) количество смолы уменьшается на 1 (но не может стать отрицательным). Вы можете выполнить не более K операций.
// 
// Порядок подсечки произвольный. Например, если подсечь два соседних дерева, то то, которое подсекут вторым, потеряет 1 смолу из-за первого. Требуется максимизировать суммарное количество собранной смолы.
// 
// Формат входных данных:
// - Первая строка: два целых числа N и K (1 ≤ N ≤ 2000, 1 ≤ K ≤ N).
// - Вторая строка: N целых чисел A_1, A_2, ..., A_N (0 ≤ A_i ≤ 10^5).
// - Следующие N-1 строк: пары чисел u, v (1 ≤ u, v ≤ N, u ≠ v), обозначающие тропу между деревьями u и v.
// 
// Формат выходных данных:
// - Одно целое число — максимальное количество собранной смолы.
// 
// Пример 1:
// Вход:
// 3 2
// 5 10 7
// 1 2
// 1 3
// 
// Выход:
// 17
// 
// Пояснение: Можно подсечь деревья 2 и 3. Сначала подсекаем дерево 2 — получаем 10, у дерева 1 смола становится 4. Затем подсекаем дерево 3 — получаем 7, у дерева 1 смола становится 3. Итого 17. Дерево 1 не подсекаем.
// 
// Пример 2:
// Вход:
// 4 3
// 10 20 30 40
// 1 2
// 2 3
// 3 4
// 
// Выход:
// 88
// 
// Пояснение: Выбираем деревья 2, 3, 4. Подсекаем их в порядке 2, 3, 4. Дерево 2: 20. Дерево 3: 30 - 1 (от дерева 2) = 29. Дерево 4: 40 - 1 (от дерева 3) = 39. Итого 20+29+39 = 88.
// 
// Ограничения:
// - N ≤ 2000, K ≤ N.
// - Время: O(N * K).
// - Память: O(N * K).

function maxResin(N, K, A, edges) {
    // Строим список смежности (1-индексация)
    const adj = Array.from({ length: N + 1 }, () => []);
    for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
    }

    const INF_NEG = -1e15;

    // Итеративный обход в глубину для получения порядка обработки (пост-ордер)
    const parent = new Array(N + 1).fill(0);
    const order = [];
    const stack = [1];
    parent[1] = -1; // корень
    while (stack.length) {
        const v = stack.pop();
        order.push(v);
        for (const u of adj[v]) {
            if (u !== parent[v]) {
                parent[u] = v;
                stack.push(u);
            }
        }
    }

    // Массивы для хранения DP
    const dp0 = Array.from({ length: N + 1 }, () => []);
    const dp1 = Array.from({ length: N + 1 }, () => []);

    // Обрабатываем в обратном порядке (от листьев к корню)
    for (let i = order.length - 1; i >= 0; i--) {
        const v = order[i];
        // Инициализация для узла v
        let cur_dp0 = [0]; // v не выбран, 0 узлов
        let cur_dp1 = [INF_NEG, A[v - 1]]; // v выбран, 0 узлов (невозможно), 1 узел (v)

        // Собираем детей (все соседи кроме родителя)
        for (const u of adj[v]) {
            if (u === parent[v]) continue;

            const child_dp0 = dp0[u];
            const child_dp1 = dp1[u];
            const max_k2 = Math.max(child_dp0.length, child_dp1.length) - 1;

            const new_len0 = Math.min(K + 1, cur_dp0.length + max_k2);
            const new_len1 = Math.min(K + 1, cur_dp1.length + max_k2);
            const new_dp0 = new Array(new_len0).fill(INF_NEG);
            const new_dp1 = new Array(new_len1).fill(INF_NEG);

            // Слияние для случая, когда v не выбран
            for (let k1 = 0; k1 < cur_dp0.length; k1++) {
                if (cur_dp0[k1] === INF_NEG) continue;
                for (let k2 = 0; k2 <= max_k2; k2++) {
                    const k = k1 + k2;
                    if (k > K) break;
                    const val0 = k2 < child_dp0.length ? child_dp0[k2] : INF_NEG;
                    const val1 = k2 < child_dp1.length ? child_dp1[k2] : INF_NEG;
                    const best_child = Math.max(val0, val1);
                    if (best_child === INF_NEG) continue;
                    const val = cur_dp0[k1] + best_child;
                    if (val > new_dp0[k]) new_dp0[k] = val;
                }
            }

            // Слияние для случая, когда v выбран
            for (let k1 = 0; k1 < cur_dp1.length; k1++) {
                if (cur_dp1[k1] === INF_NEG) continue;
                for (let k2 = 0; k2 <= max_k2; k2++) {
                    const k = k1 + k2;
                    if (k > K) break;
                    const val0 = k2 < child_dp0.length ? child_dp0[k2] : INF_NEG;
                    const val1 = k2 < child_dp1.length ? child_dp1[k2] - 1 : INF_NEG;
                    const best_child = Math.max(val0, val1);
                    if (best_child === INF_NEG) continue;
                    const val = cur_dp1[k1] + best_child;
                    if (val > new_dp1[k]) new_dp1[k] = val;
                }
            }

            cur_dp0 = new_dp0;
            cur_dp1 = new_dp1;
        }

        dp0[v] = cur_dp0;
        dp1[v] = cur_dp1;
    }

    // Ответ — максимум по всем k <= K среди dp0[1] и dp1[1]
    let ans = 0;
    const root_dp0 = dp0[1];
    const root_dp1 = dp1[1];
    for (let k = 0; k <= K; k++) {
        if (k < root_dp0.length && root_dp0[k] > ans) ans = root_dp0[k];
        if (k < root_dp1.length && root_dp1[k] > ans) ans = root_dp1[k];
    }
    return ans;
}
