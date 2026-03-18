export interface PhilosophyPillar {
  id:             string;
  number:         string;   // '01' | '02' | '03'
  pillar:         string;   // 'Craft'
  statement:      string;   // display text — '\n' splits into lines
  body:           string;
  imageSrc:       string;
  imageCaption:   string;
}

export const PHILOSOPHY: PhilosophyPillar[] = [
  {
    id:           'craft',
    number:       '01',
    pillar:       'Craft',
    statement:    'Every detail is a\ndecision. Every decision\na commitment.',
    body:         'We believe architecture is inseparable from the hands that shape it. Materials are chosen for their truth, not their trend. Joinery, texture, and proportion are worked and reworked until the outcome earns its permanence.',
    imageSrc:     '/images/studio-cover.jpg',
    imageCaption: 'Studio Muem — Canggu atelier',
  },
  {
    id:           'context',
    number:       '02',
    pillar:       'Context',
    statement:    'A building belongs\nto its place before\nit belongs to its owner.',
    body:         'Site, climate, culture, and light are not constraints — they are the brief. We listen before we draw, and we draw only what the land would have suggested given enough time.',
    imageSrc:     '/images/habitus-cover.jpg',
    imageCaption: 'Habitus — responding to landscape',
  },
  {
    id:           'longevity',
    number:       '03',
    pillar:       'Longevity',
    statement:    'Build what outlasts\nthe moment it was\ndesigned for.',
    body:         'Trends are noise. We work toward permanence — structures that accumulate meaning as they age, that feel inevitable rather than fashionable, and that a future generation will choose to keep.',
    imageSrc:     '/images/residences-cover.jpg',
    imageCaption: 'Residences — built for generations',
  },
];
