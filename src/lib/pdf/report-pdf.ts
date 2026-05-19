import { readFileSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";

const COLORS = {
  ink: "#111827",
  graphite: "#293241",
  muted: "#6B7280",
  mist: "#F7F8FA",
  line: "#E5E7EB",
  teal: "#2A9D8F",
  coral: "#D95D39",
  gold: "#E9C46A",
  white: "#FFFFFF"
};

const LABELS: Record<string, string> = {
  contexte_objectif: "Contexte & objectif",
  synthese_chiffree: "Synthèse chiffrée",
  global_score: "Score global",
  job_matching_score: "Matching poste",
  sincerity_index: "Indice de sincérité",
  coherence_index: "Indice de cohérence",
  block_scores: "Scores par bloc",
  soft_skill_scores: "Scores soft skills",
  hard_skill_score: "Score hard skills",
  risk_level: "Niveau de risque",
  recommendation: "Recommandation",
  final_opinion: "Avis final",
  qualitative: "Analyse qualitative",
  qualitative_observations: "Observations qualitatives",
  matching_evidence: "Indices de matching",
  risk_evidence: "Indices de risque",
  manager_fit_evidence: "Compatibilité manager",
  team_fit_evidence: "Compatibilité équipe",
  recommended_interview_questions: "Questions d'entretien recommandées",
  onboarding_focus: "Focus onboarding"
};

const HIDDEN_KEYS = new Set(["scoring_context", "generated_at"]);

export type ReportPdfMetadata = {
  candidate?: Record<string, unknown>;
  job?: Record<string, unknown>;
  company?: Record<string, unknown>;
};

export async function createReportPdfBuffer(input: Record<string, unknown>, title = "Rapport NeuroRecrut") {
  const report = cleanValue((input.reportJson as Record<string, unknown> | undefined) ?? input) as Record<string, unknown>;
  const analysis = cleanValue((input.analysisJson as Record<string, unknown> | undefined) ?? {}) as Record<string, unknown>;
  const metadata = (input.metadata as ReportPdfMetadata | undefined) ?? {};

  const doc = new PDFDocument({
    size: "A4",
    margin: 38,
    bufferPages: true,
    info: { Title: title, Creator: "NeuroRecrut" }
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  drawReport(doc, report, analysis, metadata, title);
  doc.end();
  return done;
}

function drawReport(
  doc: PDFKit.PDFDocument,
  report: Record<string, unknown>,
  analysis: Record<string, unknown>,
  metadata: ReportPdfMetadata,
  title: string
) {
  drawHeader(doc, title, metadata);
  drawScoreCards(doc, analysis);
  drawQuickRead(doc, analysis);
  drawScorePanels(doc, analysis);

  Object.entries(report).forEach(([key, value]) => {
    const cleaned = cleanValue(value, key);
    if (!isEmpty(cleaned)) drawSection(doc, labelize(key), cleaned);
  });

  drawFooter(doc);
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, metadata: ReportPdfMetadata) {
  const margin = left(doc);
  const logoPath = join(process.cwd(), "public", "neurorecrut-logo.png");

  try {
    doc.image(readFileSync(logoPath), margin, margin, { width: 165 });
  } catch {
    doc.font("Helvetica-Bold").fontSize(20).fillColor(COLORS.ink).text("NeuroRecrut", margin, margin);
  }

  doc.y = margin + 94;
  doc.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.ink).text(title, margin, doc.y, { width: contentWidth(doc) });
  doc.moveDown(0.25);
  doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(`Généré par NeuroRecrut · ${new Date().toLocaleDateString("fr-FR")}`);
  doc.moveDown(1.4);

  const groups = [
    ["Candidat", metadata.candidate ?? {}],
    ["Poste", metadata.job ?? {}],
    ["Entreprise", metadata.company ?? {}]
  ] as const;

  const gap = 12;
  const cardWidth = (contentWidth(doc) - gap * 2) / 3;
  ensureSpace(doc, 122);
  const top = doc.y;
  groups.forEach(([heading, data], index) => {
    drawMetadataCard(doc, margin + index * (cardWidth + gap), top, cardWidth, heading, data);
  });
  doc.y = top + 126;
}

function drawMetadataCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, data: Record<string, unknown>) {
  doc.roundedRect(x, y, width, 108, 8).fillAndStroke(COLORS.white, COLORS.line);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.coral).text(title.toUpperCase(), x + 12, y + 12, { width: width - 24 });
  let lineY = y + 34;

  Object.entries(data).slice(0, 5).forEach(([key, value]) => {
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.graphite).text(`${labelize(key)}: ${primitive(value)}`, x + 12, lineY, {
      width: width - 24,
      height: 15,
      ellipsis: true
    });
    lineY += 13;
  });
}

