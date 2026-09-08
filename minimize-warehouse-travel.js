// Задача: Minimize Warehouse Travel
// Сложность: hard
// Дата генерации: 2026-09-08

// Условие задачи
// Minimize Warehouse Travel
// 
// Склад имеет вид дерева: вершины — склады, рёбра — коридоры с длинами. Вершина 1 является доком, куда нужно привезти все посылки заказа. Сборщик начинает в доке с пустой тележкой вместимостью C. Он может идти по коридорам в обе стороны, собирать посылки в любом порядке и возвращаться в док сколько угодно раз, но не может одновременно везти больше C посылок. Посылки из одного заказа могут находиться на одном складе (тогда их несколько).
// 
// Для каждого заказа требуется найти минимальную суммарную длину пути, который должен пройти сборщик, чтобы все посылки оказались в доке.
// 
// Формат входных данных:
// Первая строка содержит три целых числа N, Q, C (2 ≤ N ≤ 2·10^5, 1 ≤ Q ≤ 2·10^5, 1 ≤ C ≤ 10^9).
// Далее идут N−1 строк, каждая содержит три целых числа u, v, w — ребро между складами u и v длины w (1 ≤ u, v ≤ N, 1 ≤ w ≤ 10^9).
// Далее идут Q строк заказов. Каждая строка начинается с числа k — количества посылок в заказе, затем следует k чисел — номера складов, где лежат посылки. Если номер повторяется, значит на этом складе несколько посылок. Сумма всех k по всем заказам не превосходит 2·10^5.
// 
// Формат выходных данных:
// Для каждого заказа выведите одно целое число — минимальную суммарную дистанцию, которую нужно пройти сборщику.
// 
// Пример:
// Входные данные:
// 4 1 2
// 1 2 10
// 2 3 20
// 2 4 30
// 2 3 4
// 
// Выходные данные:
// 120
// 
// Пояснение: тележка вмещает 2 посылки. Можно дойти от дока до склада 3, забрать посылку, затем до склада 4, забрать вторую, после чего вернуться в док. Пройденный путь: 1-2-3 (30), 3-2 (20), 2-4 (30), 4-2 (30), 2-1 (10), итого 120.

function minimizeWarehouseTravel(N, C, edges, queries) {
    const adj = Array.from({ length: N + 1 }, () => []);
    for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
    }

    const LOG = Math.max(1, Math.ceil(Math.log2(N)) + 1);
    const up = Array.from({ length: LOG }, () => new Array(N + 1).fill(0));
    const depth = new Array(N + 1).fill(0);
    const tin = new Array(N + 1).fill(0);
    const tout = new Array(N + 1).fill(0);
    const distRoot = new Array(N + 1).fill(0n);

    // Итеративный обход дерева от корня 1: заполняем tin/tout, глубину,
    // расстояния от корня и двоичные подъёмы для LCA.
    const root = 1;
    up[0][root] = root;
    for (let i = 1; i < LOG; ++i) up[i][root] = root;
    depth[root] = 0;
    distRoot[root] = 0n;

    let timer = 0;
    tin[root] = timer++;

    const stack = [{ v: root, p: root, idx: 0 }];
    while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.idx < adj[top.v].length) {
            const [to, w] = adj[top.v][top.idx++];
            if (to === top.p) continue;

            depth[to] = depth[top.v] + 1;
            distRoot[to] = distRoot[top.v] + BigInt(w);
            tin[to] = timer++;

            up[0][to] = top.v;
            for (let i = 1; i < LOG; ++i) {
                up[i][to] = up[i - 1][up[i - 1][to]];
            }

            stack.push({ v: to, p: top.v, idx: 0 });
        } else {
            tout[top.v] = timer;
            stack.pop();
        }
    }

    const isAncestor = (u, v) => tin[u] <= tin[v] && tout[v] <= tout[u];

    const lca = (u, v) => {
        if (isAncestor(u, v)) return u;
        if (isAncestor(v, u)) return v;
        for (let i = LOG - 1; i >= 0; --i) {
            const a = up[i][u];
            if (!isAncestor(a, v)) u = a;
        }
        return up[0][u];
    };

    const results = [];

    for (const query of queries) {
        if (query.length === 0) {
            results.push('0');
            continue;
        }

        // Сколько посылок лежит на каждом складе в текущем заказе.
        const cnt = new Map();
        const needed = new Set([root]);

        for (const x of query) {
            cnt.set(x, (cnt.get(x) || 0) + 1);
            needed.add(x);
        }

        // Сортируем требуемые вершины по tin и добавляем LCA соседних вершин.
        // Так получается минимальный набор вершин виртуального дерева.
        let nodes = Array.from(needed);
        nodes.sort((a, b) => tin[a] - tin[b]);

        const extraLcas = [];
        for (let i = 0; i + 1 < nodes.length; ++i) {
            extraLcas.push(lca(nodes[i], nodes[i + 1]));
        }
        for (const v of extraLcas) needed.add(v);

        nodes = Array.from(needed);
        nodes.sort((a, b) => tin[a] - tin[b]);

        // Построение рёбер виртуального дерева: для каждой вершины храним ближайшего
        // предка среди множества nodes.
        const parent = new Map();
        const st = [];
        for (const v of nodes) {
            while (st.length > 0 && !isAncestor(st[st.length - 1], v)) {
                st.pop();
            }
            if (st.length === 0) {
                parent.set(v, 0);
            } else {
                parent.set(v, st[st.length - 1]);
            }
            st.push(v);
        }

        // sum[v] — общее количество посылок в исходном поддереве вершины v.
        const sum = new Map();
        for (const v of nodes) sum.set(v, 0);
        for (const [v, c] of cnt) sum.set(v, c);

        // Идём снизу вверх по tin: дети всегда имеют больший tin, чем родитель.
        // Для каждого виртуального ребра (p, v) все рёбра исходного дерева на пути
        // p-v имеют одно и то же число посылок в поддереве, поэтому вклад участка
        // равен расстояние(p,v) * ceil(сумма поддерева v / C).
        // Полный путь содержит каждый такой участок дважды, поэтому в конце умножаем на 2.
        let halfAnswer = 0n;
        for (let i = nodes.length - 1; i >= 0; --i) {
            const v = nodes[i];
            const p = parent.get(v);
            if (p === 0) continue;

            const cur = sum.get(v);
            if (cur > 0) {
                const trips = Math.ceil(cur / C);
                if (trips > 0) {
                    halfAnswer += (distRoot[v] - distRoot[p]) * BigInt(trips);
                }
            }

            sum.set(p, (sum.get(p) || 0) + cur);
        }

        results.push((2n * halfAnswer).toString());
    }

    return results;
}
