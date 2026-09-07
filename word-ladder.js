// Задача: Word Ladder
// Сложность: hard
// Дата генерации: 2026-09-07

// Условие задачи
// Даны два слова одинаковой длины: beginWord и endWord. Также дан список слов wordList (словарь). Нужно найти длину кратчайшей последовательности преобразований, которая начинается с beginWord и заканчивается endWord. За один шаг разрешается заменить ровно одну букву в текущем слове, и полученное слово обязано присутствовать в wordList. Если endWord недостижим, нужно вернуть 0.
// 
// Формат входных данных:
// Функция принимает три аргумента: beginWord (строка), endWord (строка), wordList (массив строк). Все слова состоят только из строчных латинских букв и имеют одинаковую длину.
// 
// Формат результата:
// Целое число — длина кратчайшей последовательности, где beginWord считается первым словом последовательности.
// 
// Пример 1:
// beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
// Результат: 5
// Пояснение: hit -> hot -> dot -> dog -> cog.
// 
// Пример 2:
// beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]
// Результат: 0
// Пояснение: endWord "cog" отсутствует в wordList, поэтому построить путь нельзя.
// 
// Ограничения:
// 1 <= beginWord.length <= 10
// 0 <= wordList.length <= 5000

function wordLadder(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  if (beginWord === endWord) return 1;

  // Карта шаблонов: слово 'hot' даёт шаблоны '*ot', 'h*t', 'ho*'.
  const patterns = new Map();

  const addToPatterns = (word) => {
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + '*' + word.slice(i + 1);
      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }
      patterns.get(pattern).push(word);
    }
  };

  // Добавляем в карту все слова из словаря, а также beginWord,
  // чтобы можно было строить первые переходы. beginWord не обязан быть в wordList.
  for (const word of wordList) {
    addToPatterns(word);
  }
  addToPatterns(beginWord);

  // Обычный BFS. В очереди лежат пары [слово, длина пути от beginWord].
  const queue = [[beginWord, 1]];
  const visited = new Set([beginWord]);
  let head = 0;

  while (head < queue.length) {
    const [current, distance] = queue[head];
    head++;

    if (current === endWord) {
      return distance;
    }

    // Перебираем все однобуквенные замены текущего слова,
    // используя заранее построенные шаблоны.
    for (let i = 0; i < current.length; i++) {
      const pattern = current.slice(0, i) + '*' + current.slice(i + 1);
      const neighbors = patterns.get(pattern) || [];

      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([next, distance + 1]);
        }
      }
    }
  }

  return 0;
}
