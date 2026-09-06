# JavaScript Algorithms

Репозиторий с моими решениями алгоритмических задач на JavaScript.

Здесь собраны решения задач с различных платформ для практики алгоритмов и подготовки к техническим собеседованиям.

## Ежедневная генерация решений

GitHub Actions каждый день выбирает от 1 до 3 задач из [complete-tasks.json](complete-tasks.json). Каждая задача обрабатывается отдельно: создаётся отдельный commit, затем workflow ждёт примерно один час перед следующей задачей. Условие записывается в начале файла, а код содержит комментарии на русском языке.

Для работы workflow в настройках репозитория добавьте:

- Secret `DEEPSEEK_API_KEY` — API-ключ DeepSeek.
- Repository variable `DEEPSEEK_MODEL` — необязательно; по умолчанию используется `deepseek-chat`.

Workflow можно запустить вручную через Actions → Daily algorithm solutions → Run workflow.
