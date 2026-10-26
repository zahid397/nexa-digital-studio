import type { Payload } from 'payload'
import type { About, Home, SiteSetting } from '../src/payload-types'
import { hasEditorialContent, missingDefaults } from './seed-helpers'

const rich = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    direction: 'ltr' as const,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        direction: 'ltr' as const,
        version: 1,
        children: [
          { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
        ],
      },
    ],
  },
})

const services = [
  {
    title: 'Web Development',
    slug: 'web-development',
    icon: 'code' as const,
    description:
      'Fast, accessible websites with the craft of a custom build and the confidence of a reliable foundation.',
    intro:
      'Your website should feel as good to use as it looks. We connect considered design with maintainable engineering, from the first prototype to the last performance check.',
    deliverables: [
      'Responsive Next.js websites',
      'Accessible component systems',
      'Performance and technical SEO',
      'Testing and deployment handover',
    ],
  },
  {
    title: 'CMS Development',
    slug: 'cms-development',
    icon: 'layers' as const,
    description:
      'Content systems your team can actually use. Structured, secure and built around the way you publish.',
    intro:
      'A useful CMS gives editors independence without compromising your website. We design clear content models, sensible permissions and publishing workflows that fit your team.',
    deliverables: [
      'Content modelling and architecture',
      'Payload CMS implementation',
      'Editorial roles and publishing',
      'Migration and editor documentation',
    ],
  },
  {
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    icon: 'pen' as const,
    description:
      'Clear journeys, thoughtful interactions and interfaces that make complicated things feel simple.',
    intro:
      'Good design starts by understanding what people need to do. We turn research and practical constraints into purposeful interfaces, then test the details that make them work.',
    deliverables: [
      'User journeys and wireframes',
      'Interactive prototypes',
      'Responsive interface design',
      'Reusable design systems',
    ],
  },
  {
    title: 'Branding',
    slug: 'branding',
    icon: 'spark' as const,
    description:
      'An identity with a point of view. A consistent voice and visual language that carry across every touchpoint.',
    intro:
      'A brand is the impression you leave. We help define a clear direction and build a visual identity that feels distinctive, coherent and useful in the real world.',
    deliverables: [
      'Brand positioning workshops',
      'Visual identity and wordmarks',
      'Typography and colour systems',
      'Practical brand guidelines',
    ],
  },
  {
    title: 'SEO and Digital Marketing',
    slug: 'seo-digital-marketing',
    icon: 'chart' as const,
    description:
      'A thoughtful approach to being found, with useful content and measurement that helps you decide what comes next.',
    intro:
      'Visibility should support a real business goal. We review technical foundations, content and the customer journey, then develop a measurable plan without promising rankings or invented results.',
    deliverables: [
      'Technical and content SEO review',
      'Content planning and on-page SEO',
      'Campaign landing pages',
      'Measurement and reporting setup',
    ],
  },
  {
    title: 'E-commerce Development',
    slug: 'e-commerce-development',
    icon: 'bag' as const,
    description:
      'Shopping experiences that make discovery natural and buying straightforward, from catalogue to checkout.',
    intro:
      'A good store balances a distinctive brand with a dependable buying journey. We design product discovery, catalogue management and checkout flows around your customers and operations.',
    deliverables: [
      'Storefront and product pages',
      'Catalogue content architecture',
      'Accessible cart and checkout design',
      'Integration planning and launch QA',
    ],
  },
]
const projects = [
  {
    title: 'Orbit',
    slug: 'orbit-finance',
    category: 'digital-products',
    image: '/images/orbit.svg' as const,
    summary: 'A calmer way to understand your money.',
    featured: true,
    overview:
      'A fictional personal-finance interface exploring how a clear overview can make everyday decisions easier.',
    challenge:
      'Financial dashboards often compete for attention. The concept needed a useful hierarchy without reducing important information to decorative numbers.',
    solution:
      'A focused overview, consistent chart language and simple navigation put the next useful action in view. The mockup uses illustrative data and makes no financial-performance claims.',
    technologies: ['Next.js', 'TypeScript', 'Design system'],
  },
  {
    title: 'Sora',
    slug: 'sora-architecture',
    category: 'brand-web',
    image: '/images/sora.svg' as const,
    summary: 'An editorial home for spaces with feeling.',
    featured: true,
    overview:
      'An architecture-studio website concept that gives the work room to speak through a quiet, editorial layout.',
    challenge:
      'The design needed to balance visual storytelling with straightforward access to project information and studio details.',
    solution:
      'A restrained type system, generous spacing and structured case studies turn browsing into a clear sequence. Project content uses a CMS-ready model.',
    technologies: ['Payload CMS', 'Next.js', 'Art direction'],
  },
  {
    title: 'Bloom',
    slug: 'bloom-skincare',
    category: 'commerce',
    image: '/images/bloom.svg' as const,
    summary: 'A softer, more considered shopping experience.',
    featured: true,
    overview:
      'A fictional skincare storefront exploring approachable product education and accessible product discovery.',
    challenge:
      'Customers need to understand a product before they consider buying. The concept needed clarity without an overwhelming catalogue.',
    solution:
      'A focused product range, readable ingredient information and consistent product cards make browsing predictable. No real products, payments or medical claims are involved.',
    technologies: ['Commerce UX', 'React', 'Brand identity'],
  },
  {
    title: 'Forma',
    slug: 'forma-objects',
    category: 'commerce',
    image: '/images/forma.svg' as const,
    summary: 'Everyday objects. Uncommon character.',
    featured: true,
    overview:
      'A homeware-store concept built around the relationship between useful objects and expressive visual design.',
    challenge:
      'The catalogue needed to remain easy to scan while giving each object a distinct presence.',
    solution:
      'Modular product layouts, clear category labels and tactile colour combinations support discovery. Product mockups are original illustrations for this demonstration.',
    technologies: ['Next.js', 'Product design', 'E-commerce'],
  },
  {
    title: 'Morrow',
    slug: 'morrow-journal',
    category: 'brand-web',
    image: '/images/morrow.svg' as const,
    summary: 'A new perspective on the everyday.',
    featured: false,
    overview:
      'A fictional independent journal exploring a flexible editorial system for essays and visual stories.',
    challenge:
      'The publication needed a recognisable identity across different story lengths without making every page identical.',
    solution:
      'An expressive headline style and reusable content modules give editors variety within a consistent reading experience.',
    technologies: ['Editorial design', 'CMS architecture', 'Accessibility'],
  },
  {
    title: 'Pulse',
    slug: 'pulse-movement',
    category: 'digital-products',
    image: '/images/pulse.svg' as const,
    summary: 'Movement that fits your own rhythm.',
    featured: false,
    overview:
      'A fictional activity-planning product concept focused on realistic goals and encouraging daily routines.',
    challenge:
      'The interface needed to support progress without creating pressure through unsupported health claims or competitive comparisons.',
    solution:
      'Personal planning, legible activity summaries and an encouraging tone keep the next step manageable. All activity data is illustrative.',
    technologies: ['UI/UX', 'React', 'Motion'],
  },
]


