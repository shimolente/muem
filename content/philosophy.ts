export interface PhilosophyPillar {
  id:          string;
  heading:     string;
  subheading:  string;
  body:        string;
  imageSrc:    string;
}

export const PHILOSOPHY: PhilosophyPillar[] = [
  {
    id:         'essence',
    heading:    'Essence',
    subheading: 'Rootedness. Sustainability. Refinement.',
    body:       'We design spaces that work with their environment rather than compete with it. A quieter approach to architecture — where nothing is excessive, and everything is considered.',
    imageSrc:   '/images/studio-cover.jpg',
  },
  {
    id:         'team',
    heading:    'Team',
    subheading: 'Vision. Collaboration. Expertise.',
    body:       'Our studio brings together architects, interior designers, and craftspeople who share a common conviction: that the best spaces are built through dialogue, not decree.',
    imageSrc:   '/images/habitus-cover.jpg',
  },
  {
    id:         'international',
    heading:    'International',
    subheading: 'Bali. Lombok. Italy.',
    body:       'Rooted in Bali, our practice spans continents. We bring the same considered approach to every site — letting each place teach us something new about how people want to live.',
    imageSrc:   '/images/residences-cover.jpg',
  },
];
