import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type GradeDepth = "Advanced" | "Proficient" | "Intermediate" | "Foundational";
export type SkillSource = "course" | "self-declared" | "certification" | "project";

export interface Course {
  id: string;
  name: string;
  grade: string;
  depthLevel: GradeDepth;
  skillsCredited: string[];
}

export interface SkillItem {
  name: string;
  source: SkillSource;
  depth: GradeDepth;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  skills: string[];
  verified: boolean;
  imageUri?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export type SkillTrend = "growing" | "stable" | "declining";
export type GapPriority = "Critical" | "Important" | "Emerging";

export interface GapItem {
  id: string;
  skill: string;
  sdi: number;
  priority: GapPriority;
  trend: SkillTrend;
  trendValue: number;
  youHave: string | null;
  whatYouNeed: string[];
  whatYouHave: string[];
  closedBy: string[];
}

export interface RoadmapCert {
  id: string;
  title: string;
  provider: string;
  platform: string;
  duration: string;
  rating: number;
  enrolled: string;
  free: boolean;
  gapsClosedIds: string[];
  gapsClosedNames: string[];
  status: "Not Started" | "In Progress" | "Completed";
  url?: string;
}

export interface RoadmapProject {
  id: string;
  title: string;
  description: string;
  dataset?: string;
  estimatedTime: string;
  gapsClosedIds: string[];
  gapsClosedNames: string[];
  status: "Not Started" | "In Progress" | "Completed";
}

export interface DecayWarning {
  id: string;
  skill: string;
  trendPerMonth: number;
  rSquared: number;
  forecastIn3Months: number;
  history: { period: string; value: number }[];
  replacement: string;
  replacementHistory: { period: string; value: number }[];
  replacementTrend: number;
  coOccurrenceConfidence: number;
  dismissed: boolean;
}

export interface AffinityCluster {
  name: string;
  avgGrade: number;
  subjects: string[];
}

export interface AffinityCareer {
  career: string;
  affinity: "Strong" | "Moderate" | "Weak";
  stars: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  program: string;
  yearLevel: string;
  university: string;
  courses: Course[];
  additionalSkills: SkillItem[];
  certifications: Certification[];
  projects: Project[];
  targetCareer: string | null;
  targetCareerPostings: number;
  onboardingStep: "courses" | "skills" | "certs" | "projects" | "career" | "computing" | "complete";
  gapAnalysis: GapItem[];
  roadmapCerts: RoadmapCert[];
  roadmapProjects: RoadmapProject[];
  decayWarnings: DecayWarning[];
  affinityClusters: AffinityCluster[];
  affinityCareers: AffinityCareer[];
  readinessScore: number;
  skillsMatched: number;
  totalRequired: number;
  readinessHistory: { label: string; score: number }[];
}

export const COURSE_LIST = [
  { id: "dbms", name: "Database Management Systems", skills: ["SQL", "Database Design", "Normalization"] },
  { id: "stats", name: "Statistics and Probability", skills: ["Statistical Analysis", "Probability", "Data Interpretation"] },
  { id: "prog1", name: "Computer Programming 1", skills: ["Python Basics", "Programming Logic", "Problem Solving"] },
  { id: "prog2", name: "Computer Programming 2 (OOP)", skills: ["Object-Oriented Programming", "Java", "Debugging"] },
  { id: "ds", name: "Data Structures and Algorithms", skills: ["Data Structures", "Algorithms", "Problem Solving"] },
  { id: "web", name: "Web Development", skills: ["HTML", "CSS", "JavaScript"] },
  { id: "im", name: "Information Management", skills: ["Data Organization", "Information Systems", "Business Process"] },
  { id: "sad", name: "Systems Analysis and Design", skills: ["Systems Thinking", "Documentation", "Use Case Modeling"] },
  { id: "da", name: "Data Analytics", skills: ["Data Analysis", "Data Visualization", "Excel", "Dashboard Design"] },
  { id: "mob", name: "Mobile Application Development", skills: ["Mobile Development", "React Native", "UI/UX"] },
  { id: "net", name: "Computer Networks", skills: ["Networking", "TCP/IP", "Network Security"] },
  { id: "os", name: "Operating Systems", skills: ["Linux", "System Administration", "Shell Scripting"] },
  { id: "se", name: "Software Engineering", skills: ["Software Development", "Agile", "Git", "Documentation"] },
  { id: "hci", name: "Human-Computer Interaction", skills: ["UI/UX Design", "User Research", "Prototyping"] },
  { id: "pm", name: "Project Management", skills: ["Project Planning", "Scrum", "Risk Management"] },
  { id: "ml", name: "Machine Learning", skills: ["Machine Learning", "scikit-learn", "Model Evaluation"] },
  { id: "adv_db", name: "Advanced Database Systems", skills: ["SQL Advanced", "Query Optimization", "NoSQL"] },
  { id: "bi", name: "Business Intelligence", skills: ["Power BI", "Tableau", "Data Warehousing", "ETL"] },
];

export const ADDITIONAL_SKILLS_LIST = [
  "Python", "R", "Excel Advanced", "Power BI", "Tableau", "SQL Advanced",
  "Machine Learning", "pandas", "NumPy", "TensorFlow", "PyTorch", "Keras",
  "Git", "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Snowflake", "dbt",
  "JavaScript", "TypeScript", "React", "Node.js", "REST APIs",
  "Data Visualization", "Statistics Applied", "A/B Testing",
  "Microsoft Access", "SPSS", "Canva", "Figma", "Photoshop",
  "PHP", "Java", "C++", "Kotlin", "Swift", "Flutter",
];

export function gradeToDepth(grade: string): GradeDepth | null {
  const g = parseFloat(grade);
  if (isNaN(g) || g > 3.0) return null;
  if (g <= 1.5) return "Advanced";
  if (g <= 2.0) return "Proficient";
  if (g <= 2.75) return "Intermediate";
  return "Foundational";
}

const DATA_ANALYST_GAPS: GapItem[] = [
  {
    id: "g1", skill: "SQL Advanced", sdi: 91, priority: "Critical", trend: "growing", trendValue: 3.2,
    youHave: null,
    whatYouNeed: ["Window functions: ROW_NUMBER, RANK, LAG, LEAD", "Common Table Expressions (CTEs) and recursive queries", "Subqueries and correlated subqueries", "Query optimization — execution plans, indexing", "Complex aggregations: GROUPING SETS, ROLLUP, CUBE"],
    whatYouHave: ["SELECT, FROM, WHERE, JOIN, GROUP BY", "Basic aggregations (COUNT, SUM, AVG)", "Primary/foreign keys, normalization"],
    closedBy: ["Google Data Analytics Certificate"],
  },
  {
    id: "g2", skill: "Tableau", sdi: 78, priority: "Critical", trend: "growing", trendValue: 5.1,
    youHave: null,
    whatYouNeed: ["Data connections and live vs. extract", "Calculated fields, LOD expressions", "Dashboard design and interactivity", "Story creation and presentation", "Published views and Tableau Server"],
    whatYouHave: [],
    closedBy: ["Google Data Analytics Certificate", "Tableau Desktop Specialist"],
  },
  {
    id: "g3", skill: "Python Intermediate", sdi: 74, priority: "Critical", trend: "stable", trendValue: 0.3,
    youHave: null,
    whatYouNeed: ["pandas — DataFrame operations, merging, reshaping", "NumPy — vectorized array operations", "Data cleaning: nulls, type conversion, deduplication", "File I/O: CSV, Excel, JSON, DB connections", "matplotlib / seaborn for visualization"],
    whatYouHave: ["Python syntax, loops, functions, file I/O", "Basic OOP concepts"],
    closedBy: ["Google Data Analytics Certificate"],
  },
  {
    id: "g4", skill: "Power BI", sdi: 63, priority: "Important", trend: "growing", trendValue: 14.0,
    youHave: null,
    whatYouNeed: ["Data modeling with relationships", "DAX formulas for calculated measures", "Power Query for data transformation", "Report and dashboard design", "Publishing to Power BI Service"],
    whatYouHave: [],
    closedBy: ["Microsoft Power BI Data Analyst"],
  },
  {
    id: "g5", skill: "Excel Advanced", sdi: 58, priority: "Important", trend: "stable", trendValue: -0.5,
    youHave: null,
    whatYouNeed: ["Pivot tables and slicers", "XLOOKUP, INDEX-MATCH, SUMIFS", "Power Query for data import and transformation", "Data validation and conditional formatting", "Macros and VBA basics"],
    whatYouHave: ["Basic Excel functions: SUM, AVERAGE, COUNT"],
    closedBy: ["Google Data Analytics Certificate"],
  },
  {
    id: "g6", skill: "Statistics Applied", sdi: 52, priority: "Important", trend: "stable", trendValue: 1.2,
    youHave: null,
    whatYouNeed: ["Hypothesis testing (t-test, ANOVA, chi-square)", "Regression analysis (linear, logistic)", "Probability distributions in practice", "A/B testing framework", "Correlation vs. causation analysis"],
    whatYouHave: ["Descriptive statistics", "Basic probability theory"],
    closedBy: ["Google Data Analytics Certificate"],
  },
  {
    id: "g7", skill: "dbt (Data Build Tool)", sdi: 31, priority: "Emerging", trend: "growing", trendValue: 8.7,
    youHave: null,
    whatYouNeed: ["SQL-based data transformations", "Model dependencies and DAG management", "Testing and documentation in dbt", "Jinja templating for dynamic SQL", "Integration with data warehouses"],
    whatYouHave: [],
    closedBy: [],
  },
  {
    id: "g8", skill: "Snowflake", sdi: 24, priority: "Emerging", trend: "growing", trendValue: 6.3,
    youHave: null,
    whatYouNeed: ["Virtual warehouse concepts", "Snowflake SQL dialect", "Time travel and data cloning", "Role-based access control", "Integration with BI tools"],
    whatYouHave: [],
    closedBy: [],
  },
];

const DATA_ANALYST_CERTS: RoadmapCert[] = [
  {
    id: "c1", title: "Google Data Analytics Certificate",
    provider: "Google", platform: "Coursera", duration: "~6 months at 10 hrs/week",
    rating: 4.8, enrolled: "2.1M", free: true,
    gapsClosedIds: ["g1", "g3", "g5", "g6"],
    gapsClosedNames: ["SQL Advanced", "Python Intermediate", "Excel Advanced", "Statistics Applied"],
    status: "Not Started", url: "https://coursera.org/professional-certificates/google-data-analytics",
  },
  {
    id: "c2", title: "Microsoft Power BI Data Analyst",
    provider: "Microsoft", platform: "Microsoft Learn", duration: "~3 months",
    rating: 4.7, enrolled: "890K", free: true,
    gapsClosedIds: ["g4"],
    gapsClosedNames: ["Power BI"],
    status: "Not Started",
  },
  {
    id: "c3", title: "Tableau Desktop Specialist",
    provider: "Tableau", platform: "Tableau Training", duration: "~2 months",
    rating: 4.6, enrolled: "340K", free: false,
    gapsClosedIds: ["g2"],
    gapsClosedNames: ["Tableau"],
    status: "Not Started",
  },
];

const DATA_ANALYST_PROJECTS: RoadmapProject[] = [
  {
    id: "p1", title: "End-to-End Sales Analysis Dashboard",
    description: "Build a complete analysis pipeline: SQL queries → Python cleaning → Tableau dashboard. Suitable for portfolio.",
    dataset: "Superstore Sales dataset from Kaggle",
    estimatedTime: "2–3 weeks",
    gapsClosedIds: ["g1", "g3", "g2"],
    gapsClosedNames: ["SQL Advanced", "Python Intermediate", "Tableau"],
    status: "Not Started",
  },
  {
    id: "p2", title: "Customer Segmentation with Python",
    description: "Perform K-means clustering on Philippine business data. Write a full Jupyter notebook with EDA and findings.",
    dataset: "Public Philippine e-commerce dataset",
    estimatedTime: "1–2 weeks",
    gapsClosedIds: ["g3", "g6"],
    gapsClosedNames: ["Python Intermediate", "Statistics Applied"],
    status: "Not Started",
  },
  {
    id: "p3", title: "HR Attrition Dashboard (Power BI)",
    description: "Build a Power BI dashboard analyzing employee attrition drivers. Use DAX measures and drill-through pages.",
    dataset: "IBM HR Analytics dataset from Kaggle",
    estimatedTime: "1–2 weeks",
    gapsClosedIds: ["g4"],
    gapsClosedNames: ["Power BI"],
    status: "Not Started",
  },
];

const DECAY_WARNINGS: DecayWarning[] = [
  {
    id: "d1", skill: "Microsoft Access",
    trendPerMonth: -8.2, rSquared: 0.97, forecastIn3Months: 9,
    history: [
      { period: "Jan 2024", value: 41 }, { period: "Apr 2024", value: 33 },
      { period: "Jul 2024", value: 28 }, { period: "Oct 2024", value: 19 },
      { period: "Jan 2025", value: 14 },
    ],
    replacement: "Power BI", replacementTrend: 14.0, coOccurrenceConfidence: 0.87,
    replacementHistory: [
      { period: "Oct 2024", value: 48 }, { period: "Jan 2025", value: 63 },
    ],
    dismissed: false,
  },
];

const AFFINITY_CLUSTERS: AffinityCluster[] = [
  { name: "ANALYTICAL & DATA", avgGrade: 1.47, subjects: ["Statistics and Probability", "Database Management Systems", "Information Management"] },
  { name: "SYSTEMS & DESIGN", avgGrade: 2.00, subjects: ["Systems Analysis and Design", "Information Management"] },
];

const AFFINITY_CAREERS: AffinityCareer[] = [
  { career: "Data Analyst", affinity: "Strong", stars: 3 },
  { career: "Business Analyst", affinity: "Strong", stars: 3 },
  { career: "Data Engineer", affinity: "Moderate", stars: 2 },
  { career: "Business Intelligence Analyst", affinity: "Moderate", stars: 2 },
];

export const CAREER_MATCHES: { career: string; postings: number; confidence: number }[][] = [
  [
    { career: "Data Analyst", postings: 847, confidence: 0.94 },
    { career: "Business Intelligence Analyst", postings: 312, confidence: 0.81 },
    { career: "Data Reporting Specialist", postings: 198, confidence: 0.73 },
  ],
  [
    { career: "Software Engineer", postings: 1204, confidence: 0.93 },
    { career: "Full Stack Developer", postings: 891, confidence: 0.87 },
    { career: "Backend Developer", postings: 634, confidence: 0.76 },
  ],
  [
    { career: "Frontend Developer", postings: 723, confidence: 0.91 },
    { career: "UI/UX Designer", postings: 412, confidence: 0.83 },
    { career: "Web Developer", postings: 561, confidence: 0.79 },
  ],
  [
    { career: "Network Engineer", postings: 423, confidence: 0.89 },
    { career: "IT Support Specialist", postings: 612, confidence: 0.84 },
    { career: "Systems Administrator", postings: 287, confidence: 0.71 },
  ],
];

function computeGapsForUser(user: Partial<User>): { gaps: GapItem[]; score: number; matched: number; total: number } {
  const ownedSkills = new Set<string>();
  (user.courses ?? []).forEach((c) => c.skillsCredited.forEach((s) => ownedSkills.add(s.toLowerCase())));
  (user.additionalSkills ?? []).forEach((s) => ownedSkills.add(s.name.toLowerCase()));
  (user.certifications ?? []).forEach((cert) => cert.skills.forEach((s) => ownedSkills.add(s.toLowerCase())));
  (user.projects ?? []).forEach((p) => p.skills.forEach((s) => ownedSkills.add(s.toLowerCase())));

  const gaps = DATA_ANALYST_GAPS.map((gap) => {
    const skillLower = gap.skill.toLowerCase();
    const hasSkill = ownedSkills.has(skillLower) || ownedSkills.has(gap.skill.split(" ")[0].toLowerCase());
    return { ...gap, youHave: hasSkill ? gap.skill : null };
  });

  const matched = gaps.filter((g) => g.youHave !== null).length;
  const total = gaps.length;
  const score = Math.round((matched / total) * 100);
  return { gaps, score, matched, total };
}

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; program: string; yearLevel: string; university: string }) => Promise<boolean>;
  logout: () => void;
  updateOnboardingStep: (step: User["onboardingStep"]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  setAdditionalSkills: (skills: SkillItem[]) => void;
  addCertification: (cert: Certification) => void;
  removeCertification: (id: string) => void;
  updateCertificationImage: (id: string, imageUri: string) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setTargetCareer: (career: string, postings: number) => void;
  completeOnboarding: () => void;
  updateRoadmapCertStatus: (id: string, status: RoadmapCert["status"]) => void;
  updateRoadmapProjectStatus: (id: string, status: RoadmapProject["status"]) => void;
  dismissDecayWarning: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "ctc_user_v3";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        setIsLoggedIn(true);
      }
    });
  }, []);

  const save = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    const u: User = {
      id: "demo", name: "Juan dela Cruz", email, program: "BSIT", yearLevel: "3rd Year",
      university: "Polytechnic University of the Philippines",
      courses: [], additionalSkills: [], certifications: [], projects: [],
      targetCareer: null, targetCareerPostings: 0,
      onboardingStep: "courses",
      gapAnalysis: [], roadmapCerts: DATA_ANALYST_CERTS, roadmapProjects: DATA_ANALYST_PROJECTS,
      decayWarnings: DECAY_WARNINGS, affinityClusters: AFFINITY_CLUSTERS, affinityCareers: AFFINITY_CAREERS,
      readinessScore: 0, skillsMatched: 0, totalRequired: 8, readinessHistory: [],
    };
    setIsLoggedIn(true);
    await save(u);
    return true;
  };

  const register = async (data: { name: string; email: string; password: string; program: string; yearLevel: string; university: string }): Promise<boolean> => {
    const u: User = {
      id: Date.now().toString(), name: data.name, email: data.email,
      program: data.program, yearLevel: data.yearLevel, university: data.university,
      courses: [], additionalSkills: [], certifications: [], projects: [],
      targetCareer: null, targetCareerPostings: 0,
      onboardingStep: "courses",
      gapAnalysis: [], roadmapCerts: DATA_ANALYST_CERTS, roadmapProjects: DATA_ANALYST_PROJECTS,
      decayWarnings: DECAY_WARNINGS, affinityClusters: AFFINITY_CLUSTERS, affinityCareers: AFFINITY_CAREERS,
      readinessScore: 0, skillsMatched: 0, totalRequired: 8, readinessHistory: [],
    };
    setIsLoggedIn(true);
    await save(u);
    return true;
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updateOnboardingStep = async (step: User["onboardingStep"]) => {
    if (!user) return;
    await save({ ...user, onboardingStep: step });
  };

  const addCourse = async (course: Course) => {
    if (!user) return;
    const courses = [...user.courses.filter((c) => c.id !== course.id), course];
    await save({ ...user, courses });
  };

  const removeCourse = async (id: string) => {
    if (!user) return;
    await save({ ...user, courses: user.courses.filter((c) => c.id !== id) });
  };

  const setAdditionalSkills = async (skills: SkillItem[]) => {
    if (!user) return;
    await save({ ...user, additionalSkills: skills });
  };

  const addCertification = async (cert: Certification) => {
    if (!user) return;
    const certifications = [...user.certifications.filter((c) => c.id !== cert.id), cert];
    await save({ ...user, certifications });
  };

  const removeCertification = async (id: string) => {
    if (!user) return;
    await save({ ...user, certifications: user.certifications.filter((c) => c.id !== id) });
  };

  const updateCertificationImage = async (id: string, imageUri: string) => {
    if (!user) return;
    const certifications = user.certifications.map((c) =>
      c.id === id ? { ...c, imageUri, verified: true } : c
    );
    await save({ ...user, certifications });
  };

  const addProject = async (project: Project) => {
    if (!user) return;
    await save({ ...user, projects: [...user.projects, project] });
  };

  const removeProject = async (id: string) => {
    if (!user) return;
    await save({ ...user, projects: user.projects.filter((p) => p.id !== id) });
  };

  const setTargetCareer = async (career: string, postings: number) => {
    if (!user) return;
    await save({ ...user, targetCareer: career, targetCareerPostings: postings, onboardingStep: "computing" });
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const { gaps, score, matched, total } = computeGapsForUser(user);
    await save({
      ...user,
      onboardingStep: "complete",
      gapAnalysis: gaps,
      readinessScore: score,
      skillsMatched: matched,
      totalRequired: total,
      readinessHistory: [{ label: "Start", score }],
    });
  };

  const updateRoadmapCertStatus = async (id: string, status: RoadmapCert["status"]) => {
    if (!user) return;
    const updated = user.roadmapCerts.map((c) => (c.id === id ? { ...c, status } : c));
    let newUser = { ...user, roadmapCerts: updated };
    if (status === "Completed") {
      const cert = updated.find((c) => c.id === id);
      if (cert) {
        const newCertSkills: SkillItem[] = cert.gapsClosedNames.map((s) => ({
          name: s, source: "certification" as SkillSource, depth: "Advanced" as GradeDepth,
        }));
        const certObj: Certification = {
          id, title: cert.title, issuer: cert.provider, date: new Date().toISOString().split("T")[0],
          skills: cert.gapsClosedNames, verified: true,
        };
        const updatedCerts = [...newUser.certifications.filter((c) => c.id !== id), certObj];
        newUser = { ...newUser, certifications: updatedCerts };
        const { gaps, score, matched, total } = computeGapsForUser(newUser);
        const history = [...newUser.readinessHistory, { label: cert.title.split(" ").slice(0, 2).join(" "), score }];
        newUser = { ...newUser, gapAnalysis: gaps, readinessScore: score, skillsMatched: matched, totalRequired: total, readinessHistory: history };
      }
    }
    await save(newUser);
  };

  const updateRoadmapProjectStatus = async (id: string, status: RoadmapProject["status"]) => {
    if (!user) return;
    const updated = user.roadmapProjects.map((p) => (p.id === id ? { ...p, status } : p));
    await save({ ...user, roadmapProjects: updated });
  };

  const dismissDecayWarning = async (id: string) => {
    if (!user) return;
    const updated = user.decayWarnings.map((d) => (d.id === id ? { ...d, dismissed: true } : d));
    await save({ ...user, decayWarnings: updated });
  };

  return (
    <AppContext.Provider value={{
      user, isLoggedIn, login, register, logout, updateOnboardingStep,
      addCourse, removeCourse, setAdditionalSkills, addCertification, removeCertification,
      addProject, removeProject, setTargetCareer, completeOnboarding,
      updateRoadmapCertStatus, updateRoadmapProjectStatus, dismissDecayWarning,
    updateCertificationImage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
