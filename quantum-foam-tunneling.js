// Задача: Quantum Foam Tunneling
// Сложность: hard
// Дата генерации: 2026-10-14

// Условие задачи
// В квантовой пене частица может туннелировать между N квантовыми состояниями. Амплитуда туннелирования из состояния i в состояние j за один шаг (один планковский такт) задана комплексным числом a_ij + i*b_ij. Частица начинает в состоянии S. Через L тактов мы хотим узнать вероятность обнаружить её в состоянии T. Вероятность равна квадрату модуля амплитуды перехода из S в T за L шагов: |(A^L)[S][T]|^2, где A — матрица амплитуд переходов.
// 
// Все вычисления проводятся по модулю P = 10^9 + 7. Комплексные числа представляются парами (a, b) по модулю P, при этом i^2 = -1 (то есть (a+bi)(c+di) = (ac - bd) + (ad + bc)i). Гарантируется, что -1 не является квадратичным вычетом по модулю P, поэтому такое представление корректно.
// 
// Входные данные:
// Первая строка: N, L, S, T (1 ≤ N ≤ 50, 0 ≤ L ≤ 10^18, 0 ≤ S, T < N).
// Далее N строк, каждая содержит 2N целых чисел: для каждого j от 0 до N-1 сначала a_ij, затем b_ij (0 ≤ a_ij, b_ij < P).
// 
// Выходные данные:
// Одно целое число — вероятность P(T|S,L) = |(A^L)[S][T]|^2 mod P.
// 
// Пример 1:
// Вход:
// 2 1 0 1
// 0 0 0 1
// 0 1 0 0
// Выход:
// 1
// Пояснение: A = [[0, i], [i, 0]]. (A^1)[0][1] = i. |i|^2 = 1.
// 
// Пример 2:
// Вход:
// 2 2 0 1
// 0 0 0 1
// 0 1 0 0
// Выход:
// 0
// Пояснение: A^2 = [[-1, 0], [0, -1]]. (A^2)[0][1] = 0. |0|^2 = 0.

function solve(input) {
  const P = 1000000007n;
  const lines = input.trim().split('\n');
  const first = lines[0].trim().split(/\s+/);
  const N = parseInt(first[0]);
  const L = BigInt(first[1]);
  const S = parseInt(first[2]);
  const T = parseInt(first[3]);

  // Чтение матрицы амплитуд A
  const A = [];
  for (let i = 0; i < N; i++) {
    const row = lines[i+1].trim().split(/\s+/);
    const rowComplex = [];
    for (let j = 0; j < N; j++) {
      const a = BigInt(row[2*j]);
      const b = BigInt(row[2*j+1]);
      rowComplex.push([a, b]);
    }
    A.push(rowComplex);
  }

  // Умножение комплексных чисел (a+bi)*(c+di) по модулю P
  function mulComplex(x, y) {
    const re = (x[0] * y[0] - x[1] * y[1]) % P;
    const im = (x[0] * y[1] + x[1] * y[0]) % P;
    return [(re + P) % P, (im + P) % P];
  }

  // Умножение матриц размера N x N
  function matMul(X, Y) {
    const Z = Array.from({ length: N }, () => Array.from({ length: N }, () => [0n, 0n]));
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < N; k++) {
        const xik = X[i][k];
        if (xik[0] === 0n && xik[1] === 0n) continue; // пропускаем нулевые элементы
        for (let j = 0; j < N; j++) {
          const prod = mulComplex(xik, Y[k][j]);
          Z[i][j][0] = (Z[i][j][0] + prod[0]) % P;
          Z[i][j][1] = (Z[i][j][1] + prod[1]) % P;
        }
      }
    }
    return Z;
  }

  // Быстрое возведение матрицы в степень L
  function matPow(M, exp) {
    // Единичная матрица
    let res = Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => i === j ? [1n, 0n] : [0n, 0n])
    );
    let base = M;
    while (exp > 0n) {
      if (exp & 1n) res = matMul(res, base);
      base = matMul(base, base);
      exp >>= 1n;
    }
    return res;
  }

  const resultMatrix = matPow(A, L);
  const [re, im] = resultMatrix[S][T]; // амплитуда перехода из S в T за L шагов
  const prob = (re * re + im * im) % P;
  return prob.toString();
}
