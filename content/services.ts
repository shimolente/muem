/* ─── Studio Services ───────────────────────────────────────────────────────
 *  Sequential service phases — order matters.
 * ───────────────────────────────────────────────────────────────────────── */

export interface Service {
  id:          string;
  name:        string;         // phase strip label (keep concise)
  tagline:     string;         // small tag above title (leave '' to hide)
  title:       string;         // display headline
  description: string[];       // paragraphs
  image:       string;         // /public path
}

export const SERVICES: Service[] = [
  {
    id:      'project-analysis',
    name:    'Project Analysis',
    tagline: '',
    title:   'Project Analysis',
    description: [
      "As architects & developers, we guide the vision from the very beginning, aligning our expertise with your goals to ensure the project succeeds — whether as an investment or a place to live.",
      "We also support early-stage decisions, from land selection to architectural feasibility and business planning, ensuring each project is grounded in financial viability.",
    ],
    image: '/images/studio-cover.jpg',
  },
  {
    id:      'concept-layout',
    name:    'Concept & Layout',
    tagline: '',
    title:   'Concept & Layout',
    description: [
      "We work closely with the client from the outset, using moodboards to define the project's style and materiality. From there, we develop the spatial layout and translate it into 3D volumetry and initial perspectives, allowing a clear understanding of the spaces, proportions, and overall architectural expression.",
    ],
    image: '/images/residences-cover.jpg',
  },
  {
    id:      'interiors-renders',
    name:    'Interiors & Renders',
    tagline: '',
    title:   'Interiors & Renders',
    description: [
      "We develop the interior design through detailed material and furniture selection, supported by realistic visualisations that reflect the final atmosphere of the project.",
      "In parallel, we provide colour-coded plans to facilitate early marketing and support the commercialisation process.",
    ],
    image: '/images/habitus-cover.jpg',
  },
  {
    id:      'technical-drawings',
    name:    'Technical Drawings',
    tagline: '',
    title:   'Technical Drawings',
    description: [
      "We produce a fully coordinated technical package, covering structure, MEP systems, and construction details. Using Revit as a central platform, all elements are integrated to ensure precision, avoid conflicts, and enable a smooth and efficient construction process.",
    ],
    image: '/images/studio-cover.jpg',
  },
  {
    id:      'cost-construction',
    name:    'Cost & Construction',
    tagline: '',
    title:   'Cost & Construction',
    description: [
      "We prepare detailed Bills of Quantities and support the tendering process, coordinating with contractors to ensure clarity, accuracy, and cost control. During construction, we remain involved to oversee execution, ensuring the project is delivered in line with the design, budget, and expected quality.",
    ],
    image: '/images/habitus-cover.jpg',
  },
  {
    id:      'furnishing-styling',
    name:    'Furnishing & Styling',
    tagline: '',
    title:   'Furnishing & Styling',
    description: [
      "We can complete the project through furniture selection, procurement and final styling, ensuring every element aligns with the overall design vision.",
      "The result is a fully resolved space, ready to be lived in, experienced, or brought to market.",
    ],
    image: '/images/residences-cover.jpg',
  },
];
