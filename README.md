# Tring

[![npm version](https://img.shields.io/npm/v/tring)](https://www.npmjs.com/package/tring)
[![CI Status](https://img.shields.io/github/actions/workflow/status/altwaireb/tring/ci.yml)](https://github.com/altwaireb/tring/actions)

> Keep translations in sync. Keep developers in control.

A developer-first toolkit for managing JSON translations.

Tring provides a focused CLI workflow for creating, analyzing, validating, organizing, comparing, and synchronizing localized resources across your project.

## Features

- Analyze translations across configured target locales.
- Detect missing and extra translation files and keys.
- Detect empty translation values and unsorted keys.
- Compare and synchronize translation resources automatically or with empty placeholders.
- Support nested translation directories and multiple layout structures (`directories` or `files`).
- TypeScript configuration with full type safety (`tring.config.ts`).
- CI-friendly non-zero exit codes with GitHub Actions annotation formatting.
- Lightweight and fast CLI built with Citty.

## Installation

```bash
pnpm add -D tring
# or npm
npm install --save-dev tring
# or yarn
yarn add --dev tring
```

## Quick Start

```bash
tring init      # Create configuration file
tring doctor    # Validate setup & project structure
tring analyze   # Run analysis on all target locales
tring check     # Validate translation files for issues
```

## Configuration

Tring uses a TypeScript configuration file named `tring.config.ts`:

```ts
import { defineConfig, TranslationLayout } from "tring";

export default defineConfig({
	directory: "app/i18n",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA", "fr-FR"],
});
```

### Configuration Options

| Option | Description |
| --- | --- |
| `directory` | Root directory containing translation resources. |
| `layout` | Translation file layout (`directories` or `files`). |
| `source` | Source locale used as the translation reference. |
| `locales` | Target locales to analyze and synchronize. |

## Translation Layouts

### Directories

Each locale has its own directory. Nested directories are supported and identified relative to the locale folder:

```text
app/
└── i18n/
    ├── en-US/
    │   ├── common.json
    │   └── admin/
    │       └── users.json
    └── ar-SA/
        ├── common.json
        └── admin/
            └── users.json
```

### Files

Each locale is represented by a single JSON file:

```text
app/
└── i18n/
    ├── en-US.json
    └── ar-SA.json
```

## Commands Overview

All commands support short aliases for faster workflow:

| Command | Alias | Description |
| --- | --- | --- |
| `init` | `i` | Create a new Tring configuration file. |
| `doctor` | `d` | Validate configuration and directory setup. |
| `analyze` | `n` | Analyze all configured locales. |
| `analyze-only` | `no` | Analyze a single specified locale. |
| `check` | `c` | Check translation files for structural or content issues. |
| `add` | `a` | Add missing translation keys to target locales. |
| `sync` | `y` | Synchronize translation resources with the source locale. |
| `compare` | `o` | Compare translation values for a file or key across locales. |
| `missing` | `m` | Find missing keys and empty translation values. |
| `sort` | `s` | Sort translation keys alphabetically. |
| `list` | `l` | List translation resources. |

---

## Command Reference & Options

### `tring add` (`a`)

Add missing translation keys to configured locales.

```bash
tring add [-e|--empty] [-l|--locale=<locale>] [-f|--file=<file>]
```

- `-e, --empty` — Use empty values for missing translation keys.
- `-l, --locale` — Add missing translation keys only for the specified locale.
- `-f, --file` — Add the specified translation file to all configured locales.

### `tring analyze` (`n`)

Analyze all configured locales.

```bash
tring analyze [-f|--showFiles]
```

- `-f, --showFiles` — Show all translation files.

### `tring analyze-only` (`no`)

Analyze a specific locale.

```bash
tring analyze-only [-f|--showFiles] <locale>
```

- `-f, --showFiles` — Show all translation files.
- `<locale>` — The locale to analyze.

### `tring check` (`c`)

Check translation files for structural or content issues.

```bash
tring check [--skip-empty] [--skip-sort] [--github]
```

- `--skip-empty` — Skip empty translation value checks.
- `--skip-sort` — Skip translation key sorting checks.
- `--github` — Format issues as GitHub workflow annotations.

**GitHub Workflow Output Example:**

```text
::error file=app/i18n/de-DE/admin/users.json,title=Missing key::Missing translation key: status.active
::warning file=app/i18n/fr-FR/settings.json,title=Empty value::Empty translation value: status.active
```

### `tring sync` (`y`)

Synchronize translation files.

```bash
tring sync [--dry-run] [--apply] [--empty] [--locale=<locale>] [--file=<file>]
```

- `-d, --dry-run` — Preview translation changes without modifying files.
- `-a, --apply` — Apply the planned translation changes.
- `-e, --empty` — Use empty values for missing translation keys when applying changes.
- `-l, --locale` — Synchronize only the specified locale.
- `-f, --file` — Synchronize only the specified translation file.

`--dryRun` and `--apply` cannot be used together.

For the `files` translation layout, `--file` is not supported.

### `tring compare` (`o`)

Compare translation values for a specific resource or key across locales.

```bash
tring compare
tring compare --file auth.json
tring compare --key login.title
```

- `-f, --file` — Translation resource file to compare.
- `-k, --key` — Translation key to compare.

### `tring doctor` (`d`)

Check your Tring project setup.

```bash
tring doctor
```

### `tring init` (`i`)

Create a new Tring configuration file.

```bash
tring init [--force]
```

- `--force` — Overwrite the existing configuration file.

### `tring list` (`l`)

List translation resources.

```bash
tring list [OPTIONS]
```

- `-f, --showFiles` — Show all translation files.

### `tring missing` (`m`)

Find missing translations.

```bash
tring missing [OPTIONS]
```

- `-e, --empty` — Include empty translations.
- `-o, --only-empty` — Show only empty translations.

### `tring sort` (`s`)

Sort translation keys alphabetically.

```bash
tring sort [-f|--file=<file>] [-l|--locale=<locale>]
```

- `-f, --file` — Translation file path starting with the locale (for example, `en-US/admin/roles.json`).
- `-l, --locale` — Sort translation files for a specific locale.

`--file` and `--locale` cannot be used together.

---

## Exit Codes & CI Integration

| Exit Code | Meaning |
| ---: | --- |
| `0` | Command completed successfully without a command error. |
| `1` | Translation issues were detected or the command could not complete successfully. |

**GitHub Actions Workflow Integration:**
```yaml
- name: Validate Translations
  run: pnpm exec tring check --github
```

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/altwaireb/tring.git
cd tring
pnpm install
```

### Quality Checks

Ensure all checks pass before submitting pull requests:

```bash
pnpm format
pnpm lint
pnpm check
pnpm test
pnpm build
```

## Package Testing

To test the published package from the example project:

```bash
cd examples/basic
pnpm update tring --latest
```

Run the CLI:

```bash
pnpm exec tring doctor
pnpm exec tring analyze
pnpm exec tring check
```

## Contributing

Contributions are welcome.

Before submitting a change, make sure all development checks pass.

For CLI changes, also test the published package from the example project.

## License

MIT
