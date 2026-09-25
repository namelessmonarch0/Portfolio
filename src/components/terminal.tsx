"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { PixelName } from "./pixel-name";

const tabs = ["home", "about", "experience", "projects", "contact"] as const;
type Tab = (typeof tabs)[number];
const commands = [
  ...tabs,
  "help",
  "ls",
  "whoami",
  "theme",
  "crt",
  "reboot",
  "clear",
];
const bootLines = [
  "KUDAY SYSTEMS / BIOS 1.0",
  "Memory check ............................... OK",
  "Mounting /about /experience /projects ....... OK",
  "Initializing phosphor display .............. OK",
  "Starting visitor session. Welcome in.",
];
type Entry = {
  id: number;
  command: string;
  panel?: Tab;
  message?: string;
  target?: string;
};

function Welcome() {
  return (
    <div className="shell-welcome">
      <p className="shell-system">KUDAY OS [Version 1.0] · Personal terminal</p>
      <h1>
        <span className="sr-only">Kuday Yurter</span>
        <PixelName />
      </h1>
      <p>Software engineer. Curious by default.</p>
      <p className="muted">
        I turn messy data into useful systems.
        <br />
        Pipelines, AI agents, and software that makes things work better.
      </p>
      <p className="shell-instruction">
        Type <strong>help</strong> to explore, or choose a command below.
      </p>
    </div>
  );
}

