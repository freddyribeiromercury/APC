import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const membro = defineType({
  name: 'membro',
  title: 'Sócio',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'nome',
      title: 'Nome Completo',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'genero',
      title: 'Género',
      type: 'string',
      options: {
        list: [
          { title: 'Masculino', value: 'Masculino' },
          { title: 'Feminino', value: 'Feminino' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: 'telemovel',
      title: 'Telemóvel',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'cartaoCidadao',
      title: 'Cartão de Cidadão',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'morada',
      title: 'Morada',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'foto',
      title: 'Fotografia',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'temLicenciatura',
      title: 'Tem Licenciatura em Criminologia',
      type: 'boolean',
      initialValue: false,
      description: 'Cartão fundo cinzento (sim) ou amarelo (não)',
    }),
    defineField({
      name: 'ativo',
      title: 'Ativo',
      type: 'boolean',
      initialValue: false,
      description: '⚡ Mudar para Ativo dispara o envio automático do cartão por email',
    }),
    defineField({
      name: 'cartaoEnviado',
      title: 'Cartão Enviado',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'numeroSocio',
      title: 'N.º de Sócio',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'dataSubmissao',
      title: 'Data de Submissão',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'dataAprovacao',
      title: 'Data de Aprovação',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'nome',
      subtitle: 'email',
      media: 'foto',
    },
  },
  orderings: [
    {
      title: 'Data de Submissão (recente)',
      name: 'submissaoDesc',
      by: [{ field: 'dataSubmissao', direction: 'desc' }],
    },
    {
      title: 'N.º de Sócio',
      name: 'numeroSocioAsc',
      by: [{ field: 'numeroSocio', direction: 'asc' }],
    },
  ],
})
