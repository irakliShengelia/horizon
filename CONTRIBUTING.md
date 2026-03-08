# Contributing to Laravel Horizon

Thank you for considering contributing to Laravel Horizon! This guide will walk you through everything you need to get started.

## Code of Conduct

Please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct) before contributing.

## Forking the Repository

1. Click the **Fork** button at the top-right of the [laravel/horizon](https://github.com/laravel/horizon) repository page.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/horizon.git
   cd horizon
   ```
3. Add the upstream remote so you can keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/laravel/horizon.git
   ```
4. Install PHP dependencies:
   ```bash
   composer install
   ```
5. Install JavaScript dependencies:
   ```bash
   npm install
   ```

## Branch Naming

Always branch off of the appropriate **active support branch** (see the [Laravel release policy](https://laravel.com/docs/releases#support-policy)). Never target `master` directly unless you are fixing a bug that only exists there.

Use the following naming conventions for your branches:

| Type | Pattern | Example |
|------|---------|---------|
| Bug fix | `fix/<short-description>` | `fix/job-metrics-overflow` |
| New feature | `feature/<short-description>` | `feature/pause-queue-tag` |
| Improvement / refactor | `improve/<short-description>` | `improve/supervisor-restart` |
| Documentation | `docs/<short-description>` | `docs/update-readme` |

Keep branch names lowercase and use hyphens instead of spaces or underscores.

## Pull Request Process

1. **Sync your fork** before starting work:
   ```bash
   git fetch upstream
   git checkout <target-branch>
   git merge upstream/<target-branch>
   ```
2. **Create a branch** following the naming conventions above.
3. **Write tests** for any new behaviour or bug fix. Pull requests without tests may be closed.
4. **Run the test suite** and ensure it passes:
   ```bash
   composer test
   ```
5. **Run static analysis** and resolve any issues:
   ```bash
   composer lint
   ```
6. **Commit your changes** with a clear, descriptive commit message written in the imperative mood (e.g. *"Fix job metrics overflow when count exceeds integer limit"*).
7. **Push** your branch to your fork:
   ```bash
   git push origin <your-branch-name>
   ```
8. **Open a pull request** against the correct upstream branch on GitHub. Fill in the PR template completely, including:
   - A descriptive title
   - A thorough description of the change and its motivation
   - How existing features are unaffected
   - References to any related issues (e.g. `Closes #123`)
9. **Address review feedback** promptly. Pull requests that become stale may be closed.

> **Tip:** Pull requests without a descriptive title, thorough description, or tests will be closed without review.

## Code Style

Laravel Horizon follows the [Laravel coding style](https://laravel.com/docs/contributions#coding-style), which is based on [PSR-12](https://www.php-fig.org/psr/psr-12/) with some Laravel-specific conventions.

### PHP

- **Indentation:** 4 spaces (no tabs).
- **Encoding:** UTF-8.
- **Line endings:** LF.
- **Trailing whitespace:** none.
- **Final newline:** files must end with a single newline.
- Follow the **Laravel preset** enforced by [StyleCI](https://styleci.io). You can preview violations before pushing by running StyleCI locally or by inspecting the CI check on your PR.
- Static analysis is configured via `phpstan.neon.dist`. Keep the codebase at the configured PHPStan level:
  ```bash
  composer lint
  ```

### JavaScript / CSS

- **Indentation:** 4 spaces (no tabs).
- **Quotes:** single quotes for JS, double quotes only when required.
- **Semicolons:** required.
- **Trailing commas:** ES5 style.
- **Print width:** 120 characters.
- Arrow functions always include parentheses around parameters.
- Formatting is enforced by StyleCI (see `.styleci.yml`).

### General Guidelines

- Keep changes focused. One pull request per feature or bug fix.
- Delete branches after they are merged.
- Do not include unrelated formatting or refactoring changes in a functional PR.

## Security Vulnerabilities

Please **do not** open a public issue for security vulnerabilities. Review our [security policy](https://github.com/laravel/horizon/security/policy) for responsible disclosure instructions.

## License

By contributing to Laravel Horizon you agree that your contributions will be licensed under the [MIT License](LICENSE.md).
