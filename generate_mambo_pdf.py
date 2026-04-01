"""
Mambo History Course — PDF Generator
Renders all 20 module markdown files into a single beautifully-styled PDF.
"""

import os
import re
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

# ─── Colour Palette ───────────────────────────────────────────────────────────
DEEP_BURGUNDY   = colors.HexColor("#3D0C11")   # header / title bg
RICH_GOLD       = colors.HexColor("#C9963B")   # accent / headings
WARM_CREAM      = colors.HexColor("#FBF5E6")   # page bg (cosmetic only)
DARK_CHARCOAL   = colors.HexColor("#1E1E1E")   # body text
MEDIUM_GRAY     = colors.HexColor("#6B6B6B")   # secondary text
LIGHT_SAND      = colors.HexColor("#F5EDD8")   # table row alt
ACCENT_RED      = colors.HexColor("#8B1A1A")   # quiz answer highlights
BORDER_GOLD     = colors.HexColor("#D4A843")   # table borders
LIGHT_GOLD_FILL = colors.HexColor("#FFF3D0")   # callout boxes / quiz header

W, H = A4
MARGIN = 2.2 * cm

# ─── Page Template ────────────────────────────────────────────────────────────
class MamboPageTemplate:
    def __init__(self, total_pages_holder):
        self.total = total_pages_holder

    def on_page(self, canv, doc):
        canv.saveState()
        page = doc.page

        # Header bar
        canv.setFillColor(DEEP_BURGUNDY)
        canv.rect(0, H - 1.4 * cm, W, 1.4 * cm, fill=1, stroke=0)

        canv.setFont("Helvetica-Bold", 9)
        canv.setFillColor(RICH_GOLD)
        canv.drawString(MARGIN, H - 0.85 * cm, "THE MAMBO HISTORY COURSE")

        canv.setFont("Helvetica", 8)
        canv.setFillColor(colors.white)
        canv.drawRightString(W - MARGIN, H - 0.85 * cm,
                             "Based on McMains · Spinning Mambo into Salsa")

        # Footer
        canv.setFillColor(DEEP_BURGUNDY)
        canv.rect(0, 0, W, 1.1 * cm, fill=1, stroke=0)

        canv.setFont("Helvetica", 8)
        canv.setFillColor(RICH_GOLD)
        canv.drawCentredString(W / 2, 0.38 * cm, f"— {page} —")

        # Thin gold rule under header
        canv.setStrokeColor(RICH_GOLD)
        canv.setLineWidth(1.5)
        canv.line(MARGIN, H - 1.4 * cm - 1, W - MARGIN, H - 1.4 * cm - 1)

        # Thin gold rule above footer
        canv.line(MARGIN, 1.1 * cm + 1, W - MARGIN, 1.1 * cm + 1)

        canv.restoreState()


# ─── Style Definitions ────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles["cover_title"] = ParagraphStyle(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=36,
        textColor=colors.white,
        alignment=TA_CENTER,
        leading=42,
        spaceAfter=12,
    )
    styles["cover_subtitle"] = ParagraphStyle(
        "cover_subtitle",
        fontName="Helvetica",
        fontSize=14,
        textColor=RICH_GOLD,
        alignment=TA_CENTER,
        leading=20,
        spaceAfter=6,
    )
    styles["cover_tagline"] = ParagraphStyle(
        "cover_tagline",
        fontName="Helvetica-Oblique",
        fontSize=11,
        textColor=colors.HexColor("#D4C5A0"),
        alignment=TA_CENTER,
        leading=16,
    )

    styles["module_title"] = ParagraphStyle(
        "module_title",
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=colors.white,
        alignment=TA_LEFT,
        leading=26,
        spaceAfter=6,
    )
    styles["section_heading"] = ParagraphStyle(
        "section_heading",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=RICH_GOLD,
        alignment=TA_LEFT,
        leading=18,
        spaceBefore=14,
        spaceAfter=5,
    )
    styles["sub_heading"] = ParagraphStyle(
        "sub_heading",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=DEEP_BURGUNDY,
        alignment=TA_LEFT,
        leading=15,
        spaceBefore=8,
        spaceAfter=4,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK_CHARCOAL,
        alignment=TA_JUSTIFY,
        leading=15,
        spaceAfter=7,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK_CHARCOAL,
        alignment=TA_LEFT,
        leading=15,
        leftIndent=16,
        spaceAfter=4,
        bulletIndent=4,
    )
    styles["quiz_q"] = ParagraphStyle(
        "quiz_q",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DEEP_BURGUNDY,
        alignment=TA_LEFT,
        leading=14,
        spaceBefore=10,
        spaceAfter=3,
    )
    styles["quiz_option"] = ParagraphStyle(
        "quiz_option",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK_CHARCOAL,
        alignment=TA_LEFT,
        leading=14,
        leftIndent=16,
        spaceAfter=2,
    )
    styles["quiz_answer"] = ParagraphStyle(
        "quiz_answer",
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        textColor=ACCENT_RED,
        alignment=TA_LEFT,
        leading=14,
        leftIndent=16,
        spaceAfter=6,
    )
    styles["watch_link"] = ParagraphStyle(
        "watch_link",
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#1A5276"),
        alignment=TA_LEFT,
        leading=15,
        leftIndent=12,
        spaceAfter=5,
    )
    styles["toc_module"] = ParagraphStyle(
        "toc_module",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=DEEP_BURGUNDY,
        leading=16,
        spaceAfter=2,
    )
    styles["toc_title"] = ParagraphStyle(
        "toc_title",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK_CHARCOAL,
        leading=14,
        leftIndent=20,
        spaceAfter=6,
    )

    return styles


