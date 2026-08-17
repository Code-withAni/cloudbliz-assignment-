# Contributing

Thank you for contributing to the **CloudBlitz Enquiry Management System**!

This project uses the **Gitflow branching model**. Please read this document before creating any branches or pull requests.

## Branching model

The repository has two permanent branches:

| Branch    | Purpose                                                              |
| --------- | -------------------------------------------------------------------- |
| `main`    | Production-ready code. Only updated from `release/*` and `hotfix/*`. |
| `develop` | Integration branch. All completed features are merged here.          |

### Branch naming conventions

| Branch type        | Naming pattern                | Branch off | Merge back into          | Delete after merge |
| ------------------ | ----------------------------- | ---------- | ------------------------ | ------------------ |
| Feature            | `feature/<short-description>` | `develop`  | `develop`                | Yes                |
| Release            | `release/<version>`           | `develop`  | `main` **and** `develop` | Yes                |
| Hotfix             | `hotfix/<short-description>`  | `main`     | `main` **and** `develop` | Yes                |
| Support (optional) | `support/<version>`           | `main`     | —                        | No                 |

Examples:

```text
feature/enquiry-filtering
release/1.0.0
hotfix/fix-auth-token-expiry
```

### Lifecycle

1. **Feature branches** — new work starts on `feature/*` off `develop`. When finished, open a pull request into `develop`. Merging back is done with a **no-fast-forward merge** so the work is recorded as a merge commit.
2. **Release branches** — when `develop` has enough features for a release, branch `release/<version>` from `develop`. Only bug fixes, docs, and version bumps happen here. Merge to `main` with `-no-ff` and tag the release; then merge back into `develop` so `develop` stays in sync.
3. **Hotfix branches** — for urgent production fixes, branch `hotfix/*` off `main`. Merge into `main`, tag it, and merge back into `develop`.

### Versioning

Releases are tagged with **semantic versioning** (`v1.2.3`). Keep `main` and the release branch version in sync.

## Committing

Commits are checked automatically before they are created:

- **ESLint** runs with `--fix` on staged JS/TS files.
- **Prettier** formats staged files.

This is wired up through **Husky + lint-staged** (see `package.json`). If a commit fails, fix the reported issues and stage the corrected files again.

Conventional, concise commit messages are encouraged:

```text
feat: add enquiry status dropdown
fix: correct timezone handling in reports
docs: update Gitflow section
chore: bump eslint to v9
```

## Pull requests

- Open PRs against the correct base branch (`develop` for features, `main` for hotfixes/releases).
- Keep PRs small and focused on a single concern.
- Ensure `npm run lint` and `npm run format:check` pass locally before requesting review.
