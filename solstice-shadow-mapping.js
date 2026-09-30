// Задача: Solstice Shadow Mapping
// Сложность: medium
// Дата генерации: 2026-09-30

// Условие задачи
// На улице, идущей вдоль оси X от 0 до L, стоят n зданий. Каждое здание занимает отрезок [l_i, l_i + w_i] и имеет высоту h_i. Здания не пересекаются. В дни зимнего и летнего солнцестояния солнечные лучи параллельны и направлены слева направо вниз. Если коэффициент удлинения тени равен k, то вертикальная стена высоты h отбрасывает вправо тень длины h*k. Значит, здание с правым краем r_i = l_i + w_i затеняет отрезок [r_i, r_i + h_i*k]. Сами здания не являются улицей: участки [l_i, l_i+w_i] нужно исключать. Зимой коэффициент равен kWinter, летом — kSummer, причём kWinter >= kSummer > 0. Найдите суммарную длину участков улицы, которые находятся в тени зимой, но не находятся в тени летом.
// 
// Формат: реализуйте функцию solsticeShadowMapping(L, buildings, kWinter, kSummer). L — число, buildings — массив троек [l, w, h]. Возвращаемое значение — число (длина), допустимая погрешность 1e-6.
// 
// Пример:
// L = 20
// buildings = [[2,3,4],[8,2,3]]
// kWinter = 1.5
// kSummer = 0.5
// Ответ: 4.0
// 
// Пояснение: зимняя тень на улице имеет длину 7.5, летняя — 3.5, разность 4.0.

function solsticeShadowMapping(L, buildings, kWinter, kSummer) {
  // Сортируем здания по левому краю: дальше строим промежутки улицы между ними.
  const sorted = buildings
    .map(([l, w, h]) => ({ l, w, h, r: l + w }))
    .sort((a, b) => a.l - b.l);

  // Сливаем пересекающиеся отрезки. На входе могут быть тени, накрывающие друг друга.
  function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [intervals[0].slice()];
    for (let i = 1; i < intervals.length; i++) {
      const [s, e] = intervals[i];
      const last = merged[merged.length - 1];
      // Небольшой допуск нужен, чтобы почти касающиеся тени считались слипшимися.
      if (s <= last[1] + 1e-12) {
        if (e > last[1]) last[1] = e;
      } else {
        merged.push([s, e]);
      }
    }
    return merged;
  }

  // Суммарная длина пересечения двух отсортированных наборов непересекающихся отрезков.
  function intersectionLength(a, b) {
    let i = 0, j = 0, sum = 0;
    while (i < a.length && j < b.length) {
      const left = Math.max(a[i][0], b[j][0]);
      const right = Math.min(a[i][1], b[j][1]);
      if (right > left) sum += right - left;
      if (a[i][1] < b[j][1]) i++;
      else j++;
    }
    return sum;
  }

  // Для заданного коэффициента удлинения k считаем длину улицы, попавшей в тень.
  function shadowedRoadLength(k) {
    // Тени от зданий: начинаются у правого края здания и уходят вправо.
    const shadows = [];
    for (const b of sorted) {
      const start = Math.max(0, b.r);
      const end = Math.min(L, b.r + b.h * k);
      if (end > start) shadows.push([start, end]);
    }
    const mergedShadows = mergeIntervals(shadows);

    // Улица — это [0, L] без самих зданий. Собираем свободные промежутки.
    const road = [];
    let cur = 0;
    for (const b of sorted) {
      const left = Math.min(L, Math.max(0, b.l));
      const right = Math.min(L, Math.max(0, b.r));
      if (cur < left) road.push([cur, left]);
      if (right > cur) cur = right;
    }
    if (cur < L) road.push([cur, L]);

    // Тень на улице — пересечение теней с дорожными промежутками.
    return intersectionLength(mergedShadows, road);
  }

  const winter = shadowedRoadLength(kWinter);
  const summer = shadowedRoadLength(kSummer);

  // По условию kWinter >= kSummer, поэтому зимняя тень содержит летнюю.
  // Значит, искомая длина — это просто разность длин затенённых участков.
  return winter - summer;
}
