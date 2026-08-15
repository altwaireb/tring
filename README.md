# Tring

A developer-first toolkit for managing JSON translations.

Tring analyzes translation files, detects missing and extra files and keys, and provides a focused CLI workflow for keeping localized resources in sync.

## Features

- Analyze translation files across locales.
- Detect missing translation files.
- Detect extra translation files.
- Detect missing translation keys.
- Detect extra translation keys.
- Analyze a specific locale.
- Inspect matched translation files when needed.
- Support multiple translation file layouts.
- Support nested translation directories.
- TypeScript configuration.
- Clear CLI output designed for local development and CI.
- Non-zero exit codes when translation issues are detected.
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

Initialize Tring in your project:

```bash
tring init
```

This creates:

```text
tring.config.ts
```

Check the project configuration:

```bash
tring doctor
```

Then analyze your translations:

```bash
tring analyze
```

For a more detailed report that also includes matched files:

```bash
tring analyze --show-files
```

### Analyze a specific locale

```bash
tring analyze-only ar-SA
```

Short alias:

```bash
tring ao ar-SA
```

## Configuration

Tring uses a TypeScript configuration file named:

```text
tring.config.ts
```

A basic configuration looks like:

```ts
import { defineConfig, TranslationLayout } from "tring";

export default defineConfig({
	directory: "app/i18n",
	layout: TranslationLayout.directories,
	source: "en-US",
	locales: ["ar-SA"],
});
```

### Configuration options

| Option | Description |
| --- | --- |
| `directory` | Root directory containing translation files. |
| `layout` | Translation file layout. |
| `source` | Source locale used as the translation reference. |
| `locales` | Target locales to analyze. |

## Translation Layout

Tring supports different layouts for organizing translation files.

### `TranslationLayout.directories`

Translations are organized inside a directory for each locale:

```text
app/
└── i18n/
    ├── en-US/
    │   ├── common.json
    │   ├── auth.json
    │   ├── admin/
    │   │   └── common.json
    │   └── user/
    │       └── common.json
    └── ar-SA/
        ├── common.json
        ├── auth.json
        ├── admin/
        │   └── common.json
        └── user/
            └── common.json
```

Nested directories are supported. Translation files are identified by their path relative to the locale directory.

For example:

```text
en-US/admin/common.json
en-US/user/common.json
```

are treated as different translation resources even though both files are named `common.json`.

The source locale is used as the reference:

```text
en-US
  ↓
ar-SA
```

### `TranslationLayout.files`

Each locale is represented by a single JSON file:

```text
app/
└── i18n/
    ├── en-US.json
    └── ar-SA.json
```

For this layout, the locale JSON file itself is identified as the locale file.

## Commands

### `tring init`

Create a new Tring configuration file.

```bash
tring init
```

Alias:

```bash
tring i
```

#### Options

```text
--force
```

Overwrite an existing configuration file.

---

### `tring doctor`

Check the Tring project configuration and translation structure.

```bash
tring doctor
```

Alias:

```bash
tring d
```

The command checks:

- Tring configuration.
- Translation directory.
- Translation layout.
- Configured locales.

---

### `tring analyze`

Analyze all configured target locales.

```bash
tring analyze
```

Alias:

```bash
tring a
```

Example output:

```text
Translation Analysis

Source: en-US
Target: ar-SA

Files Missing
  ✗ admin/settings.json | ar-SA

Files Extra
  • admin/legacy.json | ar-SA

Keys Missing
  ✗ auth.login.button | ar-SA | auth.json
  ✗ profile.email | ar-SA | common/profile.json

Extra Keys
  • auth.login.dec | ar-SA | auth.json

Summary
  Files missing: 1
  Files extra: 1
  Keys missing: 2
  Extra keys: 1
```

Each issue includes the target locale and, for key issues, the translation resource containing the key.

#### `--show-files`

```bash
tring analyze --show-files
```

Output:

