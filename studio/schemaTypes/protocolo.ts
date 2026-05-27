import { defineField, defineType, defineArrayMember } from 'sanity'
import { StarIcon } from '@sanity/icons'

export const protocolo = defineType({
  name: 'protocolo',
  title: 'Protocolo',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome da Entidade',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Saúde & Bem-Estar', value: 'saude' },
          { title: 'Formação & Educação', value: 'formacao' },
          { title: 'Segurança & Defesa', value: 'seguranca' },
          { title: 'Outros Serviços', value: 'outros' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'etiqueta',
      title: 'Etiqueta (badge)',
      type: 'string',
      description: 'Ex: "20% desconto", "Parceiro Exclusivo"',
    }),
    defineField({
      name: 'beneficios',
      title: 'Benefícios',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'percentagem', title: 'Percentagem / Destaque', type: 'string' }),
            defineField({ name: 'descricao', title: 'Descrição', type: 'string' }),
          ],
          preview: {
            select: { title: 'descricao', subtitle: 'percentagem' },
          },
        }),
      ],
    }),
    defineField({
      name: 'ordem',
      title: 'Ordem',
      type: 'number',
      description: 'Menor número aparece primeiro dentro da categoria',
    }),
    defineField({
      name: 'ativo',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'nome',
      subtitle: 'categoria',
      media: 'logo',
    },
  },
  orderings: [
    {
      title: 'Categoria + Ordem',
      name: 'categoriaOrdem',
      by: [
        { field: 'categoria', direction: 'asc' },
        { field: 'ordem', direction: 'asc' },
      ],
    },
  ],
})
