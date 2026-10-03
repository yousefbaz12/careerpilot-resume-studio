import type { ResumeJSON } from "@/lib/resume-schema";

const escapeLatex = (value: string) => value
  .replace(/\\/g, "\\textbackslash{}")
  .replace(/([#$%&_{}])/g, "\\$1")
  .replace(/~/g, "\\textasciitilde{}")
  .replace(/\^/g, "\\textasciicircum{}");

const bullets = (items: string[]) => `\\begin{itemize}[leftmargin=*,nosep]\n${items.map((item) => `  \\item ${escapeLatex(item)}`).join("\n")}\n\\end{itemize}`;

function renderSection(key: ResumeJSON["sectionOrder"][number], resume: ResumeJSON) {
  switch (key) {
    case "summary": return `\\section*{Professional Summary}\n${escapeLatex(resume.summary)}`;
    case "skills": return `\\section*{Technical Skills}\n${resume.skills.map(escapeLatex).join(" \\textbar{} ")}`;
    case "experience": return `\\section*{Professional Experience}\n${resume.experience.map((item) => `\\textbf{${escapeLatex(item.role)}} \\hfill ${escapeLatex(item.dates)}\\\\\n\\textit{${escapeLatex(item.company)}}\n${bullets(item.bullets)}`).join("\n")}`;
    case "projects": return `\\section*{Research \\& Projects}\n${resume.projects.map((item) => `\\textbf{${escapeLatex(item.name)}} \\hfill ${escapeLatex(item.dates)}\\\\\n\\textit{${item.stack.map(escapeLatex).join(", ")}}\n${bullets(item.bullets)}`).join("\n")}`;
    case "education": return `\\section*{Education}\n${resume.education.map((item) => `\\textbf{${escapeLatex(item.degree)}} \\hfill ${escapeLatex(item.dates)}\\\\\n\\textit{${escapeLatex(item.school)}}`).join("\n\n")}`;
    case "certifications": return `\\section*{Certifications}\n${bullets(resume.certifications)}`;
    case "awards": return `\\section*{Awards \\& Achievements}\n${bullets(resume.awards)}`;
    case "interests": return `\\section*{Research Interests}\n${resume.interests.map(escapeLatex).join(" \\textbar{} ")}`;
  }
}

export function generateResumeLatex(resume: ResumeJSON) {
  const contact = [resume.personal.phone, resume.personal.email, resume.personal.location].map(escapeLatex).join(" \\textbar{} ");
  return `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.55in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\titlespacing*{\\section}{0pt}{5pt}{2pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{${escapeLatex(resume.personal.name)}}}\\\\
${escapeLatex(resume.personal.title)}\\\\
${contact}\\\\
${resume.personal.links.map(escapeLatex).join(" \\textbar{} ")}
\\end{center}
${resume.sectionOrder.map((key) => renderSection(key, resume)).join("\n")}
\\end{document}`;
}
