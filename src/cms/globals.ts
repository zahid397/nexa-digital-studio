import type { GlobalConfig } from 'payload'
import { adminOnly, isAdminUser } from '@/lib/access'
import { linkFields, seoFields } from './fields'

const globalAccess: NonNullable<GlobalConfig['access']> = {
  read: ({ req }) => isAdminUser(req) || (req.query?.draft !== true && req.query?.draft !== 'true'),
  readVersions: adminOnly,
  update: adminOnly,
}
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Navigation, contact and footer',
  admin: { group: 'Website' },
  access: globalAccess,
  fields: [
    { name: 'brandName', type: 'text', required: true },
    { name: 'tagline', type: 'textarea', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'navigation', type: 'array', required: true, maxRows: 7, fields: linkFields },
    { name: 'footerHeading', type: 'text', required: true },
    { name: 'footerNote', type: 'textarea', required: true },
    { name: 'footerLinks', type: 'array', maxRows: 8, fields: linkFields },
    { name: 'contactTitle', type: 'text', required: true },
    { name: 'contactIntro', type: 'textarea', required: true },
    { name: 'privacyNote', type: 'textarea', required: true },
  ],
}
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Website' },
  access: globalAccess,
  versions: { drafts: { autosave: false }, max: 15 },
  fields: [
    { name: 'eyebrow', type: 'text', required: true, maxLength: 100 },
    { name: 'heroTitle', type: 'text', required: true, maxLength: 110 },
    { name: 'heroAccent', type: 'text', required: true, maxLength: 100 },
    { name: 'heroDescription', type: 'textarea', required: true, maxLength: 400 },
    { name: 'servicesTitle', type: 'text', required: true },
    { name: 'workTitle', type: 'text', required: true },
    { name: 'advantagesTitle', type: 'text', required: true },
    {
      name: 'advantages',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'testimonial', type: 'textarea', required: true },
    { name: 'testimonialRole', type: 'text', required: true },
    seoFields,
  ],
}
export const About: GlobalConfig = {
  slug: 'about',
  label: 'About the studio',
  admin: { group: 'Website' },
  access: globalAccess,
  versions: { drafts: { autosave: false }, max: 15 },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'intro', type: 'textarea', required: true },
    { name: 'mission', type: 'textarea', required: true },
    { name: 'vision', type: 'textarea', required: true },
    {
      name: 'values',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'process',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'team',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        { name: 'bio', type: 'textarea', required: true },
      ],
    },
    seoFields,
  ],
}
