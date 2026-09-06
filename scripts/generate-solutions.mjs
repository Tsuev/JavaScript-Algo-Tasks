import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const tasksPath = join(root, "complete-tasks.json");
const outputDir = join(root, "solutions");
const apiKey = process.env.DEEPSEEK_API_KEY;
const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

if (!apiKey) {
  throw new Error("Не найден DEEPSEEK_API_KEY в переменных окружения.");
}

const tasks = JSON.parse(await readFile(tasksPath, "utf8"));
if (!Array.isArray(tasks) || tasks.length === 0) {
  throw new Error("complete-tasks.json должен содержать непустой массив задач.");
}

const requestedCount = Number.parseInt(process.env.TASK_COUNT || "1", 10);
if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 3) {
  throw new Error("TASK_COUNT должен быть целым числом от 1 до 3.");
}

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
}).format(new Date());

await mkdir(outputDir, { recursive: true });
const existingFiles = new Set(await readdir(outputDir));
const availableTasks = tasks.filter(
  (task) => !existingFiles.has(`${today}-${slugify(task.name)}.js`),
);
const taskPool = availableTasks.length > 0 ? availableTasks : tasks;
const selectedTasks = shuffle([...taskPool]).slice(0, Math.min(requestedCount, taskPool.length));

for (const task of selectedTasks) {
  const generated = await generateSolution(task);
  const slug = slugify(task.name);
  const filename = `${today}-${slug}.js`;
  const filePath = join(outputDir, filename);

  const contents = [
    `// Задача: ${task.name}`,
    `// Сложность: ${task.complexity}`,
    `// Дата генерации: ${today}`,
    "",
    "// Условие задачи",
    ...asComments(generated.statement),
    "",
    generated.solution.trim().replace(/^```(?:javascript|js)?\s*/i, "").replace(/```\s*$/i, ""),
    "",
  ].join("\n");

  await writeFile(filePath, contents, "utf8");
  console.log(`Создано решение: ${filePath}`);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function slugify(value) {
  return value
    .replace(/ё/gi, "е")
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
}

function asComments(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => `// ${line}`);
}

async function generateSolution(task) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ты опытный преподаватель алгоритмов. Отвечай только корректным JSON без markdown-обёртки.",
        },
        {
          role: "user",
          content: `Сгенерируй решение алгоритмической задачи на русском языке.

Название: ${task.name}
Сложность: ${task.complexity}

Верни объект строго такого вида:
{
  "statement": "полное понятное условие с форматом входных данных, результата и примерами",
  "solution": "исполняемый JavaScript-код ES2022 с одной основной функцией решения и естественными русскими комментариями"
}

Сначала в statement объясни условие задачи. В solution не используй npm-пакеты, ввод из stdin или console.log; код должен быть пригоден для чтения и запуска как самостоятельное решение. Комментарии пиши человеческим русским языком и объясняй ключевые решения, а не каждую строку.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`DeepSeek API вернул ${response.status}: ${details}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API не вернул содержимое ответа.");
  }

  const parsed = JSON.parse(content);
  if (typeof parsed.statement !== "string" || typeof parsed.solution !== "string") {
    throw new Error("Ответ DeepSeek не содержит statement и solution.");
  }
  return parsed;
}
