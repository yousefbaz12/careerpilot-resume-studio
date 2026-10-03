"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, Check, ChevronRight, Clipboard, Code2, Download, FileJson,
  FileText, GripVertical, Layers3, LoaderCircle, RefreshCcw, ShieldCheck, Sparkles, UploadCloud,
  WandSparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { downloadResumePdf } from "@/lib/export-resume-pdf";
import { generateResumeLatex } from "@/lib/resume-latex";
import { resumeSchema, sampleResume, type ResumeJSON, type ResumeSectionKey } from "@/lib/resume-schema";

const sectionMeta: Record<ResumeSectionKey, { label: string; detail: (resume: ResumeJSON) => string }> = {
  summary: { label: "Professional summary", detail: (resume) => `${resume.summary.trim().split(/\s+/).filter(Boolean).length} words` },
  skills: { label: "Technical skills", detail: (resume) => `${resume.skills.length} skills` },
  experience: { label: "Experience", detail: (resume) => `${resume.experience.length} roles` },
  projects: { label: "Research & projects", detail: (resume) => `${resume.projects.length} projects` },
  education: { label: "Education", detail: (resume) => `${resume.education.length} entries` },
  certifications: { label: "Certifications", detail: (resume) => `${resume.certifications.length} items` },
  awards: { label: "Awards", detail: (resume) => `${resume.awards.length} items` },
  interests: { label: "Research interests", detail: (resume) => `${resume.interests.length} topics` },
};

type AiReview = { headline: string; changes: string[]; warnings: string[] };
type AiProposal = { resume: ResumeJSON; review: AiReview; model: string };

