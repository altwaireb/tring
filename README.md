# Tring

A developer-first toolkit for managing JSON translations.

Tring analyzes translation resources, detects missing and extra files and keys, validates translation values and ordering, and provides a focused CLI workflow for keeping localized resources in sync.

## Features

- Analyze translations across configured locales.
- Check translation files for structural and content issues.
- Detect missing and extra translation files.
- Detect missing and extra translation keys.
- Detect empty translation values.
- Detect unsorted translation keys.
- Compare translation values across locales.
- Find missing translations.
- Add missing translation keys.
- Synchronize translation resources.
- Sort translation keys alphabetically.
- Support nested translation directories.
- Support multiple translation layouts.
- TypeScript configuration.
- CI-friendly non-zero exit codes.
- Lightweight CLI built with Citty.

## Installation

Install Tring as a development dependency:

```bash
pnpm add -D tring
```

Or with npm:

```bash
npm install --save-dev tring
```

Or with Yarn:

```bash
yarn add --dev tring
```

## Quick Start

Initialize Tring:

```bash
tring init
```

Check the project setup:

```bash
tring doctor
```

Analyze translations:

```bash
tring analyze
```

Check translation files:

```bash
tring check
```

A typical workflow is:

```bash
tring init
tring doctor
tring analyze
tring check
```

## Configuration

Tring uses a TypeScript configuration file named:

```text
tring.config.ts
```

Example:

```ts
import { defineConfig, TranslationLayout } from "tring";

export default defineConfig({
	directory: "app/i18n",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA", "fr-FR"],
});
```

### Configuration options

| Option | Description |
| --- | --- |
| `directory` | Root directory containing translation resources. |
| `layout` | Translation file layout. |
| `source` | Source locale used as the translation reference. |
| `locales` | Target locales to analyze and synchronize. |

## Translation Layouts

### Directories

Each locale has its own directory:

```text
app/
└── i18n/
    ├── en-US/
    │   ├── common.json
    │   ├── auth.json
    │   └── admin/
    │       └── users.json
    └── ar-SA/
        ├── common.json
        ├── auth.json
        └── admin/
            └── users.json
```

Nested directories are supported. A translation resource is identified by its path relative to the locale directory.

For example:

```text
en-US/admin/users.json
en-US/dashboard/overview.json
```

are separate translation resources.

### Files

Each locale is represented by a single JSON file:

```text
app/
└── i18n/
    ├── en-US.json
    └── ar-SA.json
```

## Commands

All commands are available through their short aliases.

| Command | Alias | Description |
| --- | --- | --- |
| `add` | `a` | Add missing translation keys. |
| `analyze` | `n` | Analyze all configured locales. |
| `analyze-only` | `no` | Analyze a specific locale. |
| `check` | `c` | Check translation files for issues. |
| `compare` | `o` | Compare translation resources. |
| `doctor` | `d` | Check the Tring project setup. |
| `init` | `i` | Create a new Tring configuration file. |
| `list` | `l` | List translation resources. |
| `missing` | `m` | Find missing translations. |
| `sort` | `s` | Sort translation keys alphabetically. |
| `sync` | `y` | Synchronize translation files. |

Use:

```bash
tring --help
```

or:

```bash
tring <command> --help
```

for command-specific help.

---

### `tring add`

Add missing translation keys to configured locales.

```bash
tring add
```

Alias:

```bash
tring a
```

Options:

```text
-e, --empty
-l, --locale=<locale>
-f, --file=<file>
```

- `--empty` — use empty values for missing keys.
- `--locale` — add keys only for the specified locale.
- `--file` — add the specified translation file to configured locales.

---

### `tring analyze`

Analyze all configured target locales.

```bash
tring analyze
```

Alias:

```bash
tring n
```

Option:

```text
-f, --show-files
```

Use `--show-files` to include matched translation files in the report.

---

### `tring analyze-only`

Analyze a specific configured locale.

```bash
tring analyze-only ar-SA
```

Alias:

```bash
tring no ar-SA
```

Option:

```text
-f, --show-files
```

The requested locale must be configured in `tring.config.ts`.

---

### `tring check`

Check translation files for common translation issues.

```bash
tring check
```

Alias:

```bash
tring c
```

Options:

```text
-skip-empty, --skipEmpty
-skip-sort, --skipSort
--github
```

- `-skip-empty` — skip empty translation value checks.
- `--skip-sort` — skip translation key sorting checks.
- `--github` — format issues as GitHub workflow annotations.

The check detects:

- Missing files.
- Extra files.
- Missing keys.
- Extra keys.
- Empty values.
- Unsorted keys.

Example:

```text
✗ Translation check found 29 issues

  Missing files  │  7
  Extra files    │  0
  Missing keys   │  4
  Extra keys     │  0
  Empty values   │  1
  Unsorted       │ 17
```

A clean project reports:

```text
✓ Translation check passed
```

When running in GitHub Actions, use `--github` to emit GitHub workflow annotations:

```bash
tring check --github
```

For example:

```text
::error file=app/i18n/de-DE/admin/users.json,title=Missing key::Missing translation key: status.active
```

Empty translation values are reported as warnings:

```text
::warning file=app/i18n/fr-FR/settings.json,title=Empty value::Empty translation value: status.active
```

The `--github` option outputs GitHub workflow annotations instead of the normal check report.

---

### `tring compare`

Compare translation values for a resource across locales.

```bash
tring compare
```

Alias:

```bash
tring o
```

Options:

