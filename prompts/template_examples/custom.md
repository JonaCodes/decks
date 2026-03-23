## How to write the HTML/CSS

Your output for a custom slide must include `html` and `css` fields. The renderer wraps your HTML in a `<div class="slide">` automatically — write only the inner content.

The slide viewport is **1280×720px**. A pre-loaded design system stylesheet is available with these classes and variables:

```css
/* COLOR VARIABLES — use these, never hardcode hex values */
--pink:      #E91E78;   /* emphasis / keywords */
--navy:      #1B2A4A;   /* text / dark backgrounds */
--blue:      #3B82F6;   /* section headers / accents */
--white:     #FFFFFF;
--gray:      #F3F4F6;   /* light backgrounds */
--dark-gray: #6B7280;

/* LAYOUT */
.row / .col              — flex row / column, gap 24px
.center                  — flex center both axes
.grow                    — flex: 1
.slide-title             — 36px bold navy title
.slide-body              — flex center fill (use inside .slide)

/* BOXES */
.box                     — rounded card, padding 20px 28px, flex column center
.box-navy / .box-blue / .box-pink / .box-gray / .box-white
.box .label              — 20px bold
.box .sublabel           — 14px, 80% opacity

/* ARROWS */
.arrow                   — 32px, dark-gray, centered
.arrow-pink / .arrow-blue / .arrow-navy

/* FLOW LAYOUTS */
.flow-row                — horizontal chain, boxes auto-sized equally
.flow-col                — vertical chain, boxes auto-sized equally
  (put .box + .arrow alternately inside)

/* TIMELINE */
.timeline                — outer container (position: relative)
  .timeline-line         — horizontal blue line (absolute, behind nodes)
  .timeline-nodes        — flex row space-between (position: relative z-index:1)
    .timeline-node       — flex col, gap 10px
      .timeline-dot      — 40px circle, blue, white number inside
      .timeline-dot-navy / .timeline-dot-pink
      .timeline-label    — 15px semibold, max-width 160px
      .timeline-sublabel — 12px dark-gray

/* COMPARISON */
.comparison              — flex row, full width+height, gap 32px
  .comparison-col.left   — navy bg, white text, padding 28px, rounded
  .comparison-col.right  — gray bg, navy text
  .comparison-header     — 22px bold, bottom border
  .comparison-item       — 16px, line-height 1.5

/* HIGHLIGHTS */
.highlight               — rounded box, 16px, left border accent
.highlight-pink / .highlight-blue / .highlight-navy / .highlight-green / .highlight-red

/* CODE */
.code-block              — navy bg, mono font, pre whitespace
.code-pink / .code-blue / .code-green / .code-gray   — span colors for syntax

/* TYPOGRAPHY */
.text-pink / .text-blue / .text-navy / .text-gray / .text-white
.text-sm(14) / .text-base(16) / .text-lg(20) / .text-xl(28) / .text-2xl(36) / .text-3xl(48)
.font-bold / .font-semibold / .font-medium

/* BADGES */
.badge                   — pill shape, 13px bold
.badge-pink / .badge-blue / .badge-navy / .badge-gray
```

**Rules:**
- Use design system classes for all colors and layout — never write `color: #E91E78` directly
- Keep HTML to 10–30 lines; avoid deep nesting
- The `css` field is for slide-specific overrides only (e.g. custom font size for one element)
- Always output valid JSON: escape `"` inside strings as `\"`

**Common patterns:**

Flow diagram (3 steps):
```html
<div class="slide-title">How It Works</div>
<div class="slide-body">
  <div class="flow-row">
    <div class="box box-navy"><span class="label">Input</span></div>
    <div class="arrow arrow-blue">→</div>
    <div class="box box-blue"><span class="label">Process</span></div>
    <div class="arrow arrow-blue">→</div>
    <div class="box box-pink"><span class="label">Output</span></div>
  </div>
</div>
```

