"""Generate the A4 print flyer for The Mambo Guild.

Output: scripts/flyer/flyer.html
  Open in any browser, then File -> Print -> Save as PDF, paper size A4,
  margins None / Default. The flyer is sized exactly 210x297mm so it
  prints edge-to-edge on a single sheet with the printer's hardware
  margins handling the bleed.

Requires:
  pip install qrcode

The QR code is rendered as inline SVG (vector, scales perfectly at any
print resolution). The destination URL is UTM-tagged so flyer-driven
signups are attributable in your analytics:

  utm_source=flyer
  utm_medium=print
  utm_campaign=evergreen_flyer

The QR landing page is the homepage rather than /pricing so the visitor
gets a beat to orient before hitting the offer, which converts better
for cold scan traffic. Edit QR_URL below to point elsewhere if needed.
"""
import base64
import io
import os
import sys

try:
    import qrcode
    import qrcode.image.svg
except ImportError:
    sys.exit("pip install qrcode")


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(SCRIPT_DIR, "flyer.html")

# Logo lives in the frontend public assets. Same one the navbar uses on
# the landing page so the flyer brand-matches the live site.
LOGO_PATH = os.path.normpath(os.path.join(
    SCRIPT_DIR, "..", "..", "..", "frontend", "public", "assets", "Logo.png"
))

QR_URL = (
    "https://www.themamboguild.com/"
    "?utm_source=flyer&utm_medium=print&utm_campaign=evergreen_flyer"
)


def render_qr_svg(url: str) -> str:
    """Generate the QR code as an inline SVG string. Single-path SVG, no
    external dependencies, scales without aliasing at print resolution."""
    factory = qrcode.image.svg.SvgPathImage
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=factory,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image()
    buf = io.BytesIO()
    img.save(buf)
    svg = buf.getvalue().decode("utf-8")
    # Strip the XML declaration so it embeds cleanly inside HTML.
    if svg.startswith("<?xml"):
        svg = svg.split("?>", 1)[1].lstrip()
    return svg