export default function ResumeLabPage() {
  const [resume, setResume] = useState<ResumeJSON>(sampleResume);
  const [draggedSection, setDraggedSection] = useState<ResumeSectionKey | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [targetRole, setTargetRole] = useState("Senior Machine Learning Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [notice, setNotice] = useState("Experimental workspace — changes stay on this page until you approve the design.");
  const [error, setError] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const latex = useMemo(() => generateResumeLatex(resume), [resume]);
  const allText = useMemo(() => JSON.stringify(resume), [resume]);
  const wordCount = useMemo(() => allText.replace(/[{}[\]",:]/g, " ").trim().split(/\s+/).filter(Boolean).length, [allText]);
  const impactSignals = useMemo(() => (allText.match(/(?:\d[\d,.]*%?|\d+\+|\b(?:increased|reduced|improved|saved|grew|automated)\b)/gi) || []).length, [allText]);
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean).length;
  const atsChecks = [
    { label: "Complete contact details", pass: Boolean(resume.personal.name && resume.personal.email.includes("@") && resume.personal.phone), weight: 20 },
    { label: "Focused 35–100 word summary", pass: summaryWords >= 35 && summaryWords <= 100, weight: 15 },
    { label: "Searchable technical skills", pass: resume.skills.length >= 10, weight: 15 },
    { label: "Experience has achievement bullets", pass: resume.experience.every((item) => item.role && item.company && item.bullets.length >= 2), weight: 20 },
    { label: "Projects and education included", pass: resume.projects.length > 0 && resume.education.length > 0, weight: 15 },
    { label: "Measurable impact signals", pass: impactSignals >= 3, weight: 15 },
  ];
  const atsScore = atsChecks.reduce((score, check) => score + (check.pass ? check.weight : 0), 0);

  function loadJsonFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Please drop a .json resume file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = resumeSchema.parse(JSON.parse(String(reader.result)));
        setResume(parsed);
        setProposal(null);
        setError("");
        setNotice(`${file.name} loaded. Preview, ATS score, PDF, and LaTeX are now synced.`);
      } catch {
        setError("That JSON does not match the resume schema. Export the sample JSON first and keep the same field names.");
      }
    };
    reader.onerror = () => setError("The file could not be read.");
    reader.readAsText(file);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    loadJsonFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDropActive(false);
    loadJsonFile(event.dataTransfer.files?.[0]);
  }

  function reorderSection(target: ResumeSectionKey) {
    if (!draggedSection || draggedSection === target) return;
    setResume((current) => {
      const next = current.sectionOrder.filter((item) => item !== draggedSection);
      next.splice(next.indexOf(target), 0, draggedSection);
      return { ...current, sectionOrder: next };
    });
    setNotice("Section order updated across preview, LaTeX, and PDF export.");
    setDraggedSection(null);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resume.personal.name.replace(/[^a-z0-9]+/gi, "-") || "resume"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Resume JSON downloaded. You can edit it locally and drag it back in.");
  }

  async function exportPdf() {
    try {
      setIsExporting(true);
      setError("");
      await downloadResumePdf({
        name: resume.personal.name,
        title: resume.personal.title,
        email: resume.personal.email,
        phone: resume.personal.phone,
        location: resume.personal.location,
        links: resume.personal.links.join(" | "),
        summary: resume.summary,
        skills: resume.skills,
        experiences: resume.experience.map((item) => ({ ...item, bullets: item.bullets.join("\n") })),
        projects: resume.projects.map((item) => ({ name: item.name, dates: item.dates, stack: item.stack.join(", "), description: item.bullets.join("\n") })),
        education: resume.education,
        certifications: resume.certifications,
        awards: resume.awards,
        interests: resume.interests.join(" | "),
        sectionOrder: resume.sectionOrder,
      });
      setNotice("ATS-readable PDF downloaded directly. Sections now flow naturally instead of forcing a blank page gap.");
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : "PDF export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  async function improveWithAi() {
    try {
      setIsImproving(true);
      setError("");
      setProposal(null);
      const response = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, targetRole, jobDescription }),
      });
      const result = await response.json() as AiProposal & { error?: string };
      if (!response.ok) throw new Error(result.error || "AI improvement failed.");
      setProposal(result);
      setNotice("AI draft is ready for review. Nothing changed in your resume yet.");
    } catch (aiError) {
      setError(aiError instanceof Error ? aiError.message : "AI improvement failed.");
    } finally {
      setIsImproving(false);
    }
  }

  async function copyLatex() {
    await navigator.clipboard.writeText(latex);
    setCopied(true);
    setNotice("ATS LaTeX copied to your clipboard.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#101528]">
      <header className="sticky top-0 z-40 border-b border-[#e4e7ef] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1720px] items-center justify-between gap-3 px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-xl"><Link href="/" aria-label="Back to Resume Studio"><ArrowLeft /></Link></Button>
            <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#121833] text-white shadow-[0_10px_26px_rgba(18,24,51,.18)]"><Layers3 className="size-5" /></div>
            <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-base font-bold tracking-[-.02em] sm:text-lg">Resume Lab</h1><span className="rounded-full bg-[#ece9ff] px-2 py-0.5 text-[11px] font-semibold text-[#5c4ae8]">Experimental</span></div><p className="hidden text-xs text-[#7d849a] sm:block">JSON-first ATS resume workspace</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden rounded-xl border-[#dfe2eb] bg-white sm:flex" onClick={downloadJson}><FileJson /> Save JSON</Button>
            <Button className="rounded-xl bg-[#5d52eb] text-white shadow-[0_10px_25px_rgba(93,82,235,.22)] hover:bg-[#4e43d6]" onClick={exportPdf} disabled={isExporting}>{isExporting ? <LoaderCircle className="animate-spin" /> : <Download />}<span className="hidden sm:inline">Export PDF</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1720px] px-4 py-5 sm:px-7">
        {(notice || error) && <div className={`mb-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#ffd4d4] bg-[#fff4f4] text-[#b33232]" : "border-[#dcd8ff] bg-[#f1efff] text-[#5146c8]"}`}><span className="flex items-center gap-2">{error ? <AlertTriangle className="size-4 shrink-0" /> : <Sparkles className="size-4 shrink-0" />}{error || notice}</span><button aria-label="Dismiss" onClick={() => { setNotice(""); setError(""); }}><X className="size-4" /></button></div>}

        <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="ATS health" value={`${atsScore}%`} detail={atsScore >= 85 ? "Strong structure" : "Needs attention"} color="violet" />
          <Metric label="Resume words" value={String(wordCount)} detail="Updates instantly" color="blue" />
          <Metric label="Sections" value={`${resume.sectionOrder.length}/8`} detail="Drag to reorder" color="emerald" />
          <Metric label="Impact signals" value={String(impactSignals)} detail="Metrics & outcomes" color="amber" />
        </section>

        <div className="grid items-start gap-4 xl:grid-cols-[310px_minmax(520px,1fr)_340px]">
          <aside className="order-2 space-y-4 xl:order-1 xl:sticky xl:top-[90px]">
            <section className="overflow-hidden rounded-[22px] border border-[#e2e5ed] bg-white shadow-[0_16px_44px_rgba(31,38,72,.05)]">
              <div className="border-b border-[#eceef4] px-5 py-4"><h2 className="font-semibold">Resume structure</h2><p className="mt-1 text-xs leading-5 text-[#7c849c]">Drag sections into the order you want.</p></div>
              <div className="space-y-2 p-3">
                {resume.sectionOrder.map((key, index) => <button
                  key={key}
                  draggable
                  onDragStart={() => setDraggedSection(key)}
                  onDragEnd={() => setDraggedSection(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => reorderSection(key)}
                  className={`group flex w-full cursor-grab items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:cursor-grabbing ${draggedSection === key ? "scale-[.98] border-[#766cf3] bg-[#eeecff] opacity-60" : "border-[#ebecef] bg-[#fafbfe] hover:-translate-y-0.5 hover:border-[#d9d5ff] hover:bg-[#f5f3ff]"}`}
                >
                  <GripVertical className="size-4 shrink-0 text-[#9ba1b3]" />
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold text-[#655af0] shadow-sm">{index + 1}</span>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold">{sectionMeta[key].label}</span><span className="block text-xs text-[#858ca2]">{sectionMeta[key].detail(resume)}</span></span>
                </button>)}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#e2e5ed] bg-white p-4 shadow-[0_16px_44px_rgba(31,38,72,.05)]">
              <div
                onDragEnter={(event) => { event.preventDefault(); setDropActive(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDropActive(false)}
                onDrop={handleFileDrop}
                className={`rounded-2xl border border-dashed p-5 text-center transition ${dropActive ? "scale-[1.01] border-[#665cf2] bg-[#efedff]" : "border-[#cfd4e1] bg-[#fafbfe] hover:border-[#8c84f6]"}`}
              >
                <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#ece9ff] text-[#5c51e8]"><UploadCloud className="size-5" /></div>
                <p className="mt-3 text-sm font-semibold">Drop resume JSON</p><p className="mt-1 text-xs leading-5 text-[#80879e]">Data is parsed locally before any AI request.</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-xl bg-white" onClick={() => fileInput.current?.click()}>Browse file</Button>
                <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={handleFileInput} />
              </div>
              <div className="mt-3 flex gap-2"><Button variant="ghost" size="sm" className="flex-1 rounded-xl text-[#626a82]" onClick={downloadJson}><Download /> Sample JSON</Button><Button variant="ghost" size="sm" className="flex-1 rounded-xl text-[#626a82]" onClick={() => { setResume(sampleResume); setProposal(null); setNotice("Sample resume restored."); }}><RefreshCcw /> Reset</Button></div>
            </section>
          </aside>

          <section className="order-1 min-w-0 overflow-hidden rounded-[24px] border border-[#dfe2ea] bg-white shadow-[0_20px_60px_rgba(31,38,72,.08)] xl:order-2">
            <Tabs defaultValue="preview" className="gap-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eaf1] bg-[#fbfcfe] px-4 py-3 sm:px-5">
                <TabsList className="rounded-xl bg-[#edeff5] p-1"><TabsTrigger value="preview" className="rounded-lg px-3"><FileText /> Preview</TabsTrigger><TabsTrigger value="json" className="rounded-lg px-3"><FileJson /> JSON</TabsTrigger><TabsTrigger value="latex" className="rounded-lg px-3"><Code2 /> LaTeX</TabsTrigger></TabsList>
                <div className="flex items-center gap-2 text-xs font-medium text-[#68708a]"><span className="size-2 rounded-full bg-[#24b66f] shadow-[0_0_0_4px_rgba(36,182,111,.12)]" /> Live sync</div>
              </div>
              <TabsContent value="preview" className="m-0 bg-[#eef1f6] p-3 sm:p-7">
                <ResumePreview resume={resume} />
              </TabsContent>
              <TabsContent value="json" className="m-0 bg-[#101528] p-4 sm:p-6"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.14em] text-white/50">Canonical resume.json</span><Button variant="outline" size="sm" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={downloadJson}><Download /> Download</Button></div><pre className="max-h-[1050px] overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-[#cdd5ff]">{JSON.stringify(resume, null, 2)}</pre></TabsContent>
              <TabsContent value="latex" className="m-0 bg-[#101528] p-4 sm:p-6"><div className="mb-3 flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-[.14em] text-white/50">ATS-safe template</span><p className="mt-1 text-xs text-white/40">Generated from JSON — never the source of truth.</p></div><Button variant="outline" size="sm" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={copyLatex}>{copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy code"}</Button></div><pre className="max-h-[1050px] overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-[#cdd5ff]">{latex}</pre></TabsContent>
            </Tabs>
          </section>

          <aside className="order-3 space-y-4 xl:sticky xl:top-[90px]">
            <section className="overflow-hidden rounded-[22px] border border-[#ddd9ff] bg-[linear-gradient(145deg,#171b38_0%,#242052_100%)] text-white shadow-[0_18px_50px_rgba(39,32,104,.2)]">
              <div className="relative overflow-hidden p-5"><div className="absolute -right-10 -top-12 size-36 rounded-full bg-[#7f73ff]/25 blur-2xl" /><div className="relative"><div className="flex items-center justify-between"><div className="grid size-10 place-items-center rounded-2xl bg-white/10"><WandSparkles className="size-5 text-[#b9b3ff]" /></div><span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/65">Groq · GPT-OSS 120B</span></div><h2 className="mt-4 text-lg font-semibold">AI improvement review</h2><p className="mt-1 text-sm leading-6 text-white/58">The model rewrites only summary and bullets. Facts, dates, IDs, and skills stay locked.</p></div></div>
              <div className="space-y-3 border-t border-white/10 bg-black/10 p-4">
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-white/65">Target role</span><Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="border-white/10 bg-white/8 text-white placeholder:text-white/30" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-white/65">Job description <span className="text-white/35">optional</span></span><Textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the role requirements for keyword alignment..." className="min-h-28 border-white/10 bg-white/8 text-white placeholder:text-white/30" /></label>
                <Button className="h-11 w-full rounded-xl bg-[#8378ff] text-white hover:bg-[#7569f6]" onClick={improveWithAi} disabled={isImproving}>{isImproving ? <LoaderCircle className="animate-spin" /> : <Sparkles />} {isImproving ? "Reviewing resume..." : "Generate improved draft"}</Button>
              </div>
            </section>

            {proposal && <section className="animate-lab-rise overflow-hidden rounded-[22px] border border-[#dfe2eb] bg-white shadow-[0_16px_44px_rgba(31,38,72,.06)]">
              <div className="border-b border-[#eaecf2] p-4"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7f8ee] text-[#12965a]"><ShieldCheck className="size-[18px]" /></div><div><h3 className="text-sm font-semibold">{proposal.review.headline}</h3><p className="mt-1 text-xs text-[#80879c]">Drafted with {proposal.model}</p></div></div></div>
              <div className="space-y-2 p-4">{proposal.review.changes.slice(0, 4).map((change) => <div key={change} className="flex gap-2 text-xs leading-5 text-[#586079]"><Check className="mt-0.5 size-3.5 shrink-0 text-[#20aa69]" />{change}</div>)}{proposal.review.warnings.map((warning) => <div key={warning} className="flex gap-2 rounded-xl bg-[#fff8e8] p-2.5 text-xs leading-5 text-[#8b6513]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{warning}</div>)}</div>
              <div className="flex gap-2 border-t border-[#eaecf2] p-3"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setProposal(null)}>Discard</Button><Button className="flex-1 rounded-xl bg-[#151a38] text-white hover:bg-[#242a4d]" onClick={() => { setResume(proposal.resume); setProposal(null); setNotice("AI draft applied. Preview, score, JSON, LaTeX, and PDF are synced."); }}>Apply draft <ChevronRight /></Button></div>
            </section>}

            <section className="rounded-[22px] border border-[#e2e5ed] bg-white p-4 shadow-[0_16px_44px_rgba(31,38,72,.05)]"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">ATS checks</h3><p className="mt-0.5 text-xs text-[#858ca1]">Calculated locally</p></div><div className="text-xl font-bold text-[#5c52df]">{atsScore}</div></div><Progress value={atsScore} className="mt-3 h-2" /><div className="mt-4 space-y-2.5">{atsChecks.map((check) => <div key={check.label} className="flex items-center gap-2 text-xs text-[#606881]"><span className={`grid size-5 shrink-0 place-items-center rounded-full ${check.pass ? "bg-[#e5f8ed] text-[#159359]" : "bg-[#fff1e6] text-[#c96b1c]"}`}>{check.pass ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}</span>{check.label}</div>)}</div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, detail, color }: { label: string; value: string; detail: string; color: "violet" | "blue" | "emerald" | "amber" }) {
  const tones = { violet: "from-[#f0edff] to-[#faf9ff] text-[#5a50df]", blue: "from-[#eaf6ff] to-[#f8fcff] text-[#1889ce]", emerald: "from-[#e8f8f0] to-[#f8fcfa] text-[#15945a]", amber: "from-[#fff5df] to-[#fffdf8] text-[#c17a0a]" };
  return <div className={`rounded-[18px] border border-white bg-gradient-to-br p-4 shadow-[0_8px_28px_rgba(31,38,72,.05)] ${tones[color]}`}><p className="text-xs font-semibold uppercase tracking-[.1em] opacity-65">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><p className="text-2xl font-bold tracking-[-.03em]">{value}</p><p className="pb-1 text-xs font-medium opacity-70">{detail}</p></div></div>;
}

function ResumePreview({ resume }: { resume: ResumeJSON }) {
  return <article className="animate-lab-rise mx-auto min-h-[1056px] w-full max-w-[816px] bg-white px-[6.5%] py-[5%] font-serif text-[#111] shadow-[0_22px_60px_rgba(34,40,68,.16)]">
    <header className="text-center"><h2 className="text-[clamp(1.7rem,4vw,2.4rem)] font-bold tracking-[-.02em]">{resume.personal.name}</h2><p className="mt-1 text-[clamp(.8rem,1.6vw,1rem)]">{resume.personal.title}</p><p className="mt-1 text-[clamp(.65rem,1.3vw,.8rem)]">{[resume.personal.phone, resume.personal.email, resume.personal.location].join("  |  ")}</p><p className="mt-1 text-[clamp(.65rem,1.3vw,.8rem)] text-[#06478f]">{resume.personal.links.join(" | ")}</p></header>
    <div className="mt-3">{resume.sectionOrder.map((key) => <PreviewSection key={key} title={sectionMeta[key].label}>{renderPreviewContent(key, resume)}</PreviewSection>)}</div>
  </article>;
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-2.5 break-inside-avoid"><h3 className="border-b border-black pb-0.5 text-[clamp(.82rem,1.8vw,1.05rem)] font-bold capitalize leading-tight">{title}</h3><div className="pt-1 text-[clamp(.63rem,1.25vw,.77rem)] leading-[1.34]">{children}</div></section>;
}

function renderPreviewContent(key: ResumeSectionKey, resume: ResumeJSON) {
  if (key === "summary") return <p>{resume.summary}</p>;
  if (key === "skills") return <p>{resume.skills.join(" | ")}</p>;
  if (key === "interests") return <p>{resume.interests.join(" | ")}</p>;
  if (key === "certifications" || key === "awards") return <ul className="list-disc space-y-0.5 pl-5">{resume[key].map((item) => <li key={item}>{item}</li>)}</ul>;
  if (key === "education") return <div className="space-y-1">{resume.education.map((item) => <div key={item.id}><div className="flex justify-between gap-4 font-bold"><span>{item.degree}</span><span className="shrink-0 font-normal">{item.dates}</span></div><p className="italic">{item.school}</p></div>)}</div>;
  if (key === "experience") return <div className="space-y-1.5">{resume.experience.map((item) => <div key={item.id}><div className="flex justify-between gap-4 font-bold"><span>{item.role}</span><span className="shrink-0 font-normal">{item.dates}</span></div><p className="italic">{item.company}</p><ul className="list-disc pl-5">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</div>;
  return <div className="space-y-1.5">{resume.projects.map((item) => <div key={item.id}><div className="flex justify-between gap-4 font-bold text-[#06478f]"><span>{item.name}</span><span className="shrink-0 font-normal text-black">{item.dates}</span></div><p className="italic">{item.stack.join(", ")}</p><ul className="list-disc pl-5">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</div>;
}