const siteDefaults: Omit<SiteSetting, 'id' | 'createdAt' | 'updatedAt'> = {
        brandName: 'Nexa Digital Studio',
        tagline: 'Independent thinking. Thoughtful design. Digital experiences with purpose.',
        email: 'hello@nexa.example',
        location: 'Dhaka, Bangladesh · Working everywhere',
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Services', href: '/services' },
          { label: 'Work', href: '/portfolio' },
          { label: 'Contact', href: '/contact' },
        ],
        footerHeading: 'Something good starts with a conversation.',
        footerNote:
          'A recruitment demonstration by Zahid Hasan. All agency profiles, testimonials and projects are illustrative concepts.',
        footerLinks: [
          { label: 'About the studio', href: '/about' },
          { label: 'Our capabilities', href: '/services' },
          { label: 'Selected work', href: '/portfolio' },
          { label: 'Get in touch', href: '/contact' },
        ],
        contactTitle: 'Let’s make something that matters.',
        contactIntro:
          'Tell us what you have in mind. A new idea, a website that needs a rethink, or a content system your team can call its own.',
        privacyNote:
          'This is a recruitment demo. Your inquiry is stored privately for review by the site administrator. No email is sent. Please do not include sensitive information.',
      }
const homeDefaults: Omit<Home, 'id' | 'createdAt' | 'updatedAt'> = {
        eyebrow: 'Independent digital design & development studio',
        heroTitle: 'Good ideas.',
        heroAccent: 'Extraordinary digital.',
        heroDescription:
          'We bring brands to life through thoughtful design, purposeful websites and content systems that put you in control.',
        servicesTitle: 'Considered from every angle.',
        workTitle: 'Different briefs. Same care.',
        advantagesTitle: 'Small details. A bigger difference.',
        advantages: [
          {
            title: 'Clarity before complexity',
            description: 'We ask the right questions first, so every design decision has a reason.',
          },
          {
            title: 'Design meets engineering',
            description:
              'The people who shape the experience work closely with the people who build it.',
          },
          {
            title: 'Yours to grow',
            description:
              'Manage your content, understand your system and build on a foundation you own.',
          },
        ],
        testimonial:
          'The concept brings the story and the interface together. Every part feels like it belongs.',
        testimonialRole: 'Illustrative creative director profile',
        _status: 'published',
        seo: {
          title: 'Nexa Digital Studio | Thoughtful digital experiences',
          description:
            'A fictional creative agency demonstrating custom web design, Payload CMS development and purposeful digital experiences.',
        },
      }
