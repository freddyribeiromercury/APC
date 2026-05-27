import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const noticia = defineType({
  name: 'noticia',
  title: 'Notícia',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'data',
      title: 'Data',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Conquista', value: 'conquista' },
          { title: 'Evento', value: 'evento' },
          { title: 'Congresso', value: 'congresso' },
          { title: 'Palestra', value: 'palestra' },
          { title: 'Formação', value: 'formacao' },
          { title: 'Petição', value: 'peticao' },
          { title: 'Destaque', value: 'destaque' },
          { title: 'Comunicado', value: 'comunicado' },
        ],
        layout: 'dropdown',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'descricao',
      title: 'Descrição',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'imagem',
      title: 'Imagem',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'link',
      title: 'Link (opcional)',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'titulo',
      subtitle: 'data',
      media: 'imagem',
    },
  },
  orderings: [
    {
      title: 'Data (recente)',
      name: 'dataDesc',
      by: [{ field: 'data', direction: 'desc' }],
    },
  ],
})
