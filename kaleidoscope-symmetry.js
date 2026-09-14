// Задача: Kaleidoscope Symmetry
// Сложность: hard
// Дата генерации: 2026-09-14

// Условие задачи
// В калейдоскопе имеется N зеркал, расположенных в вершинах правильного N-угольника. Каждое зеркало можно окрасить в один из K цветов. Два калейдоскопа считаются одинаковыми, если один можно получить из другого поворотом или отражением всего многоугольника (то есть с точностью до симметрий правильного N-угольника). Требуется подсчитать количество различных калейдоскопов по модулю 10^9+7.
// 
// Формат входных данных: два целых числа N и K (1 ≤ N ≤ 10^9, 1 ≤ K ≤ 10^9), разделённые пробелом.
// 
// Формат выходных данных: одно целое число — ответ по модулю 10^9+7.
// 
// Примеры:
// Ввод: 4 2
// Вывод: 6
// 
// Ввод: 5 3
// Вывод: 39
// 
// Ввод: 1 10
// Вывод: 10
// 
// Пояснение к примерам: для N=4, K=2 существует 6 различных раскрасок с точностью до поворотов и отражений. Для N=5, K=3 — 39. Для N=1, K=10 — 10 (все цвета различны, так как отражение не меняет единственное зеркало).

const MOD = 1_000_000_007n;

function modPow(base, exp, mod) {
  base %= mod;
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

function modInverse(a, mod) {
  return modPow(a, mod - 2n, mod);
}

function factorize(n) {
  const factors = [];
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      let e = 0;
      while (n % p === 0) { n /= p; e++; }
      factors.push([p, e]);
    }
  }
  if (n > 1) factors.push([n, 1]);
  return factors;
}

function getDivisors(factors) {
  let divs = [1];
  for (const [p, e] of factors) {
    const newDivs = [];
    let pe = 1;
    for (let i = 0; i <= e; i++) {
      for (const d of divs) {
        newDivs.push(d * pe);
      }
      pe *= p;
    }
    divs = newDivs;
  }
  return divs;
}

function phi(d, factors) {
  let res = d;
  for (const [p, _] of factors) {
    if (d % p === 0) {
      res = res / p * (p - 1);
    }
  }
  return res;
}

function solve(N, K) {
  const n = Number(N);
  const Nbig = BigInt(N);
  const Kbig = BigInt(K);
  
  const factors = factorize(n);
  const divisors = getDivisors(factors);
  
  // Сумма по вращениям: ∑_{d|N} φ(d) * K^{N/d}
  let rotationSum = 0n;
  for (const d of divisors) {
    const phiD = BigInt(phi(d, factors));
    const term = phiD * modPow(Kbig, BigInt(n / d), MOD) % MOD;
    rotationSum = (rotationSum + term) % MOD;
  }
  
  // Сумма по отражениям
  let reflectionSum = 0n;
  if (n % 2 === 0) {
    const half = BigInt(n / 2);
    const term1 = half * modPow(Kbig, half + 1n, MOD) % MOD; // оси через вершины
    const term2 = half * modPow(Kbig, half, MOD) % MOD;      // оси через рёбра
    reflectionSum = (term1 + term2) % MOD;
  } else {
    const term = BigInt(n) * modPow(Kbig, (BigInt(n) + 1n) / 2n, MOD) % MOD;
    reflectionSum = term;
  }
  
  const total = (rotationSum + reflectionSum) % MOD;
  const denominator = (2n * Nbig) % MOD;
  const inverse = modInverse(denominator, MOD);
  return (total * inverse) % MOD;
}
