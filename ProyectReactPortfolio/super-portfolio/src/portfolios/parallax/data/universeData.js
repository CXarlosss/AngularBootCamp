export const universe = {
  metadata: {
    version: "3.0",
    title: "Carlos De Petronila — Engineering Dashboard",
    description:
      "Structured system dashboard representing technical domains and capabilities"
  },

  dashboard: {
    layout: "vertical-modular",
    theme: "dark-engineering",
    moduleSpacing: "stacked",
    interaction: "inspector-driven"
  },

  domains: [
    {
      id: "core",
      label: "Core Identity",
      order: 1
    },
    {
      id: "stack",
      label: "Technology Stack",
      order: 2
    },
    {
      id: "projects",
      label: "Systems & Projects",
      order: 3
    },
    {
      id: "experience",
      label: "Experience & Formation",
      order: 4
    },
    {
      id: "principles",
      label: "Engineering Principles",
      order: 5
    }
  ],

  nodes: [
    /* =============================
       CORE
    ============================= */
    {
      id: "carlos",
      domain: "core",
      type: "identity",
      title: "Carlos De Petronila",
      subtitle: "Full Stack Engineer",
      tags: ["Frontend Systems", "API Design", "Architecture Thinking"],
      metadata: {
        summary:
          "Full Stack Engineer focused on modular frontend systems and scalable API-driven architectures.",
        highlights: [
          "React & Next.js specialization",
          "REST API integration",
          "Data-driven UI architecture"
        ]
      }
    },

    /* =============================
       STACK
    ============================= */
    {
      id: "react",
      domain: "stack",
      type: "technology",
      category: "frontend",
      level: "advanced",
      title: "React",
      metadata: {
        usage: "Core framework for SPA architecture",
        patterns: ["Component Composition", "Hooks", "State Isolation"]
      }
    },
    {
      id: "nextjs",
      domain: "stack",
      type: "technology",
      category: "frontend",
      level: "advanced",
      title: "Next.js",
      metadata: {
        usage: "SSR & routing for production-grade apps",
        patterns: ["App Router", "Static Optimization"]
      }
    },
    {
      id: "node",
      domain: "stack",
      type: "technology",
      category: "backend",
      level: "intermediate",
      title: "Node.js",
      metadata: {
        usage: "REST API creation",
        patterns: ["Express Middleware", "Routing Architecture"]
      }
    },
    {
      id: "mongodb",
      domain: "stack",
      type: "technology",
      category: "database",
      level: "intermediate",
      title: "MongoDB",
      metadata: {
        usage: "CRUD operations & pagination",
        patterns: ["Document modeling"]
      }
    },

    /* =============================
       PROJECTS
    ============================= */
    {
      id: "localmarket",
      domain: "projects",
      type: "project",
      title: "LocalMarket",
      metadata: {
        description:
          "Full stack application connecting local businesses with customers.",
        architecture: {
          frontend: ["React", "Next.js"],
          backend: ["Node.js"],
          database: ["MongoDB"]
        },
        responsibilities: [
          "Frontend modular architecture",
          "API integration",
          "CRUD implementation"
        ],
        deployment: ["Vercel"]
      }
    },

    {
      id: "nutricionista",
      domain: "projects",
      type: "project",
      title: "Página Nutricionista",
      metadata: {
        description:
          "Professional web focused on UX, modularity, and SEO optimization.",
        architecture: {
          frontend: ["React"],
          backend: ["REST API integration"]
        },
        responsibilities: [
          "Component reuse",
          "Performance optimization",
          "SEO structure"
        ]
      }
    },

    /* =============================
       EXPERIENCE
    ============================= */
    {
      id: "neoland",
      domain: "experience",
      type: "formation",
      title: "Neoland Bootcamp",
      metadata: {
        focus: "Full Stack Development",
        year: 2025,
        achievement: "Winning Project — LocalMarket"
      }
    },
    {
      id: "42madrid",
      domain: "experience",
      type: "formation",
      title: "42 Madrid",
      metadata: {
        focus: "Algorithms & C Programming",
        methodology: "Peer-to-peer learning"
      }
    },

    /* =============================
       PRINCIPLES
    ============================= */
    {
      id: "modularity",
      domain: "principles",
      type: "principle",
      title: "Modular Architecture",
      metadata: {
        description:
          "Separation of concerns and reusable component design."
      }
    },
    {
      id: "performance",
      domain: "principles",
      type: "principle",
      title: "Performance First",
      metadata: {
        description:
          "Optimized rendering, minimal reflows, controlled state updates."
      }
    },
    {
      id: "apiDriven",
      domain: "principles",
      type: "principle",
      title: "API-Driven Design",
      metadata: {
        description:
          "Frontend decoupled from backend via structured REST contracts."
      }
    }
  ],

  connections: [
    { from: "react", to: "localmarket" },
    { from: "nextjs", to: "localmarket" },
    { from: "node", to: "localmarket" },
    { from: "mongodb", to: "localmarket" },
    { from: "react", to: "nutricionista" },
    { from: "modularity", to: "localmarket" },
    { from: "performance", to: "nutricionista" },
    { from: "carlos", to: "react" },
    { from: "carlos", to: "nextjs" },
    { from: "carlos", to: "node" }
  ],

  filters: {
    categories: ["frontend", "backend", "database"],
    levels: ["advanced", "intermediate"]
  }
};