function drawScoreCards(doc: PDFKit.PDFDocument, analysis: Record<string, unknown>) {
  ensureSpace(doc, 108);
  const scores = [
    { label: "Global", value: numberValue(analysis.global_score), color: COLORS.teal, display: `${Math.round(numberValue(analysis.global_score))}/100` },
    { label: "Matching", value: numberValue(analysis.job_matching_score), color: COLORS.teal, display: `${Math.round(numberValue(analysis.job_matching_score))}/100` },
    { label: "Cohérence", value: numberValue(analysis.coherence_index), color: COLORS.gold, display: `${Math.round(numberValue(analysis.coherence_index))}/100` },
    {
      label: "Sincérité",
      value: Math.max(0, (numberValue(analysis.sincerity_index) + 10) * 5),
      color: COLORS.coral,
      display: `${Math.round(numberValue(analysis.sincerity_index))}/10`
    }
  ];

  const gap = 12;
  const cardWidth = (contentWidth(doc) - gap * 3) / 4;
  const top = doc.y;

  scores.forEach((score, index) => {
    const x = left(doc) + index * (cardWidth + gap);
    doc.roundedRect(x, top, cardWidth, 92, 8).fillAndStroke(COLORS.white, COLORS.line);
    doc.roundedRect(x, top, cardWidth, 6, 4).fill(score.color);
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted).text(score.label, x + 12, top + 21, { width: cardWidth - 24 });
    doc.font("Helvetica-Bold").fontSize(21).fillColor(COLORS.ink).text(score.display, x + 12, top + 42, { width: cardWidth - 24 });
    drawBar(doc, x + 12, top + 76, cardWidth - 24, score.value, score.color, false);
  });

  doc.y = top + 114;
}

function drawQuickRead(doc: PDFKit.PDFDocument, analysis: Record<string, unknown>) {
  ensureSpace(doc, 132);
  const top = doc.y;
  const margin = left(doc);
  const width = contentWidth(doc);

  doc.roundedRect(margin, top, width, 120, 8).fillAndStroke(COLORS.mist, COLORS.line);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.ink).text("Lecture rapide", margin + 16, top + 15);

  const bars = [
    ["Adéquation au poste", numberValue(analysis.job_matching_score), COLORS.teal],
    ["Robustesse globale", numberValue(analysis.global_score), COLORS.teal],
    ["Cohérence psychométrique", numberValue(analysis.coherence_index), COLORS.gold],
    ["Signal de sincérité", Math.max(0, (numberValue(analysis.sincerity_index) + 10) * 5), COLORS.coral]
  ] as const;

  const colWidth = (width - 46) / 2;
  bars.forEach(([label, value, color], index) => {
    const x = margin + 16 + (index % 2) * (colWidth + 14);
    const y = top + 48 + Math.floor(index / 2) * 35;
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.graphite).text(label, x, y, { width: colWidth - 42 });
    doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.ink).text(`${Math.round(value)}/100`, x + colWidth - 42, y, {
      width: 42,
      align: "right"
    });
    drawBar(doc, x, y + 15, colWidth, value, color, false);
  });

  doc.y = top + 144;
}

function drawScorePanels(doc: PDFKit.PDFDocument, analysis: Record<string, unknown>) {
  const blockScores = objectValue(analysis.block_scores);
  const softSkillScores = firstEntries(objectValue(analysis.soft_skill_scores), 8);
  if (!Object.keys(blockScores).length && !Object.keys(softSkillScores).length) return;

  const gap = 14;
  const panelWidth = (contentWidth(doc) - gap) / 2;
  const leftHeight = panelHeight(blockScores);
  const rightHeight = panelHeight(softSkillScores);
  ensureSpace(doc, Math.max(leftHeight, rightHeight) + 18);

  const top = doc.y;
  drawBarsPanel(doc, left(doc), top, panelWidth, "Scores par bloc", blockScores);
  drawBarsPanel(doc, left(doc) + panelWidth + gap, top, panelWidth, "Soft skills clés", softSkillScores);
  doc.y = top + Math.max(leftHeight, rightHeight) + 22;
}

function drawBarsPanel(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, values: Record<string, number>) {
  const height = panelHeight(values);
  doc.roundedRect(x, y, width, height, 8).fillAndStroke(COLORS.white, COLORS.line);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.ink).text(title, x + 14, y + 14, { width: width - 28 });

  let rowY = y + 42;
  Object.entries(values).forEach(([label, value]) => {
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.graphite).text(labelize(label), x + 14, rowY, {
      width: width - 72,
      height: 13,
      ellipsis: true
    });
    doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.ink).text(`${Math.round(value)}/100`, x + width - 56, rowY, {
      width: 42,
      align: "right"
    });
    drawBar(doc, x + 14, rowY + 15, width - 28, value, value >= 70 ? COLORS.teal : value >= 50 ? COLORS.gold : COLORS.coral, false);
    rowY += 32;
  });
}

function drawSection(doc: PDFKit.PDFDocument, title: string, value: unknown) {
  ensureSpace(doc, 74);
  const x = left(doc);
  const width = contentWidth(doc);
  const top = doc.y;

  doc.roundedRect(x, top, width, 34, 8).fillAndStroke(COLORS.mist, COLORS.line);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.ink).text(title, x + 14, top + 10, { width: width - 28 });
  doc.y = top + 48;

  renderValue(doc, value, x + 14, width - 28, 0);
  doc.y += 12;
}

