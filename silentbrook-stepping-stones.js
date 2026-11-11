// Задача: Silentbrook Stepping Stones
// Сложность: hard
// Дата генерации: 2026-11-11

// Условие задачи
// Через реку Сайлентбрук можно перебраться по камням-ступеням. Левый берег находится в координате 0, правый — в координате L. Между ними на целых координатах 0 < p1 < p2 < ... < pn < L лежат n камней. Приземление на камень i стоит w_i единиц усталости (w_i > 0), оба берега бесплатны.
// 
// Лягушка сидит на левом берегу и хочет попасть на правый. За один прыжок она может переместиться с точки x на точку y при условии x < y <= x + K, где K — максимальная длина прыжка. Приземляться можно только на камни и на берега. Так как координаты строго возрастают, каждый камень посещается не более одного раза, и любая последовательность прыжков однозначно задаётся набором камней, на которые лягушка встала.
// 
// Требуется найти минимальную суммарную усталость, с которой можно добраться с левого берега на правый, и количество различных наборов камней, дающих именно эту минимальную усталость. Количество вывести по модулю 10^9 + 7. Если перебраться невозможно, вернуть -1 и 0.
// 
// Формат входа: функция solveSilentbrook(riverLength, maxJump, stones), где riverLength = L (целое), maxJump = K (целое, K > 0), stones — массив пар [position, wear] из целых чисел. Камни могут быть переданы в произвольном порядке.
// 
// Формат результата: массив [minCost, ways], где minCost — минимальная усталость (или -1, если переправа невозможна), ways — число оптимальных наборов камней по модулю 10^9+7 (или 0 при невозможности).
// 
// Примеры:
// 1) solveSilentbrook(6, 4, [[2,1],[3,1],[4,1]]) => [1,3]. Каждый из камней 2, 3, 4 достижим с берега 0 (расстояние <= 4), и с каждого достижим правый берег 6 (расстояние <= 4), поэтому три разных одношаговых маршрута дают минимальную усталость 1.
// 2) solveSilentbrook(10, 4, [[2,1],[5,2],[6,1],[8,3]]) => [2,1]. Оптимальный маршрут 0 -> 2 -> 6 -> 10 стоит 1 + 1 = 2, и он единственный.
// 3) solveSilentbrook(10, 3, [[5,1]]) => [-1,0]. С левого берега единственный камень (координата 5) недостижим при K = 3.

function solveSilentbrook(riverLength, maxJump, stones) {
  const MOD = 1_000_000_007;

  // Сортируем камни по координате — дальше считаем, что они идут слева направо.
  const ordered = stones
    .map(([position, wear]) => ({ position, wear }))
    .sort((a, b) => a.position - b.position);

  // Точки опоры: 0 — левый берег, затем камни, затем L — правый берег.
  const pos = [0];
  const wear = [0];
  for (const stone of ordered) {
    pos.push(stone.position);
    wear.push(stone.wear);
  }
  const bankIndex = pos.length; // сюда попадёт правый берег
  pos.push(riverLength);
  wear.push(0);

  const total = pos.length;

  // Дерево отрезков по индексам точек опоры: для каждой вершины храним
  // минимальную достигнутую стоимость и суммарное число способов её получить.
  let size = 1;
  while (size < total) size <<= 1;
  const INF = Infinity;
  const treeMin = new Array(2 * size).fill(INF);
  const treeCnt = new Array(2 * size).fill(0);

  const pull = (node) => {
    const left = node * 2;
    const right = node * 2 + 1;
    if (treeMin[left] < treeMin[right]) {
      treeMin[node] = treeMin[left];
      treeCnt[node] = treeCnt[left];
    } else if (treeMin[right] < treeMin[left]) {
      treeMin[node] = treeMin[right];
      treeCnt[node] = treeCnt[right];
    } else {
      // Стоимости равны — складываем количества способов по модулю.
      treeMin[node] = treeMin[left];
      treeCnt[node] = (treeCnt[left] + treeCnt[right]) % MOD;
    }
  };

  const setPoint = (index, value, count) => {
    let node = size + index;
    treeMin[node] = value;
    treeCnt[node] = count;
    node >>= 1;
    while (node >= 1) {
      pull(node);
      node >>= 1;
    }
  };

  // Возвращает [минимальную стоимость, количество способов достичь её] на отрезке.
  const queryRange = (left, right) => {
    let lo = left + size;
    let hi = right + size;
    let bestMin = INF;
    let bestCnt = 0;
    while (lo <= hi) {
      if (lo & 1) {
        if (treeMin[lo] < bestMin) {
          bestMin = treeMin[lo];
          bestCnt = treeCnt[lo];
        } else if (treeMin[lo] === bestMin) {
          bestCnt = (bestCnt + treeCnt[lo]) % MOD;
        }
        lo++;
      }
      if (!(hi & 1)) {
        if (treeMin[hi] < bestMin) {
          bestMin = treeMin[hi];
          bestCnt = treeCnt[hi];
        } else if (treeMin[hi] === bestMin) {
          bestCnt = (bestCnt + treeCnt[hi]) % MOD;
        }
        hi--;
      }
      lo >>= 1;
      hi >>= 1;
    }
    return [bestMin, bestCnt];
  };

  // Старт: на левом берегу усталость 0, способ один.
  setPoint(0, 0, 1);

  // Самый левый ещё достижимый камень. Поскольку цели идут слева направо,
  // эта граница может только сдвигаться вправо — получаем скользящее окно.
  let leftmost = 0;

  for (let j = 1; j < total; j++) {
    // Отбрасываем точки, до которых уже не дотянуться прыжком длины maxJump.
    while (leftmost < j && pos[j] - pos[leftmost] > maxJump) {
      leftmost++;
    }
    if (leftmost > j - 1) continue; // ни одной достижимой предыдущей точки

    // Оптимальный переход — это лучший из всех достижимых камней окна.
    const [bestPrev, ways] = queryRange(leftmost, j - 1);
    if (bestPrev === INF) continue; // все предыдущие точки недостижимы

    setPoint(j, bestPrev + wear[j], ways);
  }

  const answerCost = treeMin[size + bankIndex];
  if (answerCost === INF) return [-1, 0];
  return [answerCost, treeCnt[size + bankIndex]];
}
