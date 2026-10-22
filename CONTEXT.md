# prompt-brain Context

## Overview
`prompt-brain` is a tri-platform plugin for Claude Code, Antigravity CLI (`agy`), and OpenAI Codex CLI designed to optimize prompts against an 8-category engineering algorithm and migrate prompts between 75 foundation models across 13 vendors using lazy-loaded, cited model guides.

## Core Capabilities
- **`optimize-prompt`**: 5-step prompt optimization algorithm with mode archetypes (`--mode direct|system|structured|agentic`), target-model adaptation (`--target <model>`), tool & schema deficiency analysis (Category H), and synthetic few-shot exemplar generation (`--with-examples`).
- **`migrate-prompt`**: Cross-model translation using in-memory model registry (75 models, 302 aliases) with lazy loading of exactly two guides at runtime.

## Tri-Platform Integration
1. **Claude Code**:
   - Manifest: `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`
   - Commands: `/prompt-brain:optimize-prompt`, `/prompt-brain:migrate-prompt`
2. **Antigravity CLI (`agy`)**:
   - Manifest: `gemini-extension.json` and `plugin.json`
   - Commands: `commands/optimize-prompt.toml`, `commands/migrate-prompt.toml` (`/optimize-prompt`, `/migrate-prompt`)
   - Symlinked to `~/.gemini/config/plugins/prompt-brain` and enabled via `agyplugins`.
3. **OpenAI Codex CLI**:
   - Manifest: `.codex-plugin/plugin.json`
   - Marketplace: `.agents/plugins/marketplace.json` (repo) and `~/.agents/plugins/marketplace.json` (personal)
   - Configuration: `~/.codex/config.toml` (`[plugins."prompt-brain@personal"]`)

## Directory Map
```
.
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── .claude-plugin/
│   ├── icon.png
│   ├── marketplace.json
│   └── plugin.json
├── .codex-plugin/
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
│   ├── audit-model-guides.mjs
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
- `node scripts/audit-model-guides.mjs`
- `claude plugin validate .claude-plugin/marketplace.json --strict`
- `claude plugin validate .claude-plugin/plugin.json`
