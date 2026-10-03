"use client";

import { useMemo, useState } from "react";
import {
  Award, Bell, BookOpen, BriefcaseBusiness, Check, ChevronDown,
  Code2, Copy, Download, FileText, Gauge, GraduationCap, Home, LoaderCircle, Maximize2, Menu,
  Minus, PanelLeftClose, Plus, Search, Settings, ShieldCheck, Sparkles, Target,
  Trash2, UserRound, WandSparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { downloadResumePdf } from "@/lib/export-resume-pdf";

type Experience = { id: number; role: string; company: string; dates: string; bullets: string };
type Project = { id: number; name: string; stack: string; dates: string; description: string };
type Education = { id: number; degree: string; school: string; dates: string };

const navItems = [
  { label: "Overview", icon: Home }, { label: "My profile", icon: UserRound },
  { label: "Resume studio", icon: FileText, active: true }, { label: "Job matches", icon: Search },
  { label: "Applications", icon: BriefcaseBusiness }, { label: "Settings", icon: Settings },
];

const initialExperience: Experience[] = [
  { id: 1, role: "Teaching Assistant", company: "Zewail City of Science and Technology", dates: "March 2025 - Present", bullets: "Deliver lab sessions and assist in lecturing undergraduate courses in machine learning, data science, and applied AI.\nSupport curriculum development and design practical assignments aligned with current industry standards.\nMentor students on research methodologies, ML project design, and academic integrity.\nFacilitate hands-on workshops using Python, TensorFlow, and Scikit-learn to reinforce core AI/ML concepts." },
  { id: 2, role: "Data Scientist", company: "Egyswiss Holding Company", dates: "January 2024 - March 2025", bullets: "Developed an end-to-end data pipeline extracting and processing business-critical data from Microsoft Dynamics 365 ERP via Python-based API integrations.\nUsed SQL to clean, transform, and structure raw ERP data, ensuring consistency and analytical readiness.\nBuilt interactive Power BI dashboards visualizing KPIs, enabling department heads to make data-driven, real-time decisions.\nConducted advanced analyses uncovering trends in operations and supply chain, directly supporting executive decision-making.\nCollaborated cross-functionally with finance, logistics, and IT teams to align data strategies with business goals." },
  { id: 3, role: "Data Scientist", company: "Salab", dates: "2024 - 2026", bullets: "Designed and built a fully automated text-to-SQL analytics dashboard against Oracle E-Business Suite ERP, spanning sales, finance, inventory, and operations.\nEngineered the pipeline connecting the natural-language interface to the Oracle EBS schema for non-technical business users.\nAutomated recurring daily and weekly KPI reporting and feedback cycles for leadership.\nConsolidated cross-module ERP data into a unified reporting layer, reducing manual reporting effort and turnaround time.\nPartnered with business stakeholders over two years to refine KPI definitions and reporting cadence." },
];

const initialProjects: Project[] = [
  { id: 1, name: "Research Intelligence Operating System (RIOS)", stack: "Python, LangGraph, Chainlit, LLM APIs, arXiv API, AsyncIO, Pytest", dates: "2025", description: "Engineered an AI-driven research platform orchestrating literature retrieval, structured planning, sandboxed code execution, validation, self-correction, and report generation.\nIntegrated the arXiv API with caching, retry, backoff, and timeout handling plus a provider-agnostic LLM adapter.\nBuilt a sandboxed Python execution environment with timeouts and bounded output capture.\nDelivered CLI and asynchronous Chainlit interfaces with real-time phase updates and session checkpointing.\nAdded offline tests with mocked arXiv responses to verify retrieval contracts and state propagation." },
  { id: 2, name: "Medical RAG Assistant", stack: "Python, FastAPI, LangChain, FAISS, Sentence Transformers, Ollama, Docker", dates: "2025", description: "Built a privacy-focused RAG system indexing 16,000 MedQuAD question-answer pairs with fully local inference.\nImplemented rule-based emergency-symptom detection and triage-labelled safety responses.\nExposed a FastAPI service with source attribution, session caching, retrieval debugging, and conversation logging.\nContainerized the application with Docker Compose, PostgreSQL, and Redis and added an evaluation script." },
  { id: 3, name: "Quantum-Enhanced Deepfake Detection", stack: "Quantum ML, PyTorch, Explainable AI", dates: "2024 - 2025", description: "Conducted original research integrating quantum circuits into classical neural network architectures for deepfake detection.\nAuthored a research paper demonstrating measurable improvements in optimization and model efficiency.\nInvestigated hybrid quantum-classical models for computationally intensive ML tasks." },
  { id: 4, name: "LLM-Powered Arabic Legal Document Summarizer", stack: "Mistral, Arabic LLaMA, LangChain, FAISS, Streamlit, Docker, AWS EC2", dates: "July 2025 - August 2025", description: "Fine-tuned Mistral and Arabic LLaMA models on ArabLegalEval and CUAD datasets.\nBuilt a LangChain RAG pipeline with FAISS for clause-level retrieval from Arabic contracts.\nDeveloped a Streamlit interface for uploading, summarizing, and querying documents.\nDeployed the solution as a Dockerized FastAPI service on AWS EC2." },
  { id: 5, name: "Together - IoT & Deep Learning for Climate-Smart Agriculture", stack: "CNN, Transfer Learning, Flutter, IoT", dates: "August 2023 - March 2024", description: "Led ML development for crop disease detection using CNN and transfer learning.\nDeveloped a Flutter mobile application with real-time AI recommendations and climate-awareness content.\nEngineered backend infrastructure connecting IoT sensors, cloud storage, and the mobile client.\nWon 2nd place in the Dell Envision the Future Competition across MENA, Africa, and Turkey." },
  { id: 6, name: "Equilibrium Optimizer for Hyperparameter Tuning", stack: "NSL-KDD, Metaheuristic Optimization", dates: "May 2022", description: "Applied the Equilibrium Optimizer to tune ML model hyperparameters for network intrusion detection, achieving 96% accuracy.\nDemonstrated significant improvements over PSO, GA, GWO, GSA, SSA, and CMA-ES.\nEstablished computational complexity and validated performance against advanced baselines." },
  { id: 7, name: "DALEL - Tourism Recommender System", stack: "Cosine Similarity, Recommender Systems", dates: "April 2021", description: "Built a hybrid Cairo tourism recommendation engine using cosine similarity, reviews, geolocation, and categorical attributes.\nImplemented model persistence for deployment reuse without retraining." },
];

const initialEducation: Education[] = [
  { id: 1, degree: "Pre-Master's Program (Completed)", school: "Zewail City of Science and Technology", dates: "2024 - 2025" },
  { id: 2, degree: "B.Sc. Computer and Information Sciences, GPA 3.89/4.0", school: "Zagazig University - Computer Science", dates: "2019 - 2023" },
];

export default function HomePage() {
  const [name, setName] = useState("Yousef Elbaz");
  const [title, setTitle] = useState("Machine Learning Engineer | AI Researcher");
  const [email, setEmail] = useState("yousefelbaz104@gmail.com");
  const [phone, setPhone] = useState("+20-127-5438-937");
  const [location, setLocation] = useState("Cairo, Egypt");
  const [links, setLinks] = useState("LinkedIn | GitHub | Kaggle");
  const [summary, setSummary] = useState("Machine Learning Engineer and AI Researcher with 3+ years of combined industry and academic research experience. Builds and deploys end-to-end AI and data systems spanning NLP, LLMs/RAG, computer vision, IoT analytics, text-to-SQL business intelligence, and recommender systems, with hands-on experience in MLOps and cloud deployment.");
  const [skills, setSkills] = useState("Python, SQL, TensorFlow, Keras, PyTorch, Scikit-learn, HuggingFace Transformers, LangChain, LangGraph, FAISS, Docker, FastAPI, AWS EC2, Google Cloud Platform, Power BI, Oracle EBS");
  const [experiences, setExperiences] = useState<Experience[]>(initialExperience);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [certifications, setCertifications] = useState(["Google Data Analytics Professional Certificate - Coursera", "Career Track: Data Science - 365 Data Science", "Career Track: Data Analysis - 365 Data Science"]);
  const [awards, setAwards] = useState(["2nd Place - Dell Envision the Future Competition, MENA Region, Africa & Turkey", "3rd Place - EUI Climathon, Smart Transportation Theme, MENA Region & Africa"]);
  const [interests, setInterests] = useState("Quantum Machine Learning | Explainable AI | Large Language Models | Model Optimization | IoT-Integrated AI | Arabic NLP");
  const [zoom, setZoom] = useState(78);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const skillList = useMemo(() => skills.split(",").map((skill) => skill.trim()).filter(Boolean), [skills]);
  const allText = useMemo(() => [name, title, email, phone, location, links, summary, skills, interests, ...experiences.flatMap((item) => [item.role, item.company, item.dates, item.bullets]), ...projects.flatMap((item) => [item.name, item.stack, item.dates, item.description]), ...education.flatMap((item) => [item.degree, item.school, item.dates]), ...certifications, ...awards].join(" "), [name, title, email, phone, location, links, summary, skills, interests, experiences, projects, education, certifications, awards]);
  const wordCount = useMemo(() => allText.trim().split(/\s+/).filter(Boolean).length, [allText]);
  const impactCount = useMemo(() => (allText.match(/(?:\d[\d,.]*%?|\d+\+|\b(?:increased|reduced|improved|saved|grew|automated)\b)/gi) || []).length, [allText]);
  const sectionCount = [summary, skills, experiences.length, projects.length, education.length, certifications.length, awards.length, interests].filter(Boolean).length;
  const summaryWords = summary.trim().split(/\s+/).filter(Boolean).length;

  const atsChecks = useMemo(() => [
    { label: "Name, title, email, phone and location", passed: Boolean(name && title && email.includes("@") && phone && location), weight: 20 },
    { label: "Professional summary is 35-100 words", passed: summaryWords >= 35 && summaryWords <= 100, weight: 15 },
    { label: "At least one complete experience", passed: experiences.some((item) => item.role && item.company && item.bullets), weight: 20 },
    { label: "10+ searchable technical skills", passed: skillList.length >= 10, weight: 15 },
    { label: "Projects and education included", passed: projects.length > 0 && education.length > 0, weight: 15 },
    { label: "Measurable impact appears in bullets", passed: impactCount >= 3, weight: 15 },
  ], [name, title, email, phone, location, summaryWords, experiences, skillList.length, projects.length, education.length, impactCount]);
  const atsScore = atsChecks.reduce((score, check) => score + (check.passed ? check.weight : 0), 0);
  const initials = useMemo(() => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), [name]);

  const latex = useMemo(() => `\\documentclass[10pt,letterpaper]{article}\n\\usepackage[margin=0.55in]{geometry}\n\\usepackage[hidelinks]{hyperref}\n\\begin{document}\n\\begin{center}\n{\\LARGE \\textbf{${escapeLatex(name)}}}\\\\\n${escapeLatex(title)}\\\\\n${escapeLatex(phone)} $\\mid$ ${escapeLatex(email)} $\\mid$ ${escapeLatex(location)}\\\\\n${escapeLatex(links)}\n\\end{center}\n\\section*{Professional Summary}\n${escapeLatex(summary)}\n\\section*{Technical Skills}\n${escapeLatex(skills)}\n\\section*{Professional Experience}\n${experiences.map((item) => `\\textbf{${escapeLatex(item.role)}} -- ${escapeLatex(item.company)} \\hfill ${escapeLatex(item.dates)}\\\\\n${item.bullets.split("\n").filter(Boolean).map((bullet) => `\\textbullet\\ ${escapeLatex(bullet)}`).join("\\\\\n")}`).join("\n\n")}\n\\section*{Research \\& Projects}\n${projects.map((item) => `\\textbf{${escapeLatex(item.name)}} \\hfill ${escapeLatex(item.dates)}\\\\\n\\textit{${escapeLatex(item.stack)}}\\\\\n${escapeLatex(item.description)}`).join("\n\n")}\n\\section*{Education}\n${education.map((item) => `\\textbf{${escapeLatex(item.degree)}} \\hfill ${escapeLatex(item.dates)}\\\\\n\\textit{${escapeLatex(item.school)}}`).join("\n\n")}\n\\section*{Certifications}\n${certifications.map((item) => `\\textbullet\\ ${escapeLatex(item)}`).join("\\\\\n")}\n\\section*{Awards \\& Achievements}\n${awards.map((item) => `\\textbullet\\ ${escapeLatex(item)}`).join("\\\\\n")}\n\\section*{Research Interests}\n${escapeLatex(interests)}\n\\end{document}`, [name, title, email, phone, location, links, summary, skills, experiences, projects, education, certifications, awards, interests]);

  function addExperience() {
    setExperiences((items) => [...items, { id: Date.now(), role: "New role", company: "Company", dates: "Start - End", bullets: "Add a strong achievement with a measurable result." }]);
    setNotice("Experience added. Edit the new card below.");
  }
  function addProject() {
    setProjects((items) => [...items, { id: Date.now(), name: "New project", stack: "Tools and technologies", dates: "Year", description: "Describe the problem, your contribution, and the result." }]);
    setNotice("Project added.");
  }
  async function handleExport() {
    try {
      setExporting(true);
      setNotice("Creating your ATS-ready PDF...");
      await downloadResumePdf({ name, title, email, phone, location, links, summary, skills: skillList, experiences, projects, education, certifications, awards, interests });
      setNotice("PDF downloaded directly with selectable, ATS-readable text.");
    } catch (error) {
      setNotice(`PDF export failed: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setExporting(false);
    }
  }
  async function copyLatex() {
    await navigator.clipboard.writeText(latex);
    setCopied(true);
    setNotice("LaTeX source copied to your clipboard.");
    window.setTimeout(() => setCopied(false), 1_800);
  }
  function focusFirstIssue() {
    const issue = atsChecks.find((check) => !check.passed);
    setReportOpen(true);
    setNotice(issue ? `Next improvement: ${issue.label}.` : "Your resume passes every current ATS check.");
  }

  return (
    <main className="app-shell min-h-screen bg-[#f7f8fc] text-[#11162c]">
      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-[#e8eaf2] bg-white px-4 py-5 transition-transform lg:translate-x-0`}>
        <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2.5"><div className="grid size-9 place-items-center rounded-xl bg-[#665cf6] text-white shadow-[0_8px_22px_rgba(102,92,246,.24)]"><Sparkles className="size-5" /></div><div><p className="text-[1.05rem] font-bold tracking-[-.02em]">CareerPilot</p><p className="text-xs text-[#777e99]">AI career workspace</p></div></div><Button aria-label="Close menu" variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobileNav(false)}><PanelLeftClose /></Button></div>
        <nav className="mt-10 space-y-1.5" aria-label="Main navigation">{navItems.map((item) => <button key={item.label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${item.active ? "bg-[#efedff] text-[#564bea]" : "text-[#58617e] hover:bg-[#f6f7fb] hover:text-[#14192f]"}`}><item.icon className="size-[18px]" />{item.label}</button>)}</nav>
        <div className="mt-auto rounded-2xl bg-[#151a38] p-4 text-white"><div className="mb-3 grid size-9 place-items-center rounded-xl bg-white/10"><WandSparkles className="size-[18px] text-[#9b93ff]" /></div><p className="text-sm font-semibold">Local-first workspace</p><p className="mt-1 text-xs leading-5 text-white/60">Your profile and resumes stay on your device.</p></div>
      </aside>
      {mobileNav && <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setMobileNav(false)} />}

      <section className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e8eaf2] bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3"><Button aria-label="Open menu" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNav(true)}><Menu /></Button><div className="hidden w-[min(34vw,420px)] items-center gap-2 rounded-xl border border-[#e5e7ef] bg-[#f8f9fc] px-3 py-2 text-sm text-[#8a91aa] sm:flex"><Search className="size-4" /><span>Search jobs, skills, companies...</span><span className="ml-auto rounded-md border border-[#e5e7ef] bg-white px-1.5 py-0.5 text-[11px]">⌘ K</span></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><Button aria-label="Notifications" variant="ghost" size="icon" className="relative rounded-full"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ff5263]" /></Button><div className="h-7 w-px bg-[#e5e7ef]" /><div className="grid size-9 place-items-center rounded-full bg-[#dedaff] text-xs font-bold text-[#4d43d7]">{initials}</div><div className="hidden sm:block"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-[#7c849f]">{title}</p></div><ChevronDown className="hidden size-4 text-[#7c849f] sm:block" /></div>
        </header>

        <div className="mx-auto max-w-[1530px] px-4 py-6 sm:px-7 lg:py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#655af3]"><Sparkles className="size-3.5" /> Resume studio</div><h1 className="text-2xl font-bold tracking-[-.035em] sm:text-[2rem]">Build an ATS-ready resume</h1><p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#707895]">Every score below updates as you edit. Nothing is added to your resume without your input.</p></div>
            <div className="flex flex-wrap gap-2"><Button asChild variant="outline" className="h-10 rounded-xl border-[#d8d4ff] bg-[#f4f2ff] text-[#564bea] hover:bg-[#ebe8ff]"><a href="/resume-lab"><Sparkles /> Try Resume Lab</a></Button><Button variant="outline" className="h-10 rounded-xl border-[#dedfeb] bg-white" onClick={handleExport} disabled={exporting}>{exporting ? <LoaderCircle className="animate-spin" /> : <Download />} {exporting ? "Creating PDF..." : "Download PDF"}</Button><Button className="h-10 rounded-xl bg-[#6257ef] px-5 text-white shadow-[0_9px_24px_rgba(98,87,239,.22)] hover:bg-[#5146de]" onClick={focusFirstIssue}><WandSparkles /> Improve resume</Button></div>
          </div>

          {notice && <div className="mt-4 flex items-center justify-between rounded-xl border border-[#dcd9ff] bg-[#f2f0ff] px-4 py-2.5 text-sm text-[#5349c7]"><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X className="size-4" /></button></div>}

          <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="ATS score" value={`${atsScore}%`} note={atsScore >= 85 ? "Strong" : "Needs work"} tone="purple" />
            <Kpi label="Total words" value={String(wordCount)} note="Live content" tone="blue" />
            <Kpi label="Active sections" value={`${sectionCount}/8`} note="From your CV" tone="green" />
            <Kpi label="Impact signals" value={String(impactCount)} note="Numbers & outcomes" tone="amber" />
          </section>

          <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(360px,.78fr)_minmax(470px,1.22fr)] 2xl:grid-cols-[minmax(380px,.82fr)_minmax(460px,1.18fr)_280px]">
            <section className="overflow-hidden rounded-[20px] border border-[#e3e6ef] bg-white shadow-[0_12px_40px_rgba(39,46,86,.05)]">
              <div className="flex items-center justify-between border-b border-[#eceef4] px-5 py-4"><div><h2 className="font-semibold">Resume content</h2><p className="mt-0.5 text-xs text-[#858da7]">Changes update preview and scores instantly</p></div><Settings className="size-4 text-[#8b92a8]" /></div>
              <div className="max-h-[calc(100vh-290px)] space-y-5 overflow-y-auto p-5 scrollbar-thin max-xl:max-h-none">
                <EditorSection title="Personal details" icon={<UserRound />}>
                  <Input id="name" aria-label="Full name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
                  <Input aria-label="Professional title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Professional title" />
                  <Input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
                  <div className="grid grid-cols-2 gap-2"><Input aria-label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" /><Input aria-label="Location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" /></div>
                  <Input aria-label="Professional links" value={links} onChange={(event) => setLinks(event.target.value)} placeholder="LinkedIn | GitHub | Portfolio" />
                </EditorSection>

                <EditorSection title="Professional summary" icon={<FileText />}><Textarea aria-label="Professional summary" value={summary} onChange={(event) => setSummary(event.target.value)} className="min-h-32 leading-6" /><p className="text-xs text-[#777f98]">{summaryWords} words · target 35-100</p></EditorSection>
                <EditorSection title="Technical skills" icon={<Code2 />}><Textarea aria-label="Technical skills" value={skills} onChange={(event) => setSkills(event.target.value)} className="min-h-24 leading-6" /><p className="text-xs text-[#777f98]">{skillList.length} searchable skills · separate with commas</p></EditorSection>

                <EditorSection title="Professional experience" icon={<BriefcaseBusiness />} action={<Button variant="ghost" size="sm" onClick={addExperience} className="text-[#6257ef]"><Plus /> Add</Button>}>
                  {experiences.map((item, index) => <ExperienceEditor key={item.id} item={item} index={index} update={(field, value) => setExperiences((items) => items.map((entry) => entry.id === item.id ? { ...entry, [field]: value } : entry))} remove={() => setExperiences((items) => items.filter((entry) => entry.id !== item.id))} />)}
                </EditorSection>

                <EditorSection title="Research & projects" icon={<BookOpen />} action={<Button variant="ghost" size="sm" onClick={addProject} className="text-[#6257ef]"><Plus /> Add</Button>}>
                  {projects.map((item, index) => <ProjectEditor key={item.id} item={item} index={index} update={(field, value) => setProjects((items) => items.map((entry) => entry.id === item.id ? { ...entry, [field]: value } : entry))} remove={() => setProjects((items) => items.filter((entry) => entry.id !== item.id))} />)}
                </EditorSection>

                <EditorSection title="Education" icon={<GraduationCap />} action={<Button variant="ghost" size="sm" onClick={() => setEducation((items) => [...items, { id: Date.now(), degree: "New degree", school: "Institution", dates: "Year" }])} className="text-[#6257ef]"><Plus /> Add</Button>}>
                  {education.map((item, index) => <div key={item.id} className="rounded-xl border border-[#e6e8f0] p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-[#777f98]">Education {index + 1}</span><IconDelete onClick={() => setEducation((items) => items.filter((entry) => entry.id !== item.id))} /></div><div className="space-y-2"><Input aria-label={`Degree ${index + 1}`} value={item.degree} onChange={(event) => setEducation((items) => items.map((entry) => entry.id === item.id ? { ...entry, degree: event.target.value } : entry))} /><Input aria-label={`School ${index + 1}`} value={item.school} onChange={(event) => setEducation((items) => items.map((entry) => entry.id === item.id ? { ...entry, school: event.target.value } : entry))} /><Input aria-label={`Education dates ${index + 1}`} value={item.dates} onChange={(event) => setEducation((items) => items.map((entry) => entry.id === item.id ? { ...entry, dates: event.target.value } : entry))} /></div></div>)}
                </EditorSection>

                <StringListEditor title="Certifications" icon={<Award />} values={certifications} onChange={setCertifications} placeholder="Certification name" />
                <StringListEditor title="Awards & achievements" icon={<Award />} values={awards} onChange={setAwards} placeholder="Award or achievement" />
                <EditorSection title="Research interests" icon={<Target />}><Textarea aria-label="Research interests" value={interests} onChange={(event) => setInterests(event.target.value)} className="min-h-20 leading-6" /></EditorSection>
              </div>
            </section>

            {previewOpen && <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#e3e6ef] bg-white shadow-[0_12px_40px_rgba(39,46,86,.05)]">
              <Tabs defaultValue="preview" className="gap-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eceef4] px-4 py-3 sm:px-5">
                  <TabsList className="h-8 bg-[#f4f5f9]"><TabsTrigger value="preview" className="text-xs"><FileText /> Preview</TabsTrigger><TabsTrigger value="source" className="text-xs"><Code2 /> LaTeX</TabsTrigger></TabsList>
                  <div className="flex items-center gap-1 rounded-lg border border-[#e4e6ee] bg-[#fafbfe] p-1"><Button variant="ghost" size="icon-xs" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(55, value - 5))}><Minus /></Button><span className="w-10 text-center text-[11px] font-semibold text-[#666e86]">{zoom}%</span><Button variant="ghost" size="icon-xs" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(100, value + 5))}><Plus /></Button><div className="mx-1 h-4 w-px bg-[#e0e3ec]" /><Button variant="ghost" size="icon-xs" aria-label="Collapse preview" onClick={() => setPreviewOpen(false)}><Maximize2 /></Button></div>
                </div>
                <TabsContent value="preview" className="m-0"><div className="flex min-h-[760px] items-start justify-center overflow-auto bg-[#eff1f6] p-5 sm:p-7 scrollbar-thin"><ResumeDocument name={name} title={title} email={email} phone={phone} location={location} links={links} summary={summary} skills={skillList} experiences={experiences} projects={projects} education={education} certifications={certifications} awards={awards} interests={interests} zoom={zoom} /></div></TabsContent>
                <TabsContent value="source" className="m-0"><div className="min-h-[760px] overflow-auto bg-[#171b32] p-5 scrollbar-thin"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">Generated LaTeX</p><p className="text-xs text-white/50">Read-only · regenerated from your profile</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#243051] px-2.5 py-1 text-[11px] font-semibold text-[#8ee2bb]">Local</span><Button size="sm" className="h-8 bg-white text-[#171b32] hover:bg-white/90" onClick={copyLatex}>{copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy code"}</Button></div></div><pre className="whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/10 p-4 font-mono text-xs leading-6 text-[#c9cdef]">{latex}</pre></div></TabsContent>
              </Tabs>
            </section>}

            <aside className="space-y-4 xl:col-span-2 xl:grid xl:grid-cols-[1.45fr_.55fr] xl:gap-4 xl:space-y-0 2xl:col-span-1 2xl:block 2xl:space-y-4">
              {!previewOpen && <Button variant="outline" className="h-11 w-full rounded-xl bg-white" onClick={() => setPreviewOpen(true)}><Maximize2 /> Show live preview</Button>}
              <section className="rounded-[20px] border border-[#e3e6ef] bg-white p-5 shadow-[0_12px_40px_rgba(39,46,86,.05)]">
                <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">ATS health</p><span className="size-2 animate-pulse rounded-full bg-[#22b875]" /></div><p className="mt-0.5 text-xs text-[#858da7]">Live analysis</p></div><div className={`grid size-12 place-items-center rounded-full text-sm font-bold ${atsScore >= 85 ? "bg-[#eefbf5] text-[#13945a]" : atsScore >= 60 ? "bg-[#fff6e8] text-[#bf7510]" : "bg-[#fff0f1] text-[#d34855]"}`}>{atsScore}</div></div>
                <Progress value={atsScore} className="mt-4 h-2 bg-[#e9ebf2] [&_[data-slot=progress-indicator]]:bg-[#22b875]" />
                <div className="mt-5 space-y-3">{atsChecks.slice(0, reportOpen ? atsChecks.length : 4).map((check) => <div key={check.label} className="flex items-start gap-2.5 text-xs leading-5 text-[#5f6780]"><span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${check.passed ? "bg-[#dcf7e9] text-[#149559]" : "bg-[#fff2dd] text-[#d98616]"}`}>{check.passed ? <Check className="size-2.5" strokeWidth={3} /> : <Target className="size-2.5" />}</span><span>{check.label}<strong className="ml-1 font-semibold text-[#9097aa]">+{check.weight}</strong></span></div>)}</div>
                <Button variant="outline" className="mt-5 h-10 w-full rounded-xl border-[#dedfeb] text-[#5148cf]" onClick={() => setReportOpen((open) => !open)}><Gauge /> {reportOpen ? "Show less" : "View full report"}</Button>
              </section>
              <section className="rounded-[20px] border border-[#dfe9e4] bg-gradient-to-br from-[#f0fbf6] to-white p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[#177d50]"><ShieldCheck className="size-[18px]" /> No fabricated facts</div><p className="mt-2 text-xs leading-5 text-[#5d796b]">Scores and suggestions are calculated from your current content only.</p></section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone: "purple" | "blue" | "green" | "amber" }) {
  const colors = { purple: "bg-[#f1efff] text-[#6156e8]", blue: "bg-[#edf7ff] text-[#2786c9]", green: "bg-[#edfaf3] text-[#18965a]", amber: "bg-[#fff6e9] text-[#c47b12]" };
  return <div className="flex items-center gap-3 rounded-2xl border border-[#e5e7ef] bg-white p-3.5 shadow-[0_7px_24px_rgba(39,46,86,.035)]"><div className={`grid min-w-14 place-items-center rounded-xl px-2 py-3 text-lg font-bold ${colors[tone]}`}>{value}</div><div><p className="text-sm font-semibold">{label}</p><p className="mt-0.5 text-xs text-[#838ba4]">{note}</p></div></div>;
}

function EditorSection({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="border-b border-[#eef0f5] pb-5 last:border-0"><div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-sm font-semibold text-[#242a42]"><span className="text-[#6a60ec] [&_svg]:size-4">{icon}</span>{title}</div>{action}</div><div className="space-y-2 [&_[data-slot=input]]:h-10 [&_[data-slot=input]]:rounded-xl [&_[data-slot=input]]:border-[#e5e7ef] [&_[data-slot=input]]:bg-[#fafbfe] [&_[data-slot=textarea]]:rounded-xl [&_[data-slot=textarea]]:border-[#e5e7ef] [&_[data-slot=textarea]]:bg-[#fafbfe]">{children}</div></section>;
}

function IconDelete({ onClick }: { onClick: () => void }) { return <Button type="button" variant="ghost" size="icon-xs" aria-label="Delete item" onClick={onClick} className="text-[#a0a6b8] hover:bg-[#fff0f1] hover:text-[#d34855]"><Trash2 /></Button>; }

function ExperienceEditor({ item, index, update, remove }: { item: Experience; index: number; update: (field: keyof Experience, value: string) => void; remove: () => void }) {
  return <div className="rounded-xl border border-[#e6e8f0] p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-[#777f98]">Experience {index + 1}</span><IconDelete onClick={remove} /></div><div className="space-y-2"><Input aria-label={`Role ${index + 1}`} value={item.role} onChange={(event) => update("role", event.target.value)} /><Input aria-label={`Company ${index + 1}`} value={item.company} onChange={(event) => update("company", event.target.value)} /><Input aria-label={`Experience dates ${index + 1}`} value={item.dates} onChange={(event) => update("dates", event.target.value)} /><Textarea aria-label={`Experience bullets ${index + 1}`} value={item.bullets} onChange={(event) => update("bullets", event.target.value)} className="min-h-28 leading-5" /></div></div>;
}

function ProjectEditor({ item, index, update, remove }: { item: Project; index: number; update: (field: keyof Project, value: string) => void; remove: () => void }) {
  return <div className="rounded-xl border border-[#e6e8f0] p-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-[#777f98]">Project {index + 1}</span><IconDelete onClick={remove} /></div><div className="space-y-2"><Input aria-label={`Project name ${index + 1}`} value={item.name} onChange={(event) => update("name", event.target.value)} /><Input aria-label={`Project stack ${index + 1}`} value={item.stack} onChange={(event) => update("stack", event.target.value)} /><Input aria-label={`Project dates ${index + 1}`} value={item.dates} onChange={(event) => update("dates", event.target.value)} /><Textarea aria-label={`Project description ${index + 1}`} value={item.description} onChange={(event) => update("description", event.target.value)} className="min-h-24 leading-5" /></div></div>;
}

function StringListEditor({ title, icon, values, onChange, placeholder }: { title: string; icon: React.ReactNode; values: string[]; onChange: (values: string[]) => void; placeholder: string }) {
  return <EditorSection title={title} icon={icon} action={<Button variant="ghost" size="sm" onClick={() => onChange([...values, ""])} className="text-[#6257ef]"><Plus /> Add</Button>}>{values.map((value, index) => <div key={index} className="flex gap-2"><Input aria-label={`${title} ${index + 1}`} value={value} placeholder={placeholder} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><IconDelete onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} /></div>)}</EditorSection>;
}

function ResumeDocument({ name, title, email, phone, location, links, summary, skills, experiences, projects, education, certifications, awards, interests, zoom }: { name: string; title: string; email: string; phone: string; location: string; links: string; summary: string; skills: string[]; experiences: Experience[]; projects: Project[]; education: Education[]; certifications: string[]; awards: string[]; interests: string; zoom: number }) {
  return <article id="resume-preview" className="printable-resume resume-paper origin-top bg-white text-[#171a24] shadow-[0_10px_34px_rgba(24,31,57,.13)]" style={{ width: `${zoom}%` }}>
    <header className="border-b-2 border-[#1d2448] pb-3 text-center"><h2 className="text-[clamp(1.05rem,2vw,1.55rem)] font-bold tracking-[.04em]">{name || "Your Name"}</h2><p className="mt-1 text-[clamp(.62rem,1.1vw,.78rem)] font-semibold text-[#4d5573]">{title || "Professional title"}</p><p className="mt-1.5 text-[clamp(.5rem,.95vw,.64rem)] text-[#4e556d]">{[phone, email, location].filter(Boolean).join("  |  ")}</p>{links && <p className="mt-1 text-[clamp(.5rem,.95vw,.64rem)] text-[#145b9f]">{links}</p>}</header>
    {summary && <ResumeSection title="Professional Summary"><p>{summary}</p></ResumeSection>}
    {skills.length > 0 && <ResumeSection title="Technical Skills"><p>{skills.join("  |  ")}</p></ResumeSection>}
    {experiences.length > 0 && <ResumeSection title="Professional Experience">{experiences.map((item) => <div key={item.id} className="mb-3 last:mb-0"><div className="flex items-baseline justify-between gap-3 font-semibold"><p>{item.role}</p><p className="whitespace-nowrap text-[.82em] font-medium text-[#596079]">{item.dates}</p></div><p className="italic text-[#4d5368]">{item.company}</p><ul className="mt-1 list-disc space-y-0.5 pl-4">{item.bullets.split("\n").filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul></div>)}</ResumeSection>}
    {projects.length > 0 && <ResumeSection title="Research & Projects">{projects.map((item) => { const lines = item.description.split("\n").filter(Boolean); return <div key={item.id} className="mb-3 last:mb-0"><div className="flex items-baseline justify-between gap-3 font-semibold"><p>{item.name}</p><p className="whitespace-nowrap text-[.82em] font-medium text-[#596079]">{item.dates}</p></div><p className="italic text-[#4d5368]">{item.stack}</p>{lines.length > 1 ? <ul className="mt-1 list-disc space-y-0.5 pl-4">{lines.map((line, index) => <li key={index}>{line}</li>)}</ul> : <p className="mt-1">{item.description}</p>}</div>; })}</ResumeSection>}
    {education.length > 0 && <ResumeSection title="Education">{education.map((item) => <div key={item.id} className="mb-2 last:mb-0"><div className="flex items-baseline justify-between gap-3 font-semibold"><p>{item.degree}</p><p className="whitespace-nowrap text-[.82em] font-medium text-[#596079]">{item.dates}</p></div><p className="italic text-[#4d5368]">{item.school}</p></div>)}</ResumeSection>}
    {certifications.some(Boolean) && <ResumeSection title="Certifications"><ul className="list-disc pl-4">{certifications.filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul></ResumeSection>}
    {awards.some(Boolean) && <ResumeSection title="Awards & Achievements"><ul className="list-disc pl-4">{awards.filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul></ResumeSection>}
    {interests && <ResumeSection title="Research Interests"><p>{interests}</p></ResumeSection>}
  </article>;
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-3"><h3 className="mb-1.5 border-b border-[#777d90] pb-0.5 text-[clamp(.62rem,1.05vw,.74rem)] font-bold tracking-[.06em] text-[#1d2448]">{title}</h3><div className="text-[clamp(.52rem,.95vw,.66rem)] leading-[1.42] text-[#343949]">{children}</div></section>; }

function escapeLatex(value: string) { return value.replace(/\\/g, "\\textbackslash{}").replace(/([&%$#_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}"); }
