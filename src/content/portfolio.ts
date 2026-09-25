export const links = {
  github: "https://github.com/namelessmonarch0",
  linkedin: "https://www.linkedin.com/in/kudayyurter/",
  email: "kudayyurter@gmail.com",
};

export const about = [
  "I’m Kuday, a Computer Science student at Texas A&M University–Victoria. I build software that replaces slow, manual work with tools people actually use.",
  "I’m a data science intern at Cummins, where I build dashboards, a machine learning model, AI assistants, and internal apps. Before that, I ran operations for an online engraving store and taught myself Python to automate it.",
];

export const education = {
  monogram: "TAMU-V",
  logo: { src: "/logos/tamuv.svg", width: 84, height: 44 },
  school: "Texas A&M University–Victoria",
  degree: "B.S. Computer Science · 3.8 GPA · President’s List",
  previously: "Associate of Science, Houston City College, 2022",
};

/** Best-known first. Logos live in public/logos. */
export const stack = [
  { name: "Python", logo: "python" },
  { name: "SQL", logo: "sql" },
  { name: "Databricks", logo: "databricks" },
  { name: "Power Platform", logo: "powerplatform" },
  { name: "React", logo: "react" },
  { name: "TypeScript", logo: "typescript" },
  { name: "JavaScript", logo: "javascript" },
  { name: "Linux", logo: "linux" },
  { name: "Git", logo: "git" },
  { name: "C / C++", logo: "cplusplus" },
  { name: "Power BI", logo: "powerbi" },
  { name: "scikit-learn", logo: "scikitlearn" },
  { name: "Copilot Studio", logo: "copilotstudio" },
  { name: "AWS", logo: "aws" },
  { name: "Azure", logo: "azure" },
  { name: "Docker", logo: "docker" },
  { name: "Neovim", logo: "neovim" },
  { name: "Rust", logo: "rust" },
  { name: "C#", logo: "csharp" },
  { name: ".NET", logo: "dotnet" },
  { name: "Node.js", logo: "nodejs" },
  { name: "FastAPI", logo: "fastapi" },
  { name: "Unreal Engine", logo: "unrealengine" },
  { name: "Unity", logo: "unity" },
  { name: "MATLAB", logo: "matlab" },
];

/** A real logo shown in place of a pixel monogram. */
export type Logo = { src: string; width: number; height: number };

/** Newest first. `logo` replaces the pixel monogram when set. */
export const experience: {
  monogram: string;
  logo?: Logo;
  company: string;
  role: string;
  date: string;
  highlights: string[];
}[] = [
  {
    monogram: "C",
    logo: { src: "/logos/cummins.svg", width: 48, height: 48 },
    company: "Cummins",
    role: "Data Science Intern",
    date: "May 2026 — Present",
    highlights: [
      "Built dashboards and a machine learning model for the turbo balancing line, which helped raise output from 35 to 55 turbos a day per machine.",
      "Built AI assistants for patent review and project intake, an app that replaced 5+ skills trackers, and the department’s SharePoint site.",
    ],
  },
  {
    monogram: "EMN",
    company: "Engrave Me Now",
    role: "Operations Manager",
    date: "Jan 2025 — May 2026",
    highlights: [
      "Ran the production floor on my own for a store shipping 1,000+ orders a week, with a 4.9/5 rating across three storefronts.",
      "Built the sales and inventory system the business ran on, and kept four laser and UV machines running 99% of the time.",
    ],
  },
  {
    monogram: "UH",
    logo: { src: "/logos/uh.svg", width: 57, height: 48 },
    company: "University of Houston",
    role: "IT Support Specialist",
    date: "Jan 2023 — Aug 2024",
    highlights: [
      "Fixed hardware and software problems for faculty and students in the College of Technology, with a 95% satisfaction rate.",
      "Kept 20+ computer labs up to date and set up new labs from unboxed hardware to networked machines.",
    ],
  },
  {
    monogram: "IF",
    company: "IFixandRepair",
    role: "Store Manager & Repair Technician",
    date: "Dec 2020 — May 2022",
    highlights: [
      "Repaired 100+ phones, tablets, and laptops — screens, cameras, back glass, and system recovery — with a 95% success rate.",
      "Ran the store alone on many shifts, from customer intake to repairs to closing.",
    ],
  },
];

