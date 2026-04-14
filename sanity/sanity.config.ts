/**
 * Sanity Studio configuration.
 *
 * Run locally:  npx sanity dev  (inside /sanity directory)
 * Deploy:       npx sanity deploy
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
// @ts-expect-error — @sanity/vision installed in sanity/package.json, not root
import { visionTool }    from '@sanity/vision';
import { schemaTypes }   from './schemas';

export default defineConfig({
  name:        'muem-studio',
  title:       'Muem Studio — CMS',
  projectId:   process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'REPLACE_ME',
  dataset:     process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Landing Page')
              .child(
                S.document()
                  .schemaType('landingPage')
                  .documentId('landingPage'),
              ),
            S.divider(),
            S.documentTypeListItem('studioProject')   .title('Studio Projects'),
            S.documentTypeListItem('residenceProject').title('Properties'),
            S.documentTypeListItem('furnitureItem')   .title('Lifestyle / Furniture'),
          ]),
    }),
    visionTool(), // GROQ query explorer — remove in production if desired
  ],

  schema: { types: schemaTypes },
});