export function Terminal({
  panels,
}: {
  panels: Record<Exclude<Tab, "home">, ReactNode>;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [booting, setBooting] = useState(true);
  const [effects, setEffects] = useState(true);
  const [amber, setAmber] = useState(false);
  const [command, setCommand] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const sequence = useRef(0);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const draft = useRef("");
  const lastHash = useRef<string | null>(null);
  const pendingScroll = useRef<number | "prompt" | null>(null);

  const append = useCallback((entry: Omit<Entry, "id">) => {
    const id = ++sequence.current;
    pendingScroll.current = id;
    setEntries((previous) => [...previous, { ...entry, id }]);
    setNotice(
      entry.panel ? `${entry.panel} output added.` : entry.message || "",
    );
  }, []);

  function focusPrompt() {
    // Avoid opening a software keyboard just by visiting on a phone.
    if (window.matchMedia("(pointer: fine)").matches)
      input.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    function syncHash() {
      const hash = window.location.hash.slice(1);
      if (hash === lastHash.current || hash === "content") return;
      lastHash.current = hash;
      if (/^project-0[1-5]$/.test(hash))
        append({
          command: `projects ${hash.slice(-2)}`,
          panel: "projects",
          target: hash,
        });
      else if (tabs.includes(hash as Tab))
        append({ command: hash, panel: hash as Tab });
      else if (hash)
        append({
          command: hash,
          message: `Unknown destination: ${hash}. Type help to explore.`,
        });
    }
    const frame = requestAnimationFrame(() => {
      let crtEnabled = true;
      try {
        crtEnabled = localStorage.getItem("crt-effects") !== "off";
        setEffects(crtEnabled);
        setAmber(localStorage.getItem("crt-color") === "amber");
      } catch {
        /* Preferences are optional. */
      }
      if (
        !crtEnabled ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        setBooting(false);
      syncHash();
    });
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [append]);

  useEffect(() => {
    if (!booting) {
      focusPrompt();
      return;
    }
    const timer = window.setTimeout(() => setBooting(false), 1900);
    return () => clearTimeout(timer);
  }, [booting]);

  useEffect(() => {
    if (booting || pendingScroll.current === null) return;
    const pending = pendingScroll.current;
    pendingScroll.current = null;
    const entry = entries.find((item) => item.id === pending);
    const element =
      typeof pending === "number"
        ? document.getElementById(`entry-${pending}`)
        : input.current;
    const target = entry?.target
      ? element?.querySelector(`[data-project-id="${entry.target}"]`)
      : element;
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [entries, booting]);

  function savePreference(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Optional preference. */
    }
  }

  function toggleEffects() {
    setEffects(!effects);
    savePreference("crt-effects", effects ? "off" : "on");
  }

  function toggleColor() {
    setAmber(!amber);
    savePreference("crt-color", amber ? "green" : "amber");
  }

  function reboot() {
    setEntries([]);
    setShowWelcome(true);
    setCommand("");
    setNotice("Visitor session restarted.");
    history.current = [];
    historyIndex.current = 0;
    lastHash.current = "";
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    pendingScroll.current = "prompt";
    if (
      effects &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      setBooting(true);
    else focusPrompt();
  }

  function run(raw: string) {
    const entered = raw.trim();
    if (!entered) return;
    history.current.push(entered);
    historyIndex.current = history.current.length;
    draft.current = "";
    setCommand("");
    const value = entered.toLowerCase().replace(/\s+/g, " ");
    const destination = value
      .replace(/^cd /, "")
      .replace(/\/$/, "")
      .replace(/^~\//, "");
    const file = /^cat (about\.txt|experience\.log|contact\.txt)$/.exec(value);
    const project = /^projects (0?[1-5])$/.exec(value);
    const panel = file
      ? (file[1].split(".")[0] as Tab)
      : tabs.includes(destination as Tab)
        ? (destination as Tab)
        : project
          ? "projects"
          : undefined;
    if (panel) {
      const target = project
        ? `project-${project[1].padStart(2, "0")}`
        : undefined;
      const hash = target || panel;
      if (window.location.hash !== `#${hash}`)
        window.history.pushState(null, "", `#${hash}`);
      lastHash.current = hash;
      append({ command: entered, panel, target });
    } else if (value === "help" || value === "ls") {
      append({
        command: entered,
        message:
          "about         The person behind the prompt\nexperience    Work, roles, and results\nprojects      Selected work (try projects 03)\ncontact       Email, GitHub, and LinkedIn\nhome          Show the welcome banner\n\nwhoami        A quick introduction\ntheme         Switch green / amber phosphor\ncrt           Toggle CRT effects\nclear         Clear the screen\nreboot        Start a fresh session\n\n↑ / ↓ history · Tab complete · Ctrl+L clear\nYou can also use cd projects/ or cat about.txt.",
      });
    } else if (value === "whoami") {
      append({
        command: entered,
        message:
          "Kuday Yurter\nSoftware, data, and AI. Based in Houston, TX.\nLinux, Neovim, and making games off the clock.",
      });
    } else if (value === "theme") {
      toggleColor();
      append({
        command: entered,
        message: amber
          ? "Green phosphor selected."
          : "Amber phosphor selected.",
      });
    } else if (value === "crt") {
      toggleEffects();
      append({
        command: entered,
        message: effects ? "CRT effects disabled." : "CRT effects enabled.",
      });
    } else if (value === "clear") {
      setEntries([]);
      setShowWelcome(false);
      setNotice("Screen cleared.");
      pendingScroll.current = "prompt";
      lastHash.current = "";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    } else if (value === "reboot") reboot();
    else
      append({
        command: entered,
        message: `Command not found: ${entered}. Type help to see available commands.`,
      });
    focusPrompt();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    // Long output scrolls to its beginning. Bring the editor back when used.
    input.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex.current === history.current.length)
        draft.current = command;
      historyIndex.current = Math.max(
        0,
        Math.min(
          history.current.length,
          historyIndex.current + (event.key === "ArrowUp" ? -1 : 1),
        ),
      );
      setCommand(history.current[historyIndex.current] ?? draft.current);
    } else if (event.key === "Tab" && !event.shiftKey && command.trim()) {
      const text = command.trimStart().toLowerCase();
      const prefix = text.startsWith("cd ") ? "cd " : "";
      const needle = prefix ? text.slice(3) : text;
      const matches = (prefix ? [...tabs] : commands).filter((item) =>
        item.startsWith(needle.replace(/\/$/, "")),
      );
      // A completed command lets Tab move out of the field normally.
      if (
        matches.length === 1 &&
        text !== `${prefix}${matches[0]}${prefix ? "/" : ""}`
      ) {
        event.preventDefault();
        setCommand(`${prefix}${matches[0]}${prefix ? "/" : ""}`);
      } else if (matches.length > 1) {
        event.preventDefault();
        setNotice(`Matches: ${matches.join(", ")}`);
      }
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      run("clear");
    }
  }

  return (
    <div
      className={`terminal-page shell-page ${effects ? "crt-on" : "crt-off"} ${amber ? "amber" : "green"}`}
    >
      <a className="skip-link" href="#content">
        Skip to terminal
      </a>
      <div className="screen-effects" aria-hidden="true" />
      <noscript>
        <style>{`.shell-interactive, .boot-overlay, .monitor-controls { display: none !important; } .shell-fallback { display: block !important; }`}</style>
      </noscript>
      <div className="terminal-frame shell-interactive" inert={booting}>
        <header className="shell-titlebar">
          <span>kuday@world: ~</span>
          <span className="shell-online">
            <i className="status-dot" /> SESSION ONLINE
          </span>
        </header>
        <main id="content" className="shell-main" tabIndex={-1}>
          <div className="shell-output" aria-label="Terminal output">
            {showWelcome && <Welcome />}
            {entries.map((entry) => (
              <section
                key={entry.id}
                id={`entry-${entry.id}`}
                className="shell-entry"
                aria-label={`${entry.command} output`}
              >
                <p className="shell-echo">
                  <span className="muted">visitor@kuday:~$</span>{" "}
                  {entry.command}
                </p>
                {entry.panel === "home" ? (
                  <Welcome />
                ) : entry.panel ? (
                  <div className="shell-document">{panels[entry.panel]}</div>
                ) : (
                  <pre className="shell-text">{entry.message}</pre>
                )}
              </section>
            ))}
          </div>
          <div className="shell-prompt-area">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                run(command);
              }}
              className="command-form"
            >
              <label htmlFor="terminal-input">
                <span className="accent">visitor</span>
                <span className="muted">@kuday</span>
                <span className="accent">:~$</span>
              </label>
              <input
                ref={input}
                id="terminal-input"
                value={command}
                onChange={(event) => {
                  setCommand(event.target.value);
                  input.current?.scrollIntoView({
                    block: "nearest",
                    behavior: "instant",
                  });
                }}
                onKeyDown={onKeyDown}
                placeholder="help"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal command"
                aria-describedby="shell-keyboard-hint"
              />
              <button type="submit" aria-label="Run command">
                ↵
              </button>
            </form>
            <div className="shell-shortcuts" aria-label="Suggested commands">
              {["help", "about", "experience", "projects", "contact"].map(
                (item) => (
                  <button key={item} onClick={() => run(item)}>
                    {item}
                  </button>
                ),
              )}
            </div>
            <p id="shell-keyboard-hint" className="shell-keyboard-hint">
              ↑↓ history <span>Tab complete</span>
              <span>Ctrl+L clear</span>
            </p>
            <p className="sr-only" role="status">
              {notice}
            </p>
            {notice.startsWith("Matches:") && (
              <p className="shell-completions">{notice}</p>
            )}
          </div>
        </main>
        <footer className="shell-footer">
          <span>© {new Date().getFullYear()} KUDAY YURTER</span>
          <a href="mailto:kudayyurter@gmail.com">GET IN TOUCH ↗</a>
        </footer>
      </div>
      <div className="monitor-controls" inert={booting}>
        <span>
          <i className="status-dot" /> PHOSPHOR DISPLAY / PERSONAL TERMINAL
        </span>
        <div>
          <button onClick={toggleEffects} aria-pressed={effects}>
            CRT {effects ? "ON" : "OFF"}
          </button>
          <button
            onClick={toggleColor}
            aria-label={`Switch to ${amber ? "green" : "amber"} phosphor`}
          >
            <span className="color-dot" />
            {amber ? "AMBER" : "GREEN"}
          </button>
          <button onClick={reboot}>↻ REBOOT</button>
        </div>
      </div>
      <div className="shell-fallback">
        <h1>Kuday Yurter</h1>
        {tabs
          .filter((tab): tab is Exclude<Tab, "home"> => tab !== "home")
          .map((tab) => (
            <section key={tab}>{panels[tab]}</section>
          ))}
      </div>
      {booting && (
        <div
          className="boot-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Terminal boot sequence"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setBooting(false);
            }
            if (event.key === "Tab") event.preventDefault();
          }}
        >
          <div>
            <div className="boot-mark" aria-hidden="true">
              [ky]
            </div>
            {bootLines.map((line, index) => (
              <p key={line} style={{ animationDelay: `${index * 0.3}s` }}>
                {line}
              </p>
            ))}
            <button autoFocus onClick={() => setBooting(false)}>
              Skip boot [esc] ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
