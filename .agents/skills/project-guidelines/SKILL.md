---
name: project-guidelines
description: >-
  Project-specific guidelines for boardgame.io, file length limits (<500 lines), refactoring, and minimal/ponytail code style. Always check and apply for any task in this project.
---

# Project Guidelines & Standards

This skill applies to all work and conversations within this repository (`testKredBGIO`).

## Core Principles

1. **Ponytail / Minimal Code Philosophy (`/ponytail`)**:
   - Always aim for the simplest, shortest, and most minimal working solution.
   - Avoid over-engineering, extra abstraction, or premature optimization (YAGNI).
   - Prefer standard language features and native capabilities over unnecessary dependencies.

2. **boardgame.io Architecture**:
   - Keep game state transitions (`G`), moves, and turn/phase declarations pure and deterministic.
   - Maintain clear separation between core game logic and React UI view layers.

3. **File Length Limit & Senior Developer Refactoring**:
   - Keep all source files strictly under **500 lines**.
   - If a file approaches or exceeds 500 lines, evaluate and split it up like a senior developer:
     - Extract reusable UI components into standalone sub-components.
     - Isolate move functions, helper utilities, and domain constants into separate modules.
     - Maintain clear import/export boundaries.
