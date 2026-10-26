import type { Field } from 'payload'

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  maxLength: 120,
  required: true,
  unique: true,
  index: true,
  admin: {
    description: 'Lowercase words separated by hyphens. Changing a URL requires updating links.',
  },
  validate: (value: unknown, { operation }: { operation?: string } = {}) => {
    if (value === undefined && operation === 'update') return true
    return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : 'Use lowercase letters, numbers and single hyphens.'
  },
}
export const linkFields: Field[] = [
  { name: 'label', type: 'text', required: true, maxLength: 60 },
  {
    name: 'href',
    type: 'text',
    required: true,
    validate: (v: unknown) =>
      typeof v === 'string' && /^\/(?!\/)[a-zA-Z0-9/?#=&_.-]*$/.test(v)
        ? true
        : 'Use an internal path starting with a single slash.',
  },
]
export const assetFields: Field[] = [
  {
    name: 'image',
    label: 'Image asset',
    type: 'select',
    required: true,
    defaultValue: '/images/orbit.svg',
    options: ['orbit', 'sora', 'bloom', 'forma', 'morrow', 'pulse'].map((v) => ({
      label: v[0].toUpperCase() + v.slice(1),
      value: `/images/${v}.svg`,
    })),
  },
  { name: 'imageAlt', type: 'text', required: true, maxLength: 180 },
]
export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  fields: [
    { name: 'title', type: 'text', maxLength: 70 },
    { name: 'description', type: 'textarea', maxLength: 180 },
  ],
}
