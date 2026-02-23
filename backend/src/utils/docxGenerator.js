const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

async function generateDocx(text) {
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  const children = lines.map((line) => {
    const trimmed = line.trim();

    // Linhas com ## viram títulos
    if (trimmed.startsWith("## ")) {
      return new Paragraph({
        text: trimmed.replace("## ", ""),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      });
    }

    // Linhas com # viram título principal
    if (trimmed.startsWith("# ")) {
      return new Paragraph({
        text: trimmed.replace("# ", ""),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      });
    }

    // Linhas com ** viram negrito
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return new Paragraph({
        children: [
          new TextRun({
            text: trimmed.replace(/\*\*/g, ""),
            bold: true,
          }),
        ],
        spacing: { before: 150, after: 150 },
      });
    }

    // Parágrafo normal
    return new Paragraph({
      children: [
        new TextRun({
          text: trimmed,
          size: 24, // 12pt
          font: "Arial",
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 100, after: 100 },
      indent: { firstLine: 720 }, // recuo de parágrafo
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 2.5cm
              bottom: 1440,
              left: 1800,   // 3cm
              right: 1440,  // 2.5cm
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

module.exports = { generateDocx };