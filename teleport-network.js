// Задача: Teleport Network
// Сложность: hard
// Дата генерации: 2026-09-07

// Условие задачи
// В стране есть N городов, пронумерованных от 1 до N. Можно строить двусторонние дороги между городами. В каждом городе i можно также построить станцию телепортации за a_i. Если станции построены хотя бы в двух городах, то из любого такого города можно мгновенно переместиться в любой другой такой город — телепортация ничего не стоит. Требуется выбрать набор дорог и станций так, чтобы из каждого города можно было добраться до любого другого (по дорогам или с помощью телепортов). Найдите минимальную суммарную стоимость строительства.
// Формат входных данных
// В первой строке даны два целых числа N и M (1≤N≤2·10^5, 0≤M≤3·10^5). Далее в M строках записаны тройки u_i v_i w_i (1≤u_i,v_i≤N; u_i≠v_i; 1≤w_i≤10^9) — дорогу между u_i и v_i можно построить за w_i. В последней строке даны N целых чисел a_i (1≤a_i≤10^9) — стоимость станции в городе i.
// Формат результата
// Выведите одно целое число — минимальную возможную суммарную стоимость строительства.
// Пример 1
// Входные данные:
// 4 3
// 1 2 100
// 2 3 100
// 1 4 100
// 10 1000 10 10
// Выходные данные:
// 130
// Пример 2
// Входные данные:
// 3 0
// 5 2 4
// Выходные данные:
// 11

function solve(n, roads, stationCosts) {
  const INF = Number.MAX_SAFE_INTEGER;

  class DSU {
    constructor(size) {
      this.parent = Array.from({ length: size }, (_, i) => i);
      this.rank = Array(size).fill(0);
    }

    find(x) {
      if (this.parent[x] !== x) {
        this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
    }

    union(a, b) {
      a = this.find(a);
      b = this.find(b);
      if (a === b) return false;
      if (this.rank[a] < this.rank[b]) {
        [a, b] = [b, a];
      }
      this.parent[b] = a;
      if (this.rank[a] === this.rank[b]) this.rank[a] += 1;
      return true;
    }
  }

  function kruskal(vertexCount, edges) {
    if (vertexCount <= 1) return 0;
    edges.sort((a, b) => a.w - b.w);
    const dsu = new DSU(vertexCount);
    let total = 0;
    let used = 0;
    for (const edge of edges) {
      if (dsu.union(edge.u, edge.v)) {
        total += edge.w;
        used += 1;
        if (used === vertexCount - 1) return total;
      }
    }
    return INF;
  }

  // Случай 1: используем только дороги.
  const cityEdges = roads.map(([u, v, w]) => ({ u: u - 1, v: v - 1, w }));
  const roadOnlyCost = kruskal(n, cityEdges);

  // Случай 2: добавляем виртуальный узел 0 — общую телепорт-сеть.
  const teleportEdges = roads.map(([u, v, w]) => ({ u, v, w }));
  for (let i = 1; i <= n; i++) {
    teleportEdges.push({ u: 0, v: i, w: stationCosts[i - 1] });
  }
  const withTeleportCost = kruskal(n + 1, teleportEdges);

  return Math.min(roadOnlyCost, withTeleportCost);
}