```text
-f, --file=<file>
-k, --key=<key>
```

`--file` selects a translation resource directly.

`--key` compares a specific translation key. If the key exists in multiple resources, Tring prompts you to select the resource.

Examples:

```bash
tring compare --file auth.json
```

```bash
tring compare --key login.title
```

The two options can also be combined when a specific key in a specific resource is required.

---

### `tring doctor`

Check the Tring project setup.

```bash
tring doctor
```

Alias:

```bash
tring d
```

The command validates the project configuration and translation setup.

---

### `tring init`

Create a new Tring configuration file.

```bash
tring init
```

Alias:

```bash
tring i
```

Option:

```text
--force
```

Use `--force` to overwrite an existing configuration file.

---

### `tring list`

List translation resources.

```bash
tring list
```

Alias:

```bash
tring l
```

---

### `tring missing`

Find missing translations.

```bash
tring missing
```

Alias:

```bash
tring m
```

The command can display missing translations and, when requested, empty translation values.

---

### `tring sort`

Sort translation keys alphabetically.

```bash
tring sort
```

Alias:

```bash
tring s
```

Options:

```text
-f, --file=<file>
-l, --locale=<locale>
```

Examples:

```bash
tring sort --file en-US/admin/users.json
```

```bash
tring sort --locale ar-SA
```

`--file` and `--locale` cannot be used together.

---

### `tring sync`

Synchronize translation resources with the source locale.

```bash
tring sync
```

Alias:

```bash
tring y
```

Options:

```text
-d, --dry-run
-a, --apply
-e, --empty
-l, --locale=<locale>
-f, --file=<file>
```

- `--dry-run` — preview the planned changes without modifying files.
- `--apply` — apply the synchronization plan.
- `--empty` — use empty values for missing translation keys when applying changes.
- `--locale` — synchronize only the specified locale.
- `--file` — synchronize only the specified translation file.

Examples:

Preview changes:

```bash
tring sync --dry-run
```

Apply changes:

```bash
tring sync --apply
```

Apply changes using empty values:

```bash
tring sync --apply --empty
```

Synchronize one locale:

```bash
tring sync --apply --locale ar-SA
```

`--dry-run` and `--apply` cannot be used together.

`--empty` requires `--apply`.

For the `files` translation layout, `--file` is not supported.

## Analysis

Tring compares the configured source locale with each target locale.

### Files

Tring detects:

- Missing files.
- Extra files.
- Matched files.

Example:

```text
Source:

en-US/
├── common.json
├── auth.json
└── admin/
    └── settings.json

Target:

ar-SA/
├── common.json
├── auth.json
└── admin/
    └── legacy.json
```

The result includes:

```text
Missing files

  ✗ ar-SA │ admin/settings.json

Extra files

  ✗ ar-SA │ admin/legacy.json
```

### Keys

Translation keys are compared recursively.

Source:

```json
{
	"login": {
		"title": "Login",
		"button": "Sign in"
	}
}
```

Target:

```json
{
	"login": {
		"title": "تسجيل الدخول"
	}
}
```

Tring reports:

```text
Missing keys

  ✗ ar-SA │ auth.json │ login.button
```

Extra keys are reported in the same way.

## Exit Codes

| Exit code | Meaning |
| ---: | --- |
| `0` | Command completed successfully without a command error. |
| `1` | Translation issues were detected or the command could not complete successfully. |

This makes Tring suitable for CI environments.

Example:

```yaml
- name: Check translations
  run: pnpm exec tring check
```

## Recommended Workflow

Initialize the project:

```bash
tring init
```

Validate the setup:

```bash
tring doctor
```

Analyze translations:

```bash
tring analyze
```

Check translation integrity:

```bash
tring check
```

Work on a specific locale:

```bash
tring analyze-only ar-SA
```

Compare a translation resource:

```bash
tring compare --file auth.json
```

Add missing keys:

```bash
tring add
```

Synchronize resources:

```bash
tring sync --apply
```

Sort translation keys:

```bash
tring sort
```

## CLI Reference

```text
tring init|i
tring doctor|d
tring list|l
tring compare|o
tring missing|m
tring analyze|n
tring analyze-only|no <locale>
tring sort|s
tring sync|y
tring add|a
tring check|c
```

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/altwaireb/tring.git
cd tring
pnpm install
```

Run the type checker:

```bash
pnpm check
```

Run the linter:

```bash
pnpm lint
```

Format the project:

```bash
pnpm format
```

Run the test suite:

```bash
pnpm test
```

Build the package:

```bash
pnpm build
```

Create a package archive:

```bash
pnpm pack
```

## Testing

Tring uses Vitest.

The test suite covers translation discovery, reading, comparison, analysis, synchronization, sorting, CLI commands, output formatting, aliases, configuration, and integration scenarios.

Run all tests:

```bash
pnpm test
```

Before submitting a change:

```bash
pnpm format
pnpm lint
pnpm check
pnpm test
```

## Package Testing

Build and package Tring:

```bash
pnpm build
pnpm pack
```

Then test the generated package:

```bash
cd examples/basic
pnpm remove tring
pnpm add ../../tring-*.tgz
```

Run the CLI:

```bash
pnpm exec tring doctor
pnpm exec tring analyze
pnpm exec tring check
```

## Contributing

Contributions are welcome.

Before submitting a change, make sure the formatting, linting, type checking, and test suite pass:

```bash
pnpm format
pnpm lint
pnpm check
pnpm test
```

For CLI changes, test the generated package from the tarball as well.

## License

MIT