Timeline (4 nodes):
```html
<div class="slide-title">Steps</div>
<div class="slide-body">
  <div class="timeline">
    <div class="timeline-line"></div>
    <div class="timeline-nodes">
      <div class="timeline-node">
        <div class="timeline-dot">1</div>
        <div class="timeline-label">Define</div>
      </div>
      <div class="timeline-node">
        <div class="timeline-dot">2</div>
        <div class="timeline-label">Build</div>
      </div>
      <div class="timeline-node">
        <div class="timeline-dot timeline-dot-pink">3</div>
        <div class="timeline-label">Test</div>
      </div>
      <div class="timeline-node">
        <div class="timeline-dot timeline-dot-navy">4</div>
        <div class="timeline-label">Deploy</div>
      </div>
    </div>
  </div>
</div>
```

Comparison (left vs right):
```html
<div class="slide-title">Before vs After</div>
<div class="slide-body">
  <div class="comparison">
    <div class="comparison-col left">
      <div class="comparison-header">Without agents</div>
      <div class="comparison-item">Manual steps</div>
      <div class="comparison-item">Context lost between calls</div>
    </div>
    <div class="comparison-col right">
      <div class="comparison-header">With agents</div>
      <div class="comparison-item">Autonomous execution</div>
      <div class="comparison-item">Persistent memory</div>
    </div>
  </div>
</div>
```

---

## Example 1

- Description: An **interactive fill-in-the-blank** exercise showing a central
  sentence (e.g., "The sun is **\_\_\_\_**") surrounded by a cloud of
  statistically possible word completions in various colors and percentage
  values.

## Example 2

- Description: A **linguistic breakdown** comparing "English" text on the left
  with its "Tokenized" numerical and color-coded equivalent on the right to
  explain how LLMs process language.

## Example 3

- Description: A **technical architecture flow** diagram using specific icons
  (monitors, servers, databases), curved colored arrows, and request/response
  labels to visualize data movement during complex events like **Prompt
  Injection** or **I/O auditing**.

## Example 4

- Description: A **contrastive documentation** slide featuring side-by-side
  screenshots of code from different providers (e.g., OpenAI vs. Gemini) with
  pink highlight boxes and arrows pointing to structural implementation
  differences.

## Example 5

- Description: An **interactive pause** slide designed to spark audience
  reflection, featuring a central question (e.g., "Is this really 'thinking'?"
  or "What about output variance?") and a "Guiding questions" list in the bottom
  corner.

## Example 6

- Description: A **UI walkthrough** sequence using a series of full-screen
  application screenshots (e.g., Claude.ai or Gemini Playground) to narrate a
  live chat interaction or the configuration of specific model parameters
  step-by-step.

## Example 7

- Description: An **iterative troubleshooting loop** sequence that shows a
  flawed AI prompt/output, followed by a red "**What went wrong?**" critique box
  and a green "**Next iteration?**" planning box, concluding with a "Nice!"
  success slide.

## Example 8

- Name: Horizontal Milestone Timeline
- Description: A slide used to break down the required sections of a file (like
  `CLAUDE.md`) or the stages of a workflow. It features a thin horizontal blue
  line with numbered nodes (1–4) and descriptive text labels above and below
  each node.

## Example 9

- Name: Comparative News Boxes
- Description: Used to summarize the current landscape of a technical problem;
  it features a green "Good news" box and a red "Bad news" box (or "What did I
  do?" vs "What did I not do?") to provide a balanced overview of a situation.

## Example 10

- Name: Logic Flowchart
- Description: A formal architectural diagram using decision diamonds (e.g.,
  "Output valid?") and colored arrows (purple for response, green for request)
  to map out how a system like an LLM Auditor handles data.

## Example 11

- Name: Input-Output Transformation
- Description: A slide that defines a specific coding task by showing a visual
  of the raw input (e.g., an image of a book chapter) on the far left and the
  desired structured data (e.g., a colored list of character mentions) on the
  far right, connected by a central arrow.

## Example 12

- Name: Provider/Model Landscape Grid
- Description: Used to orient students in the market; features a row of logos
  (e.g., Gemini, GPT, Claude) with a list of specific model names or technical
  stats (like token limits) appearing directly underneath each logo.

## Example 13

- Name: Technical Data Chart
- Description: A simple bar chart used to compare technical metrics (like "Token
  output/input ratios") between models, accompanied by large black arrows
  pointing from the data to specific strategic takeaways.