# ─── Markdown → ReportLab Conversion ─────────────────────────────────────────
def inline_md(text):
    """Convert inline markdown (**bold**, *italic*, `code`) to ReportLab XML."""
    # Escape existing XML chars first (except ones we'll introduce)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold-italic ***...***
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', text)
    # Bold **...**
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Italic *...*
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    # Inline code `...`
    text = re.sub(r'`(.+?)`', r'<font name="Courier" size="9">\1</font>', text)
    return text


def parse_module(filepath, styles):
    """Parse a module .md file and return a list of ReportLab flowables."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.splitlines()
    flowables = []

    # ── Module title (# heading) ──────────────────────────────────────────────
    module_title = ""
    for line in lines:
        if line.startswith("# "):
            module_title = line[2:].strip()
            break

    # Burgundy title banner
    title_data = [[Paragraph(inline_md(module_title), styles["module_title"])]]
    title_table = Table(title_data, colWidths=[W - 2 * MARGIN])
    title_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DEEP_BURGUNDY),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("BOX", (0, 0), (-1, -1), 2, RICH_GOLD),
    ]))
    flowables.append(title_table)
    flowables.append(Spacer(1, 10))

    # ── Line-by-line parsing ──────────────────────────────────────────────────
    i = 0
    in_table = False
    table_rows = []
    in_knowledge = False
    quiz_block = []    # accumulate lines for one quiz question

    def flush_quiz(block, flowables, styles):
        if not block:
            return
        # We have lines: Q line, options, answer line
        q_lines = []
        opt_lines = []
        ans_lines = []
        for ln in block:
            if re.match(r'\*\*\d+\.', ln):
                q_lines.append(ln.strip("*").strip())
            elif re.match(r'[A-D]\)', ln):
                opt_lines.append(ln)
            elif ln.startswith("*Correct") or ln.startswith("*correct"):
                ans_lines.append(ln.strip("*").strip())

        if q_lines:
            flowables.append(Paragraph(inline_md(" ".join(q_lines)), styles["quiz_q"]))
        for o in opt_lines:
            flowables.append(Paragraph(inline_md(o), styles["quiz_option"]))
        for a in ans_lines:
            flowables.append(Paragraph("✓ " + inline_md(a), styles["quiz_answer"]))

    while i < len(lines):
        line = lines[i].rstrip()

        # Skip the top-level # heading (already handled)
        if line.startswith("# "):
            i += 1
            continue

        # ── Section headings ## ───────────────────────────────────────────────
        if line.startswith("## "):
            heading_text = line[3:].strip()
            # Remove emoji prefixes for cleaner look
            heading_text = re.sub(r'^[📺📚🎵🎶🎬]\s*', '', heading_text)
            flowables.append(Spacer(1, 4))
            flowables.append(HRFlowable(
                width="100%", thickness=1.5, color=RICH_GOLD, spaceAfter=4
            ))
            flowables.append(Paragraph(inline_md(heading_text), styles["section_heading"]))

            # Track Knowledge Check section
            in_knowledge = "Knowledge Check" in heading_text
            i += 1
            continue

        # ── Sub-headings ### ──────────────────────────────────────────────────
        if line.startswith("### "):
            heading_text = line[4:].strip()
            flowables.append(Paragraph(inline_md(heading_text), styles["sub_heading"]))
            i += 1
            continue

        if line.startswith("#### "):
            heading_text = line[5:].strip()
            flowables.append(Paragraph(inline_md(heading_text), styles["sub_heading"]))
            i += 1
            continue

        # ── Horizontal rule ---
        if re.match(r'^-{3,}$', line):
            flowables.append(Spacer(1, 4))
            flowables.append(HRFlowable(
                width="100%", thickness=0.5, color=MEDIUM_GRAY, spaceAfter=4
            ))
            i += 1
            continue

        # ── Markdown table ────────────────────────────────────────────────────
        if line.startswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            # Skip separator rows like |---|---|
            if re.match(r'^\|[-| :]+\|$', line):
                i += 1
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            table_rows.append(cells)
            i += 1
            # Peek: if next non-empty line isn't a table row, flush
            j = i
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j >= len(lines) or not lines[j].startswith("|"):
                # Flush table
                in_table = False
                if table_rows:
                    col_count = max(len(r) for r in table_rows)
                    # Normalise rows
                    table_rows = [r + [""] * (col_count - len(r)) for r in table_rows]

                    # Determine column widths
                    usable = W - 2 * MARGIN
                    if col_count == 2:
                        col_widths = [usable * 0.35, usable * 0.65]
                    else:
                        col_widths = [usable / col_count] * col_count

                    pdf_rows = []
                    for ri, row in enumerate(table_rows):
                        pdf_row = []
                        for ci, cell in enumerate(row):
                            is_header = ri == 0
                            st = ParagraphStyle(
                                "tc",
                                fontName="Helvetica-Bold" if is_header else "Helvetica",
                                fontSize=9,
                                textColor=colors.white if is_header else DARK_CHARCOAL,
                                leading=13,
                            )
                            pdf_row.append(Paragraph(inline_md(cell), st))
                        pdf_rows.append(pdf_row)

                    t = Table(pdf_rows, colWidths=col_widths, repeatRows=1)
                    ts = TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), DEEP_BURGUNDY),
                        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
                         [colors.white, LIGHT_SAND]),
                        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GOLD),
                        ("TOPPADDING",    (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ])
                    t.setStyle(ts)
                    flowables.append(Spacer(1, 6))
                    flowables.append(t)
                    flowables.append(Spacer(1, 8))
                table_rows = []
            continue

        # ── Watch & Listen links 🎬 ───────────────────────────────────────────
        if "🎬" in line or "youtube.com" in line.lower():
            # Extract display text and URL
            md_link_match = re.search(r'\[(.+?)\]\((.+?)\)', line)
            if md_link_match:
                label = md_link_match.group(1)
                url = md_link_match.group(2)
                safe_label = label.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                safe_url = url.replace("&", "&amp;")
                link_para = Paragraph(
                    f'🎬 <link href="{safe_url}" color="#1A5276"><u>{safe_label}</u></link>',
                    styles["watch_link"]
                )
                flowables.append(link_para)
            else:
                text_clean = line.strip().lstrip("🎬 ")
                if text_clean:
                    flowables.append(Paragraph(inline_md(text_clean), styles["watch_link"]))
            i += 1
            continue

        # ── Knowledge Check Quiz questions ────────────────────────────────────
        if in_knowledge:
            # Detect bold-number question
            if re.match(r'\*\*\d+\.', line):
                flush_quiz(quiz_block, flowables, styles)
                quiz_block = [line]
            elif re.match(r'[A-D]\)', line) or line.startswith("*Correct") or line.startswith("*correct"):
                quiz_block.append(line)
            elif line.strip() == "":
                pass
            else:
                if quiz_block:
                    quiz_block.append(line)
            i += 1
            continue

        # ── Bullet / numbered list ─────────────────────────────────────────────
        if re.match(r'^[-*•]\s', line):
            content = line[2:].strip()
            flowables.append(Paragraph("• " + inline_md(content), styles["bullet"]))
            i += 1
            continue

        if re.match(r'^\d+\.\s', line):
            content = re.sub(r'^\d+\.\s', '', line).strip()
            num = re.match(r'^(\d+)\.', line).group(1)
            flowables.append(Paragraph(f"{num}. " + inline_md(content), styles["bullet"]))
            i += 1
            continue

        # ── Empty line ────────────────────────────────────────────────────────
        if line.strip() == "":
            flowables.append(Spacer(1, 3))
            i += 1
            continue

        # ── Regular paragraph ─────────────────────────────────────────────────
        flowables.append(Paragraph(inline_md(line), styles["body"]))
        i += 1

    # Flush any remaining quiz block
    flush_quiz(quiz_block, flowables, styles)

    return flowables


# ─── Cover Page ───────────────────────────────────────────────────────────────
def build_cover(styles):
    flowables = []

    # Big spacer to push content to vertical center-ish
    flowables.append(Spacer(1, 3.5 * cm))

    # Gold ornament line
    flowables.append(HRFlowable(
        width="70%", thickness=2, color=RICH_GOLD,
        hAlign="CENTER", spaceAfter=20
    ))

    flowables.append(Paragraph("THE MAMBO HISTORY COURSE", styles["cover_title"]))
    flowables.append(Spacer(1, 0.4 * cm))
    flowables.append(Paragraph("20 Modules · A Complete Academic Journey", styles["cover_subtitle"]))
    flowables.append(Spacer(1, 0.6 * cm))
    flowables.append(Paragraph(
        "From the Afro-Cuban roots of Son and Danzón to the global empire of Salsa,<br/>"
        "tracing the rhythm that changed the world.",
        styles["cover_tagline"]
    ))

    flowables.append(Spacer(1, 1.2 * cm))
    flowables.append(HRFlowable(
        width="70%", thickness=2, color=RICH_GOLD,
        hAlign="CENTER", spaceAfter=20
    ))

    flowables.append(Spacer(1, 0.8 * cm))
    source_style = ParagraphStyle(
        "source", fontName="Helvetica-Oblique", fontSize=10,
        textColor=MEDIUM_GRAY, alignment=TA_CENTER, leading=16,
    )
    flowables.append(Paragraph(
        "Based on: <b>McMains, Juliet.</b> <i>Spinning Mambo into Salsa:<br/>"
        "Caribbean Dance in Global Commerce.</i> Oxford University Press, 2015.",
        source_style
    ))

    flowables.append(Spacer(1, 2 * cm))

    date_style = ParagraphStyle(
        "date", fontName="Helvetica", fontSize=9,
        textColor=MEDIUM_GRAY, alignment=TA_CENTER,
    )
    flowables.append(Paragraph("© 2026 · The Mambo Inn", date_style))

    flowables.append(PageBreak())
    return flowables


# ─── Table of Contents ────────────────────────────────────────────────────────
def build_toc_page(module_titles, styles):
    flowables = []

    flowables.append(Spacer(1, 0.3 * cm))

    toc_header_style = ParagraphStyle(
        "toc_header",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=DEEP_BURGUNDY,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    flowables.append(Paragraph("Table of Contents", toc_header_style))
    flowables.append(HRFlowable(
        width="100%", thickness=1.5, color=RICH_GOLD, spaceAfter=16
    ))

    for idx, title in enumerate(module_titles, start=1):
        # Extract short title after the colon if present
        short = title.split(":", 1)[1].strip() if ":" in title else title
        row_bg = LIGHT_GOLD_FILL if idx % 2 == 0 else colors.white

        num_style = ParagraphStyle(
            "toc_num", fontName="Helvetica-Bold", fontSize=11,
            textColor=RICH_GOLD, leading=15,
        )
        title_style = ParagraphStyle(
            "toc_t", fontName="Helvetica", fontSize=10,
            textColor=DARK_CHARCOAL, leading=15,
        )

        num_para  = Paragraph(f"Module {idx:02d}", num_style)
        title_para = Paragraph(inline_md(short), title_style)

        row = [[num_para, title_para]]
        t = Table(row, colWidths=[2.8 * cm, W - 2 * MARGIN - 2.8 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), row_bg),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, BORDER_GOLD),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        flowables.append(t)

    flowables.append(PageBreak())
    return flowables


# ─── Main Build ───────────────────────────────────────────────────────────────
def main():
    course_dir = Path(r"c:\Users\pavle\Desktop\salsa_lab_v2\mambo_course")
    out_pdf = course_dir.parent / "Mambo_History_Course.pdf"

    # Collect module files in order
    module_files = sorted(
        [f for f in course_dir.glob("module_*.md")],
        key=lambda f: int(re.search(r'module_(\d+)', f.name).group(1))
    )
    print(f"Found {len(module_files)} module files.")

    styles = build_styles()

    # Read module titles for TOC
    module_titles = []
    for mf in module_files:
        text = mf.read_text(encoding="utf-8")
        for line in text.splitlines():
            if line.startswith("# "):
                module_titles.append(line[2:].strip())
                break

    # Build document
    total = [0]
    page_template = MamboPageTemplate(total)

    doc = SimpleDocTemplate(
        str(out_pdf),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=1.8 * cm,
        bottomMargin=1.6 * cm,
        title="The Mambo History Course",
        author="The Mambo Inn",
        subject="Mambo and Salsa History — 20 Modules",
    )

    story = []

    # Cover
    story += build_cover(styles)

    # Table of Contents
    story += build_toc_page(module_titles, styles)

    # Modules
    for idx, mf in enumerate(module_files, start=1):
        print(f"  Parsing Module {idx}: {mf.name} …")
        module_flowables = parse_module(mf, styles)
        story += module_flowables
        if idx < len(module_files):
            story.append(PageBreak())

    # Build PDF
    doc.build(story, onFirstPage=page_template.on_page,
              onLaterPages=page_template.on_page)

    print(f"\n✅ PDF saved to: {out_pdf}")


if __name__ == "__main__":
    main()
