import { Terminal } from "@/components/terminal";

const github = "https://github.com/namelessmonarch0";
const projects = [
  {
    id: "01",
    name: "Turbo Balancer Intelligence",
    type: "DATA ENGINEERING / ML",
    description:
      "From raw manufacturing data to useful decisions. An automated Databricks pipeline, live dashboards, and a model that reproduces a balancer’s correction angle approximately 98% of the time.",
    stack: "Python · Databricks · Delta Lake · scikit-learn",
    result: "35 → 55 units / day / machine",
    context: "Built at Cummins",
  },
  {
    id: "02",
    name: "Engineering AI Agents",
    type: "APPLIED AI",
    description:
      "Document-grounded agents for engineering quality, patent conflict review, and project intake. Built to turn unstructured information into actionable answers and structured proposals.",
    stack: "AWS Bedrock · Copilot Studio · Python",
    result: "Patent review time cut in half",
    context: "Built at Cummins",
  },
  {
    id: "03",
    name: "Skills & Capabilities Hub",
    type: "FULL-STACK DEVELOPMENT",
    description:
      "A React code app on Power Apps with a Dataverse backend. Brought five-plus disconnected tools into one place, initially deployed to a 30-person performance engineering team.",
    stack: "React · Dataverse · Power Apps · Power Automate",
    result: "~60% estimated reduction in effort",
    context: "Built at Cummins",
  },
  {
    id: "04",
    name: "E-commerce Data Pipeline",
    type: "DATA ENGINEERING",
    description:
      "A self-built pipeline that unified sales and inventory from three storefronts. Connected Amazon and Etsy data to a custom analytics and forecasting dashboard while running day-to-day production.",
    stack: "Python · Amazon Seller API · Etsy API",
    result: "5+ hours of manual entry saved / week",
    context: "Built at Engrave Me Now",
  },
  {
    id: "05",
    name: "Space Debris Explorer",
    type: "VISUALIZATION / RESEARCH",
    description:
      "An interactive exploration of 25 years of NASA orbital debris data. Country and time filters, trend analysis, and a 3D globe make a growing problem tangible.",
    stack: "MATLAB · NASA datasets · 3D graphics",
    result: "1st place · Grand Challenge Winter Summit",
    context: "Academic project · 2022",
  },
];

function SectionTitle({
  command,
  title,
  description,
}: {
  command: string;
  title: string;
  description: string;
}) {
  return (
    <header className="section-heading">
      <p className="command">
        <span>❯</span> {command}
      </p>
      <h2>
        {title}
        <span className="accent">.</span>
      </h2>
      <p>{description}</p>
    </header>
  );
}

