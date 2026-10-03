import { z } from "zod";

const nonEmpty = z.string().trim();

export const sectionKeys = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "awards",
  "interests",
] as const;

export type ResumeSectionKey = (typeof sectionKeys)[number];

export const resumeSchema = z.object({
  personal: z.object({
    name: nonEmpty,
    title: nonEmpty,
    email: nonEmpty,
    phone: nonEmpty,
    location: nonEmpty,
    links: z.array(nonEmpty),
  }),
  summary: nonEmpty,
  skills: z.array(nonEmpty),
  experience: z.array(z.object({
    id: nonEmpty,
    role: nonEmpty,
    company: nonEmpty,
    dates: nonEmpty,
    bullets: z.array(nonEmpty),
  })),
  projects: z.array(z.object({
    id: nonEmpty,
    name: nonEmpty,
    stack: z.array(nonEmpty),
    dates: nonEmpty,
    bullets: z.array(nonEmpty),
  })),
  education: z.array(z.object({
    id: nonEmpty,
    degree: nonEmpty,
    school: nonEmpty,
    dates: nonEmpty,
  })),
  certifications: z.array(nonEmpty),
  awards: z.array(nonEmpty),
  interests: z.array(nonEmpty),
  sectionOrder: z.array(z.enum(sectionKeys)).refine(
    (items) => items.length === sectionKeys.length && new Set(items).size === sectionKeys.length,
    "sectionOrder must include each section exactly once",
  ),
});

export type ResumeJSON = z.infer<typeof resumeSchema>;

export const sampleResume: ResumeJSON = {
  personal: {
    name: "Yousef Elbaz",
    title: "Machine Learning Engineer | AI Researcher",
    email: "yousefelbaz104@gmail.com",
    phone: "+20-127-5438-937",
    location: "Cairo, Egypt",
    links: ["LinkedIn", "GitHub", "Kaggle"],
  },
  summary: "Machine Learning Engineer and AI Researcher with 3+ years of combined industry and academic research experience. Builds and deploys end-to-end AI and data systems spanning NLP, LLMs/RAG, computer vision, IoT analytics, text-to-SQL business intelligence, and recommender systems, with hands-on experience in MLOps and cloud deployment.",
  skills: ["Python", "SQL", "TensorFlow", "Keras", "PyTorch", "Scikit-learn", "HuggingFace Transformers", "LangChain", "LangGraph", "FAISS", "Docker", "FastAPI", "AWS EC2", "Google Cloud Platform", "Power BI", "Oracle EBS"],
  experience: [
    { id: "exp-teaching", role: "Teaching Assistant", company: "Zewail City of Science and Technology", dates: "March 2025 - Present", bullets: ["Deliver lab sessions and assist in lecturing undergraduate courses in machine learning, data science, and applied AI.", "Support curriculum development and design practical assignments aligned with current industry standards.", "Mentor students on research methodologies, ML project design, and academic integrity."] },
    { id: "exp-egyswiss", role: "Data Scientist", company: "Egyswiss Holding Company", dates: "January 2024 - March 2025", bullets: ["Developed an end-to-end data pipeline extracting and processing business-critical data from Microsoft Dynamics 365 ERP via Python-based API integrations.", "Used SQL to clean, transform, and structure raw ERP data, ensuring consistency and analytical readiness.", "Built interactive Power BI dashboards visualizing KPIs for real-time decisions."] },
    { id: "exp-salab", role: "Data Scientist", company: "Salab", dates: "2024 - 2026", bullets: ["Designed and built a fully automated text-to-SQL analytics dashboard against Oracle E-Business Suite ERP.", "Automated recurring daily and weekly KPI reporting and feedback cycles for leadership.", "Consolidated cross-module ERP data into a unified reporting layer, reducing manual reporting effort."] },
  ],
  projects: [
    { id: "project-rios", name: "Research Intelligence Operating System (RIOS)", stack: ["Python", "LangGraph", "Chainlit", "LLM APIs", "arXiv API"], dates: "2025", bullets: ["Engineered an AI-driven research platform for literature retrieval, structured planning, sandboxed code execution, validation, self-correction, and report generation.", "Integrated the arXiv API with caching, retry, backoff, and timeout handling."] },
    { id: "project-rag", name: "Medical RAG Assistant", stack: ["Python", "FastAPI", "LangChain", "FAISS", "Docker"], dates: "2025", bullets: ["Built a privacy-focused RAG system indexing 16,000 MedQuAD question-answer pairs with fully local inference.", "Containerized the application with Docker Compose, PostgreSQL, and Redis."] },
    { id: "project-qml", name: "Quantum-Enhanced Deepfake Detection", stack: ["Quantum ML", "PyTorch", "Explainable AI"], dates: "2024 - 2025", bullets: ["Conducted original research integrating quantum circuits into classical neural network architectures for deepfake detection.", "Authored a research paper demonstrating measurable improvements in optimization and model efficiency."] },
  ],
  education: [
    { id: "edu-masters", degree: "Pre-Master's Program (Completed)", school: "Zewail City of Science and Technology", dates: "2024 - 2025" },
    { id: "edu-bsc", degree: "B.Sc. Computer and Information Sciences, GPA 3.89/4.0", school: "Zagazig University - Computer Science", dates: "2019 - 2023" },
  ],
  certifications: ["Google Data Analytics Professional Certificate - Coursera", "Career Track: Data Science - 365 Data Science"],
  awards: ["2nd Place - Dell Envision the Future Competition, MENA Region, Africa & Turkey", "3rd Place - EUI Climathon, Smart Transportation Theme, MENA Region & Africa"],
  interests: ["Quantum Machine Learning", "Explainable AI", "Large Language Models", "Arabic NLP"],
  sectionOrder: [...sectionKeys],
};
