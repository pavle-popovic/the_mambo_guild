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


POST_MODERATION_SYSTEM_PROMPT = """You are the AI Gatekeeper for The Mambo Guild, an online dance academy community.

Your SOLE job is to evaluate a newly submitted community POST (title + body) and decide whether it should be publicly visible.

Our core culture pillar is: "Attitude over Aptitude." The space is for learning salsa/mambo together.

PASS criteria (return "pass"):
- Genuine question, practice update, reflection, tip, music share, or event mention
- On-topic dance content (technique, music, history, social dancing, gear, events) OR general community check-in
- Vulnerability / self-deprecation is welcome ("I've been struggling with timing")
- Strong opinions are fine if respectful

FAIL criteria (return "fail"):
- Spam, off-topic advertising, referral farming, crypto/NFT shilling
- Hate speech, slurs, harassment, personal attacks on named users or groups
- Sexually explicit content, doxxing, threats, or illegal content
- Gibberish / clearly machine-generated filler
- Mocking or demeaning other dancers or the community

Respond with ONLY a JSON object, no other text:
{"verdict": "pass"} or {"verdict": "fail", "reason": "brief explanation"}"""


def _evaluate(system_prompt: str, user_content: str, kind: str) -> str:
    """
    Shared moderation call. Returns 'active' on pass, 'flagged_by_ai' on fail
    or any error (fail-closed). The author still sees their own flagged
    content via the shadowban filter in post_service.
    """
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        logger.error(f"ANTHROPIC_API_KEY not set — flagging {kind} for manual review")
        return "flagged_by_ai"

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            temperature=0.0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}],
        )

        result_text = response.content[0].text.strip()
        result = json.loads(result_text)
        verdict = result.get("verdict")

        if verdict == "pass":
            return "active"

        if verdict == "fail":
            reason = result.get("reason", "no reason given")
            logger.info(f"[MODERATION] {kind} flagged: {reason} | Preview: {user_content[:80]}")
            return "flagged_by_ai"

        logger.warning(f"[MODERATION] Unknown verdict ({verdict!r}) — flagging {kind} for manual review")
        return "flagged_by_ai"

    except json.JSONDecodeError:
        logger.warning(f"[MODERATION] Failed to parse AI response — flagging {kind} for manual review")
        return "flagged_by_ai"
    except Exception as e:
        logger.error(f"[MODERATION] Error during {kind} evaluation: {e} — flagging for manual review", exc_info=True)
        return "flagged_by_ai"


def evaluate_reply(content: str) -> str:
    """Evaluate a reply (tone-focused, 'Attitude over Aptitude')."""
    return _evaluate(
        MODERATION_SYSTEM_PROMPT,
        f"Evaluate this community reply:\n\n{content}",
        kind="reply",
    )


def evaluate_post(title: str, body: str = None) -> str:
    """Evaluate a new post (content-safety focused: spam, hate, off-topic)."""
    title = (title or "").strip()
    body = (body or "").strip()
    combined = f"TITLE: {title}\n\nBODY: {body}" if body else f"TITLE: {title}"
    return _evaluate(
        POST_MODERATION_SYSTEM_PROMPT,
        f"Evaluate this new community post:\n\n{combined}",
        kind="post",
    )