```text
Translation Analysis

Source: en-US
Target: ar-SA

Files
  ✓ auth.json | ar-SA
  ✓ common.json | ar-SA

Files Missing
  ✗ settings.json | ar-SA

Keys Missing
  ✗ login.button | ar-SA | auth.json

Extra Keys
  • logout.title | ar-SA | auth.json

Summary
  Files missing: 1
  Files extra: 0
  Keys missing: 1
  Extra keys: 1
```

---

### `tring analyze-only`

Analyze a single configured target locale.

```bash
tring analyze-only ar-SA
```

Alias:

```bash
tring ao ar-SA
```

The locale must exist in `tring.config.ts`.

If the locale is not configured:

```text
Locale "fr-FR" is not configured. tring.config.ts
```

The command returns exit code `1`.

#### `--show-files`

```bash
tring analyze-only ar-SA --show-files
```

The option can also be used with the alias:

```bash
tring ao ar-SA --show-files
```

## Analysis

Tring compares the source locale against each target locale at two levels.

### Files

Tring detects:

- Missing files.
- Extra files.
- Matched files.

For example:

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

The result:

```text
Files Missing
  ✗ admin/settings.json | ar-SA

Files Extra
  • admin/legacy.json | ar-SA
```

Matched files are only shown when `--show-files` is used.

### Keys

Tring recursively compares translation keys.

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

Result:

```text
Keys Missing
  ✗ login.button | ar-SA | auth.json
```

Extra keys are also reported:

```text
Extra Keys
  • logout.title | ar-SA | auth.json
```

## Exit Codes

| Exit code | Meaning |
| ---: | --- |
| `0` | Analysis completed without translation issues. |
| `1` | Translation issues were detected or the requested locale is not configured. |

This makes Tring suitable for CI:

```bash
tring analyze
```

### CI example

GitHub Actions:

```yaml
- name: Analyze translations
  run: pnpm exec tring analyze
```

A translation mismatch will fail the step automatically.

## Recommended Workflow

```bash
tring init
tring doctor
tring analyze
```

When working on a specific locale:

```bash
tring ao ar-SA
```

When debugging the complete file structure:

```bash
tring analyze --show-files
```

Before committing changes:

```bash
tring doctor
tring analyze
```

## Project Structure

A typical Tring project:

```text
my-project/
├── app/
│   └── i18n/
│       ├── en-US/
│       │   ├── common.json
│       │   ├── auth.json
│       │   └── admin/
│       │       └── settings.json
│       └── ar-SA/
│           ├── common.json
│           ├── auth.json
│           └── admin/
│               └── settings.json
├── tring.config.ts
├── package.json
└── ...
```

## CLI Reference

```text
tring init|i
tring doctor|d
tring analyze|a
tring analyze-only|ao <locale>
```

### `init`

```text
--force
```

### `analyze`

```text
--show-files
```

### `analyze-only`

```text
<locale>
--show-files
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

Tring uses Vitest for its test suite.

The test suite covers:

- Translation key extraction.
- Key comparison.
- Translation file discovery.
- Translation file reading.
- File comparison.
- Translation analysis.
- Report generation.
- Report formatting.
- Application analysis.
- CLI command behavior.
- Command aliases.
- Exit codes.
- Locale validation.
- Integration scenarios.

Run all tests with:

```bash
pnpm test
```

## Package Testing

Before publishing a release:

```bash
pnpm build
pnpm pack
```

Then install the generated package in an example project:

```bash
cd examples/basic
pnpm remove tring
pnpm add ../../tring-*.tgz
```

Run the CLI:

```bash
pnpm exec tring doctor
pnpm exec tring analyze
pnpm exec tring analyze --show-files
pnpm exec tring ao ar-SA
```

## Roadmap

Tring is being developed around a small, composable CLI and analysis core.

Planned areas include:

- Additional translation validation.
- More configurable output formats.
- Machine-readable analysis output.
- Additional translation layouts.
- Improved CI integrations.
- Additional developer tooling around translation maintenance.

## Contributing

Contributions are welcome.

Before submitting a change, make sure the following checks pass:

```bash
pnpm check
pnpm test
pnpm build
```

For changes affecting CLI behavior, test the generated package from the tarball as well.

## License

MIT
