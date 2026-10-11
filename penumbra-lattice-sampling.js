// Задача: Penumbra Lattice Sampling
// Сложность: hard
// Дата генерации: 2026-10-11

// Условие задачи
// Penumbra Lattice Sampling
// 
// В начале координат (0, 0) расположен точечный источник света. Его полутень (penumbra) — это клин (конус), выходящий из источника и ограниченный двумя лучами. Направление нижнего луча задаётся целочисленным вектором (ax, ay), верхнего — (bx, by), где ax >= 1, bx >= 1, ay >= 0, by >= 0 и выполнено ay / ax <= by / bx (наклон нижнего луча не больше наклона верхнего). Иначе говоря, точка с x > 0 попадает в полутень, если одновременно
// 
//     ay * x <= ax * y      (точка не ниже нижнего луча)
//     bx * y <= by * x      (точка не выше верхнего луча)
// 
// Рассматривается прямоугольная «область экрана»: целые x и y такие, что 1 <= x <= N и 0 <= y <= M. Нужно посчитать, сколько решётчатых точек (x, y) из этого прямоугольника лежат в полутени (граница клина включается).
// 
// ФОРМАТ ВХОДА
// Функция countPenumbraLattice(ax, ay, bx, by, N, M) принимает шесть целых чисел:
//   ax, ay — направление нижнего луча, 1 <= ax <= 10^9, 0 <= ay <= 10^9;
//   bx, by — направление верхнего луча,  1 <= bx <= 10^9, 0 <= by <= 10^9;
//   N      — правая граница по x, 1 <= N <= 10^9;
//   M      — верхняя граница по y, 0 <= M <= 10^9.
// Гарантируется, что ay * bx <= by * ax.
// 
// ФОРМАТ РЕЗУЛЬТАТА
// Количество решётчатых точек в полутени. Ответ может достигать примерно 10^18 и не помещается в обычный Number, поэтому функция возвращает BigInt.
// 
// ПРИМЕРЫ
// 1) countPenumbraLattice(1, 0, 1, 1, 5, 5) = 20n
//    Клин 0 <= y <= x, квадрат 1 <= x <= 5, 0 <= y <= 5.
//    Столбцы дают 2 + 3 + 4 + 5 + 6 = 20 точек.
// 
// 2) countPenumbraLattice(2, 1, 2, 3, 4, 10) = 12n
//    Клин x/2 <= y <= 3x/2. Столбцы дают 1 + 3 + 3 + 5 = 12 точек.
// 
// 3) countPenumbraLattice(3, 1, 1, 1, 6, 2) = 8n
//    Клин x/3 <= y <= x, обрезанный полосой y <= 2.
//    Столбцы дают 1 + 2 + 2 + 1 + 1 + 1 = 8 точек.
// 
// ПОЯСНЕНИЕ К РЕШЕНИЮ
// Для каждого целого столбца x допустимые y образуют отрезок [ceil(s1*x), min(M, floor(s2*x))], где s1 = ay/ax, s2 = by/bx, поэтому вклад столбца равен
//     floor(min(M, floor(s2*x))) ... точнее floor(s2*x) - ceil(s1*x) + 1   (когда верх не обрезан),
//     M - ceil(s1*x) + 1                                                  (когда верх обрезан).
// Так как обе границы монотонны по x, множество столбцов разбивается на два участка, а суммы floor и ceil линейных функций считаются быстрым «эвклидовым» алгоритмом суммы floor за O(log).

// ─────────────────────────────────────────────────────────────
//  Penumbra Lattice Sampling
// ─────────────────────────────────────────────────────────────

// Сумма Σ_{i=0}^{n-1} floor((a*i + b) / m) — «эвклидова» сумма за O(log).
// Все аргументы — BigInt, причём m > 0, n >= 0, a >= 0, b >= 0.
// Идея: выносим целые части наклона и сдвига, затем меняем роли осей.
function floorSum(n, m, a, b) {
  let ans = 0n;
  while (true) {
    if (a >= m) {
      // выносим целую часть коэффициента наклона
      ans += ((n - 1n) * n / 2n) * (a / m);
      a %= m;
    }
    if (b >= m) {
      // выносим целую часть свободного члена
      ans += n * (b / m);
      b %= m;
    }
    const yMax = a * n + b;
    if (yMax < m) break;
    // меняем оси местами — суть алгоритма
    n = yMax / m;
    b = yMax % m;
    const t = m;
    m = a;
    a = t;
  }
  return ans;
}

// Σ_{x=0}^{upto} floor(num * x / den)
function sumFloorLinear(upto, num, den) {
  if (upto < 0n) return 0n;
  return floorSum(upto + 1n, den, num, 0n);
}

// Σ_{x=0}^{upto} ceil(num * x / den)
// Используем тождество ceil(p/q) = floor((p + q - 1)/q).
function sumCeilLinear(upto, num, den) {
  if (upto < 0n) return 0n;
  return floorSum(upto + 1n, den, num, den - 1n);
}

// Основная функция.
// Нижний луч — (ax, ay), верхний — (bx, by), причём 0 <= ay/ax <= by/bx.
// Считаем решётчатые точки (x, y) с 1 <= x <= N, 0 <= y <= M,
// попадающие в замкнутый клин ay*x <= ax*y и bx*y <= by*x.
function countPenumbraLattice(ax, ay, bx, by, N, M) {
  const AX = BigInt(ax), AY = BigInt(ay);
  const BX = BigInt(bx), BY = BigInt(by);
  const NN = BigInt(N), MM = BigInt(M);

  // Столбец x ещё задевает полосу y <= M, пока нижняя граница
  // s1*x = (AY/AX)*x не ушла выше M, то есть AY*x <= AX*M.
  let xBottom;
  if (AY === 0n) {
    xBottom = NN; // нижняя граница совпадает с осью x — обрезки нет
  } else {
    const lim = (MM * AX) / AY; // floor(M * AX / AY)
    xBottom = lim < NN ? lim : NN;
  }

  // Значение floor(s2*x) не превосходит M, пока BY*x <= BX*M.
  let xTop;
  if (BY === 0n) {
    xTop = NN;
  } else {
    const lim = (MM * BX) / BY; // floor(M * BX / BY)
    xTop = lim < NN ? lim : NN;
  }
  // Так как s1 <= s2, всегда xBottom >= xTop (на всякий случай подстрахуемся).
  if (xTop > xBottom) xTop = xBottom;

  let answer = 0n;

  // Участок 1 (x = 1..xTop): обе границы внутри [0, M].
  // В столбце ровно floor(s2*x) - ceil(s1*x) + 1 точек.
  if (xTop >= 1n) {
    const sFloor = sumFloorLinear(xTop, BY, BX);
    const sCeil = sumCeilLinear(xTop, AY, AX);
    answer += sFloor - sCeil + xTop;
  }

  // Участок 2 (x = xTop+1..xBottom): верхняя граница обрезана значением M.
  // В столбце ровно M - ceil(s1*x) + 1 точек.
  if (xBottom > xTop) {
    const cnt = xBottom - xTop;
    const sCeil = sumCeilLinear(xBottom, AY, AX) - sumCeilLinear(xTop, AY, AX);
    answer += cnt * (MM + 1n) - sCeil;
  }

  return answer;
}
