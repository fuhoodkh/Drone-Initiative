# Git Branching Guide

## Creating a New Branch

### Method 1: Create and Switch to New Branch (Recommended)
```bash
git checkout -b branch-name
```
or (newer Git syntax):
```bash
git switch -c branch-name
```

### Method 2: Create Branch First, Then Switch
```bash
# Create branch
git branch branch-name

# Switch to branch
git checkout branch-name
```
or:
```bash
git branch branch-name
git switch branch-name
```

## Branch Naming Best Practices

Good branch names:
- `feature/user-management`
- `fix/login-issue`
- `update/background-colors`
- `dev/experimental`
- `hotfix/urgent-fix`

## Complete Workflow Example

### 1. Create and Switch to New Branch
```bash
git checkout -b feature/new-feature
```

### 2. Make Your Changes
Edit files, add features, etc.

### 3. Stage Your Changes
```bash
git add .
```
or specific files:
```bash
git add file1.js file2.css
```

### 4. Commit Changes
```bash
git commit -m "Add new feature description"
```

### 5. Push Branch to Remote
```bash
git push origin feature/new-feature
```
or (first time, set upstream):
```bash
git push -u origin feature/new-feature
```

### 6. Switch Back to Main
```bash
git checkout main
```
or:
```bash
git switch main
```

### 7. Merge Branch into Main (when ready)
```bash
# Make sure you're on main
git checkout main

# Pull latest changes
git pull origin main

# Merge your branch
git merge feature/new-feature

# Push merged changes
git push origin main
```

## Useful Branch Commands

### List All Branches
```bash
git branch              # Local branches
git branch -a           # All branches (local + remote)
git branch -r           # Remote branches only
```

### Delete Branch
```bash
# Delete local branch
git branch -d branch-name

# Force delete (if not merged)
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Rename Branch
```bash
# Rename current branch
git branch -m new-branch-name

# Rename other branch
git branch -m old-name new-name
```

### See Branch Status
```bash
git status              # Current branch and changes
git log --oneline --graph --all    # Visual branch history
```

## Example: Create Feature Branch

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create and switch to new branch
git checkout -b feature/login-improvements

# 3. Make your changes (edit files)

# 4. Commit changes
git add .
git commit -m "Improve login page UI and fix role switching"

# 5. Push branch to GitHub
git push -u origin feature/login-improvements

# 6. Later, merge back to main
git checkout main
git pull origin main
git merge feature/login-improvements
git push origin main
```

## Current Repository Info

- **Repository**: `fuhoodkh/Drone-Initiative`
- **Main Branch**: `main`
- **Remote**: `origin`
