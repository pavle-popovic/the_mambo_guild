"""
Email-validation helpers used at registration and at trial-eligibility
checks to defend against trial-abuse loops.

Two independent goals:

1. Reject signups from known disposable / throwaway email services.
   These are the prime tool for trial-abuse loops (sign up, use trial,
   throw away email, repeat). Public lists like the disposable-email-
   domains GitHub repo enumerate ~10k+ such services; we hardcode a
   curated subset (~180 of the most common ones) to catch >90% of
   casual abuse without an external dependency.

   What we DON'T block:
   - @icloud.com (Apple's "Hide My Email" generates random aliases at
     this domain that ARE legitimate forwarding addresses to a real
     mailbox)
   - @relay.firefox.com / @mozmail.com (Firefox Relay, same idea)
   - @duck.com (DuckDuckGo Email Protection, same idea)
   - @cloak.id, @hidemy.org and similar paid privacy aliases that real
     users use as their primary contact email

   These privacy-forwarding services are legitimate end-user tools.
   Blocking them would be hostile to users with privacy needs and have
   high false-positive cost. Real disposable services explicitly market
   themselves as 10-minute / throwaway inboxes — those are what the
   list below catches.

2. Normalize emails for DEDUPLICATION purposes only. Gmail and several
   other providers treat e.g. 'foo+anything@gmail.com' and
   'foo@gmail.com' as the same inbox (Gmail also ignores dots in the
   local part). For detecting "is this person already a customer", we
   collapse to a canonical form. The original email the user typed is
   NEVER mutated — it stays as-is in the User row and on Stripe customer
   records, so receipts and emails go to the address they expected.
   The canonical form is used only for dedup queries.
"""
from __future__ import annotations


