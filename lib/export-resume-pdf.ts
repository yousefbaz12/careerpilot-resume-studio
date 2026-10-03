import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type PdfExperience = { role: string; company: string; dates: string; bullets: string };
export type PdfProject = { name: string; stack: string; dates: string; description: string };
export type PdfEducation = { degree: string; school: string; dates: string };
export type PdfSectionKey = "summary" | "skills" | "experience" | "projects" | "education" | "certifications" | "awards" | "interests";

export type ResumePdfData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  skills: string[];
  experiences: PdfExperience[];
  projects: PdfProject[];
  education: PdfEducation[];
  certifications: string[];
  awards: string[];
  interests: string;
  sectionOrder?: PdfSectionKey[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 38;
const BODY_SIZE = 9.2;
const BODY_LINE = 10.6;

export async function createResumePdf(data: ResumePdfData) {
  const document = await PDFDocument.create();
  document.setTitle(`${data.name} - Resume`);
  document.setAuthor(data.name);
  document.setSubject("Professional resume");
  document.setCreator("CareerPilot Resume Studio");

  const regular = await document.embedFont(StandardFonts.TimesRoman);
  const bold = await document.embedFont(StandardFonts.TimesRomanBold);
  const italic = await document.embedFont(StandardFonts.TimesRomanItalic);
  const blue = rgb(0.02, 0.24, 0.54);
  const black = rgb(0.06, 0.06, 0.08);

  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 38;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - 38;
  };

  const ensure = (height: number) => {
    if (y - height < 34) addPage();
  };

  const drawCentered = (text: string, font: PDFFont, size: number, color = black) => {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: Math.max(MARGIN, (PAGE_WIDTH - width) / 2), y, size, font, color });
  };

  const wrap = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    const words = cleanText(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const paragraph = (text: string, options: { font?: PDFFont; size?: number; indent?: number; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const font = options.font ?? regular;
    const size = options.size ?? BODY_SIZE;
    const indent = options.indent ?? 0;
    const lines = wrap(text, font, size, PAGE_WIDTH - MARGIN * 2 - indent);
    for (const line of lines) {
      ensure(BODY_LINE);
      page.drawText(line, { x: MARGIN + indent, y, size, font, color: options.color ?? black });
      y -= BODY_LINE;
    }
    y -= options.gap ?? 2;
  };

  const section = (title: string) => {
    ensure(28);
    y -= 3;
    page.drawText(title, { x: MARGIN, y, size: 12.2, font: bold, color: black });
    page.drawLine({ start: { x: MARGIN, y: y - 2 }, end: { x: PAGE_WIDTH - MARGIN, y: y - 2 }, thickness: 0.65, color: black });
    y -= 14;
  };

  const datedHeading = (heading: string, dates: string, color = black) => {
    ensure(18);
    const dateWidth = regular.widthOfTextAtSize(cleanText(dates), BODY_SIZE);
    page.drawText(cleanText(heading), { x: MARGIN, y, size: BODY_SIZE + 0.2, font: bold, color });
    page.drawText(cleanText(dates), { x: PAGE_WIDTH - MARGIN - dateWidth, y, size: BODY_SIZE, font: regular, color: black });
    y -= BODY_LINE;
  };

  const bullet = (text: string) => {
    const lines = wrap(text, regular, BODY_SIZE, PAGE_WIDTH - MARGIN * 2 - 15);
    for (let index = 0; index < lines.length; index += 1) {
      ensure(BODY_LINE);
      if (index === 0) page.drawCircle({ x: MARGIN + 4, y: y + 3.2, size: 1.25, color: black });
      page.drawText(lines[index], { x: MARGIN + 13, y, size: BODY_SIZE, font: regular, color: black });
      y -= BODY_LINE;
    }
    y -= 0.3;
  };

  drawCentered(cleanText(data.name), bold, 25);
  y -= 21;
  drawCentered(cleanText(data.title), regular, 11);
  y -= 14;
  drawCentered([data.phone, data.email, data.location].filter(Boolean).map(cleanText).join("  |  "), regular, 8.7);
  y -= 12;
  if (data.links) {
    drawCentered(cleanText(data.links), regular, 8.7, blue);
    y -= 15;
  } else y -= 4;

  const renderers: Record<PdfSectionKey, () => void> = {
    summary: () => { section("Professional Summary"); paragraph(data.summary); },
    skills: () => { section("Technical Skills"); paragraph(data.skills.join(" | ")); },
    experience: () => {
      section("Professional Experience");
      for (const item of data.experiences) {
        datedHeading(item.role, item.dates);
        paragraph(item.company, { font: italic, gap: 1 });
        for (const line of item.bullets.split("\n").filter(Boolean)) bullet(line);
        y -= 2;
      }
    },
    projects: () => {
      section("Research & Projects");
      for (const item of data.projects) {
        datedHeading(item.name, item.dates, blue);
        paragraph(item.stack, { font: italic, gap: 1 });
        const projectLines = item.description.split("\n").filter(Boolean);
        if (projectLines.length > 1) {
          for (const line of projectLines) bullet(line);
          y -= 2;
        } else paragraph(item.description, { gap: 4 });
      }
    },
    education: () => {
      section("Education");
      for (const item of data.education) {
        datedHeading(item.degree, item.dates);
        paragraph(item.school, { font: italic, gap: 3 });
      }
    },
    certifications: () => {
      if (!data.certifications.some(Boolean)) return;
      section("Certifications");
      for (const item of data.certifications.filter(Boolean)) bullet(item);
    },
    awards: () => {
      if (!data.awards.some(Boolean)) return;
      section("Awards & Achievements");
      for (const item of data.awards.filter(Boolean)) bullet(item);
    },
    interests: () => {
      if (!data.interests) return;
      section("Research Interests");
      paragraph(data.interests);
    },
  };

  const defaultOrder: PdfSectionKey[] = ["summary", "skills", "experience", "projects", "education", "certifications", "awards", "interests"];
  for (const key of data.sectionOrder ?? defaultOrder) renderers[key]();

  return document.save();
}

export async function downloadResumePdf(data: ResumePdfData) {
  const bytes = await createResumePdf(data);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(data.name || "resume")}-Resume.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function cleanText(value: string) {
  return value.replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
}
