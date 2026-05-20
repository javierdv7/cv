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
        "- Clients: RED Salud · UC Escuela de Ingeniería · JCurtis · TALES Elek · Molinera del Rey",
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
      kind: "dir",
      name: "projects",
      children: [
        { kind: "link", name: "LogOS", url: "https://bylogos.io", screenshot: "/logos-page.png" },
        { kind: "link", name: "Indies", url: "https://indies.la", screenshot: "/indies.la.png" },
        { kind: "link", name: "CV", url: "https://vargastorres.cv", screenshot: "/iconcv.png" },
      ],
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