const aboutDefaults: Omit<About, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'A curious studio. A considered approach.',
        intro:
          'Nexa is a fictional independent digital studio, imagined in Dhaka and built around a simple belief: useful things can be beautiful, and beautiful things should be useful.',
        mission:
          'To turn complex ideas into clear digital experiences that help people do what they came to do.',
        vision: 'A web that feels more thoughtful, more accessible and a little less ordinary.',
        values: [
          {
            title: 'Curiosity',
            description:
              'Understand the people, the context and the problem before deciding on a solution.',
          },
          {
            title: 'Care',
            description:
              'Treat the small details as part of the work, from keyboard focus to the final handover.',
          },
          {
            title: 'Candour',
            description:
              'Make decisions visible. Be clear about scope, limitations and what happens next.',
          },
        ],
        process: [
          {
            title: 'Discover',
            description:
              'A shared understanding of the audience, the challenge and what a useful outcome looks like.',
          },
          {
            title: 'Define',
            description:
              'Content structure, creative direction and a practical plan before production begins.',
          },
          {
            title: 'Create',
            description:
              'Design and development move together, with regular reviews and real feedback.',
          },
          {
            title: 'Refine & launch',
            description:
              'Test the experience, work through the details and hand over a system you can manage.',
          },
        ],
        team: [
          {
            name: 'Ari Rahman',
            role: 'Creative direction',
            bio: 'Connects the brand story with a clear visual point of view.',
          },
          {
            name: 'Maya Noor',
            role: 'Experience design',
            bio: 'Explores how people move through an experience and where it can feel easier.',
          },
          {
            name: 'Rafi Khan',
            role: 'Development',
            bio: 'Turns design intent into reliable, accessible interfaces and content tools.',
          },
        ],
        _status: 'published',
      }

export const demoSlugs = {
  services: services.map((service) => service.slug),
  projects: projects.map((project) => project.slug),
}

export type SeedSummary = {
  services: { created: number; preserved: number; published: number; unpublished: string[] }
  projects: { created: number; preserved: number; published: number; unpublished: string[] }
  globals: { slug: string; action: string; filledFields: string[]; needsReview: boolean }[]
  complete: boolean
}

