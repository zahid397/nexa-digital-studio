import { APIError, type CollectionConfig } from 'payload'
import { adminOnly, publishedOrAdmin, isAdminUser } from '@/lib/access'
import { assetFields, seoFields, slugField } from './fields'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Administration' },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600_000,
    tokenExpiration: 7200,
    cookies: { sameSite: 'Lax', secure: process.env.SITE_URL?.startsWith('https://') === true },
  },
  access: {
    admin: ({ req }) => isAdminUser(req),
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeOperation: [
      ({ operation }) => {
        if (operation === 'forgotPassword')
          throw new APIError(
            'Email recovery is not configured. Contact the site owner for the documented CLI recovery process.',
            503,
          )
      },
    ],
    beforeChange: [
      ({ req, operation }) => {
        if (operation === 'create' && !isAdminUser(req) && req.context?.secureBootstrap !== true)
          throw new APIError('Public registration is disabled.', 403)
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: ['admin'],
      access: {
        create: ({ req }) => isAdminUser(req) || req.context?.secureBootstrap === true,
        update: ({ req }) => isAdminUser(req),
      },
    },
  ],
}
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [{ name: 'title', type: 'text', required: true, maxLength: 80 }, slugField],
}
const drafts = { drafts: { autosave: false, validate: true }, maxPerDoc: 15 } as const
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  access: {
    read: publishedOrAdmin,
    readVersions: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  versions: drafts,
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 100 },
    slugField,
    { name: 'order', type: 'number', defaultValue: 0, index: true },
    { name: 'description', type: 'textarea', required: true, maxLength: 350 },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: ['code', 'layers', 'pen', 'spark', 'chart', 'bag'],
      defaultValue: 'code',
    },
    { name: 'intro', type: 'textarea', required: true, maxLength: 700 },
    { name: 'content', type: 'richText' },
    {
      name: 'deliverables',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [{ name: 'item', type: 'text', required: true, maxLength: 140 }],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Discuss your project',
      required: true,
      maxLength: 70,
    },
    seoFields,
  ],
}
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
  },
  access: {
    read: publishedOrAdmin,
    readVersions: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  versions: drafts,
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    slugField,
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    { name: 'summary', type: 'textarea', required: true, maxLength: 350 },
    ...assetFields,
    { name: 'gallery', type: 'array', maxRows: 6, fields: assetFields },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'isDemo',
      label: 'Fictional demonstration concept',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
    { name: 'year', type: 'text', required: true, defaultValue: '2026', maxLength: 4 },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'overview', type: 'textarea', required: true, maxLength: 1600 },
    { name: 'challenge', type: 'textarea', required: true, maxLength: 1600 },
    { name: 'solution', type: 'textarea', required: true, maxLength: 1600 },
    { name: 'body', type: 'richText' },
    {
      name: 'technologies',
      type: 'array',
      maxRows: 10,
      fields: [{ name: 'name', type: 'text', required: true, maxLength: 60 }],
    },
    seoFields,
  ],
}
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Inbox',
    defaultColumns: ['name', 'email', 'service', 'status', 'createdAt'],
    description: 'Contact submissions are saved here. No email delivery is configured.',
  },
  access: { create: () => false, read: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    {
      name: 'submissionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'fingerprint',
      type: 'text',
      required: true,
      access: { read: () => false },
      admin: { hidden: true },
    },
    { name: 'name', type: 'text', required: true, maxLength: 100, admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
    { name: 'service', type: 'text', required: true, admin: { readOnly: true } },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 4000,
      admin: { readOnly: true },
    },
    { name: 'budget', type: 'text', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'closed'],
      required: true,
    },
  ],
}
