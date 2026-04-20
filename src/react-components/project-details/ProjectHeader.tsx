// RESPONSABILIDADES DEL COMPONENTE:
// Muestra el nombre y la descripción del proyecto (solo recibe datos y los pinta)

// FUNCIONAMIENTO:
// ProjectDetailsPage → pasa project → ProjectHeader lo muestra
// ======================================================
// IMPORTACIONES
// ======================================================
// Necesario para JSX
import * as React from "react"
// Importas la clase Project para poder traerme el nombre y descripción del proyecto
import { Project } from "../../classes/Project"

// Define qué recibe el componente: "Este componente necesita un proyecto para funcionar"
interface Props {
  project: Project
}

// ======================================================
// COMPONENTE: ProjectHeader
// ======================================================
export function ProjectHeader({ project }: Props) {

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <header>
      <div>
        {/* { } permiten meter JavaScript dentro de JSX */}
        <h2>{project.name}</h2>
        <p style={{ color: "#969696" }}>
          {project.description}
        </p>
      </div>
    </header>
  )
}