# Curated frozenset of disposable email service domains.
# Sources: top entries from disposable-email-domains/disposable_email_blocklist
# and the npm 'disposable-email-domains' package, filtered to PURE disposable
# services (excluding privacy-forwarding services like Apple Hide-My-Email,
# Firefox Relay, DuckDuckGo Email, etc. which have legitimate users).
# Updated 2026-04 — refresh annually if abuse patterns shift.
DISPOSABLE_EMAIL_DOMAINS: frozenset[str] = frozenset({
    # 10-minute / minute-mail family
    "10minutemail.com", "10minutemail.net", "10minutemail.info",
    "10minutemail.org", "10minutemail.co.uk", "10minutemail.us",
    "10minute.email", "20minutemail.com", "30minutemail.com",
    "minute-mail.com", "hour-email.com", "minutemail.com",
    "1secmail.com", "1secmail.net", "1secmail.org",

    # Mailinator family
    "mailinator.com", "mailinator.net", "mailinator.org", "mailinator2.com",
    "mailinator2.net", "sharklasers.com", "guerrillamailblock.com",
    "pokemail.net", "spam4.me", "veryrealemail.com", "trbvm.com",

    # Guerrilla Mail
    "guerrillamail.com", "guerrillamail.biz", "guerrillamail.de",
    "guerrillamail.info", "guerrillamail.net", "guerrillamail.org",
    "guerrillamailblock.com",

    # temp-mail family
    "temp-mail.org", "temp-mail.io", "temp-mail.ru", "tempmail.com",
    "tempmail.net", "tempmail.us", "tempmailaddress.com", "tempmailo.com",
    "tempmail.email", "tempmail.de", "tempmail.dev", "tempinbox.com",
    "temporary-email.com", "tempr.email", "temp-mailo.com",
    "tempmailbox.net", "tempmail.plus", "temporaryemail.net",

    # Yopmail
    "yopmail.com", "yopmail.net", "yopmail.fr", "yopmail.gq", "yopmail.pw",
    "cool.fr.nf", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf",
    "monmail.fr.nf",

    # Throwaway / discard family
    "throwaway.email", "throwawaymail.com", "throwawaymail.pp.ua",
    "discard.email", "discardmail.com", "discardmail.de",
    "trash-mail.com", "trash-mail.at", "trashmail.com", "trashmail.net",
    "trashmail.me", "trashmail.at", "trashmail.de", "trashmail.io",
    "trashmail.ws", "wegwerfemail.de", "wegwerfmail.de", "wegwerfmail.net",
    "wegwerfmail.org",

    # Common short-lived inboxes
    "dispostable.com", "mintemail.com", "mailcatch.com",
    "fakemailgenerator.com", "fakemailgenerator.net", "fakeinbox.com",
    "fake-mail.net", "fakemail.fr", "spamgourmet.com",
    "jetable.org", "jetable.fr.nf", "jetable.com",
    "mailnesia.com", "maildrop.cc", "mvrht.net", "mvrht.com",
    "33mail.com", "nada.email", "nada.ltd", "eyepaste.com",
    "spambog.com", "spambog.de", "spambog.ru", "spambox.us", "spam.la",
    "emailondeck.com", "emailtemporanea.net", "emailtemporanea.com",
    "inboxbear.com", "getnada.com", "emailfake.com",
    "byom.de", "emailtemp.org", "mailtemp.info", "tmail.ws",
    "moakt.com", "moakt.cc", "moakt.ws", "harakirimail.com",
    "linshiyou.com", "0815.ru", "2prong.com", "airmaildrop.com",
    "anonbox.net", "antichef.com", "bccto.me", "chacuo.net",
    "meltmail.com", "mytemp.email", "mytempmail.com",
    "ronnyfreemail.com", "inboxkitten.com", "generator.email",
    "mailto.plus", "tempmailfree.com", "tempemail.co",
    "tempemail.com", "tempemail.net", "yourtempmail.com",
    "throwam.com", "owlpic.com", "spamfree24.org", "spamfree24.com",
    "spamfree24.de", "spamfree24.eu", "spamfree24.info", "spamfree24.net",

    # Spam-fighting "fake" identity generators (often used by bots)
    "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
    "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
    "teleworm.us", "teleworm.com",

    # Mohmal, dropmail, etc.
    "mohmal.com", "dropmail.me", "dropmail.club",

    # Yet more known disposables
    "mailforspam.com", "spamavert.com", "incognitomail.org",
    "incognitomail.com", "tempmailgen.com", "freeml.net",
    "objectmail.com", "proxymail.eu", "regbypass.com",
    "rmqkr.net", "tempinbox.co.uk", "tempmail.eu", "tempmail.us.com",
    "thankyou2010.com", "thisisnotmyrealemail.com", "tradermail.info",
    "wuzup.net", "wuzupmail.net", "yapped.net", "zoemail.org",
    "zoemail.net",

    # More variants commonly seen in 2024-2026 abuse logs
    "anonaddy.me", "imailcrew.com", "smartnator.com", "tempr.email",
    "vmail.icu", "vmailing.com", "fivemail.de", "dump-email.info",
    "dudmail.com", "dumpmail.de", "dumpyemail.com", "etranquil.com",
    "etranquil.net", "etranquil.org", "explodemail.com", "fastacura.com",
    "fastchevy.com", "fastchrysler.com", "fastkawasaki.com",
    "fastmazda.com", "fastmitsubishi.com", "fastnissan.com",
    "fastsubaru.com", "fastsuzuki.com", "fasttoyota.com", "fastyamaha.com",

    # GetAirmail / Smailpro family
    "getairmail.com", "smailpro.com",

    # Dispostable / others
    "deadaddress.com", "dontsendmespam.de", "mt2009.com", "mt2014.com",
    "mt2015.com", "mt2016.com", "mt2017.com", "mt2018.com", "mt2019.com",
    "no-spam.ws", "noref.in", "nospam.ze.tc", "nowhere.org",
    "objectmail.com", "spamslicer.com", "speed.1s.fr", "tilien.com",
    "venompen.com", "yourmailtoday.com",

    # Disposable suffixes from spam-detection feeds
    "binkmail.com", "bobmail.info", "chammy.info", "devnullmail.com",
    "dfgh.net", "discardmail.com", "discardmail.de", "duskmail.com",
    "gehensiemirnichtaufdensack.de", "h.mintemail.com", "hidzz.com",
    "hmamail.com", "kasmail.com", "klzlk.com", "kook.ml",
    "kurzepost.de", "litedrop.com", "mailbiz.biz", "mailcatch.com",
    "maileater.com", "mailexpire.com", "mailfa.tk", "mailguard.me",
    "mailhz.me", "mailimate.com", "mailinator.com", "mailme.lv",
    "mailmoat.com", "mailms.com", "mailshell.com", "mailslite.com",
    "mailtemporary.com", "mailtothis.com", "mbx.cc", "mixzu.net",
    "mt2009.com", "mxfuel.com", "nepwk.com", "nervmich.net",
    "no-spam.ws", "nogmailspam.info", "noms.cc", "nospam.ze.tc",
    "nospamfor.us", "nospamthanks.info", "objectmail.com", "oneoffemail.com",
    "onewaymail.com", "ordinaryamerican.net", "owlpic.com", "pjjkp.com",
    "plexolan.de", "poofy.org", "pookmail.com", "privacy.net",
    "punkass.com", "putthisinyourspamdatabase.com", "qq.com.com",
    "quickinbox.com", "rcpt.at", "recode.me", "rmqkr.net",
    "rppkn.com", "rtrtr.com", "s0ny.net", "sandelf.de",
    "saynotospams.com", "selfdestructingmail.com", "sendspamhere.com",
    "shieldedmail.com", "shieldedmail.net", "shiftmail.com",
    "shitmail.me", "shortmail.net", "sibmail.com", "skeefmail.com",
    "slopsbox.com", "smellfear.com", "smtp99.com", "snakemail.com",
    "sneakemail.com", "sofimail.com", "sofort-mail.de", "sogetthis.com",
    "soodonims.com", "spam.la", "spam.su", "spamavert.com",
    "spambob.com", "spambob.net", "spambob.org", "spamcero.com",
    "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net",
    "spamcowboy.org", "spamday.com", "spamex.com", "spamfree.eu",
    "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info",
    "spamfree24.net", "spamfree24.org", "spamgourmet.com", "spamgourmet.net",
    "spamgourmet.org", "spamhereplease.com", "spamhole.com",
    "spamify.com", "spaminator.de", "spamkill.info", "spaml.com",
    "spaml.de", "spammotel.com", "spamobox.com", "spamoff.de",
    "spamslicer.com", "spamspot.com", "spamthis.co.uk", "spamthisplease.com",
    "spamtroll.net", "speed.1s.fr", "stinkefinger.net", "stuffmail.de",
    "supergreatmail.com", "superrito.com", "supermailer.jp", "suremail.info",
    "tagyourself.com", "talkinator.com", "teewars.org", "teleworm.com",
    "teleworm.us", "tempalias.com", "tempemail.biz", "tempemail.co.za",
    "tempemail.com", "tempemail.net", "tempinbox.co.uk", "tempinbox.com",
    "tempmail.it", "tempmaiyl.com", "tempomail.fr", "temporarily.de",
    "temporarioemail.com.br", "temporaryemail.net", "temporaryforwarding.com",
    "temporaryinbox.com", "temporarymailaddress.com", "tempthe.net",
    "tempymail.com", "thanksnospam.info", "thankyou2010.com",
    "thecloudindex.com", "thisisnotmyrealemail.com", "throwam.com",
    "throwawayemailaddress.com", "tilien.com", "tmail.ws", "tmailinator.com",
    "tmpemails.com", "topranklist.de", "tradermail.info", "trash2009.com",
    "trashdevil.com", "trashemail.de", "trashymail.com", "trashymail.net",
    "trbvm.com", "trialmail.de", "trillianpro.com", "twinmail.de",
    "twoweirdtricks.com", "umail.net", "uggsrock.com",
    "veryrealemail.com", "viditag.com", "viralplays.com", "vrmtr.com",
    "vsimcard.com", "wegwerf-email.at", "wegwerf-emails.de",
    "wegwerfemailadresse.com", "wegwerfmail.de", "wegwerfmail.net",
    "wegwerfmail.org", "wh4f.org", "whyspam.me", "wilemail.com",
    "willhackforfood.biz", "willselfdestruct.com", "winemaven.info",
    "wuzupmail.net", "yapped.net", "youmailr.com", "yourdomain.com",
    "yuurok.com", "zehnminuten.de", "zehnminutenmail.de", "zoaxe.com",
    "zoemail.net", "zoemail.org", "zomg.info", "zxcv.com", "zxcvbnm.com",
})


