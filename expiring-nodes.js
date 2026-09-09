// Задача: Expiring Nodes
// Сложность: medium
// Дата генерации: 2026-09-09

// Условие задачи
// Вам дано дерево с N вершинами, пронумерованными от 1 до N. Корень дерева — вершина 1. Каждая вершина i имеет срок жизни expiry_i: она доступна только в моменты времени t < expiry_i. Поступает Q запросов: в каждом запросе даны две вершины u, v и время t. Требуется определить, существует ли путь между u и v, целиком состоящий из доступных в момент t вершин.
// 
// В дереве путь единственный, поэтому для положительного ответа нужно, чтобы минимум expiry_i на пути был строго больше t.
// 
// Формат входных данных:
// Первая строка содержит числа N и Q (1 ≤ N, Q ≤ 2·10^5).
// Следующие N-1 строк содержат рёбра дерева u v.
// Далее идут N чисел expiry_1, expiry_2, ..., expiry_N (1 ≤ expiry_i ≤ 10^9).
// Далее Q строк: каждая содержит u v t (1 ≤ u, v ≤ N, 1 ≤ t ≤ 10^9).
// 
// Формат выходных данных:
// Для каждого запроса выведите YES или NO в отдельной строке.
// 
// Пример:
// Вход:
// 5 4
// 1 2
// 1 3
// 2 4
// 2 5
// 10 5 8 3 12
// 2 4 4
// 2 4 2
// 1 5 7
// 1 5 4
// 
// Выход:
// NO
// YES
// NO
// YES
// 
// Пояснение:
// Для запроса 2 4 4 путь 2-4 имеет минимум min(5,3)=3, а 4 ≥ 3, поэтому NO. При t=2 минимум 3 > 2, поэтому YES.

function expiringNodes(N, edges, expiry, queries) {
    const LOG = Math.ceil(Math.log2(N)) + 2;

    // Переводим сроки жизни в 1-индексный массив, чтобы индекс совпадал с номером вершины.
    const life = new Array(N + 1);
    life[0] = Infinity;
    for (let i = 1; i <= N; ++i) {
        life[i] = expiry[i - 1];
    }

    // Строим список смежности.
    const adj = Array.from({ length: N + 1 }, () => []);
    for (const [a, b] of edges) {
        adj[a].push(b);
        adj[b].push(a);
    }

    // Обход дерева из корня 1: заполняем родителей и глубины.
    const parent = new Array(N + 1).fill(0);
    const depth = new Array(N + 1).fill(0);
    const visited = new Array(N + 1).fill(false);
    visited[1] = true;
    const stack = [1];
    while (stack.length) {
        const v = stack.pop();
        for (const to of adj[v]) {
            if (!visited[to]) {
                visited[to] = true;
                parent[to] = v;
                depth[to] = depth[v] + 1;
                stack.push(to);
            }
        }
    }

    // Бинарные подъёмы.
    // up[k][v] — предок на 2^k шагов вверх; 0 означает «предка нет».
    // mn[k][v] — минимум life на пути от v на 2^k шагов вверх, не включая конечную вершину.
    const up = Array.from({ length: LOG }, () => new Array(N + 1).fill(0));
    const mn = Array.from({ length: LOG }, () => new Array(N + 1).fill(Infinity));

    for (let v = 1; v <= N; ++v) {
        up[0][v] = parent[v];
        mn[0][v] = life[v];
    }

    for (let k = 1; k < LOG; ++k) {
        for (let v = 1; v <= N; ++v) {
            const mid = up[k - 1][v];
            up[k][v] = up[k - 1][mid];
            mn[k][v] = Math.min(mn[k - 1][v], mn[k - 1][mid]);
        }
    }

    // Возвращает минимум life на пути между a и b.
    function pathMin(a, b) {
        if (a === b) {
            return life[a];
        }

        let result = Infinity;

        // Поднимаем более глубокую вершину, пока глубины не сравняются.
        if (depth[a] < depth[b]) {
            [a, b] = [b, a];
        }
        let diff = depth[a] - depth[b];
        for (let k = 0; k < LOG; ++k) {
            if (diff & (1 << k)) {
                result = Math.min(result, mn[k][a]);
                a = up[k][a];
            }
        }

        // Если после выравнивания вершины совпали, то b — общий предок.
        if (a === b) {
            return Math.min(result, life[b]);
        }

        // Поднимаем обе вершины одновременно.
        for (let k = LOG - 1; k >= 0; --k) {
            if (up[k][a] !== up[k][b]) {
                result = Math.min(result, mn[k][a], mn[k][b]);
                a = up[k][a];
                b = up[k][b];
            }
        }

        // Теперь a и b — дети lca, осталось учесть их самих и lca.
        return Math.min(result, life[a], life[b], life[up[0][a]]);
    }

    // Обработка запросов.
    return queries.map(([u, v, t]) =>
        pathMin(u, v) > t ? 'YES' : 'NO'
    );
}
