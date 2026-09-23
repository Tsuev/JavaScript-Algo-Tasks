// Задача: Emberlight Rationing
// Сложность: hard
// Дата генерации: 2026-09-23

// Условие задачи
// В городе Эмберлайт n дней подряд добывают свет. В день i добывается a_i единиц. Мэр хочет разбить все n дней на ровно k непрерывных периодов (каждый период — непустой отрезок подряд идущих дней, все дни покрыты ровно один раз, порядок сохраняется). Стоимость периода равна квадрату суммарной добычи за этот период. Требуется минимизировать суммарную стоимость всех периодов.
// 
// Формально: нужно выбрать индексы 0 = i_0 < i_1 < ... < i_k = n и минимизировать Σ_{t=1}^k (Σ_{j=i_{t-1}+1}^{i_t} a_j)^2.
// 
// Входные данные: функция solve(n, k, a), где n — количество дней (1 ≤ n ≤ 1000), k — количество периодов (1 ≤ k ≤ n), a — массив из n целых чисел (0 ≤ a_i ≤ 50).
// 
// Выходные данные: функция возвращает одно число — минимальную суммарную стоимость.
// 
// Примеры:
// 1. solve(5, 2, [1, 2, 3, 4, 5]) → 117. Разбиение [1,2,3] и [4,5] даёт (1+2+3)^2 + (4+5)^2 = 36 + 81 = 117.
// 2. solve(3, 3, [1, 1, 1]) → 3.
// 3. solve(1, 1, [5]) → 25.
// 
// Ограничения: n ≤ 1000, k ≤ n, a_i ≤ 50. Ответ помещается в 64-битное целое, но для JavaScript достаточно Number.

function solve(n, k, a) {
  // Префиксные суммы: S[i] = сумма первых i дней.
  const S = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    S[i] = S[i - 1] + a[i - 1];
  }

  // dp[i] — минимальная стоимость для первых i дней при текущем числе периодов.
  let dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  // Последовательно увеличиваем число периодов до k.
  for (let t = 1; t <= k; t++) {
    const ndp = new Array(n + 1).fill(Infinity);

    // Выпуклая оболочка линий y = m*x + b для перехода:
    // ndp[i] = S[i]^2 + min_j (-2*S[j]*S[i] + dp[j] + S[j]^2)
    const lines = [];
    let head = 0; // указатель на первую актуальную линию

    for (let i = t; i <= n; i++) {
      const j = i - 1;
      if (dp[j] < Infinity) {
        const m = -2 * S[j];
        const b = dp[j] + S[j] * S[j];

        // Если наклон совпадает, оставляем только линию с меньшим b.
        let skip = false;
        while (lines.length > head && lines[lines.length - 1].m === m) {
          if (lines[lines.length - 1].b <= b) {
            skip = true;
            break;
          } else {
            lines.pop();
          }
        }

        if (!skip) {
          // Удаляем последнюю линию, если она перестала быть полезной.
          while (lines.length - head >= 2) {
            const l1 = lines[lines.length - 2];
            const l2 = lines[lines.length - 1];
            const left = (l2.b - l1.b) * (l2.m - m);
            const right = (b - l2.b) * (l1.m - l2.m);
            if (left >= right) {
              lines.pop();
            } else {
              break;
            }
          }
          lines.push({ m, b });
        }
      }

      // Запрос минимума в точке x = S[i].
      const x = S[i];
      while (lines.length - head >= 2) {
        const l1 = lines[head];
        const l2 = lines[head + 1];
        if (l1.m * x + l1.b >= l2.m * x + l2.b) {
          head++;
        } else {
          break;
        }
      }

      if (lines.length - head >= 1) {
        const best = lines[head];
        ndp[i] = best.m * x + best.b + x * x;
      }
    }

    dp = ndp;
  }

  return dp[n];
}