export const workProjects = [
  {
    name: "Turbo Balancer dashboards",
    description:
      "Live dashboards for Cummins’ turbo balancing machines, replacing hand-entered data and Excel reports. Engineers used them to find the slow spots on the line.",
    result: "35 → 55 turbos a day per machine",
    stack: "Databricks · Python · Power BI",
    context: "Cummins",
  },
  {
    name: "Balancer correction model",
    description:
      "A model that reproduces the correction the balancing machine calculates, matching it about 98% of the time, so the machines Cummins already owns can do more.",
    result: "About $16M in new machines not needed",
    stack: "Python · scikit-learn",
    context: "Cummins",
  },
  {
    name: "Engineering AI agents",
    description:
      "Assistants that compare new patents against Cummins’ own, turn rough project ideas into proposals, and help with quality decisions — all answering from internal documents.",
    result: "Patent reviews take half the time",
    stack: "Copilot Studio · AWS Bedrock · Databricks",
    context: "Cummins",
  },
  {
    name: "Skills & Capabilities app",
    description:
      "One app for tracking who knows what, replacing 5+ scattered spreadsheets and tools. Rolled out first to a 30-person engineering team.",
    result: "About 60% less time spent managing skills",
    stack: "React · Power Apps · Dataverse",
    context: "Cummins",
  },
  {
    name: "CCS AI SharePoint site",
    description:
      "The home for AI work across Cummins’ components and software group: news, a list of live and in-progress agents, and training.",
    result: "Live for a ~20,000-person organization",
    stack: "SharePoint",
    context: "Cummins",
  },
  {
    name: "Store sales & inventory system",
    description:
      "Pulls orders and stock from Amazon, Etsy, and a third store into one place, forecasts demand, and ranks what to restock before each order.",
    result: "Inventory costs down 20%, sales up 30%",
    stack: "Python · Amazon and Etsy APIs",
    context: "Engrave Me Now",
  },
];

export const personalProjects = [
  {
    name: "Kessler",
    description:
      "Every tracked object in Earth orbit, 1957 to now: a live 3D globe of about 30,000 objects at their real positions, plus charts of how orbit got crowded. It started as my team’s MATLAB app that took 1st place out of 25 teams at the Grand Challenge Winter Summit.",
    stack: "Next.js · Three.js · FastAPI · AWS",
    href: "https://kessler.kudayyurter.dev",
    linkLabel: "kessler.kudayyurter.dev",
  },
  {
    name: "Dispatch",
    description:
      "A terminal app for running several coding agents (Claude Code, Codex, opencode) side by side in live, tiled terminals. Early stage.",
    stack: "Rust",
    href: "https://github.com/namelessmonarch0/Dispatch",
    linkLabel: "GitHub",
  },
  {
    name: "Snake Game",
    description: "A retro snake game.",
    stack: "C++ · Raylib",
    href: "https://github.com/namelessmonarch0/SnakeGame",
    linkLabel: "GitHub",
  },
  {
    name: "Clash of Valor",
    description: "A duel game that runs in the terminal.",
    stack: "C++",
    href: "https://github.com/namelessmonarch0/ClashOfValor",
    linkLabel: "GitHub",
  },
  {
    name: "Lumon boot splash",
    description:
      "A Linux boot animation styled after Lumon, the company in Severance.",
    stack: "Shell · Plymouth",
    href: "https://github.com/namelessmonarch0/PlymouthLumonSplash",
    linkLabel: "GitHub",
  },
];