function renderValue(doc: PDFKit.PDFDocument, value: unknown, x: number, width: number, depth: number) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item && typeof item === "object") {
        renderValue(doc, item, x, width, depth + 1);
      } else {
        paragraph(doc, `• ${primitive(item)}`, x, width, 9);
      }
    });
    return;
  }

  if (isNumericObject(value)) {
    Object.entries(value).forEach(([label, score]) => {
      drawFlowBar(doc, x, width, labelize(label), score);
    });
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      const cleaned = cleanValue(nested, key);
      if (HIDDEN_KEYS.has(key) || isEmpty(cleaned)) return;

      ensureSpace(doc, 34);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.coral).text(labelize(key).toUpperCase(), x, doc.y, {
        width
      });
      doc.y += 13;
      renderValue(doc, cleaned, x + Math.min(10, depth * 4), width - Math.min(10, depth * 4), depth + 1);
      doc.y += 4;
    });
    return;
  }

  paragraph(doc, primitive(value), x, width, 9);
}

function paragraph(doc: PDFKit.PDFDocument, text: string, x: number, width: number, size: number) {
  const options = { width, lineGap: 3 };
  doc.font("Helvetica").fontSize(size).fillColor(COLORS.graphite);
  const height = doc.heightOfString(text, options);
  ensureSpace(doc, Math.min(height + 8, 220));
  doc.text(text, x, doc.y, options);
  doc.y += 4;
}

function drawFlowBar(doc: PDFKit.PDFDocument, x: number, width: number, label: string, value: number) {
  ensureSpace(doc, 34);
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.graphite).text(label, x, doc.y, { width: width - 50 });
  doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.ink).text(`${Math.round(value)}/100`, x + width - 44, doc.y - 9, {
    width: 44,
    align: "right"
  });
  drawBar(doc, x, doc.y + 5, width, value, value >= 70 ? COLORS.teal : value >= 50 ? COLORS.gold : COLORS.coral, false);
  doc.y += 20;
}

function drawBar(doc: PDFKit.PDFDocument, x: number, y: number, width: number, value: number, color: string, showValue = true) {
  const score = Math.max(0, Math.min(100, Math.round(value)));
  doc.roundedRect(x, y, width, 6, 3).fill(COLORS.line);
  doc.roundedRect(x, y, Math.max(2, Math.round((width * score) / 100)), 6, 3).fill(color);
  if (showValue) {
    doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.ink).text(`${score}/100`, x + width - 40, y - 11, { width: 40, align: "right" });
  }
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc.font("Helvetica").fontSize(7).fillColor(COLORS.muted).text(
      `NeuroRecrut · Rapport confidentiel · Page ${index + 1}/${range.count}`,
      left(doc),
      doc.page.height - 28,
      { width: contentWidth(doc), align: "center" }
    );
  }
}

function cleanValue(value: unknown, key?: string): unknown {
  if (key === "synthese_chiffree" && value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return {
      global_score: source.global_score,
      job_matching_score: source.job_matching_score,
      sincerity_index: source.sincerity_index,
      coherence_index: source.coherence_index,
      hard_skill_score: source.hard_skill_score,
      risk_level: source.risk_level,
      recommendation: source.recommendation,
      final_opinion: source.final_opinion
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => cleanValue(item)).filter((item) => !isEmpty(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([nestedKey]) => !HIDDEN_KEYS.has(nestedKey))
        .map(([nestedKey, nested]) => [nestedKey, cleanValue(nested, nestedKey)] as const)
        .filter(([, nested]) => !isEmpty(nested))
    );
  }

  return value;
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number) {
  if (doc.y + height > bottom(doc)) {
    doc.addPage();
  }
}

function panelHeight(values: Record<string, number>) {
  return Math.max(86, 44 + Object.keys(values).length * 32);
}

function labelize(key: string) {
  const mapped = LABELS[key] ?? key.replace(/_/g, " ");
  return mapped
    .split(" ")
    .map((word) => (word.length ? `${word.charAt(0).toLocaleUpperCase("fr-FR")}${word.slice(1)}` : word))
    .join(" ")
    .replace(/\bRh\b/g, "RH");
}

function primitive(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Non renseigné";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !HIDDEN_KEYS.has(key))
      .map(([key, nested]) => `${labelize(key)}: ${primitive(nested)}`)
      .join(" · ");
  }
  return String(value);
}

function isNumericObject(value: unknown): value is Record<string, number> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value)) &&
    Object.values(value as Record<string, unknown>).every((item) => typeof item === "number");
}

function objectValue(value: unknown): Record<string, number> {
  return isNumericObject(value) ? value : {};
}

function firstEntries(value: Record<string, number>, count: number) {
  return Object.fromEntries(Object.entries(value).slice(0, count));
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isEmpty(value: unknown) {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function left(doc: PDFKit.PDFDocument) {
  return doc.page.margins.left;
}

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function bottom(doc: PDFKit.PDFDocument) {
  return doc.page.height - doc.page.margins.bottom - 30;
}
