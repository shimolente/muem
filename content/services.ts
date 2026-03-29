/* ─── Studio Services ───────────────────────────────────────────────────────
 *  Sequential service phases — order matters.
 * ───────────────────────────────────────────────────────────────────────── */

export interface Service {
  id:          string;
  name:        string;         // phase strip label (keep concise)
  tagline:     string;         // small tag above title
  title:       string;         // display headline
  description: string[];       // paragraphs
  image:       string;         // /public path
}

export const SERVICES: Service[] = [
  {
    id:      'architecture',
    name:    'Architecture',
    tagline: 'Home Living',
    title:   'Build, Design, Innovate',
    description: [
      "Muem Studio's understanding of architecture resides in the creation of the fine art and methodical science of designing buildings and spaces that will have a profound positive impact on people's lifestyles or business.",
      "Our architecture is uniquely matched to each project, we always seek to combine beauty and meaning by placing people at the center of each design, as our final goal in any project is always to satisfy the needs and desires of clients, both individuals or businesses, being faithful to our design philosophy.",
    ],
    image: '/images/studio-cover.jpg',
  },
  {
    id:      'landscape-design',
    name:    'Landscape Design',
    tagline: 'Outdoor Living',
    title:   'Nature, Shaped with Intent',
    description: [
      "We approach landscape as an extension of architecture — a living, breathing environment that frames and enhances every structure it surrounds. Our landscape designs harmonise the built and natural worlds with precision and sensitivity.",
      "From tropical garden terraces to resort-scale outdoor spaces, we balance ecological respect with experiential richness, crafting environments that evolve beautifully over time.",
    ],
    image: '/images/residences-cover.jpg',
  },
  {
    id:      'interior-design',
    name:    'Interior Design',
    tagline: 'Living Spaces',
    title:   'Craft Every Detail',
    description: [
      "Interior design at Muem Studio goes far beyond aesthetics. We create environments that tell stories, balancing materiality, light, and spatial flow to produce spaces that feel both deeply personal and timelessly refined.",
      "From concept sketches to final installation, our team curates each element — furniture, finishes, textiles, and art — ensuring a seamless dialogue between architecture and the human experience within it.",
    ],
    image: '/images/habitus-cover.jpg',
  },
  {
    id:      'structural-mep',
    name:    'Structural & MEP',
    tagline: 'Technical Precision',
    title:   'Engineering the Invisible',
    description: [
      "Great architecture stands on great engineering. Muem Studio's structural and MEP teams work in close integration with our design studio to ensure every system — structural, mechanical, electrical, and plumbing — is both high-performing and invisible to the experience.",
      "We apply rigorous analysis and site-specific expertise to deliver buildings that are as sound as they are beautiful, with systems engineered to last generations.",
    ],
    image: '/images/studio-cover.jpg',
  },
  {
    id:      'construction-management',
    name:    'Construction',
    tagline: 'On Site, On Time',
    title:   'Precision from Ground Up',
    description: [
      "From breaking ground to final handover, Muem Studio's construction management team is your on-site advocate. We coordinate contractors, manage schedules, and enforce quality standards to ensure the vision we design is the reality we deliver.",
      "Our process is transparent, communicative, and relentlessly detail-oriented — because the difference between a good building and a great one lives in the thousand small decisions made during construction.",
    ],
    image: '/images/habitus-cover.jpg',
  },
  {
    id:      'analytics-investment',
    name:    'Investment Analysis',
    tagline: 'Data-Driven Design',
    title:   'Clarity Before Commitment',
    description: [
      "Before a single line is drawn, Muem Studio provides rigorous analytics and investment evaluation — market positioning, feasibility studies, ROI modelling, and risk assessment — so every project decision is backed by data.",
      "We bridge the gap between visionary design and sound investment, helping clients and developers make confident, well-informed decisions from project inception through completion.",
    ],
    image: '/images/residences-cover.jpg',
  },
  {
    id:      'project-specialties',
    name:    'Specialties',
    tagline: 'Beyond the Brief',
    title:   'Bespoke for Every Brief',
    description: [
      "Some projects defy categorisation. Muem Studio thrives in these spaces — adaptive reuse, heritage restoration, mixed-use developments, hospitality concepts, and highly bespoke private commissions that require a fresh approach every time.",
      "Whatever the typology, we bring the same rigour, care, and creative ambition that defines every Muem project, tailoring our process to the unique demands and aspirations of each brief.",
    ],
    image: '/images/studio-cover.jpg',
  },
];
