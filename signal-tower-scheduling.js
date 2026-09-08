// Задача: Signal Tower Scheduling
// Сложность: hard
// Дата генерации: 2026-09-08

// Условие задачи
// Signal Tower Scheduling
// 
// Вдоль прямой расположено n радиовышек. Для i-й вышки известны координата x_i и радиус действия r_i. Она покрывает открытый интервал (x_i - r_i, x_i + r_i). Если два интервала имеют хотя бы одну общую точку, эти вышки нельзя включать одновременно в одном слоте — они создают помехи. Требуется распределить все вышки по временным слотам так, чтобы в каждом слоте любые две вышки имели непересекающиеся интервалы покрытия, и минимизировать количество слотов.
// 
// Формат входных данных:
// Первая строка содержит n (1 ≤ n ≤ 200000). В следующих n строках — по два целых числа x_i и r_i (|x_i| ≤ 10^9, 1 ≤ r_i ≤ 10^9).
// 
// Формат выходных данных:
// В первой строке выведите одно целое число k — минимальное число слотов. Во второй строке выведите n чисел s_i (1 ≤ s_i ≤ k), где s_i — номер слота для i-й вышки. Если корректных расписаний несколько, можно вывести любое.
// 
// Пример 1:
// Вход:
// 3
// 0 2
// 2 1
// 5 1
// Выход:
// 2
// 1 2 1
// 
// Пояснение: вышки 1 и 3 не пересекаются, их можно поставить в слот 1; вышка 2 пересекается с вышкой 1, поэтому она в слоте 2.
// 
// Пример 2:
// Вход:
// 4
// 0 1
// 1 1
// 3 1
// 4 1
// Выход:
// 2
// 1 2 1 2

function signalTowerScheduling(towers) {
    const n = towers.length;
    if (n === 0) return { k: 0, schedule: [] };

    // Мин-куча
    class MinHeap {
        constructor(compare) {
            this.compare = compare;
            this.a = [];
        }
        size() { return this.a.length; }
        peek() { return this.a[0]; }
        push(x) {
            const a = this.a;
            a.push(x);
            let i = a.length - 1;
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (this.compare(a[i], a[p]) < 0) {
                    [a[i], a[p]] = [a[p], a[i]];
                    i = p;
                } else break;
            }
        }
        pop() {
            const a = this.a;
            const top = a[0];
            const last = a.pop();
            if (a.length > 0) {
                a[0] = last;
                let i = 0;
                while (true) {
                    let largest = i;
                    const l = 2 * i + 1, r = 2 * i + 2;
                    if (l < a.length && this.compare(a[l], a[largest]) < 0) largest = l;
                    if (r < a.length && this.compare(a[r], a[largest]) < 0) largest = r;
                    if (largest === i) break;
                    [a[i], a[largest]] = [a[largest], a[i]];
                    i = largest;
                }
            }
            return top;
        }
    }

    // Интервалы: [left, right, исходный номер]
    const intervals = towers.map(([x, r], i) => [x - r, x + r, i]);
    intervals.sort((p, q) => p[0] - q[0]);

    // lastEnd[c] — правая граница последнего интервала, закреплённого за цветом c.
    const lastEnd = [];
    // busy: (right, color) — цвета, занятые до right.
    const busy = new MinHeap((p, q) => p[0] - q[0]);
    // free: свободные номера цветов.
    const free = new MinHeap((p, q) => p - q);

    const schedule = new Array(n);
    let maxColor = -1;

    for (let i = 0; i < intervals.length; i++) {
        const [l, r, originalIndex] = intervals[i];

        // Освобождаем цвета, у которых последний интервал закончился не позже l.
        while (busy.size() > 0 && busy.peek()[0] <= l) {
            const [end, color] = busy.pop();
            // Запись могла устареть: цвет уже переиспользован с большей правой границей.
            if (lastEnd[color] === end) {
                free.push(color);
            }
        }

        let color;
        if (free.size() > 0) {
            color = free.pop();
        } else {
            color = ++maxColor;
        }

        schedule[originalIndex] = color + 1;
        lastEnd[color] = r;
        busy.push([r, color]);
    }

    return { k: maxColor + 1, schedule: schedule };
}
