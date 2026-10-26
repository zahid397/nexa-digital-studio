import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/payload-types'
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project
  priority?: boolean
}) {
  const category =
    typeof project.category === 'object' ? project.category.title : 'Selected project'
  return (
    <article className="project-card">
      <Link
        href={`/portfolio/${project.slug}`}
        className="project-link"
        aria-label={`View ${project.title} project`}
      >
        <div className="project-image">
          <Image
            src={project.image}
            alt={project.imageAlt}
            width={1200}
            height={900}
            priority={priority}
            unoptimized
          />
          <span className="project-open">
            <ArrowUpRight size={23} aria-hidden="true" />
          </span>
          {project.isDemo && <span className="demo-badge">Demo concept</span>}
        </div>
        <div className="project-info">
          <div>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
          </div>
          <span className="project-category">{category}</span>
        </div>
      </Link>
    </article>
  )
}
