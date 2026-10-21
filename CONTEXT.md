# prompt-brain Context

## Overview
`prompt-brain` is a dual-target plugin for Claude Code and Antigravity CLI (`agy`) designed to optimize prompts against a rigorous 5-step engineering algorithm and migrate prompts between 75 foundation models across 13 vendors using lazy-loaded, cited model guides.

## Core Capabilities
- **`optimize-prompt`**: 5-step prompt optimization algorithm (Parse & Intent Extraction -> Weakness Analysis across 7 categories -> Best-Practice Matching -> Reconstruction -> Changelog Generation).
- **`migrate-prompt`**: Cross-model translation using in-memory model registry (75 models, 302 aliases) with lazy loading of exactly two guides at runtime.

## Dual-Platform Integration
1. **Claude Code**:
   - Manifest: `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`
   - Commands: `/prompt-brain:optimize-prompt`, `/prompt-brain:migrate-prompt`
2. **Antigravity CLI (`agy`)**:
   - Manifest: `gemini-extension.json` and `plugin.json`
   - Commands: `commands/optimize-prompt.toml`, `commands/migrate-prompt.toml` (`/optimize-prompt`, `/migrate-prompt`)
   - Symlinked to `~/.gemini/config/plugins/prompt-brain` and enabled via `agyplugins`.

## Directory Map
```
.
├── .claude-plugin/
│   ├── icon.png
│   ├── marketplace.json
│   └── plugin.json
├── .github/
│   └── workflows/
│       └── validate.yml
├── CHANGELOG.md
├── CLAUDE.md
├── CONTEXT.md
├── LICENSE
├── README.md
├── commands/
│   ├── migrate-prompt.toml
│   └── optimize-prompt.toml
├── evals/
│   ├── migrate-prompt/
│   └── optimize-prompt/
├── evals-effort/
│   └── migrate-prompt/
├── gemini-extension.json
├── plugin.json
├── scripts/
│   ├── check-frontmatter.mjs
│   ├── check-registry-sync.mjs
│   ├── check-release-consistency.mjs
│   └── check-skill-block-sync.mjs
└── skills/
    ├── migrate-prompt/
    │   ├── SKILL.md
    │   ├── examples.md
    │   └── model-guides/     # 75 model guides
    └── optimize-prompt/
        ├── SKILL.md
        └── examples.md
```

## Verification Scripts
Run from repository root:
- `node scripts/check-registry-sync.mjs`
- `node scripts/check-frontmatter.mjs`
- `node scripts/check-skill-block-sync.mjs`
- `node scripts/check-release-consistency.mjs --require-bump`
- `claude plugin validate .claude-plugin/marketplace.json --strict`
- `claude plugin validate .claude-plugin/plugin.json --json`
