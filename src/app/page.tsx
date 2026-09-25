import Image from "next/image";
import portraitHead from "@/assets/portrait-head.webp";
import { PixelBitmap } from "@/components/pixel-bitmap";
import { PixelName } from "@/components/pixel-name";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { Section } from "@/components/section";
import { SiteHeader } from "@/components/site-header";
import {
  about,
  education,
  experience,
  links,
  personalProjects,
  stack,
  workProjects,
} from "@/content/portfolio";
import { textToBitmap } from "@/lib/pixel-font";

function Monogram({ text, label }: { text: string; label: string }) {
  return (
    <span className="monogram">
      <PixelBitmap rows={textToBitmap(text)} label={label} />
    </span>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero container" aria-labelledby="hero-title">
          <h1 id="hero-title">
            <span className="sr-only">Kuday Yurter</span>
            <PixelName />
          </h1>
        </section>

        <Section id="about" title="About">
          <RevealOnScroll>
            <div className="prose">
              {about.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="education">
              <Monogram text={education.monogram} label={education.school} />
              <div>
                <h3>{education.school}</h3>
                <p>{education.degree}</p>
                <p className="muted">{education.previously}</p>
              </div>
            </div>
          </RevealOnScroll>
        </Section>

        <Section id="stack" title="Tech stack">
          <RevealOnScroll>
            <ol className="stack-grid">
              {stack.map((tool) => (
                <li key={tool.logo}>
                  <Image
                    src={`/logos/${tool.logo}.svg`}
                    alt={tool.name}
                    width={40}
                    height={40}
                  />
                  <span aria-hidden="true">{tool.name}</span>
                </li>
              ))}
            </ol>
          </RevealOnScroll>
        </Section>

        <Section id="experience" title="Experience">
          <ol className="timeline">
            {experience.map((job) => (
              <li className="job" key={job.company}>
                <RevealOnScroll className="job__body">
                  <Monogram text={job.monogram} label={job.company} />
                  <div>
                    <p className="job__meta">
                      {job.date} · {job.location}
                    </p>
                    <h3>{job.company}</h3>
                    <p className="job__role">{job.role}</p>
                    <ul>
                      {job.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
          <RevealOnScroll>
            <a
              className="text-link"
              href={links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              View my LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </RevealOnScroll>
        </Section>

        <Section id="projects" title="Work projects">
          <ol className="projects">
            {workProjects.map((project) => (
              <li className="project" key={project.name}>
                <RevealOnScroll className="project__body">
                  <p className="eyebrow">{project.context}</p>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p className="project__result">{project.result}</p>
                  <p className="project__stack">{project.stack}</p>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="personal" title="Personal projects">
          <ol className="projects">
            {personalProjects.map((project) => (
              <li className="project" key={project.name}>
                <RevealOnScroll className="project__body">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p className="project__stack">{project.stack}</p>
                  <a
                    className="text-link project__link"
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name}: ${project.linkLabel}`}
                  >
                    {project.linkLabel} <span aria-hidden="true">↗</span>
                  </a>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
          <RevealOnScroll>
            <a
              className="text-link"
              href={links.github}
              target="_blank"
              rel="noreferrer"
            >
              More on GitHub <span aria-hidden="true">↗</span>
            </a>
          </RevealOnScroll>
        </Section>

        <Section id="contact" title="Contact">
          <RevealOnScroll>
            <a className="contact-email" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            <div className="contact-links">
              <a
                className="button"
                href={links.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button"
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="muted contact-note">Based in Houston, Texas.</p>
          </RevealOnScroll>
        </Section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner container">
          <Image src={portraitHead} alt="" width={24} height={24} />
          <span>© {new Date().getFullYear()} Kuday Yurter</span>
        </div>
      </footer>
    </>
  );
}
