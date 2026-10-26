import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

export const cms = cache(() => getPayload({ config }))
export const getSite = cache(async () =>
  (await cms()).findGlobal({ slug: 'site-settings', overrideAccess: false }),
)
export const getHome = cache(async () =>
  (await cms()).findGlobal({ slug: 'home', draft: false, overrideAccess: false }),
)
export const getAbout = cache(async () =>
  (await cms()).findGlobal({ slug: 'about', draft: false, overrideAccess: false }),
)
export const getServices = cache(async () =>
  (await cms()).find({
    collection: 'services',
    where: { _status: { equals: 'published' } },
    draft: false,
    overrideAccess: false,
    limit: 100,
    sort: 'order',
  }),
)
export const getProjects = cache(async () =>
  (await cms()).find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    draft: false,
    overrideAccess: false,
    limit: 100,
    sort: 'order',
    depth: 1,
  }),
)
export const getCategories = cache(async () =>
  (await cms()).find({
    collection: 'categories',
    overrideAccess: false,
    limit: 100,
    sort: 'title',
  }),
)
export const getProject = cache(async (slug: string) => {
  const { docs } = await (
    await cms()
  ).find({
    collection: 'projects',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    draft: false,
    overrideAccess: false,
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})
export const getService = cache(async (slug: string) => {
  const { docs } = await (
    await cms()
  ).find({
    collection: 'services',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    draft: false,
    overrideAccess: false,
    limit: 1,
  })
  return docs[0] ?? null
})
