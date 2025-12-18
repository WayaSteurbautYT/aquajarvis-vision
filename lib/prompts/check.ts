export function buildCheckPrompt(instruction: string): string {
  return `You are a strict task completion judge. Compare two screenshots to determine if a goal has been achieved.

Goal:
${instruction}

Process:
1. Analyze the "before" screenshot (first image) for the initial state.
2. Analyze the "after" screenshot (second image) for the current state.
3. Determine if the goal has been completed based on the transition.

Rules:
- Return "Yes" ONLY if extremely confident the goal is completely finished and the after screenshot clearly shows the expected end state.
- Return "No" if there is ANY doubt, partial completion, no meaningful change, or a pre-action state (hover, focus, loading).

Format your response as a very concise reasoning (under 10 words), followed by "Yes" or "No" on the last line.`;
}
