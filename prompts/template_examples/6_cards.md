## Example 1

- Title: The Big Buzzwords
- Card 1
  - card_title: LLMs
  - card_subtext: Claude, GPT, Gemini, Llama...
- Card 2
  - card_title: AI Agents
  - card_subtext: Tools, Memory, the Agentic Loop
- Card 3
  - card_title: Coding Tools
  - card_subtext: Cursor, Codex, Claude Code...
- Card 4
  - card_title: MCP
  - card_subtext: What, when, and how to use it
- Card 5
  - card_title: The Dark Side of AI
  - card_subtext: Prompt Injection, Data Privacy, Cost Scaling

## Example 2

- Title: MCP Pitfalls & Tips
- Card 1
  - card_title: Too many tools!
  - card_subtext: LLM confusion, context window, latency, cost
- Card 2
  - card_title: Serious security vulnerability
  - card_subtext: when multiple tools active together
- Card 3
  - card_title: Unnecessary MCP
  - card_subtext: where API would suffice
- Card 4
  - card_title: MCP Loop
  - card_subtext: can trigger several non-idempotent/destructive tools
- Card 5
  - card_title: Auth Risk
  - card_subtext: if using a single admin key instead of proper per-user tokens

## Example 3

- Title: Agent Design - when do we need them?
- Card 1
  - card_title: Each step can change the plan
- Card 2
  - card_title: The next step can't be known upfront
- Card 3
  - card_title: The process requires multi-step reasoning
- Card 4
  - card_title: The memory from previous steps affects what happens next
- Card 5
  - card_title: It would be brittle to hardcode the workflow

## Example 4

- Title: AI Agents
- Card 1
  - card_title: LLM
  - card_subtext: At the base of all agents is a "brain" - the LLM
  - card_explanation: ""
- Card 2
  - card_title: Memory
  - card_subtext: Helps the brain remember and reason the next step
  - card_explanation: ""
- Card 3
  - card_title: Tools
  - card_subtext: LLM-friendly functions
  - card_explanation: Definition + schema wrappers for APIs/DBs/etc
- Card 4
  - card_title: Loop
  - card_subtext: Allows the agent to iterate until it completes the given task
  - card_explanation: ""

## Example 5

- Title: Problems with CC
- Card 1
  - card_title: Overly Eager
  - card_subtext: Tends to do more than you ask for; bloating your code and
    wasting tokens
- Card 2
  - card_title: Doesn’t know your project
  - card_subtext: Theoretically all files are indexed; practically it’s
    inconsistent
- Card 3
  - card_title: Burns tokens fast
  - card_subtext: The bigger the project - the bigger the burn
- Card 4
  - card_title: Shellpocalypse Now
  - card_subtext: CLI commands means screwing up is easy

## Example 6

- Title: Plan religiously - Pro Tips
- Card 1
  - card_title: Reference your .md files
- Card 2
  - card_title: Ask Claude to ask you questions
- Card 3
  - card_title: “think deeply”
- Card 4
  - card_title: Verify the plan
  - card_subtext: (yourself, Claude, other LLM)
- Card 5
  - card_title: Scrutinize scope
- Card 6
  - card_title: Fine-tune the plan
  - card_subtext: (usually)

## Example 7

- Title: MCP Pitfalls & Tips
- Card 1
  - card_title: MCP ≠ API wrapper
  - card_subtext: getInfo(params) is better than separate /getUserInfo,
    /getAccountInfo, & /getDealsInfo calls
- Card 2
  - card_title: Fewer tools → more consistent results
- Card 3
  - card_title: Tools descriptions are prompts!
  - card_subtext: No need to overload, but a 3-4 word description might not be
    enough
- Card 4
  - card_title: Think human-first
  - card_subtext: Application interfaces are fading away; how do humans work?

## Example 8

- Title: Problems with Prompts
- Card 1
  - card_title: Hallucination
  - card_subtext: Model generates false or unsupported information
- Card 2
  - card_title: Context Window
  - card_subtext: Cannot input “infinite context” - model may miss details
- Card 3
  - card_title: Output Volatility
  - card_subtext: Same prompt can produce inconsistent results
- Card 4
  - card_title: Constraint Adherence
  - card_subtext: Models can ignore part of the rules outlined in the prompt

## Example 9

- Title: Prevention Strategies
- Card 1
  - card_title: Strict output formats
  - card_explanation: If the code itself expects {result: "xx"}, it will reject
    "drop table"
- Card 2
  - card_title: Filter injection-like patterns
  - card_explanation: Even simple regex can help!
- Card 3
  - card_title: Limit LLM access
  - card_explanation: Can’t hack what you can’t access =&rpar;
- Card 4
  - card_title: Human in the Loop
  - card_explanation: For hyper-sensitive steps (billing, payments, etc)
- Card 5
  - card_title: LLM I/O Auditor
  - card_explanation: ""
