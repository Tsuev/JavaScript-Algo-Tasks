// Задача: Gossamer Thread Binding
// Сложность: hard
// Дата генерации: 2026-10-01

// Условие задачи
// Задача: Gossamer Thread Binding (связывание паутинных нитей).
// 
// У вас есть n паутинных нитей, каждая задана непустой строкой из строчных латинских букв. Две нити A и B можно связать, если непустой суффикс A совпадает с префиксом B той же длины. В результате получается строка A, к которой приписана часть B, не вошедшая в перекрытие. Разрешается также приписать B к A без перекрытия (перекрытие длины 0). Связывания можно выполнять в любом порядке.
// 
// Нужно связать все нити в одну так, чтобы итоговая строка имела минимально возможную длину. Фактически требуется найти кратчайшую общую суперстроку: строку минимальной длины, содержащую каждую исходную строку как подстроку. Вернуть эту строку; если оптимальных строк несколько, вернуть любую.
// 
// Формат входа: реализуйте функцию gossamerThreadBinding(threads), где threads — массив строк.
// Ограничения: 1 ≤ threads.length ≤ 15, 1 ≤ threads[i].length ≤ 100. Все символы — строчные латинские буквы.
// 
// Формат выхода: функция должна вернуть строку — кратчайшую связанную нить.
// 
// Примеры:
// 1) threads = [«abc», «bcd», «cde»] -> «abcde»
// 2) threads = [«ab», «bc», «ca»] -> «abca» (или другая кратчайшая строка длины 4)
// 3) threads = [«aaa», «aa»] -> «aaa»
// 4) threads = [«xyz», «yzx», «zxy»] -> «xyzxy»

function gossamerThreadBinding(threads) {
  // Убираем нити, которые полностью содержатся в других.
  // Сортируем по убыванию длины: тогда более короткая нить будет отброшена,
  // если она является подстрокой уже оставленной более длинной.
  const sorted = [...threads].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const arr = [];
  for (const s of sorted) {
    let inside = false;
    for (const t of arr) {
      if (t.includes(s)) {
        inside = true;
        break;
      }
    }
    if (!inside) arr.push(s);
  }

  const n = arr.length;
  if (n === 0) return '';
  if (n === 1) return arr[0];

  // overlap[i][j] — максимальная длина суффикса arr[i],
  // совпадающего с префиксом arr[j]. При связывании эту часть не дублируем.
  const overlap = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = arr[i];
      const b = arr[j];
      const maxK = Math.min(a.length, b.length);
      for (let k = maxK; k >= 1; k--) {
        if (a.slice(a.length - k) === b.slice(0, k)) {
          overlap[i][j] = k;
          break;
        }
      }
    }
  }

  const full = 1 << n;
  const INF = 1e9;
  // dp[mask][last] — минимальная длина суперстроки для набора mask,
  // заканчивающейся нитью last.
  const dp = Array.from({ length: full }, () => Array(n).fill(INF));
  // parent[mask][last] — предыдущая нить в оптимальном связывании.
  const parent = Array.from({ length: full }, () => Array(n).fill(-1));

  for (let i = 0; i < n; i++) {
    dp[1 << i][i] = arr[i].length;
  }

  for (let mask = 1; mask < full; mask++) {
    for (let last = 0; last < n; last++) {
      const curLen = dp[mask][last];
      if (curLen >= INF) continue;
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;
        const nextMask = mask | (1 << next);
        const candidate = curLen + arr[next].length - overlap[last][next];
        if (candidate < dp[nextMask][next]) {
          dp[nextMask][next] = candidate;
          parent[nextMask][next] = last;
        }
      }
    }
  }

  let bestLen = INF;
  let lastThread = -1;
  for (let i = 0; i < n; i++) {
    if (dp[full - 1][i] < bestLen) {
      bestLen = dp[full - 1][i];
      lastThread = i;
    }
  }

  // Восстанавливаем порядок связывания.
  const order = [];
  let mask = full - 1;
  let cur = lastThread;
  while (cur !== -1) {
    order.push(cur);
    const prev = parent[mask][cur];
    mask ^= (1 << cur);
    cur = prev;
  }
  order.reverse();

  // Собираем итоговую строку, добавляя только неперекрывающиеся части.
  let result = arr[order[0]];
  for (let i = 1; i < order.length; i++) {
    const prev = order[i - 1];
    const next = order[i];
    result += arr[next].slice(overlap[prev][next]);
  }

  return result;
}
