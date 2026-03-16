### **1. Pedagogical Patterns: Instructions for an LLM**

- **Minimalist Layout:** Prioritize **white space**. Keep text minimal, using
  short, punchy sentences rather than long paragraphs.
- **Highly Visual:** Every conceptual slide should feature a relevant
  high-resolution image, icon, or diagram. Avoid "text-only" slides unless they
  are for a single, powerful "Punchline".
- **Sequential Storytelling:** When explaining complex processes (like AI Agent
  loops or setup steps), break the concept across multiple slides. Each slide
  should "reveal" one new part of the diagram or one new point while keeping the
  previous ones visible but perhaps faded.
- **Interactive Design Elements:** Use arrows or boxes to highlight specific
  areas within screenshots of code or apps.
- **Emphasis through Color:** Highlight keywords within sentences by changing
  their color (e.g., using pink for the subject and blue for the action) and
  making them **bold**.
- **Anchor with Mental Models:** Before explaining technical details, provide a
  relatable analogy or a high-level conceptual "Bottom Line" to ground the
  student's understanding.
- **Problem-First Discovery:** Instead of just showing the "right" way, start by
  demonstrating a "Bad" example or a common failure mode. Follow this with a
  "What went wrong?" critique to build intuition.
- **The Iterative Deepening Loop:** When teaching complex tasks (like prompt
  engineering or coding with AI), use an iterative approach. Show an attempt,
  critique it, refine the instructions, and show the improved result.
- **Active Pause Points:** Intermingle lecture slides with "Thinking time" or
  "Discuss" prompts to encourage peer-to-peer learning and reflection before
  moving to implementation.
- **Actionable Hand-off:** Every conceptual section must conclude with a "Now
  you" or "Practice time" slide that provides a clear, step-by-step task for the
  student to complete.
- **"Under the Hood" Visualization:** When explaining protocols or flows (like
  MCP or API calls), use sequential diagrams that build piece-by-piece to show
  data movement between systems.
- **Incremental Component Assembly:** Never present a complex system diagram in
  one go. Instead, build it component by component across a sequence of slides
  (e.g., starting with the "Brain/LLM" and adding "Memory," then "Tools") to
  manage the student's cognitive load.
- **Contrastive Definition:** When introducing a new technology (like MCP),
  define it primarily by contrasting it with what the students already know
  (like standard APIs), explicitly showing the code-level differences.
- **The "Micro-Step" UI Walkthrough:** To explain an automated process, use a
  long sequence of full-screen application screenshots where each slide
  represents one small step in the chat or tool-calling interaction, simulating
  a "happy path" video.
- **Success Visualization:** Before any hands-on task, provide a "Target" slide
  that shows exactly what the final output should look like (e.g., a screenshot
  of a terminal or a specific UI state) so the student has a visual "north
  star".
- **Annotation of "Live" Evidence:** Use real screenshots of forums (e.g.,
  Reddit) or terminal logs to provide "street cred" or practical evidence for a
  conceptual claim, often using hand-drawn style arrows to point to the key
  takeaway.
- **Iterative Troubleshooting Narrative:** Structure lessons around a
  "Failure-to-Success" loop: show a bad prompt, show the bad output, provide a
  "What went wrong?" critique, and then reveal the improved prompt.

---

### **2. Recurring Slide Templates**

