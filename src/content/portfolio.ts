export const links = {
  github: "https://github.com/namelessmonarch0",
  linkedin: "https://www.linkedin.com/in/kudayyurter/",
  email: "kudayyurter@gmail.com",
};

export const intro = {
  tagline: "Software · Data · AI — Houston, TX",
  headline: "Software engineer. Curious by default.",
  body: "I turn messy data into useful systems — pipelines, AI agents, and software that makes things work better.",
};

export const results: {
  start?: number;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
}[] = [
  { start: 35, value: 55, prefix: "35 → ", suffix: "", label: "Units per day, per machine" },
  { value: 98, prefix: "~", suffix: "%", label: "Correction-angle match" },
  { value: 50, prefix: "", suffix: "%", label: "Less time on patent reviews" },
];

export const about = [
  "I’m Kuday, a Computer Science student at Texas A&M University–Victoria, based in Houston. I build across software engineering, data, and AI — usually wherever there’s a slow process or a messy dataset worth improving.",
  "My path into software has been hands-on. I’ve repaired devices, supported computer labs, and run an e-commerce production floor. At Engrave Me Now, I taught myself Python to connect the business’s data. At Cummins, that curiosity grew into manufacturing pipelines, machine learning, and tools for engineers.",
  "Outside of work, I’m into Linux, fast terminal workflows, and game development with Raylib, Unreal Engine, and Unity. I enjoy tools that invite you to take them apart.",
];

export const skills = [
  ["Languages", "Python, SQL, TypeScript, JavaScript, C/C++, C#, Rust"],
  ["Data & AI", "Databricks, Delta Lake, PySpark, scikit-learn, Power BI, AWS Bedrock"],
  ["Applications", "React, Node.js, FastAPI, .NET, Power Platform, Dataverse"],
  ["Everyday tools", "Linux, Neovim, Git, Docker, Azure, CLI tooling"],
] as const;

export const education = {
  monogram: "TAMU-V",
  school: "Texas A&M University–Victoria",
  degree: "B.S. Computer Science · 3.8 / 4.0 GPA · President’s List",
  previously: "Previously: Associate of Science, Houston City College · 2022",
};

export const experience = [
  {
    monogram: "C",
    company: "Cummins",
    role: "Data Science Intern",
    date: "May 2026 — Present",
    location: "Columbus, IN",
    summary:
      "Built data pipelines, machine learning models, AI agents, and internal applications with the Components and Software AI department.",
    highlights: [
      "Automated Turbo Balancer data ingestion and analytics; insights helped raise throughput from 35 to 55 units per day per machine.",
      "Built a React and Dataverse skills hub, consolidating 5+ tools for an initial team of approximately 30 people.",
      "Created document-grounded agents for engineering quality, patent review, and project intake.",
    ],
  },
  {
    monogram: "EMN",
    company: "Engrave Me Now",
    role: "Operations Manager",
    date: "Jan 2025 — May 2026",
    location: "Katy, TX",
    summary:
      "Ran the production floor and built the software behind a business fulfilling more than 1,000 orders a week.",
    highlights: [
      "Connected three storefronts with a Python ETL pipeline using Amazon and Etsy APIs.",
      "Used custom analytics to help reduce inventory overhead by 20% and increase sales by 30%.",
      "Managed production, fulfillment, equipment maintenance, and collaboration with a remote team.",
    ],
  },
  {
    monogram: "IF",
    company: "IFixandRepair",
    role: "Store Manager & Repair Technician",
    date: "Dec 2020 — May 2022",
    location: "Houston, TX",
    summary:
      "Diagnosed and repaired over 100 mobile devices and computers, while managing store operations and customer support.",
    highlights: [
      "Hands-on hardware diagnostics, precision repairs, and operating system recovery.",
      "Maintained a 95% repair success rate across a range of devices and platforms.",
    ],
  },
];

export const projects = [
  {
    id: "01",
    name: "Turbo Balancer Intelligence",
    type: "Data engineering / ML",
    description:
      "From raw manufacturing data to useful decisions. An automated Databricks pipeline, live dashboards, and a model that reproduces a balancer’s correction angle approximately 98% of the time.",
    stack: "Python · Databricks · Delta Lake · scikit-learn",
    result: "35 → 55 units / day / machine",
    context: "Built at Cummins",
  },
  {
    id: "02",
    name: "Engineering AI Agents",
    type: "Applied AI",
    description:
      "Document-grounded agents for engineering quality, patent conflict review, and project intake. Built to turn unstructured information into actionable answers and structured proposals.",
    stack: "AWS Bedrock · Copilot Studio · Python",
    result: "Patent review time cut in half",
    context: "Built at Cummins",
  },
  {
    id: "03",
    name: "Skills & Capabilities Hub",
    type: "Full-stack development",
    description:
      "A React code app on Power Apps with a Dataverse backend. Brought five-plus disconnected tools into one place, initially deployed to a 30-person performance engineering team.",
    stack: "React · Dataverse · Power Apps · Power Automate",
    result: "~60% estimated reduction in effort",
    context: "Built at Cummins",
  },
  {
    id: "04",
    name: "E-commerce Data Pipeline",
    type: "Data engineering",
    description:
      "A self-built pipeline that unified sales and inventory from three storefronts. Connected Amazon and Etsy data to a custom analytics and forecasting dashboard while running day-to-day production.",
    stack: "Python · Amazon Seller API · Etsy API",
    result: "5+ hours of manual entry saved / week",
    context: "Built at Engrave Me Now",
  },
  {
    id: "05",
    name: "Space Debris Explorer",
    type: "Visualization / research",
    description:
      "An interactive exploration of 25 years of NASA orbital debris data. Country and time filters, trend analysis, and a 3D globe make a growing problem tangible.",
    stack: "MATLAB · NASA datasets · 3D graphics",
    result: "1st place · Grand Challenge Winter Summit",
    context: "Academic project · 2022",
  },
];
