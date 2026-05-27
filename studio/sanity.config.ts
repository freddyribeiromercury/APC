import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'APC — Gestão de Sócios',
  projectId: 'v8cpwm2k',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('APC')
          .items([
            S.listItem()
              .title('Sócios Pendentes')
              .child(
                S.documentList()
                  .title('Pendentes de Aprovação')
                  .filter('_type == "membro" && ativo == false')
              ),
            S.listItem()
              .title('Sócios Ativos')
              .child(
                S.documentList()
                  .title('Sócios Ativos')
                  .filter('_type == "membro" && ativo == true')
              ),
            S.divider(),
            S.documentTypeListItem('membro').title('Todos os Sócios'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
