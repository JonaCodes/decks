## Project Overview

We've built an addon for Google Slides that allows users to generate
presentations based on a set of templates. Template slides are stored in a
Google Slides presentation that hold details about when to use each template.

We use an LLM to generate the content of the slides based on the templates. The
LLM spits out a JSON object with the content of the slides, which is then used
to generate the presentation via the Slides API.

The goal is to make my life easier when creating presentations. As much as
possible, I want to offload the task to the LLM. However, not all slides are
template-able, hence we have custom slides as well, though in the future we
might overcome that as well.

## Coding Guidelines

### DRY (Don't Repeat Yourself)

- Extract common logic into utilities or services
- Reuse shared components and functions

### Single Responsibility

- Each file should have one clear purpose
- Each function should do one thing well
- Avoid bloated files; prefer splitting into multiple files that are fewer than
  300 lines

### No Magic Values

- All hardcoded strings and numbers must be constants
- Define constants in dedicated constant files, or at the top of files if they
  are only used in that file

### No code smells

- No fallback logic, we want consistent logic
- No patches, hacks, or workarounds: code should be sound
- Don't leave "temporary" code in the codebase

### Keep Files Small

- Avoid bloated files
- Split large files into focused modules