export default function Home() {
  return (
    <Terminal
      panels={{
        about: (
          <>
            <SectionTitle
              command="cat about.txt"
              title="A builder at heart"
              description="A little context on the person behind the terminal."
            />
            <div className="about-copy">
              <p>
                I’m Kuday, a Computer Science student at Texas A&M
                University–Victoria, based in Houston. I build across software
                engineering, data, and AI — usually wherever there’s a slow
                process or a messy dataset worth improving.
              </p>
              <p>
                My path into software has been hands-on. I’ve repaired devices,
                supported computer labs, and run an e-commerce production floor.
                At Engrave Me Now, I taught myself Python to connect the
                business’s data. At Cummins, that curiosity grew into
                manufacturing pipelines, machine learning, and tools for
                engineers.
              </p>
              <p>
                Outside of work, I’m into Linux, fast terminal workflows, and
                game development with Raylib, Unreal Engine, and Unity. I enjoy
                tools that invite you to take them apart.
              </p>
            </div>
            <div className="home-divider">
              <span>TOOLBOX</span>
              <span>ALWAYS LEARNING</span>
            </div>
            <div className="skill-grid">
              {[
                [
                  "01 / LANGUAGES",
                  "Python, SQL, TypeScript, JavaScript, C/C++, C#, Rust",
                ],
                [
                  "02 / DATA & AI",
                  "Databricks, Delta Lake, PySpark, scikit-learn, Power BI, AWS Bedrock",
                ],
                [
                  "03 / APPLICATIONS",
                  "React, Node.js, FastAPI, .NET, Power Platform, Dataverse",
                ],
                [
                  "04 / EVERYDAY TOOLS",
                  "Linux, Neovim, Git, Docker, Azure, CLI tooling",
                ],
              ].map(([title, text]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <div className="education">
              <span className="eyebrow">EDUCATION</span>
              <h3>Texas A&M University–Victoria</h3>
              <p>B.S. Computer Science · 3.8 / 4.0 GPA · President’s List</p>
              <p className="muted">
                Previously: Associate of Science, Houston City College · 2022
              </p>
            </div>
          </>
        ),
        experience: (
          <>
            <SectionTitle
              command="cat experience.log"
              title="Learning by building"
              description="From hardware repairs to systems that help people work better."
            />
            <div className="experience-list">
              {[
                {
                  date: "MAY 2026 — PRESENT",
                  company: "Cummins",
                  role: "Data Science Intern",
                  location: "Columbus, IN",
                  copy: "Built data pipelines, machine learning models, AI agents, and internal applications with the Components and Software AI department.",
                  highlights: [
                    "Automated Turbo Balancer data ingestion and analytics; insights helped raise throughput from 35 to 55 units per day per machine.",
                    "Built a React and Dataverse skills hub, consolidating 5+ tools for an initial team of approximately 30 people.",
                    "Created document-grounded agents for engineering quality, patent review, and project intake.",
                  ],
                },
                {
                  date: "JAN 2025 — MAY 2026",
                  company: "Engrave Me Now",
                  role: "Operations Manager",
                  location: "Katy, TX",
                  copy: "Ran the production floor and built the software behind a business fulfilling more than 1,000 orders a week.",
                  highlights: [
                    "Connected three storefronts with a Python ETL pipeline using Amazon and Etsy APIs.",
                    "Used custom analytics to help reduce inventory overhead by 20% and increase sales by 30%.",
                    "Managed production, fulfillment, equipment maintenance, and collaboration with a remote team.",
                  ],
                },
                {
                  date: "DEC 2020 — MAY 2022",
                  company: "IFixandRepair",
                  role: "Store Manager & Repair Technician",
                  location: "Houston, TX",
                  copy: "Diagnosed and repaired over 100 mobile devices and computers, while managing store operations and customer support.",
                  highlights: [
                    "Hands-on hardware diagnostics, precision repairs, and operating system recovery.",
                    "Maintained a 95% repair success rate across a range of devices and platforms.",
                  ],
                },
              ].map((job) => (
                <article className="experience" key={job.company}>
                  <div className="experience-date">
                    {job.date}
                    <span>{job.location}</span>
                  </div>
                  <div>
                    <h3>{job.company}</h3>
                    <p className="accent job-role">{job.role}</p>
                    <p>{job.copy}</p>
                    <ul>
                      {job.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <a
              className="text-link"
              href="https://www.linkedin.com/in/kudayyurter/"
              target="_blank"
              rel="noreferrer"
            >
              View my LinkedIn <span>↗</span>
            </a>
          </>
        ),
        projects: (
          <>
            <SectionTitle
              command="ls -la projects/"
              title="Useful things, built"
              description="Selected work across data engineering, applied AI, and software."
            />
            <div className="project-list">
              {projects.map((project) => (
                <article
                  className="project-detail"
                  data-project-id={`project-${project.id}`}
                  key={project.id}
                >
                  <span className="project-number">{project.id}</span>
                  <div>
                    <p className="eyebrow">{project.type}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-result">↳ {project.result}</div>
                    <p className="project-stack">{project.stack}</p>
                    <span className="muted project-context">
                      {project.context}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <a
              className="primary-link"
              href={github}
              target="_blank"
              rel="noreferrer"
            >
              Find more on GitHub <span>↗</span>
            </a>
          </>
        ),
        contact: (
          <>
            <SectionTitle
              command="./say-hello"
              title="Let’s make something"
              description="Have a project in mind, an interesting problem, or a Linux setup to compare? I’d love to hear about it."
            />
            <a className="contact-email" href="mailto:kudayyurter@gmail.com">
              kudayyurter@gmail.com <span>↗</span>
            </a>
            <div className="contact-links">
              <a href={github} target="_blank" rel="noreferrer">
                <span>01 / GITHUB</span>
                <strong>namelessmonarch0 ↗</strong>
              </a>
              <a
                href="https://www.linkedin.com/in/kudayyurter/"
                target="_blank"
                rel="noreferrer"
              >
                <span>02 / LINKEDIN</span>
                <strong>Kuday Yurter ↗</strong>
              </a>
            </div>
            <div className="contact-note">
              <span className="status-dot" /> Based in Houston, Texas.
              <br />
              <span className="muted">
                Interested in software, data engineering, and applied AI.
              </span>
            </div>
          </>
        ),
      }}
    />
  );
}
