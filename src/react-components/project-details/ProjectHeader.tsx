import * as React from "react"
import { Project } from "../../classes/Project"

interface Props {
  project: Project
}

export function ProjectHeader({ project }: Props) {
  return (
    <header>
      <div>
        <h2>{project.name}</h2>
        <p style={{ color: "#969696" }}>
          {project.description}
        </p>
      </div>
    </header>
  )
}