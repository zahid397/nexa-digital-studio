'use client'
import { useState } from 'react'
import type { Category, Project } from '@/payload-types'
import { ProjectCard } from './project-card'
import { EmptyState } from './ui'
export function PortfolioGrid({
  projects,
  categories,
}: {
  projects: Project[]
  categories: Category[]
}) {
  const [selected, setSelected] = useState('all')
  const visible = projects.filter(
    (p) =>
      selected === 'all' ||
      String(typeof p.category === 'object' ? p.category.id : p.category) === selected,
  )
  return (
    <>
      <div className="portfolio-toolbar">
        <div className="filter-list" aria-label="Project categories">
          <button
            type="button"
            aria-pressed={selected === 'all'}
            onClick={() => setSelected('all')}
          >
            All work <span>{projects.length.toString().padStart(2, '0')}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected === String(c.id)}
              onClick={() => setSelected(String(c.id))}
            >
              {c.title}
            </button>
          ))}
        </div>
        <p className="micro muted">Self-initiated concepts</p>
      </div>
      <p className="sr-only" role="status">
        {visible.length} projects shown
      </p>
      {visible.length ? (
        <div className="project-grid">
          {visible.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="A new chapter is taking shape."
          description="There are no published projects in this category yet. Try another filter."
        />
      )}
    </>
  )
}
