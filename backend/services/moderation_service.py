"""
AI Gatekeeper Moderation Service
=================================
Evaluates community reply text using Anthropic Claude to enforce
the "Attitude over Aptitude" culture pillar.

Returns 'active' or 'flagged_by_ai' for the moderation_status column.
"""
import logging
import json
from config import settings

logger = logging.getLogger(__name__)

MODERATION_SYSTEM_PROMPT = """You are the AI Gatekeeper for The Mambo Guild, an online dance academy community.

Your SOLE job is to evaluate a community comment/reply and decide whether it should be publicly visible.

Our core culture pillar is: "Attitude over Aptitude."

PASS criteria (return "pass"):
- The comment is encouraging, constructive, or respectful
- Critique is allowed IF framed positively (e.g., "Great effort! Try adjusting your weight transfer here.")
- Neutral or factual comments are fine
- Humor and casual tone are fine as long as they are not mocking

FAIL criteria (return "fail"):
- Condescending or arrogant tone ("That's basic, everyone knows that")
- Insulting or mocking the dancer ("Lol what was that")
- Demanding or bossy without encouragement ("You NEED to fix your arms")
- Passive-aggressive comments ("Well... at least you tried I guess")
- Personal attacks or bullying of any kind

Respond with ONLY a JSON object, no other text:
{"verdict": "pass"} or {"verdict": "fail", "reason": "brief explanation"}"""


def evaluate_reply(content: str) -> str:
    """
    Evaluate a reply's content using Claude.
    Returns 'active' if the comment passes, 'flagged_by_ai' if it fails.
    Falls back to 'active' on any error (fail-open to avoid blocking users).
    """
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set - moderation disabled, defaulting to active")
        return "active"

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            temperature=0.0,
            system=MODERATION_SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"Evaluate this community reply:\n\n{content}"}
            ],
        )

        result_text = response.content[0].text.strip()

        # Parse the JSON verdict
        result = json.loads(result_text)
        verdict = result.get("verdict", "pass")

        if verdict == "fail":
            reason = result.get("reason", "no reason given")
            logger.info(f"[MODERATION] Reply flagged: {reason} | Content preview: {content[:80]}")
            return "flagged_by_ai"

        return "active"

    except json.JSONDecodeError:
        logger.warning(f"[MODERATION] Failed to parse AI response, defaulting to active")
        return "active"
    except Exception as e:
        logger.error(f"[MODERATION] Error during evaluation: {e}", exc_info=True)
        return "active"
