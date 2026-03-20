---
name: github-repo-publish
description: Bind a local project to a GitHub repository and push it safely. Use when Codex needs to initialize git, inspect remotes, set or replace the GitHub origin URL, create a first commit, rename or choose the publish branch, or push the current project to GitHub.
---

# GitHub Repo Publish

Inspect the repository state before changing anything.

- Run `git status --short --branch` and `git remote -v`.
- If the directory is not a git repository, initialize it with `git init`.
- Ask the user for the target GitHub repository URL if it is not already provided.

Use `scripts/bind-and-push.ps1` for the standard workflow.

## Standard Workflow

1. Confirm the working directory is the project root to publish.
2. If `origin` is unset, set it to the provided GitHub URL.
3. If `origin` already exists and points somewhere else, do not overwrite it silently. Confirm or pass `-ReplaceOrigin`.
4. Stage the intended files with `git add -A`.
5. Create a commit if there are staged or unstaged changes and the user has not asked to avoid commits.
6. Push with upstream tracking using the chosen branch, usually `main`.

## Command Patterns

- Inspect:
  `git status --short --branch`
  `git remote -v`
- Run the helper:
  `powershell -ExecutionPolicy Bypass -File .\skills\github-repo-publish\scripts\bind-and-push.ps1 -RepoUrl <github-url> -Branch main -CommitMessage "Initial commit"`

## Helper Script Notes

- Prefer `-ReplaceOrigin` only when the user explicitly wants to repoint the repository.
- Use `-SkipCommit` when the repo already has the desired commit history.
- The script is idempotent for initialization and remote setup checks.

## Validation

- Re-run `git status --short --branch` after the script completes.
- Re-run `git remote -v` and confirm `origin` matches the GitHub URL.
- Confirm the push target branch shown by `git branch --show-current`.
