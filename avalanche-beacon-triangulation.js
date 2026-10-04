// Задача: Avalanche Beacon Triangulation
// Сложность: hard
// Дата генерации: 2026-10-04

// Условие задачи
// В горах сошла лавина. У каждого пострадавшего есть лавинный бипер, который излучает сигнал. Сигнал слышен в пределах радиуса r_i от точки нахождения бипера. Известно, что биперы находятся в точках (x_i, y_i). Спасатель может находиться в любой точке плоскости. Ему нужно найти такое место, где он сможет услышать сигналы от максимального количества биперов. Определите это максимальное количество.
// 
// Формально: дано n окружностей с центрами (x_i, y_i) и радиусами r_i. Точка (x, y) покрывается окружностью i, если расстояние от (x, y) до (x_i, y_i) не превосходит r_i. Найдите максимальное число окружностей, покрывающих одну точку.
// 
// Входные данные: Функция solve принимает массив circles, состоящий из n объектов. Каждый объект имеет поля x, y, r (вещественные числа). Ограничения: 1 ≤ n ≤ 2000, -10^4 ≤ x, y ≤ 10^4, 0 < r ≤ 10^4.
// 
// Выходные данные: Функция должна вернуть одно целое число — максимальное количество биперов, сигнал от которых слышен в некоторой точке.
// 
// Примеры:
// 
// Пример 1:
// circles = [
//   {x: 0, y: 0, r: 1},
//   {x: 2, y: 0, r: 1},
//   {x: 1, y: 0, r: 0.5}
// ]
// Ответ: 3
// Пояснение: В точке (1, 0) слышны все три бипера.
// 
// Пример 2:
// circles = [
//   {x: 0, y: 0, r: 1},
//   {x: 3, y: 0, r: 1},
//   {x: 6, y: 0, r: 1}
// ]
// Ответ: 1
// 
// Пример 3:
// circles = [
//   {x: 0, y: 0, r: 5},
//   {x: 1, y: 0, r: 1}
// ]
// Ответ: 2

function solve(circles) {
  const n = circles.length;
  if (n === 0) return 0;

  const PI = Math.PI;
  const TWO_PI = 2 * PI;
  const EPS = 1e-9;

  let ans = 1;

  for (let i = 0; i < n; i++) {
    const { x: xi, y: yi, r: ri } = circles[i];
    let base = 1;
    const events = [];

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const { x: xj, y: yj, r: rj } = circles[j];
      const dx = xj - xi;
      const dy = yj - yi;
      const d = Math.hypot(dx, dy);

      // Если окружность i полностью внутри j
      if (d + ri <= rj + EPS) {
        base++;
      } else if (d + rj < ri - EPS) {
        // j полностью внутри i, граница i не задевает j
        continue;
      } else if (d > ri + rj + EPS) {
        // окружности не пересекаются
        continue;
      } else {
        // пересекаются или касаются
        const a = Math.atan2(dy, dx);
        let cosAlpha = (ri * ri + d * d - rj * rj) / (2 * ri * d);
        if (cosAlpha > 1) cosAlpha = 1;
        if (cosAlpha < -1) cosAlpha = -1;
        const alpha = Math.acos(cosAlpha);

        let l = a - alpha;
        let r = a + alpha;

        // нормализуем углы в [0, 2pi)
        while (l < 0) l += TWO_PI;
        while (r < 0) r += TWO_PI;
        while (l >= TWO_PI) l -= TWO_PI;
        while (r >= TWO_PI) r -= TWO_PI;

        if (l > r) {
          // интервал переходит через 0
          events.push({ angle: l, delta: 1 });
          events.push({ angle: TWO_PI, delta: -1 });
          events.push({ angle: 0, delta: 1 });
          events.push({ angle: r, delta: -1 });
        } else {
          events.push({ angle: l, delta: 1 });
          events.push({ angle: r, delta: -1 });
        }
      }
    }

    // Сортируем события: по углу, при равенстве сначала +1, потом -1
    events.sort((e1, e2) => {
      if (e1.angle !== e2.angle) return e1.angle - e2.angle;
      return e2.delta - e1.delta;
    });

    let current = base;
    ans = Math.max(ans, current);

    for (const ev of events) {
      current += ev.delta;
      if (current > ans) ans = current;
    }
  }

  return ans;
}