{name: **Presentation Title**, description: "A light gray background with a pink
logo at the top center. The title is centered in dark navy text with a subtitle
in white text inside a dark navy pill-shaped box."}

{name: **New Section Header**, description: "A solid bright blue background with
a white title on the left middle, preceded by a small white horizontal bar. A
large, high-quality representative image is placed on the right side."}

{name: **Punchline / Key Insight**, description: "A white background featuring
one or two lines of large, centered text. Keywords are highlighted in bold pink
and blue to emphasize the main takeaway."}

{name: **Multi-Card Concept**, description: "Used to group 3–6 related ideas
together. Each idea is contained in a rounded rectangle (card) with a heading
and brief bullet points. Cards often use alternating pink and navy colors."}

{name: **Sequential Card Reveal**, description: "A series of slides where one
card is highlighted in dark navy while the others are grayed out, used to walk
through a list of points or problems one by one."}

{name: **Practice Time**, description: "A white background with 'Practice Time'
in large navy text. It features a simple keyboard icon in the center and
specific instructions or exercise links below in pink."}

{name: **Code / Architecture Breakdown**, description: "A white background
showing a code snippet or application diagram on the left, with explanatory text
or logic steps on the right, often using colored arrows to link the two."}

{name: **Step-by-Step Timeline**, description: "A horizontal line with numbered
circles used to show a chronological flow or a multi-step process, with brief
descriptions above or below each number."}

{name: **Questions / Ending**, description: "A dark navy background with the
pink logo at the top and bottom. The word 'Questions?' is centered in large
white text with a pink question mark."}

{name: **The Bottom Line**, description: "A minimalist slide used to provide a
definitive, one-sentence summary of a complex concept, often following a
deep-dive or a demo."}

{name: **Good vs. Bad Comparison**, description: "A side-by-side or stacked
layout featuring two boxes: a 'Bad' box showing a common mistake and a 'Good'
box showing the corrected best practice."}

{name: **Iterative Critique**, description: "A slide sequence that displays an
AI input/output, followed by a 'What went wrong?' critique slide, leading into a
'Next iteration' instruction slide."}

{name: **Warning / Gotcha**, description: "A high-visibility slide used to
highlight critical pitfalls, security risks, or cost implications that students
must be aware of."}

{name: **Step-by-Step Logic Breakdown**, description: "A sequence of slides
where a central diagram or code snippet remains constant while different
components are highlighted and explained one at a time."}

{name: **Live Demo Narrative**, description: "A series of full-screen
application or code screenshots that use arrows and speech bubbles to walk
through a live interaction or a 'happy path' workflow."}

{name: **Guided Discussion**, description: "A 'Thinking time' slide that poses a
central question for the audience, often accompanied by a small 'Guiding
questions' list in the corner to spark conversation."}

{name: **Exercise Hand-off**, description: "A 'Now you' slide that lists 3–5
specific, numbered steps for a hands-on exercise, often including a link to
setup instructions."}

{name: **The Incremental Build**, description: "A multi-slide sequence where a
central architecture diagram grows by one component per slide, with a small
descriptive label added next to each new part."}

{name: **Contrastive Code Comparison**, description: "A slide showing two code
snippets—one representing the 'old/wrong' way and one the 'new/better'
way—side-by-side to highlight specific architectural differences."}

{name: **The Critique Card**, description: "Used immediately after a failed AI
attempt; it features a large red box titled 'What went wrong?' containing 2–4
punchy bullet points of logical failures."}

{name: **Configuration Callout**, description: "A slide showing a JSON or config
code snippet on the left, with an arrow pointing from a specific line of code to
a large explanatory card on the right."}

{name: **Interactive Reasoning Reveal**, description: "A screenshot of an AI’s
'hidden' reasoning or planning steps, used to show the student what happens
'under the hood' before the final output is generated."}

{name: **The Pro-Tip Grid**, description: "A 2x3 or 3x2 grid of cards where one
specific tip is highlighted in a dark color while the other five are grayed out,
allowing for a sequential walk-through of best practices."}

{name: **Visual Anchor**, description: "A slide with a large, non-technical
image (e.g., a sun to show scale or a power plug for connections) used to ground
a complex technical concept in a simple metaphor."}

{name: **Task framing (Input/Output)**, description: "A slide that defines a
coding task by showing a visual of the raw input data (e.g., a book page) on the
left and the desired structured output (e.g., percentages) on the right."}

{name: **Now You (Action Checklist)**, description: "A concluding transition
slide that lists a numbered sequence of steps for the student to perform, often
using alternating blue and pink colors for each step."}
