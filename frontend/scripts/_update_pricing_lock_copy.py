"""ONE-OFF: rephrase the price-lock copy across all 16 locale message files.

The old wording ("locked in for life") read like a commitment trap. New
wording: price never goes up + cancel anytime in 2 clicks, no questions
asked. Same value prop, no fear of being trapped.

Touches 7 keys per locale, all under landing.pricing.* :
  proGrandfatherReason, proFeature4,
  guildMasterGrandfatherReason, guildMasterFeature6,
  trustCancelAnytimeDesc, trustLocked, trustLockedDesc

Read-modify-write. Safe to re-run (idempotent on already-updated keys).
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parent.parent / "messages"

# {locale: {key: new_value}}
NEW_COPY = {
    "es": {
        "proGrandfatherReason": "Sube a $49/mes el 1 de agosto de 2026. Tu tarifa de $39/mes queda bloqueada aunque suba el precio público.",
        "proFeature4": "Tus $39/mes nunca suben, cancela cuando quieras en 2 clics",
        "guildMasterGrandfatherReason": "Sube a $99/mes cuando se llenen las 30 plazas. Tu tarifa de $59/mes queda bloqueada aunque suba el precio público.",
        "guildMasterFeature6": "Tus $59/mes nunca suben, cancela cuando quieras en 2 clics",
        "trustCancelAnytimeDesc": "dos clics, sin preguntas",
        "trustLocked": "El precio nunca sube",
        "trustLockedDesc": "tu tarifa está bloqueada, tu suscripción no",
    },
    "fr": {
        "proGrandfatherReason": "Passe à 49 $/mois le 1er août 2026. Votre tarif de 39 $/mois reste verrouillé même si le prix public augmente.",
        "proFeature4": "Votre 39 $/mois n'augmente jamais, annulez quand vous voulez en 2 clics",
        "guildMasterGrandfatherReason": "Passe à 99 $/mois quand les 30 places sont prises. Votre tarif de 59 $/mois reste verrouillé même si le prix public augmente.",
        "guildMasterFeature6": "Votre 59 $/mois n'augmente jamais, annulez quand vous voulez en 2 clics",
        "trustCancelAnytimeDesc": "deux clics, sans question",
        "trustLocked": "Le prix n'augmente jamais",
        "trustLockedDesc": "votre tarif est verrouillé, votre abonnement non",
    },
    "it": {
        "proGrandfatherReason": "Sale a $49/mese il 1 agosto 2026. La tua tariffa di $39/mese rimane bloccata anche se il prezzo pubblico aumenta.",
        "proFeature4": "I tuoi $39/mese non aumentano mai, cancella quando vuoi in 2 clic",
        "guildMasterGrandfatherReason": "Sale a $99/mese quando si riempiono i 30 posti. La tua tariffa di $59/mese rimane bloccata anche se il prezzo pubblico aumenta.",
        "guildMasterFeature6": "I tuoi $59/mese non aumentano mai, cancella quando vuoi in 2 clic",
        "trustCancelAnytimeDesc": "due clic, senza domande",
        "trustLocked": "Il prezzo non aumenta mai",
        "trustLockedDesc": "la tua tariffa è bloccata, il tuo abbonamento no",
    },
    "de": {
        "proGrandfatherReason": "Steigt am 1. August 2026 auf $49/Monat. Dein $39/Monat bleibt fix, auch wenn der öffentliche Preis steigt.",
        "proFeature4": "Deine $39/Monat steigen nie, jederzeit in 2 Klicks kündbar",
        "guildMasterGrandfatherReason": "Steigt auf $99/Monat, sobald alle 30 Plätze belegt sind. Dein $59/Monat bleibt fix, auch wenn der öffentliche Preis steigt.",
        "guildMasterFeature6": "Deine $59/Monat steigen nie, jederzeit in 2 Klicks kündbar",
        "trustCancelAnytimeDesc": "zwei Klicks, ohne Nachfragen",
        "trustLocked": "Der Preis steigt nie",
        "trustLockedDesc": "dein Preis ist fix, dein Abo nicht",
    },
    "pt": {
        "proGrandfatherReason": "Passa a $49/mês em 1 de agosto de 2026. A sua tarifa de $39/mês fica fixada mesmo quando o preço público sobe.",
        "proFeature4": "Os seus $39/mês nunca sobem, cancele quando quiser em 2 cliques",
        "guildMasterGrandfatherReason": "Passa a $99/mês quando os 30 lugares estiverem preenchidos. A sua tarifa de $59/mês fica fixada mesmo quando o preço público sobe.",
        "guildMasterFeature6": "Os seus $59/mês nunca sobem, cancele quando quiser em 2 cliques",
        "trustCancelAnytimeDesc": "dois cliques, sem perguntas",
        "trustLocked": "O preço nunca sobe",
        "trustLockedDesc": "a sua tarifa está fixada, a sua subscrição não",
    },
    "nl": {
        "proGrandfatherReason": "Gaat naar $49/maand op 1 aug 2026. Jouw $39/maand blijft vast, ook als de publieke prijs stijgt.",
        "proFeature4": "Jouw $39/maand stijgt nooit, altijd op te zeggen met 2 klikken",
        "guildMasterGrandfatherReason": "Gaat naar $99/maand zodra alle 30 plekken vol zijn. Jouw $59/maand blijft vast, ook als de publieke prijs stijgt.",
        "guildMasterFeature6": "Jouw $59/maand stijgt nooit, altijd op te zeggen met 2 klikken",
        "trustCancelAnytimeDesc": "twee klikken, geen vragen",
        "trustLocked": "De prijs stijgt nooit",
        "trustLockedDesc": "jouw tarief staat vast, je abonnement niet",
    },
    "pl": {
        "proGrandfatherReason": "Wzrasta do $49/mies. 1 sierpnia 2026 r. Twoja stawka $39/mies. pozostaje zablokowana nawet gdy publiczna cena rośnie.",
        "proFeature4": "Twoje $39/mies. nigdy nie wzrosną, anuluj w 2 kliknięciach",
        "guildMasterGrandfatherReason": "Wzrasta do $99/mies. gdy wszystkie 30 miejsc zostanie zajętych. Twoja stawka $59/mies. pozostaje zablokowana nawet gdy publiczna cena rośnie.",
        "guildMasterFeature6": "Twoje $59/mies. nigdy nie wzrosną, anuluj w 2 kliknięciach",
        "trustCancelAnytimeDesc": "dwa kliknięcia, bez pytań",
        "trustLocked": "Cena nigdy nie rośnie",
        "trustLockedDesc": "twoja stawka jest zablokowana, twoja subskrypcja nie",
    },
    "ru": {
        "proGrandfatherReason": "Цена вырастет до $49/мес 1 августа 2026. Ваш тариф $39/мес зафиксирован, даже если публичная цена вырастет.",
        "proFeature4": "Ваши $39/мес никогда не вырастут, отмена в 2 клика в любой момент",
        "guildMasterGrandfatherReason": "Цена вырастет до $99/мес, когда все 30 мест будут заняты. Ваш тариф $59/мес зафиксирован, даже если публичная цена вырастет.",
        "guildMasterFeature6": "Ваши $59/мес никогда не вырастут, отмена в 2 клика в любой момент",
        "trustCancelAnytimeDesc": "два клика, без лишних вопросов",
        "trustLocked": "Цена никогда не растёт",
        "trustLockedDesc": "ваш тариф зафиксирован, ваша подписка нет",
    },
    "ar": {
        "proGrandfatherReason": "سيرتفع إلى $49/شهر في 1 أغسطس 2026. سعرك $39/شهر يبقى ثابتًا حتى لو ارتفع السعر العام.",
        "proFeature4": "$39/شهر لن ترتفع أبدًا، إلغاء بنقرتين في أي وقت",
        "guildMasterGrandfatherReason": "سيرتفع إلى $99/شهر عندما تمتلئ جميع الـ30 مقعدًا. سعرك $59/شهر يبقى ثابتًا حتى لو ارتفع السعر العام.",
        "guildMasterFeature6": "$59/شهر لن ترتفع أبدًا، إلغاء بنقرتين في أي وقت",
        "trustCancelAnytimeDesc": "نقرتان، بدون أسئلة",
        "trustLocked": "السعر لا يرتفع أبدًا",
        "trustLockedDesc": "سعرك ثابت، اشتراكك ليس كذلك",
    },
    "el": {
        "proGrandfatherReason": "Πάει στα $49/μήνα την 1η Αυγούστου 2026. Η δική σου τιμή $39/μήνα μένει κλειδωμένη ακόμα και όταν ανέβει η δημόσια τιμή.",
        "proFeature4": "Τα $39/μήνα σου δεν ανεβαίνουν ποτέ, ακύρωση όποτε θες με 2 κλικ",
        "guildMasterGrandfatherReason": "Πάει στα $99/μήνα όταν γεμίσουν οι 30 θέσεις. Η δική σου τιμή $59/μήνα μένει κλειδωμένη ακόμα και όταν ανέβει η δημόσια τιμή.",
        "guildMasterFeature6": "Τα $59/μήνα σου δεν ανεβαίνουν ποτέ, ακύρωση όποτε θες με 2 κλικ",
        "trustCancelAnytimeDesc": "δύο κλικ, χωρίς ερωτήσεις",
        "trustLocked": "Η τιμή δεν ανεβαίνει ποτέ",
        "trustLockedDesc": "η τιμή σου είναι κλειδωμένη, η συνδρομή σου όχι",
    },
    "ja": {
        "proGrandfatherReason": "2026年8月1日から$49/月になります。公定価格が上がってもあなたの$39/月はそのまま。",
        "proFeature4": "あなたの$39/月は決して上がりません。いつでも2クリックで解約。",
        "guildMasterGrandfatherReason": "30名の枠が埋まり次第$99/月になります。公定価格が上がってもあなたの$59/月はそのまま。",
        "guildMasterFeature6": "あなたの$59/月は決して上がりません。いつでも2クリックで解約。",
        "trustCancelAnytimeDesc": "2クリック、質問なし",
        "trustLocked": "価格は決して上がりません",
        "trustLockedDesc": "価格は固定、契約は固定ではありません",
    },
    "ko": {
        "proGrandfatherReason": "2026년 8월 1일부터 $49/월로 인상됩니다. 공식 가격이 올라도 회원님의 $39/월은 고정됩니다.",
        "proFeature4": "회원님의 $39/월은 절대 인상되지 않습니다. 언제든 클릭 두 번이면 해지",
        "guildMasterGrandfatherReason": "30명이 모두 차면 $99/월로 인상됩니다. 공식 가격이 올라도 회원님의 $59/월은 고정됩니다.",
        "guildMasterFeature6": "회원님의 $59/월은 절대 인상되지 않습니다. 언제든 클릭 두 번이면 해지",
        "trustCancelAnytimeDesc": "클릭 두 번, 질문 없음",
        "trustLocked": "가격은 절대 오르지 않습니다",
        "trustLockedDesc": "요금은 고정, 구독은 자유",
    },
    "zh": {
        "proGrandfatherReason": "2026 年 8 月 1 日起涨至 $49/月。公开价格上涨后，您的 $39/月仍保持不变。",
        "proFeature4": "您的 $39/月永不涨价，随时两步取消",
        "guildMasterGrandfatherReason": "30 个名额满后涨至 $99/月。公开价格上涨后，您的 $59/月仍保持不变。",
        "guildMasterFeature6": "您的 $59/月永不涨价，随时两步取消",
        "trustCancelAnytimeDesc": "两步取消，无需理由",
        "trustLocked": "价格永不上涨",
        "trustLockedDesc": "锁定的是价格，不是您",
    },
    "sr": {
        "proGrandfatherReason": "Расте на $49/мес 1. августа 2026. Ваша цена од $39/мес остаје закључана и када јавна цена порасте.",
        "proFeature4": "Ваших $39/мес никад не расту, откажите било кад у 2 клика",
        "guildMasterGrandfatherReason": "Расте на $99/мес када се попуни свих 30 места. Ваша цена од $59/мес остаје закључана и када јавна цена порасте.",
        "guildMasterFeature6": "Ваших $59/мес никад не расту, откажите било кад у 2 клика",
        "trustCancelAnytimeDesc": "два клика, без питања",
        "trustLocked": "Цена никад не расте",
        "trustLockedDesc": "ваша цена је закључана, ваша претплата није",
    },
    "tr": {
        "proGrandfatherReason": "1 Ağustos 2026'da $49/aya çıkacak. Halka açık fiyat artsa bile $39/aylık fiyatınız sabit kalır.",
        "proFeature4": "$39/aylık fiyatınız asla artmaz, istediğiniz zaman 2 tıkla iptal",
        "guildMasterGrandfatherReason": "30 üye dolduğunda $99/aya çıkacak. Halka açık fiyat artsa bile $59/aylık fiyatınız sabit kalır.",
        "guildMasterFeature6": "$59/aylık fiyatınız asla artmaz, istediğiniz zaman 2 tıkla iptal",
        "trustCancelAnytimeDesc": "iki tık, soru sorulmaz",
        "trustLocked": "Fiyat asla artmaz",
        "trustLockedDesc": "fiyatınız sabit, aboneliğiniz değil",
    },
}


def update_locale(locale: str, replacements: dict[str, str]) -> int:
    path = MESSAGES_DIR / f"{locale}.json"
    if not path.exists():
        print(f"  SKIP {locale}: file not found")
        return 0

    data = json.loads(path.read_text(encoding="utf-8"))
    pricing = data.get("landing", {}).get("pricing", {})
    if not pricing:
        print(f"  SKIP {locale}: landing.pricing block missing")
        return 0

    changed = 0
    for key, new_val in replacements.items():
        if key in pricing and pricing[key] != new_val:
            pricing[key] = new_val
            changed += 1

    if changed:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  UPDATED {locale}: {changed} key(s)")
    else:
        print(f"  no-op  {locale}: already up to date")
    return changed


def main():
    total = 0
    for locale, replacements in NEW_COPY.items():
        total += update_locale(locale, replacements)
    print(f"\nTotal updates across all locales: {total}")


if __name__ == "__main__":
    main()
