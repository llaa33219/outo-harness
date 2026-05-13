---
name: outo-harness
description: Discover and apply agent harness presets to project AGENT.md files. Use when setting up a new project, configuring agent instructions, or when the user asks about AGENT.md, CLAUDE.md, or agent configuration.
---

# outo-harness Skill

## Overview

outo-harness manages reusable agent harness presets - pre-configured instruction templates that can be adapted to specific projects. Instead of writing AGENT.md from scratch, discover existing harnesses and customize them.

## When to Use

- Setting up agent instructions for a new project
- User asks about AGENT.md, CLAUDE.md, or agent configuration
- Looking for best practices for a specific framework/stack
- Migrating agent config between tools (Cursor, Windsurf, Claude Code)

## Commands

### List Available Harnesses

```bash
npx outo-harness list
```

Shows all registered harnesses with name, description, and path.

### Add a New Harness

```bash
npx outo-harness add <source>
```

Where `<source>` is:
- GitHub URL: `https://github.com/owner/repo`
- Short form: `owner/repo`
- npm package: `package-name`

### Update All Harnesses

```bash
npx outo-harness update
```

Pulls latest versions of all registered harnesses.

## Workflow: Using a Harness

### Understanding the Concepts

- **AGENT.md**: 프로젝트별 에이전트 지침 파일. 이 프로젝트에서 에이전트가 뭘 할 것인지 정의
- **Harness**: 에이전트를 어떻게 통제할 것인가에 대한 지침. 행동 양식, 워크플로우, 하위 에이전트 관리 등

outo-harness는 **시작점을 제공하는 프리셋**입니다. 프로젝트마다 맞춤화해야 합니다.

### Step 1: Harness 확인

```bash
# 등록된 harness 목록 확인
npx outo-harness list

# harness 내용 확인
cat ~/.agents/harness/<name>/HARNESS.md
```

### Step 2: 프로젝트 분석

프로젝트의 특성을 파악합니다:
- 기술 스택 (React, Python, Go 등)
- 기존 AGENT.md 존재 여부
- 프로젝트 구조와 컨벤션

### Step 3: AGENT.md 작성

harness를 **참고**하여 프로젝트에 맞는 AGENT.md를 작성합니다:

1. harness에서 프로젝트에 적용 가능한 부분 추출
2. 프로젝트 특화 내용으로 변환
3. 프로젝트에 없는 도구/패턴 제거
4. AGENT.md에 반영

**핵심 원칙:**
- harness는 시작점일 뿐, 그대로 복사하지 않음
- 프로젝트의 실제 구조와 명령어에 맞게 변환
- 기존 AGENT.md가 있으면 보존하면서 보완

## Relationship to Other Tools

| Tool | File | outo-harness compatible |
|------|------|------------------------|
| AGENTS.md | AGENTS.md | ✅ Primary target |
| Claude Code | CLAUDE.md | ✅ Adapt content |
| Cursor | .cursor/rules/ | ✅ Adapt content |
| Windsurf | .windsurfrules | ✅ Adapt content |