def encode_logo_data_url() -> str:
    """Read the brand logo PNG and return as a base64 data URL so the
    flyer.html file stays fully self-contained (no separate image to ship
    or worry about path resolution at print time)."""
    if not os.path.exists(LOGO_PATH):
        sys.exit(f"Logo not found at {LOGO_PATH}")
    with open(LOGO_PATH, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>The Mambo Guild Flyer (A4)</title>
    <!-- Same fonts the live landing page loads via next/font: Inter for body
         and Playfair Display for display headings. Browser fetches them
         when the file is opened (online); the print-to-PDF step bakes them
         into the PDF so the printed flyer ships without dependencies. -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        @media print {
            body { margin: 0; }
            .flyer { page-break-after: avoid; }
        }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact;
            print-color-adjust: exact; color-adjust: exact; }
        html, body {
            margin: 0; padding: 0;
            background: #2a2a2a;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        }
        .flyer {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: #FAF6EC;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        /* ---------- TOP BAND (logo + brand title) ---------- */
        .topband {
            background: #0E0E0E;
            color: #F9F7F1;
            padding: 8mm 16mm 6mm 16mm;
            text-align: center;
            border-bottom: 4px solid #D4AF37;
        }
        .topband .logo {
            height: 22mm;
            width: auto;
            display: block;
            margin: 0 auto;
        }
        .topband .brand {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
            font-size: 26pt;
            font-weight: 900;
            color: #F9F7F1;
            margin-top: 4mm;
            letter-spacing: 1pt;
            line-height: 1;
        }
        .topband .brand .gold {
            color: #D4AF37;
        }
        .topband .tagline {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 9pt;
            letter-spacing: 3pt;
            margin-top: 3mm;
            color: #c9c0a8;
            text-transform: uppercase;
            font-weight: 600;
        }

        /* ---------- HERO ---------- */
        .hero {
            padding: 10mm 16mm 5mm 16mm;
            text-align: center;
        }
        .hero h1 {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
            color: #0E0E0E;
            margin: 0;
            line-height: 1.0;
            letter-spacing: -0.5pt;
            font-weight: 900;
        }
        .hero .h1-line1 {
            font-size: 54pt;
            display: block;
        }
        .hero .h1-line2 {
            font-size: 22pt;
            font-weight: 700;
            display: block;
            margin-top: 6pt;
            background: linear-gradient(135deg, #FCE205 0%, #C49620 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: #C49620;
            letter-spacing: 1pt;
            text-transform: uppercase;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        }
        .hero .credential {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            color: #555;
            margin-top: 10pt;
            letter-spacing: 1pt;
            text-transform: uppercase;
            font-weight: 500;
        }
        .hero .credential strong { color: #0E0E0E; font-weight: 700; }

        /* ---------- VALUE STRIP ---------- */
        .values {
            display: flex;
            justify-content: center;
            gap: 6mm;
            padding: 0 16mm;
            margin-top: 5mm;
        }
        .value {
            flex: 1;
            text-align: center;
            border: 1.5px solid #d8cfb8;
            border-radius: 4px;
            padding: 5mm 3mm;
            background: #fefcf6;
        }
        .value .head {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 18pt;
            color: #C49620;
            font-weight: 900;
            line-height: 1.05;
        }
        .value .label {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 1.3pt;
            color: #444;
            margin-top: 5pt;
            line-height: 1.3;
            font-weight: 600;
        }

        /* ---------- CTA + QR ---------- */
        .cta-band {
            margin: 7mm 12mm 0 12mm;
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            color: #F9F7F1;
            border-radius: 4px;
            padding: 7mm 8mm 6mm 8mm;
            display: flex;
            align-items: center;
            gap: 8mm;
            border: 2px solid #D4AF37;
        }
        .cta-text {
            flex: 1;
            min-width: 0;
        }
        .cta-text .offer {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 20pt;
            line-height: 1.05;
            margin: 0 0 3mm 0;
            color: #FCE205;
            font-weight: 900;
        }
        .cta-text .offer-sub {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-size: 10.5pt;
            color: #e8e2cc;
            margin: 0 0 4mm 0;
            line-height: 1.4;
        }
        .cta-text .button {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            display: inline-block;
            background: linear-gradient(135deg, #FCE205 0%, #D4AF37 100%);
            color: #0E0E0E;
            font-weight: 800;
            font-size: 12.5pt;
            padding: 4mm 7mm;
            border-radius: 3px;
            text-transform: uppercase;
            letter-spacing: 1.2pt;
        }
        .cta-text .url {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            margin-top: 4mm;
            font-size: 10.5pt;
            color: #FCE205;
            letter-spacing: 1pt;
            font-weight: 600;
        }

        .qr-wrap {
            background: #FAF6EC;
            padding: 4mm;
            border-radius: 3px;
            text-align: center;
            border: 2px solid #FCE205;
        }
        .qr {
            width: 42mm;
            height: 42mm;
            display: block;
        }
        .qr svg { width: 100%; height: 100%; display: block; }
        .qr-caption {
            margin-top: 3mm;
            font-size: 8pt;
            color: #0E0E0E;
            text-transform: uppercase;
            letter-spacing: 1.5pt;
            font-weight: 700;
        }

        /* ---------- POSITIONING STRIP + FOOTER ---------- */
        .pitch {
            margin: 6mm 16mm 0 16mm;
            text-align: center;
            font-size: 9.5pt;
            color: #5a4a10;
            background: #fff8e1;
            border-left: 3px solid #D4AF37;
            border-right: 3px solid #D4AF37;
            padding: 3mm 6mm;
            border-radius: 2px;
            line-height: 1.45;
        }
        .pitch strong { color: #0E0E0E; }

        .footer {
            margin-top: auto;
            background: #0E0E0E;
            color: #c9c0a8;
            text-align: center;
            padding: 5mm 16mm;
            font-size: 8.5pt;
            letter-spacing: 2pt;
            text-transform: uppercase;
            border-top: 4px solid #D4AF37;
        }
        .footer .url {
            color: #FCE205;
            font-weight: 700;
            letter-spacing: 3pt;
        }
    </style>
</head>
<body>
    <div class="flyer">
        <div class="topband">
            <img class="logo" src="__LOGO_DATA_URL__" alt="The Mambo Guild">
            <div class="brand">The <span class="gold">Mambo</span> Guild</div>
            <div class="tagline">Online Salsa &middot; Mambo &middot; Pachanga School</div>
        </div>

        <div class="hero">
            <h1>
                <span class="h1-line1">World's #1</span>
                <span class="h1-line2">Gamified Online Salsa Platform</span>
            </h1>
            <div class="credential">
                By <strong>Pavle Popovic</strong> &middot; Certified Learning Experience Design Teacher
            </div>
        </div>

        <div class="values">
            <div class="value">
                <div class="head">500+</div>
                <div class="label">Structured<br>Classes</div>
            </div>
            <div class="value">
                <div class="head">Anytime<br>Anywhere</div>
                <div class="label">No Partner<br>Needed</div>
            </div>
            <div class="value">
                <div class="head">16</div>
                <div class="label">Languages</div>
            </div>
        </div>

        <div class="cta-band">
            <div class="cta-text">
                <div class="offer">7 Days Free.<br>Cancel anytime.</div>
                <div class="offer-sub">Structured course path from beginner to advanced. Skill Tree, community, frame-by-frame breakdowns. Cancel in 2 clicks before day 8.</div>
                <div class="button">Grab Your 7-Day Free Trial</div>
                <div class="url">themamboguild.com</div>
            </div>
            <div class="qr-wrap">
                <div class="qr">__QR_SVG__</div>
                <div class="qr-caption">Scan to start</div>
            </div>
        </div>

        <div class="pitch">
            <strong>Not another video dump.</strong> A structured, gamified course path designed by a Certified Learning Experience Design Teacher.
        </div>

        <div class="footer">
            <span class="url">themamboguild.com</span>
        </div>
    </div>
</body>
</html>
"""


def main():
    print(f"Generating QR for: {QR_URL}")
    qr_svg = render_qr_svg(QR_URL)

    print(f"Embedding logo from: {LOGO_PATH}")
    logo_data_url = encode_logo_data_url()

    html = (
        HTML_TEMPLATE
        .replace("__QR_SVG__", qr_svg)
        .replace("__LOGO_DATA_URL__", logo_data_url)
    )

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Wrote {OUT_PATH}")
    print()
    print("Next steps:")
    print(f"  1. Open {OUT_PATH} in Chrome/Edge/Firefox")
    print("  2. File -> Print (Ctrl+P)")
    print("  3. Destination: Save as PDF")
    print("  4. Paper size: A4")
    print("  5. Margins: Default OR None")
    print("  6. Background graphics: ON (critical for the dark CTA band)")


if __name__ == "__main__":
    main()
