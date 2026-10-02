# Project instructions

## Project shape

- This is a standalone space quiz implemented in `index.html`.
- Keep it self-contained: HTML, CSS, quiz data, and JavaScript belong in that file. Do not add a server, build step, or runtime dependency unless explicitly requested.
- Keep the quiz to 10 questions and preserve the start, question, feedback, scoring, progress, and results flows.

## UI and accessibility

- Preserve the narrow centered layout, sans-serif typography, mission-control styling, and both `prefers-color-scheme` themes.
- Respect `prefers-reduced-motion` for animations and transitions.
- Keep native semantic controls, visible keyboard focus, useful screen-reader announcements, and intentional focus movement through the quiz.
- Retain distinct correct/incorrect feedback and the celebratory results treatment for scores of 8 or higher.

## Verification

- For interaction changes, smoke-test in the integrated browser: start with the keyboard, navigate and answer questions, check feedback and score updates, and complete the results flow.
- Check both correct and incorrect answers, progress updates, and keyboard focus transitions when relevant.
- Do not add tooling or dependencies for this static page.
