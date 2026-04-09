import * as React from "react"
import { Project } from "../../classes/Project"
import { ProgressEditor } from "./ProgressEditor"

interface Props {
  project: Project
  onEdit: () => void
  onUpdate: () => void
}

export function ProjectInfoCard({ project, onEdit, onUpdate }: Props) {

  const progress = Math.min(Math.max(project.progress * 100, 0), 100)

  return (
    <div className="dashboard-card" style={{ padding: "30px 0" }}>
      
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px 30px",
        marginBottom: 30
      }}>
        <div className="project-details-icon" style={{ backgroundColor: project.colour }}>
          {project.getInitials()}
        </div>

        <button 
          className="btn-secondary"
          onClick={onEdit}
        >
          Edit
        </button>

      </div>

      {/* CONTENT */}
      <div style={{ padding: "0 30px" }}>

        {/* NAME + DESCRIPTION */}
        <div>
          <h5>{project.name}</h5>
          <p>{project.description}</p>
        </div>

        {/* PROPERTIES */}
        <div style={{
          display: "flex",
          columnGap: 30,
          padding: "30px 0px",
          justifyContent: "space-between",
          flexWrap: "wrap"
        }}>
          <div>
            <p style={{ color: "#969696" }}>Status</p>
            <p>{project.status}</p>
          </div>

          <div>
            <p style={{ color: "#969696" }}>Cost</p>
            <p>${project.cost}</p>
          </div>

          <div>
            <p style={{ color: "#969696" }}>Role</p>
            <p>{project.userRole}</p>
          </div>

          <div>
            <p style={{ color: "#969696" }}>Finish Date</p>
            <p>{project.finishDate.toLocaleDateString("es-ES")}</p>
          </div>
        </div>

        <ProgressEditor project={project} onChange={onUpdate} />
        
      </div>
    </div>
  )
}