/** Adds missing fictional examples, preserving existing records and editorial decisions. */
export async function seedDemo(payload: Payload): Promise<SeedSummary> {
  const summary: SeedSummary = {
    services: { created: 0, preserved: 0, published: 0, unpublished: [] },
    projects: { created: 0, preserved: 0, published: 0, unpublished: [] },
    globals: [],
    complete: false,
  }
  const categoryIds = new Map<string, number>()
  for (const category of [
    { title: 'Digital products', slug: 'digital-products' },
    { title: 'Brand & web', slug: 'brand-web' },
    { title: 'Commerce', slug: 'commerce' },
  ]) {
    const existing = await payload.find({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: category.slug } },
      limit: 1,
    })
    const document = existing.docs[0] ?? await payload.create({
      collection: 'categories', overrideAccess: true, data: category,
    })
    categoryIds.set(category.slug, document.id)
  }
  for (const [index, service] of services.entries()) {
    const existing = await payload.count({
      collection: 'services', overrideAccess: true,
      where: { slug: { equals: service.slug } },
    })
    if (existing.totalDocs) {
      summary.services.preserved++
      continue
    }
    await payload.create({
      collection: 'services', overrideAccess: true,
      data: {
        ...service,
        order: index + 1,
        deliverables: service.deliverables.map((item) => ({ item })),
        content: rich('Every engagement begins with a conversation about your audience, your content and the job the experience needs to do. Scope, responsibilities and delivery checkpoints are agreed before production starts. You receive clear documentation and a handover that helps your team continue with confidence.'),
        ctaLabel: 'Discuss your project',
        _status: 'published',
      },
    })
    summary.services.created++
  }
  for (const [index, project] of projects.entries()) {
    const existing = await payload.count({
      collection: 'projects', overrideAccess: true,
      where: { slug: { equals: project.slug } },
    })
    if (existing.totalDocs) {
      summary.projects.preserved++
      continue
    }
    await payload.create({
      collection: 'projects', overrideAccess: true,
      data: {
        ...project,
        category: categoryIds.get(project.category)!,
        imageAlt: `${project.title} fictional concept interface`,
        gallery: [{ image: project.image, imageAlt: `${project.title} concept overview` }],
        technologies: project.technologies.map((name) => ({ name })),
        body: rich('This self-initiated concept demonstrates design direction and content structure. It is not a commissioned client project, an operating product or evidence of verified business results.'),
        year: '2026', order: index + 1, isDemo: true, _status: 'published',
      },
    })
    summary.projects.created++
  }

  for (const [slug, defaults] of [
    ['site-settings', siteDefaults], ['home', homeDefaults], ['about', aboutDefaults],
  ] as const) {
    // Inspect latest drafts so setup cannot overwrite an editor's unpublished work.
    const current = await payload.findGlobal({ slug, draft: true, overrideAccess: true })
    const initialized = hasEditorialContent(current)
    if (initialized && '_status' in current && current._status === 'draft') {
      summary.globals.push({ slug, action: 'preserved-draft', filledFields: [], needsReview: true })
      continue
    }
    const patch = missingDefaults(current, defaults, { initialize: !initialized })
    const filledFields = Object.keys(patch)
    let final = current
    if (filledFields.length) {
      // A first initialization is explicitly published. An existing draft is never published.
      // Keep each slug/data pair discriminated for Payload's generated global types.
      if (slug === 'site-settings') {
        const data = missingDefaults(current, siteDefaults, { initialize: !initialized })
        final = await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data })
      } else if (slug === 'home') {
        const data = missingDefaults(current, homeDefaults, { initialize: !initialized })
        final = await payload.updateGlobal({
          slug: 'home', overrideAccess: true,
          data: !initialized ? { ...data, _status: 'published' } : data,
        })
      } else {
        const data = missingDefaults(current, aboutDefaults, { initialize: !initialized })
        final = await payload.updateGlobal({
          slug: 'about', overrideAccess: true,
          data: !initialized ? { ...data, _status: 'published' } : data,
        })
      }
    }
    const requiredArrays = slug === 'site-settings' ? ['navigation'] : slug === 'home' ? ['advantages'] : ['values', 'process']
    const finalFields = final as unknown as Record<string, unknown>
    const needsReview = (slug !== 'site-settings' && finalFields._status !== 'published') || requiredArrays.some((field) => {
      const value = finalFields[field]
      return !Array.isArray(value) || value.length === 0
    })
    summary.globals.push({
      slug,
      action: filledFields.length ? initialized ? 'filled-missing-fields' : 'initialized' : 'preserved',
      filledFields, needsReview,
    })
  }
  for (const collection of ['services', 'projects'] as const) {
    // Match the same publication predicate used by the public site, rather than
    // claiming success merely because records exist in the administrator API.
    const published = await payload.find({
      collection, overrideAccess: true, draft: false, depth: 0, limit: 100,
      where: { and: [
        { slug: { in: demoSlugs[collection] } },
        { _status: { equals: 'published' } },
      ] },
    })
    const publishedSlugs = new Set(published.docs.map((document) => document.slug))
    summary[collection].published = publishedSlugs.size
    summary[collection].unpublished = demoSlugs[collection].filter((slug) => !publishedSlugs.has(slug))
  }
  summary.complete = summary.services.unpublished.length === 0
    && summary.projects.unpublished.length === 0
    && !summary.globals.some((global) => global.needsReview)
  return summary
}
