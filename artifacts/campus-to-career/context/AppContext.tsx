import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  program: string;
  yearLevel: string;
  targetCareer: string;
  skills: string[];
  certifications: string[];
  projects: string[];
}

export interface SkillGap {
  id: string;
  skill: string;
  demand: number;
  priority: "Critical" | "Important" | "Emerging";
  description: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  type: "Certification" | "Project";
  skills: string[];
  status: "Not Started" | "In Progress" | "Completed";
  provider?: string;
  duration?: string;
}

export interface SkillDecay {
  id: string;
  skill: string;
  trend: number;
  replacement: string;
}

const defaultUser: User = {
  id: "1",
  name: "Juan dela Cruz",
  email: "juan@university.edu.ph",
  program: "BSIT",
  yearLevel: "3rd Year",
  targetCareer: "Data Analyst",
  skills: ["Python", "SQL", "Excel", "HTML/CSS"],
  certifications: ["CompTIA IT Fundamentals"],
  projects: ["University Enrollment System"],
};

const defaultSkillGaps: SkillGap[] = [
  { id: "1", skill: "Machine Learning", demand: 87, priority: "Critical", description: "Core requirement for data analyst roles in the Philippines. High demand across BPO, fintech, and e-commerce sectors." },
  { id: "2", skill: "Power BI / Tableau", demand: 74, priority: "Critical", description: "Business intelligence tools heavily required by local enterprises and multinationals." },
  { id: "3", skill: "Apache Spark", demand: 61, priority: "Important", description: "Used by large data teams at leading PH companies for big data processing." },
  { id: "4", skill: "R Programming", demand: 55, priority: "Important", description: "Statistical analysis language used in research, banking, and healthcare." },
  { id: "5", skill: "Cloud Platforms (AWS/GCP)", demand: 68, priority: "Important", description: "Essential for modern data infrastructure. Many PH companies migrating to cloud." },
  { id: "6", skill: "dbt (Data Build Tool)", demand: 38, priority: "Emerging", description: "Rapidly growing in analytics engineering workflows." },
  { id: "7", skill: "LLM Fine-tuning", demand: 42, priority: "Emerging", description: "AI skills becoming differentiators in competitive job market." },
];

const defaultRoadmap: RoadmapItem[] = [
  { id: "1", title: "Google Data Analytics Certificate", type: "Certification", skills: ["SQL", "R", "Tableau"], status: "In Progress", provider: "Google / Coursera", duration: "6 months" },
  { id: "2", title: "AWS Cloud Practitioner", type: "Certification", skills: ["Cloud", "AWS"], status: "Not Started", provider: "Amazon Web Services", duration: "3 months" },
  { id: "3", title: "Sales Forecasting Dashboard", type: "Project", skills: ["Python", "ML", "Power BI"], status: "Not Started" },
  { id: "4", title: "Microsoft Power BI Data Analyst", type: "Certification", skills: ["Power BI", "DAX", "SQL"], status: "Not Started", provider: "Microsoft", duration: "4 months" },
  { id: "5", title: "Customer Churn Prediction Model", type: "Project", skills: ["Python", "ML", "Pandas"], status: "Not Started" },
];

const defaultSkillDecays: SkillDecay[] = [
  { id: "1", skill: "Basic HTML/CSS", trend: -24, replacement: "React / Tailwind CSS" },
  { id: "2", skill: "Microsoft Access", trend: -41, replacement: "PostgreSQL / MySQL" },
  { id: "3", skill: "Flash/ActionScript", trend: -89, replacement: "JavaScript / TypeScript" },
];

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  skillGaps: SkillGap[];
  roadmap: RoadmapItem[];
  skillDecays: SkillDecay[];
  readinessScore: number;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateRoadmapStatus: (id: string, status: RoadmapItem["status"]) => void;
  updateUser: (data: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [skillGaps] = useState<SkillGap[]>(defaultSkillGaps);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(defaultRoadmap);
  const [skillDecays] = useState<SkillDecay[]>(defaultSkillDecays);

  const readinessScore = 63;

  useEffect(() => {
    AsyncStorage.getItem("user").then((data) => {
      if (data) {
        setUser(JSON.parse(data));
        setIsLoggedIn(true);
      }
    });
    AsyncStorage.getItem("roadmap").then((data) => {
      if (data) setRoadmap(JSON.parse(data));
    });
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const u = { ...defaultUser, email };
    setUser(u);
    setIsLoggedIn(true);
    await AsyncStorage.setItem("user", JSON.stringify(u));
    return true;
  };

  const register = async (data: Partial<User> & { password: string }): Promise<boolean> => {
    const u: User = {
      id: Date.now().toString(),
      name: data.name ?? "",
      email: data.email ?? "",
      program: data.program ?? "BSIT",
      yearLevel: data.yearLevel ?? "1st Year",
      targetCareer: "Data Analyst",
      skills: [],
      certifications: [],
      projects: [],
    };
    setUser(u);
    setIsLoggedIn(true);
    await AsyncStorage.setItem("user", JSON.stringify(u));
    return true;
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem("user");
  };

  const updateRoadmapStatus = async (id: string, status: RoadmapItem["status"]) => {
    const updated = roadmap.map((item) => (item.id === id ? { ...item, status } : item));
    setRoadmap(updated);
    await AsyncStorage.setItem("roadmap", JSON.stringify(updated));
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{ user, isLoggedIn, skillGaps, roadmap, skillDecays, readinessScore, login, register, logout, updateRoadmapStatus, updateUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
