import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle,
  WidthType, ShadingType
} from "docx";
import { saveAs } from "file-saver";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, bold = false, shade = null) {
  return new TableCell({
    borders,
    width: { size: 4680, type: WidthType.DXA },
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), bold, font: "Arial", size: 22 })],
      }),
    ],
  });
}

export async function downloadReport(data, filename = "FinCore-Analysis") {
  const riskColor =
    data.riskLevel === "Low" ? "00B050" :
    data.riskLevel === "High" ? "C00000" : "ED7D31";

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
          paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "2E5FA3" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [

        // ── Title ──────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: "FinCore Contract Analysis Report", bold: true, size: 40, font: "Arial", color: "1F3864" })],
          spacing: { after: 80 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E5FA3", space: 1 } },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, size: 20, font: "Arial", color: "888888" })],
          spacing: { after: 400 },
        }),

        // ── Risk Score ─────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Risk Assessment")] }),
        new Paragraph({
          children: [
            new TextRun({ text: "Overall Risk Score: ", bold: true, font: "Arial", size: 24 }),
            new TextRun({ text: `${data.riskScore}/100`, bold: true, font: "Arial", size: 24, color: riskColor }),
            new TextRun({ text: `   [${data.riskLevel} Risk]`, bold: true, font: "Arial", size: 24, color: riskColor }),
          ],
          spacing: { after: 160 },
        }),

        // ── Summary ────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Plain-Language Summary")] }),
        new Paragraph({
          children: [new TextRun({ text: data.summary || "", font: "Arial", size: 22 })],
          spacing: { after: 320 },
        }),

        // ── Clauses ────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Key Clauses")] }),
        ...(data.clauses || []).flatMap((c) => {
          const tagColor = c.type === "risk" ? "C00000" : c.type === "positive" ? "00B050" : "2E5FA3";
          const prefix   = c.type === "risk" ? "⚠ RISK" : c.type === "positive" ? "✓ POSITIVE" : "→ NEUTRAL";
          return [
            new Paragraph({
              children: [
                new TextRun({ text: `${prefix}: `, bold: true, color: tagColor, font: "Arial", size: 22 }),
                new TextRun({ text: c.tag, bold: true, font: "Arial", size: 22 }),
              ],
              spacing: { before: 160, after: 60 },
            }),
            new Paragraph({
              children: [new TextRun({ text: c.text, font: "Arial", size: 22, color: "444444" })],
              spacing: { after: 120 },
              indent: { left: 360 },
            }),
          ];
        }),

        // ── Financials ─────────────────────────────────────
        ...(data.financials?.length > 0 ? [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Financial Breakdown")] }),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [3120, 3120, 3120],
            rows: [
              new TableRow({
                children: [
                  cell("Item", true, "D5E8F0"),
                  cell("Value", true, "D5E8F0"),
                  cell("Note", true, "D5E8F0"),
                ],
              }),
              ...(data.financials || []).map((f) =>
                new TableRow({
                  children: [cell(f.label), cell(f.value), cell(f.note || "")],
                })
              ),
            ],
          }),
          new Paragraph({ children: [new TextRun("")], spacing: { after: 320 } }),
        ] : []),

        // ── Recommendation ─────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("FinCore Recommendation")] }),
        new Paragraph({
          children: [new TextRun({ text: data.recommendation || "", font: "Arial", size: 22 })],
          spacing: { after: 320 },
          shading: { fill: "EBF5FB", type: ShadingType.CLEAR },
        }),

        // ── Footer note ────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: "This report was generated by FinCore AI. It is for informational purposes only and does not constitute legal advice.", size: 18, color: "AAAAAA", font: "Arial", italics: true })],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}-${Date.now()}.docx`);
}