# Deciding what to ask

A question is expensive: it stops the work and asks someone else to think. Spend it only when the answer changes what you build.

## The rule

- One `ask_user_question` call, at most four questions, before the first slide. Never a second round unless an answer opens a question you could not have asked before.
- Ask only about a decision that changes the deck's content or shape: what leads, what gets cut, what the room must decide, whose voice it carries, which of two real directions to take.
- Read the material first. A good question names what was read and the tension inside it ("your notes give the reorg and the two launches equal weight").
- If there is no one to answer, or the user said "just build it", decide, and state the assumptions in one line.

## What earns a question

- A brief with two or more result-changing decisions still open.
- A choice between concrete directions: lead with the reorg; lead with the launches; lead with the hiring pause.
- The decision the audience must make: approve, fund, choose, or just understand.
- Voice, when the source is blunt and the room may not be.
- Look, only when no brand, template, or reference was supplied.

## What does not

- Anything the chat already answers.
- Audience and length when the setting implies them ("Thursday staff meeting" implies the team and about 8 slides).
- A missing number: write `[€__]`, `[Q4 churn]`, or `[name]` and list the placeholders in the reply. Do not turn a fact into a question.
- "How does this look?", "Is this okay?", "Any changes?" — no object, no decision.
- A question whose only possible answer is free text. If the options are not real, the question is not ready.
- More than four questions. If you have five, two of them are the same decision.

## Writing the options

- 2–4 concrete directions for THIS deck, not shades of one idea. Each differs on an axis you can name.
- Label: a few words that carry the choice ("The reorg", "The two launches", "The hiring pause").
- Description: one short line on what the deck becomes.
- Put your recommendation first and mark it "(Recommended)".
- `multi_select` true by default; false only when the options exclude each other (one length, one format).
- No "Other" or "you decide" option; the card adds its own.

## Example

A user pastes Q4 planning notes — churn up in mid-market, a price change shipping Nov 1, hiring frozen, and a board meeting on Dec 12 — and says "board update". A well-formed call:

```json
{
  "questions": [
    {
      "id": "lead",
      "header": "Lead",
      "question": "Your notes give churn, the price change, and the hiring freeze equal weight. What should the board remember from this update?",
      "multi_select": true,
      "options": [
        { "label": "Churn is the story (Recommended)", "description": "Mid-market retention first; price and hiring as context" },
        { "label": "The price change", "description": "Nov 1 launch, its risk, and the mitigation" },
        { "label": "The hiring freeze", "description": "What the team can and cannot do in Q1" }
      ]
    },
    {
      "id": "ask",
      "header": "The ask",
      "question": "What should the board do at the end of the deck?",
      "multi_select": false,
      "options": [
        { "label": "Approve the retention plan (Recommended)", "description": "One page, one number, one decision" },
        { "label": "Note the risks", "description": "No decision; owners and dates on the close" },
        { "label": "Pre-read only", "description": "Denser pages that stand alone without a presenter" }
      ]
    }
  ]
}
```

## After the answers

- Restate them in one line: "按你的选择：以续费为主线，结尾要董事会批准留存方案；价格与招聘作为背景。"
- Whatever the answers leave open, decide and say what you picked.
- Then write the outline. Do not ask again because the outline looks different from what you imagined; that is the work.