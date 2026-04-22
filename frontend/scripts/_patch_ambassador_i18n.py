"""
Add ambassador modal + instructors-page ambassador card keys across all
14 locales. Overwrites just these specific keys on each run.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar"]


INSTRUCTORS_KEYS: dict[str, dict[str, str]] = {
    "en": {
        "ambassadorTitle": "Become a Guild Ambassador",
        "ambassadorBody": "Love The Mambo Guild and want to represent it in your scene? Apply to become a Guild Ambassador and help grow the community.",
        "ambassadorCta": "Apply to become an ambassador",
    },
    "es": {
        "ambassadorTitle": "Conviértete en Embajador del Gremio",
        "ambassadorBody": "¿Amas The Mambo Guild y quieres representarlo en tu escena? Postúlate para ser Embajador del Gremio y ayuda a crecer la comunidad.",
        "ambassadorCta": "Postúlate para ser embajador",
    },
    "pt": {
        "ambassadorTitle": "Seja um Embaixador da Guilda",
        "ambassadorBody": "Ama a The Mambo Guild e quer representá-la na sua cena? Candidate-se a Embaixador da Guilda e ajude a crescer a comunidade.",
        "ambassadorCta": "Candidatar-se a embaixador",
    },
    "fr": {
        "ambassadorTitle": "Deviens Ambassadeur de la Guilde",
        "ambassadorBody": "Tu adores The Mambo Guild et veux la représenter dans ta scène ? Postule pour devenir Ambassadeur de la Guilde et aide la communauté à grandir.",
        "ambassadorCta": "Postuler comme ambassadeur",
    },
    "de": {
        "ambassadorTitle": "Werde Gilden-Botschafter",
        "ambassadorBody": "Du liebst The Mambo Guild und willst sie in deiner Szene vertreten? Bewirb dich als Gilden-Botschafter und hilf, die Community wachsen zu lassen.",
        "ambassadorCta": "Als Botschafter bewerben",
    },
    "it": {
        "ambassadorTitle": "Diventa Ambasciatore della Gilda",
        "ambassadorBody": "Ami The Mambo Guild e vuoi rappresentarla nella tua scena? Candidati come Ambasciatore della Gilda e aiuta la community a crescere.",
        "ambassadorCta": "Candidati come ambasciatore",
    },
    "ja": {
        "ambassadorTitle": "ギルド・アンバサダーになる",
        "ambassadorBody": "The Mambo Guildを愛し、地元シーンで代表したい方へ。ギルド・アンバサダーに応募して、コミュニティの成長を一緒に。",
        "ambassadorCta": "アンバサダーに応募する",
    },
    "ko": {
        "ambassadorTitle": "길드 앰버서더가 되세요",
        "ambassadorBody": "The Mambo Guild을 사랑하고 지역 씬에서 대표하고 싶나요? 길드 앰버서더에 지원해 커뮤니티 성장을 함께하세요.",
        "ambassadorCta": "앰버서더 지원하기",
    },
    "zh": {
        "ambassadorTitle": "成为公会大使",
        "ambassadorBody": "热爱 The Mambo Guild 并想在你的舞蹈圈代表它？申请成为公会大使，帮助社区成长。",
        "ambassadorCta": "申请成为大使",
    },
    "ru": {
        "ambassadorTitle": "Стань послом Гильдии",
        "ambassadorBody": "Любишь The Mambo Guild и хочешь представлять её в своей сцене? Подай заявку на посла Гильдии и помоги расти сообществу.",
        "ambassadorCta": "Стать послом",
    },
    "pl": {
        "ambassadorTitle": "Zostań ambasadorem Gildii",
        "ambassadorBody": "Kochasz The Mambo Guild i chcesz reprezentować ją w swojej scenie? Zgłoś się na ambasadora Gildii i pomóż społeczności rosnąć.",
        "ambassadorCta": "Zgłoś się jako ambasador",
    },
    "nl": {
        "ambassadorTitle": "Word Gilde-Ambassadeur",
        "ambassadorBody": "Hou je van The Mambo Guild en wil je haar in jouw scene vertegenwoordigen? Solliciteer als Gilde-Ambassadeur en help de community groeien.",
        "ambassadorCta": "Solliciteer als ambassadeur",
    },
    "el": {
        "ambassadorTitle": "Γίνε Πρεσβευτής της Συντεχνίας",
        "ambassadorBody": "Αγαπάς το The Mambo Guild και θες να το εκπροσωπείς στη σκηνή σου; Κάνε αίτηση για Πρεσβευτής της Συντεχνίας και βοήθησε την κοινότητα να μεγαλώσει.",
        "ambassadorCta": "Κάνε αίτηση για πρεσβευτής",
    },
    "ar": {
        "ambassadorTitle": "كن سفيرًا للنقابة",
        "ambassadorBody": "تحب The Mambo Guild وترغب في تمثيلها في مجتمعك؟ قدّم طلبك لتصبح سفيرًا للنقابة وساعد في نمو المجتمع.",
        "ambassadorCta": "تقديم طلب السفير",
    },
}


AMBASSADOR_MODAL: dict[str, dict[str, str]] = {
    "en": {
        "title": "Apply to become a Guild Ambassador",
        "subtitle": "Tell us a bit about yourself and why you want to represent The Mambo Guild.",
        "nameLabel": "Full name",
        "emailLabel": "Email",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/you (optional)",
        "locationLabel": "City / scene",
        "locationPlaceholder": "e.g. Barcelona, NYC (optional)",
        "messageLabel": "Why you?",
        "messagePlaceholder": "Share your dance background, the scene you're part of, and how you'd represent the Guild. Minimum 20 characters.",
        "messageHint": "{count} / 4000",
        "submit": "Send application",
        "sending": "Sending…",
        "cancel": "Cancel",
        "close": "Close",
        "successTitle": "Application sent",
        "successBody": "Thanks for applying. Pavle will read every application personally and reach out if there's a fit.",
        "genericError": "Could not send your application. Please try again in a bit.",
    },
    "es": {
        "title": "Postúlate para ser Embajador del Gremio",
        "subtitle": "Cuéntanos un poco sobre ti y por qué quieres representar The Mambo Guild.",
        "nameLabel": "Nombre completo",
        "emailLabel": "Correo",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/tu (opcional)",
        "locationLabel": "Ciudad / escena",
        "locationPlaceholder": "ej. Barcelona, NYC (opcional)",
        "messageLabel": "¿Por qué tú?",
        "messagePlaceholder": "Comparte tu background de baile, la escena a la que perteneces y cómo representarías al Gremio. Mínimo 20 caracteres.",
        "messageHint": "{count} / 4000",
        "submit": "Enviar postulación",
        "sending": "Enviando…",
        "cancel": "Cancelar",
        "close": "Cerrar",
        "successTitle": "Postulación enviada",
        "successBody": "Gracias por postularte. Pavle lee cada postulación personalmente y te escribirá si encaja.",
        "genericError": "No se pudo enviar tu postulación. Inténtalo de nuevo en un rato.",
    },
    "pt": {
        "title": "Candidate-se a Embaixador da Guilda",
        "subtitle": "Conte um pouco sobre você e por que quer representar a The Mambo Guild.",
        "nameLabel": "Nome completo",
        "emailLabel": "E-mail",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/voce (opcional)",
        "locationLabel": "Cidade / cena",
        "locationPlaceholder": "ex. Lisboa, São Paulo (opcional)",
        "messageLabel": "Por que você?",
        "messagePlaceholder": "Compartilhe seu histórico de dança, a cena da qual faz parte e como representaria a Guilda. Mínimo 20 caracteres.",
        "messageHint": "{count} / 4000",
        "submit": "Enviar candidatura",
        "sending": "Enviando…",
        "cancel": "Cancelar",
        "close": "Fechar",
        "successTitle": "Candidatura enviada",
        "successBody": "Obrigado por se candidatar. Pavle lê cada candidatura pessoalmente e responderá se houver encaixe.",
        "genericError": "Não foi possível enviar sua candidatura. Tente novamente em breve.",
    },
    "fr": {
        "title": "Postule pour devenir Ambassadeur de la Guilde",
        "subtitle": "Parle-nous un peu de toi et de pourquoi tu veux représenter The Mambo Guild.",
        "nameLabel": "Nom complet",
        "emailLabel": "E-mail",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/toi (optionnel)",
        "locationLabel": "Ville / scène",
        "locationPlaceholder": "ex. Paris, Bruxelles (optionnel)",
        "messageLabel": "Pourquoi toi ?",
        "messagePlaceholder": "Parle de ton parcours en danse, de ta scène et de la façon dont tu représenterais la Guilde. 20 caractères minimum.",
        "messageHint": "{count} / 4000",
        "submit": "Envoyer la candidature",
        "sending": "Envoi…",
        "cancel": "Annuler",
        "close": "Fermer",
        "successTitle": "Candidature envoyée",
        "successBody": "Merci pour ta candidature. Pavle lit chaque candidature personnellement et te recontacte si ça matche.",
        "genericError": "Impossible d'envoyer ta candidature. Réessaie dans un instant.",
    },
    "de": {
        "title": "Bewirb dich als Gilden-Botschafter",
        "subtitle": "Erzähl uns kurz über dich und warum du The Mambo Guild vertreten möchtest.",
        "nameLabel": "Vollständiger Name",
        "emailLabel": "E-Mail",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/du (optional)",
        "locationLabel": "Stadt / Szene",
        "locationPlaceholder": "z. B. Berlin, Wien (optional)",
        "messageLabel": "Warum du?",
        "messagePlaceholder": "Erzähle von deinem Tanz-Background, deiner Szene und wie du die Gilde repräsentieren würdest. Mindestens 20 Zeichen.",
        "messageHint": "{count} / 4000",
        "submit": "Bewerbung senden",
        "sending": "Wird gesendet…",
        "cancel": "Abbrechen",
        "close": "Schließen",
        "successTitle": "Bewerbung gesendet",
        "successBody": "Danke für deine Bewerbung. Pavle liest jede Bewerbung persönlich und meldet sich, wenn es passt.",
        "genericError": "Deine Bewerbung konnte nicht gesendet werden. Bitte gleich nochmal versuchen.",
    },
    "it": {
        "title": "Candidati come Ambasciatore della Gilda",
        "subtitle": "Parlaci un po' di te e perché vuoi rappresentare The Mambo Guild.",
        "nameLabel": "Nome completo",
        "emailLabel": "Email",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/tu (opzionale)",
        "locationLabel": "Città / scena",
        "locationPlaceholder": "es. Milano, Roma (opzionale)",
        "messageLabel": "Perché tu?",
        "messagePlaceholder": "Racconta il tuo background di danza, la scena di cui fai parte e come rappresenteresti la Gilda. Minimo 20 caratteri.",
        "messageHint": "{count} / 4000",
        "submit": "Invia candidatura",
        "sending": "Invio…",
        "cancel": "Annulla",
        "close": "Chiudi",
        "successTitle": "Candidatura inviata",
        "successBody": "Grazie per la candidatura. Pavle legge ogni candidatura personalmente e ti risponde se c'è un match.",
        "genericError": "Impossibile inviare la candidatura. Riprova tra poco.",
    },
    "ja": {
        "title": "ギルド・アンバサダーに応募",
        "subtitle": "あなたのことと、なぜThe Mambo Guildを代表したいかを教えてください。",
        "nameLabel": "フルネーム",
        "emailLabel": "メール",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/you（任意）",
        "locationLabel": "都市 / シーン",
        "locationPlaceholder": "例：東京、大阪（任意）",
        "messageLabel": "なぜあなた？",
        "messagePlaceholder": "ダンス歴、所属するシーン、ギルドをどう代表したいかを教えてください。最低20文字。",
        "messageHint": "{count} / 4000",
        "submit": "応募を送信",
        "sending": "送信中…",
        "cancel": "キャンセル",
        "close": "閉じる",
        "successTitle": "応募を送信しました",
        "successBody": "ご応募ありがとうございます。Pavleがすべての応募を個別に読み、合う場合にご連絡します。",
        "genericError": "応募を送信できませんでした。しばらくしてから再度お試しください。",
    },
    "ko": {
        "title": "길드 앰버서더 지원",
        "subtitle": "자신에 대해 간단히 알려주고 왜 The Mambo Guild을 대표하고 싶은지 말씀해 주세요.",
        "nameLabel": "이름 (전체)",
        "emailLabel": "이메일",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/you (선택)",
        "locationLabel": "도시 / 씬",
        "locationPlaceholder": "예: 서울, 부산 (선택)",
        "messageLabel": "왜 당신인가요?",
        "messagePlaceholder": "댄스 배경, 소속 씬, 그리고 어떻게 길드를 대표할지 알려주세요. 최소 20자.",
        "messageHint": "{count} / 4000",
        "submit": "지원서 보내기",
        "sending": "전송 중…",
        "cancel": "취소",
        "close": "닫기",
        "successTitle": "지원서가 전송됨",
        "successBody": "지원해 주셔서 감사합니다. Pavle이 모든 지원서를 직접 읽고 적합하면 연락드립니다.",
        "genericError": "지원서를 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.",
    },
    "zh": {
        "title": "申请成为公会大使",
        "subtitle": "告诉我们一点关于你的信息，以及你为什么想代表 The Mambo Guild。",
        "nameLabel": "全名",
        "emailLabel": "邮箱",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/你（可选）",
        "locationLabel": "城市 / 舞蹈圈",
        "locationPlaceholder": "如：北京、上海（可选）",
        "messageLabel": "为什么是你？",
        "messagePlaceholder": "分享你的舞蹈背景、所在舞蹈圈，以及你会如何代表公会。至少 20 个字符。",
        "messageHint": "{count} / 4000",
        "submit": "发送申请",
        "sending": "发送中…",
        "cancel": "取消",
        "close": "关闭",
        "successTitle": "申请已发送",
        "successBody": "感谢申请。Pavle 会亲自阅读每一份申请，合适时将与您联系。",
        "genericError": "无法发送申请。请稍后再试。",
    },
    "ru": {
        "title": "Заявка на посла Гильдии",
        "subtitle": "Расскажи немного о себе и почему ты хочешь представлять The Mambo Guild.",
        "nameLabel": "Полное имя",
        "emailLabel": "Email",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/вы (опционально)",
        "locationLabel": "Город / сцена",
        "locationPlaceholder": "напр. Москва, Киев (опционально)",
        "messageLabel": "Почему ты?",
        "messagePlaceholder": "Расскажи о танцевальном бэкграунде, своей сцене и о том, как будешь представлять Гильдию. Минимум 20 символов.",
        "messageHint": "{count} / 4000",
        "submit": "Отправить заявку",
        "sending": "Отправка…",
        "cancel": "Отмена",
        "close": "Закрыть",
        "successTitle": "Заявка отправлена",
        "successBody": "Спасибо за заявку. Pavle читает каждую заявку лично и свяжется, если подойдёт.",
        "genericError": "Не удалось отправить заявку. Попробуйте ещё раз чуть позже.",
    },
    "pl": {
        "title": "Zgłoś się na ambasadora Gildii",
        "subtitle": "Opowiedz trochę o sobie i dlaczego chcesz reprezentować The Mambo Guild.",
        "nameLabel": "Imię i nazwisko",
        "emailLabel": "Email",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/ty (opcjonalnie)",
        "locationLabel": "Miasto / scena",
        "locationPlaceholder": "np. Warszawa, Kraków (opcjonalnie)",
        "messageLabel": "Dlaczego ty?",
        "messagePlaceholder": "Opisz swoje tło taneczne, scenę, do której należysz, i jak reprezentowałbyś Gildię. Minimum 20 znaków.",
        "messageHint": "{count} / 4000",
        "submit": "Wyślij zgłoszenie",
        "sending": "Wysyłanie…",
        "cancel": "Anuluj",
        "close": "Zamknij",
        "successTitle": "Zgłoszenie wysłane",
        "successBody": "Dzięki za zgłoszenie. Pavle osobiście czyta każde zgłoszenie i odezwie się, jeśli będzie pasować.",
        "genericError": "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.",
    },
    "nl": {
        "title": "Solliciteer als Gilde-Ambassadeur",
        "subtitle": "Vertel iets over jezelf en waarom je The Mambo Guild wil vertegenwoordigen.",
        "nameLabel": "Volledige naam",
        "emailLabel": "E-mail",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/jij (optioneel)",
        "locationLabel": "Stad / scene",
        "locationPlaceholder": "bijv. Amsterdam, Antwerpen (optioneel)",
        "messageLabel": "Waarom jij?",
        "messagePlaceholder": "Deel je dansachtergrond, de scene waarin je zit en hoe je de Gilde zou vertegenwoordigen. Minstens 20 tekens.",
        "messageHint": "{count} / 4000",
        "submit": "Sollicitatie versturen",
        "sending": "Versturen…",
        "cancel": "Annuleren",
        "close": "Sluiten",
        "successTitle": "Sollicitatie verzonden",
        "successBody": "Bedankt voor je sollicitatie. Pavle leest iedere sollicitatie persoonlijk en neemt contact op als het past.",
        "genericError": "Sollicitatie kon niet worden verstuurd. Probeer het zo nog eens.",
    },
    "el": {
        "title": "Αίτηση για Πρεσβευτή της Συντεχνίας",
        "subtitle": "Πες μας λίγα για σένα και γιατί θες να εκπροσωπείς το The Mambo Guild.",
        "nameLabel": "Ονοματεπώνυμο",
        "emailLabel": "Email",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/εσύ (προαιρετικό)",
        "locationLabel": "Πόλη / σκηνή",
        "locationPlaceholder": "π.χ. Αθήνα, Θεσσαλονίκη (προαιρετικό)",
        "messageLabel": "Γιατί εσύ;",
        "messagePlaceholder": "Μοιράσου το χορευτικό σου υπόβαθρο, τη σκηνή σου και πώς θα εκπροσωπούσες τη Συντεχνία. Τουλάχιστον 20 χαρακτήρες.",
        "messageHint": "{count} / 4000",
        "submit": "Αποστολή αίτησης",
        "sending": "Αποστολή…",
        "cancel": "Άκυρο",
        "close": "Κλείσιμο",
        "successTitle": "Η αίτηση στάλθηκε",
        "successBody": "Ευχαριστούμε. Ο Pavle διαβάζει προσωπικά κάθε αίτηση και θα επικοινωνήσει αν ταιριάζει.",
        "genericError": "Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά σε λίγο.",
    },
    "ar": {
        "title": "التقديم لسفير النقابة",
        "subtitle": "أخبرنا عن نفسك ولماذا تريد تمثيل The Mambo Guild.",
        "nameLabel": "الاسم الكامل",
        "emailLabel": "البريد الإلكتروني",
        "instagramLabel": "Instagram",
        "instagramPlaceholder": "instagram.com/you (اختياري)",
        "locationLabel": "المدينة / المجتمع",
        "locationPlaceholder": "مثال: دبي، الرياض (اختياري)",
        "messageLabel": "لماذا أنت؟",
        "messagePlaceholder": "شارك خلفيتك في الرقص، المجتمع الذي تنتمي إليه، وكيف ستمثّل النقابة. 20 حرفًا على الأقل.",
        "messageHint": "{count} / 4000",
        "submit": "إرسال الطلب",
        "sending": "جارٍ الإرسال…",
        "cancel": "إلغاء",
        "close": "إغلاق",
        "successTitle": "تم إرسال الطلب",
        "successBody": "شكرًا على تقديمك. سيقرأ Pavle كل طلب شخصيًا وسيتواصل إن كان هناك توافق.",
        "genericError": "تعذّر إرسال الطلب. حاول مرة أخرى بعد قليل.",
    },
}


# Phoenix title overrides per locale (replaces title_the_ambassador everywhere)
PHOENIX_TITLE: dict[str, dict[str, str]] = {
    "en": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Falls, rises, keeps dancing."},
    "es": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Cae, se levanta, sigue bailando."},
    "pt": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Cai, levanta, continua dançando."},
    "fr": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Tombe, se relève, continue de danser."},
    "de": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Fällt, steht auf, tanzt weiter."},
    "it": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Cade, si rialza, continua a ballare."},
    "ja": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "倒れて、立ち上がって、踊り続ける。"},
    "ko": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "쓰러지고, 일어나고, 계속 춤춘다."},
    "zh": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "跌倒，起身，继续跳舞。"},
    "ru": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Падает, поднимается, продолжает танцевать."},
    "pl": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Upada, wstaje, dalej tańczy."},
    "nl": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Valt, staat op, blijft dansen."},
    "el": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "Πέφτει, σηκώνεται, συνεχίζει να χορεύει."},
    "ar": {"title_the_phoenix_label": "The Phoenix", "title_the_phoenix_description": "يسقط، ينهض، يستمر في الرقص."},
}


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    if not path.exists():
        print(f"skip {locale}.json — missing")
        return
    data = json.loads(path.read_text(encoding="utf-8"))

    # instructors.ambassador* keys
    instructors = data.setdefault("instructors", {})
    for k, v in INSTRUCTORS_KEYS.get(locale, {}).items():
        instructors[k] = v

    # ambassador modal namespace
    data["ambassador"] = AMBASSADOR_MODAL.get(locale, AMBASSADOR_MODAL["en"])

    # Drop any lingering Ambassador title key and add Phoenix
    cosmetics = data.setdefault("cosmetics", {})
    cosmetics.pop("title_the_ambassador_label", None)
    cosmetics.pop("title_the_ambassador_description", None)
    for k, v in PHOENIX_TITLE.get(locale, {}).items():
        cosmetics[k] = v

    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale}.json")


def main() -> None:
    for locale in LOCALES:
        patch_locale(locale)


if __name__ == "__main__":
    main()
