import * as React from "react"
import * as Router from "react-router-dom"
import { ProjectsManager } from "../../classes/ProjectsManager"
import { ProjectInfoCard } from "./ProjectInfoCard"
import { ProjectHeader } from "./ProjectHeader"
import { TodoList } from "./TodoList"
import { ProjectFormModal } from "../ProjectFormModal"
import { IProject, Project } from "../../classes/Project"

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
    const errorRef = React.useRef<HTMLDialogElement>(null)
    const [editingProject, setEditingProject] = React.useState<Project | null>(null)
    const routeParams = Router.useParams<{id: string}>()
    if (!routeParams.id) {return <p>Project ID is needed to see this page</p>}
    const project = props.projectsManager.getProject(routeParams.id)
    React.useEffect(() => {
      if (!project) {
        errorRef.current?.showModal()
      }
    }, [project])

    if (!project) {
      return (
        <dialog ref={errorRef} className="error-modal">
          <h3>Error</h3>
          <p id="error-message">
            The project with ID {routeParams.id} was not found.
          </p>
          <button onClick={() => window.location.href = "/"}>
            Go back
          </button>
        </dialog>
      )
    }

    const handleEditSubmit = (data: IProject) => {
      if (!project) return

      project.name = data.name
      project.description = data.description
      project.status = data.status
      project.userRole = data.userRole
      project.finishDate = data.finishDate

      setEditingProject(null)
    }
    return (
        <div className="page" id="project-details">
          <ProjectHeader project={project} />
        
      <div className="main-page-content">
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30}}>
          <ProjectInfoCard 
            project={project} 
            onEdit={() => setEditingProject(project)}
            onUpdate={() => props.projectsManager.updateProject()}
          />
          <TodoList 
            project={project} 
            onUpdate={() => props.projectsManager.updateProject()}
          />
        </div>
        <div
          id="viewer-container"
          className="dashboard-card"
          style={{ minWidth: 0 }}
        />
      </div>

      <ProjectFormModal
        projectToEdit={editingProject}
        onSubmit={handleEditSubmit}
      />

    </div>
  );
}