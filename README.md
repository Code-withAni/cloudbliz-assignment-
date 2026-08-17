# CloudBlitz Enquiry Management System

A monorepo for the **CloudBlitz Enquiry Management System** — a web application that captures, tracks, and manages customer enquiries through a fast frontend and a robust backend API.

## Goal

Provide a single system to manage customer enquiries end-to-end:

- **Capture** enquiries from customers through a clean, responsive UI.
- **Manage** enquiries with statuses, assignments, and follow-ups.
- **Track** history and analytics so enquiries never get lost.

## Repository layout

```
cloudblitz-assignment-/
├── frontend/    # Client application (Vite + TypeScript)
├── backend/     # Server-side API (REST / Node + TypeScript)
├── .husky/      # Git hooks (lint-staged on pre-commit)
└── (root)       # Shared ESLint + Prettier + TypeScript tooling
```

## Getting started

```bash
# Install all workspace dependencies
npm install

# Run linting (ESLint + Prettier)
npm run lint
npm run format:check
```

## Branching model

This repository follows **Gitflow**. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

## License

[MIT](./LICENSE)
