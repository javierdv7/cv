export type FsNode =
  | { kind: "dir"; name: string; children: FsNode[] }
  | { kind: "file"; name: string; id: string; content: string }
  | {
      kind: "link";
      name: string;
      url: string;
      screenshot?: string;
      logoSlug?: string;
      logoText?: string;
      logoAscii?: string;
    };

const ASCII_CV = String.raw`
 ██████╗██╗   ██╗
██╔════╝██║   ██║
██║     ██║   ██║
██║     ╚██╗ ██╔╝
╚██████╗ ╚████╔╝
 ╚═════╝  ╚═══╝
`;

export const ROOT: FsNode = {
  kind: "dir",
  name: "~",
  children: [
    {
      kind: "file",
      name: "about.md",
      id: "about",
      content: [
        "# javier vargas",
        "",
        "> Co-Founder & CEO / CTO @ **LogOS** · building local-first Industrial AI",
        "",
        "Based in **Santiago, Chile**.",
        "Five years shipping software inside real industrial plants — from PLC-adjacent firmware to edge-deployed AI and browser-native Digital Twins.",
        "",
        "Betting the next industrial software cycle runs at the **edge**, on **open infrastructure**, and answers to **plant operators** — not to the cloud.",
        "",
        "## now",
        "- Founder · CEO · CTO @ **LogOS** — local-first Industrial AI for Smart Energy & Infrastructure",
        "- Clients: RED Salud · UC Escuela de Ingeniería · FSCurtis · TALES Elek · Molinera del Rey",
        "- Computer Science Engineering @ **PUC Chile** (2025–2029)",
        "- Stanford Continuing Studies — BUS-154 Technical Program Management (2026)",
        "",
        "## previously",
        "- **Software Engineer @ TALES Elek** (2021–2025) — 5 years shipping embedded, edge and integration software in active plants",
        "- **Independent R&D** (2021–2024) — local-first AI and IIoT prototypes that became the LogOS thesis",
        "",
        "## wins",
        "- **1st Place** · Human Enhancement Track — Platanus Hack 25 (record.ai)",
        "- **NACE** · top 58 PUC Engineering students (2025)",
        "- **Reconocimiento de Aporte** · UNITE UC (2025)",
        "- **Escuela de Líderes UC** (2023)",
        "- **3rd Place** · Magnetic Induction Generator — Universidad de Chile (2019)",
        "- Built an agentic voice AI on a Raspberry Pi 4 B+ — **before ChatGPT existed**",
        "",
        "## community",
        "- **UNITE UC** — Finance Coordinator",
        "- **Club de Cohetería Ursa Crux** — Digital Systems",
        "- **indies.la** · **JavaScript Chile** · **DevOpsDays Santiago**",
        "",
        "## contact",
        "- email: [javier@bylogos.io](mailto:javier@bylogos.io)",
        "- site: [bylogos.io](https://bylogos.io)",
        "- linkedin: [linkedin.com/in/javierdvt](https://linkedin.com/in/javierdvt)",
        "",
        "Full résumé: [cv.pdf](/cv.pdf)",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "contact.md",
      id: "contact",
      content: [
        "# contact",
        "",
        "- **email** — [javier@bylogos.io](mailto:javier@bylogos.io)",
        "- **site** — [bylogos.io](https://bylogos.io)",
        "- **linkedin** — [linkedin.com/in/javierdvt](https://linkedin.com/in/javierdvt)",
        "- **github** — [github.com/javierdv7](https://github.com/javierdv7)",
        "- **twitter** — [@javierdv07](https://twitter.com/javierdv07)",
        "- **instagram** — [@jdavidv7](https://instagram.com/jdavidv7)",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "interests.md",
      id: "interests",
      content: [
        "# interests",
        "",
        "- **IIoT** — industrial sensors, brownfield integration",
        "- **Physical AI** — Industrial AI at the edge",
        "- **Robotics & Automation**",
        "- **Embedded Systems** — firmware, edge runtimes",
        "- **Computer Vision** — open-CV on tiny devices",
        "- **Clustering** — distributed compute on cheap hardware",
        "- **Digital Twins** — browser-native, Three.js / R3F",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "studies.md",
      id: "studies",
      content: [
        "# studies",
        "",
        "## Computer Science Engineering",
        "**Pontifical Catholic University of Chile** · 2025 – 2029",
        "",
        "Active in **NACE** · **UNITE UC** · **InnoBar** · **Club de Cohetería Ursa Crux (CCUC)**.",
        "Selected among the top 58 students at PUC School of Engineering (NACE 2025) for leadership, innovation, science and entrepreneurship.",
        "",
        "## BUS-154 — Technical Program Management",
        "**Stanford Continuing Studies** · Apr – May 2026",
        "",
        "Leading Teams and Delivering Results. Business leadership + technical project management.",
        "",
        "## Leadership School",
        "**Pontifical Catholic University of Chile** · Aug 2023",
        "",
        "Faculty of Economy and Administration leadership program.",
        "",
        "## Autodidact",
        "",
        "Most of what I deploy I taught myself first.",
        "Embedded firmware, edge runtimes, AI inference, distributed systems, GPU stacks, industrial protocols — read it, prototype it, ship it, move on.",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "experiments.md",
      id: "experiments",
      content: [
        "# experiments",
        "",
        "## Record.ai",
        "> Platanus Hack 25 · Human Enhancement Track · **1st Place**",
        "",
        "![record.ai screenshot 1](/experiments/recordai/1.png)",
        "",
        "AI-powered engine that connects physical identity with digital presence. Facial recognition triggers real-time web scraping, instantly surfacing a person's professional background and public data the moment you meet them.",
        "",
        "Won the category for a seamless **wow factor** — proof that AI can bridge the gap between offline interactions and online information.",
        "",
        "![record.ai screenshot 2](/experiments/recordai/2.png)",
        "![record.ai screenshot 3](/experiments/recordai/3.png)",
        "![record.ai screenshot 4](/experiments/recordai/4.png)",
        "",
        "## Agentic Voice AI + Computer Vision",
        "> Colegio Tomás Moro · Science Fair · Oct 2022",
        "",
        "![agentic AI rig](/experiments/agenticai/1.png)",
        "",
        "Agentic voice AI with open computer vision running **locally on a Raspberry Pi 4 B+** — before ChatGPT went public. Vision triggers, voice loop, on-device inference. The prototype that seeded the LogOS thesis: useful AI doesn't need the cloud.",
        "",
        "![agentic AI demo](/experiments/agenticai/2.png)",
        "",
        "## Magnetic Induction Generator",
        "> Universidad de Chile Science Fair · Jul 2019 · **3rd Place**",
        "",
        "![induction generator](/experiments/m_induction/1.png)",
        "",
        "Built at **12 years old**. Hand-wound coils, scavenged magnets, raw curiosity. The first time hardware paid back the hours I sank into it.",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "projects.md",
      id: "projects",
      content: [
        "# projects",
        "",
        "## LogOS",
        "[bylogos.io](https://bylogos.io)",
        "",
        "![LogOS](/logos-page.png)",
        "",
        "**LogOS is the infrastructure that digitizes your existing field without replacing it.** We prepare your industry for the AI era: real-time 3D digital twins with intelligent assistance — not an Excel spreadsheet.",
        "",
        "Edge-native architecture that speaks legacy plant languages (**Modbus / OPC-UA / MQTT**) and connects gear that's been on the floor for decades. Built for operations still running on manual monitoring or isolated SCADA.",
        "",
        "- **Sub-second decision loops at the edge** — no cloud round-trip",
        "- **Predictive AI** anticipates equipment failures before they hit",
        "- **6+ months local data retention** — operational data stays sovereign inside the plant",
        "- **WhatsApp / Telegram alerts**, **automated PDF reports**",
        "- **Compliance by design**, audit-friendly, vendor-lock-in-free",
        "",
        "**Co-Founder · CEO · CTO.** Clients: RED Salud · UC Escuela de Ingeniería · FSCurtis · TALES Elek · Molinera del Rey.",
        "",
        "## Indies",
        "[indies.la](https://indies.la)",
        "",
        "![Indies](/indies.la.png)",
        "",
        "> **hogar para los locos, ambiciosos y obsesos.**",
        "",
        "Latin-American community for devs building crazy stuff — founders, hackers, indie engineers shipping in public. Think **founders.inc** / **FR8** / **South Park Commons**, but for LATAM. Co-living, co-building, mutual obsession, zero corporate.",
        "",
        "A home for the people who can't stop making things.",
      ].join("\n"),
    },
    {
      kind: "file",
      name: "skills.md",
      id: "skills",
      content: [
        "# skills",
        "",
        "## domain",
        "- Industrial IoT (IIoT) · Edge Computing",
        "- Industrial AI · Physical AI",
        "- Digital Twins",
        "- Smart Energy & Infrastructure",
        "",
        "## architecture",
        "- **Local-first** / Edge-native",
        "- Cloud Native & Linux Foundation ecosystem",
        "- Open-source-first",
        "- On-device inference",
        "",
        "## engineering stack",
        "- [TypeScript](https://www.typescriptlang.org) · [Node.js](https://nodejs.org) · [Bun](https://bun.sh)",
        "- [Python](https://www.python.org)",
        "- [Go](https://go.dev)",
        "- [React](https://reactjs.org) · [Three.js](https://threejs.org) · [React Three Fiber](https://r3f.docs.pmnd.rs)",
        "- [Docker](https://www.docker.com) · [Kubernetes](https://kubernetes.io)",
        "- [TensorFlow](https://www.tensorflow.org) · [PyTorch](https://pytorch.org)",
        "- Linux · IoT data pipelines · embedded & edge runtimes",
        "",
        "## leadership",
        "- Founding-team building",
        "- Engineering hiring & culture",
        "- Technical Program Management",
        "- Investor & customer narrative",
        "",
        "## languages",
        "- Spanish — native",
        "- English — full professional",
        "- Portuguese — basic",
      ].join("\n"),
    },
  ],
};

export function resolvePath(path: string[]): FsNode {
  let node: FsNode = ROOT;
  for (const seg of path) {
    if (node.kind !== "dir") throw new Error(`not a dir: ${seg}`);
    const next = node.children.find(c => c.name === seg);
    if (!next) throw new Error(`not found: ${seg}`);
    node = next;
  }
  return node;
}

export function findFile(id: string, node: FsNode = ROOT): Extract<FsNode, { kind: "file" }> | null {
  if (node.kind === "file" && node.id === id) return node;
  if (node.kind === "dir") {
    for (const c of node.children) {
      const f = findFile(id, c);
      if (f) return f;
    }
  }
  return null;
}