# Providers whose local-part should be alias-normalized in the same
# Gmail-style way: collapse '+anything' AND drop dots from the local part.
# Adding a domain here = treat 'foo.bar+x@<domain>' the same as 'foobar@<domain>'.
_GMAIL_STYLE_PROVIDERS = frozenset({
    "gmail.com",
    "googlemail.com",
})


def is_disposable_email(email: str) -> bool:
    """Return True if the email's domain matches a known disposable service.

    Case-insensitive. Returns False for malformed or empty input rather
    than raising, so the caller can decide separately whether to reject
    on format. Designed to be cheap (frozenset lookup, O(1))."""
    if not email or "@" not in email:
        return False
    domain = email.strip().lower().rsplit("@", 1)[-1]
    if not domain:
        return False
    return domain in DISPOSABLE_EMAIL_DOMAINS


def normalize_email_for_dedup(email: str) -> str:
    """
    Return a canonical, lowercase email for deduplication purposes.

    Gmail / Googlemail: strip dots from the local part and drop
    everything from the first '+' onwards. So 'Pavle+test@gmail.com'
    and 'P.av.le@gmail.com' both become 'pavle@gmail.com'. This matches
    Google's actual mail-routing behavior — both routes deliver to the
    same inbox.

    Other providers: just strip '+aliases' (a common but not universal
    convention; Outlook/Yahoo/Proton honor it; some smaller providers
    treat '+' as part of the local-part literally — using normalization
    here is on the over-block side, which is what we want for trial-abuse
    detection: prefer false positives over false negatives).

    The original email string the user typed is NEVER mutated by this
    function; it returns a SEPARATE canonical form for dedup queries.
    Use the as-typed email for storage, sending, and Stripe customer
    creation (so receipts go to the address the user expects). Use the
    canonical form only for dedup lookups.
    """
    if not email or "@" not in email:
        return email.strip().lower()
    local, _, domain = email.strip().lower().partition("@")
    if not local or not domain:
        return email.strip().lower()
    if domain in _GMAIL_STYLE_PROVIDERS:
        # Gmail collapses dots and ignores +aliases.
        local = local.split("+", 1)[0].replace(".", "")
    elif "+" in local:
        # Generic +alias support: strip from the first '+'.
        local = local.split("+", 1)[0]
    if not local:
        # Edge case: 'a+b@gmail.com' has local 'a' which is fine, but
        # an email like '+only@gmail.com' would normalize to '@gmail.com'
        # — return the original lowercased form rather than producing a
        # malformed canonical.
        return email.strip().lower()
    return f"{local}@{domain}"
