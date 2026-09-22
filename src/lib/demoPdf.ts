/**
 * Tiny client-side PDF generator used by the offline showcase.
 *
 * No backend is involved — the exported "audit trail" is a small, valid PDF
 * built entirely in the browser so the export UX can be demoed.
 */

function sanitize(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(text: string): string {
  return sanitize(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function buildDemoPdf(lines: string[]): Blob {
  const wrapped: string[] = [];
  for (const raw of lines) {
    const line = sanitize(raw);
    if (line.length <= 96) {
      wrapped.push(line);
    } else {
      for (let i = 0; i < line.length; i += 96) {
        wrapped.push(line.slice(i, i + 96));
      }
    }
  }

  const body =
    "BT\n" +
    "/F1 9 Tf\n" +
    "50 780 Td\n" +
    "14 TL\n" +
    wrapped.map((line) => `(${escapePdfText(line)}) Tj\nT*`).join("\n") +
    "\nET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
