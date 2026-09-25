import Image from "next/image";
import portrait from "@/assets/portrait.webp";
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
  intro,
  links,
  projects,
  results,
  skills,
} from "@/content/portfolio";
import { textToBitmap } from "@/lib/pixel-font";
import techLogos from "@/lib/tech-logos.json";

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
          <div className="hero__copy">
            <h1 id="hero-title">
              <span className="sr-only">Kuday Yurter</span>
              <PixelName />
            </h1>
            <p className="hero__tagline">{intro.tagline}</p>
            <p className="hero__headline">{intro.headline}</p>
            <p className="hero__intro">{intro.body}</p>
            <div className="hero__actions">
              <a className="button button--solid" href="#projects">
                View projects
              </a>
              <a className="button" href="#contact">
                Get in touch
              </a>
            </div>
          </div>
          <div className="hero__portrait">
            <Image
              src={portrait}
              alt="Pixel-art portrait of Kuday Yurter"
              preload
              sizes="(max-width: 800px) 70vw, 460px"
            />
          </div>
        </section>

        <RevealOnScroll>
          <ul className="results container" aria-label="Selected results">
            {results.map((result) => (
              <li className="result" key={result.label}>
                <span className="result__value">
                  {`${result.prefix}${result.value}${result.suffix}`}
                </span>
                <span className="result__label">{result.label}</span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>

        <Section id="about" eyebrow="About" title="A builder at heart.">
          <RevealOnScroll>
            <div className="prose">
              {about.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <ul className="logo-grid" aria-label="Tools I use">
              {techLogos.map((logo) => (
                <li key={logo.slug}>
                  <PixelBitmap rows={logo.rows} label={logo.title} />
                  <span aria-hidden="true">{logo.title}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll>
            <dl className="skills">
              {skills.map(([group, list]) => (
                <div key={group}>
                  <dt>{group}</dt>
                  <dd>{list}</dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="education">
              <Monogram text={education.monogram} label={education.school} />
              <div>
                <p className="eyebrow">Education</p>
                <h3>{education.school}</h3>
                <p>{education.degree}</p>
                <p className="muted">{education.previously}</p>
              </div>
            </div>
          </RevealOnScroll>
        </Section>

        <Section
          id="experience"
          eyebrow="Experience"
          title="Learning by building."
        >
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
                    <p>{job.summary}</p>
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

        <Section id="projects" eyebrow="Projects" title="Useful things, built.">
          <ol className="projects">
            {projects.map((project) => (
              <li
                className="project"
                id={`project-${project.id}`}
                key={project.id}
              >
                <RevealOnScroll className="project__body">
                  <span className="project__number">{project.id}</span>
                  <div>
                    <p className="eyebrow">{project.type}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <p className="project__result">{project.result}</p>
                    <p className="project__stack">{project.stack}</p>
                    <p className="project__context">{project.context}</p>
                  </div>
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
              Find more on GitHub <span aria-hidden="true">↗</span>
            </a>
          </RevealOnScroll>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Let’s make something.">
          <RevealOnScroll>
            <p className="prose">
              Have a project in mind, an interesting problem, or a Linux setup
              to compare? I’d love to hear about it.
            </p>
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
            <p className="muted contact-note">
              Based in Houston, Texas. Interested in software, data engineering,
              and applied AI.
            </p>
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
