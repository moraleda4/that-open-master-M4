// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// ProjectHeader es un componente principalmente visual.

// Responsabilidades:
// 1. Mostrar el nombre del proyecto.
// 2. Mostrar la descripción del proyecto.
// 3. Mostrar el botón de eliminación.
// 4. Notificar al componente padre cuando el usuario solicita borrar el proyecto.
//
// IMPORTANTE:
//
// No elimina proyectos.
// No modifica datos.
// No accede a Firebase.
// No accede a ProjectsManager.
//
// Solo muestra información y emite eventos.

// FLUJO:
  // ProjectDetailsPage
  // ↓
  // project + onDelete
  // ↓
  // ProjectHeader
  // ↓
  // Renderiza información
  // ↓
  // Si el usuario pulsa "Delete Project"
  // ↓
  // Ejecuta onDelete()

// ======================================================
// IMPORTACIONES
// ======================================================
// Necesario para JSX
import * as React from "react"
// Importas la clase Project para poder traerme el nombre y descripción del proyecto
// Clase Project utilizada para tipar la prop recibida por el componente
import { Project } from "../../classes/Project"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// project
// ↓
// Proyecto que se mostrará

// onDelete
// ↓
// Callback ejecutado cuando el usuario pulsa el botón de eliminar

// Define qué recibe el componente: "Este componente necesita un proyecto para funcionar"
interface Props {
  project: Project
  onDelete: () => void
}

// ======================================================
// COMPONENTE: ProjectHeader
// ======================================================
// Cabecera visual de la página de detalles. Muestra:
  // - nombre
  // - descripción
  // - acción de borrado
export function ProjectHeader({ project, onDelete }: Props) {

  // ======================================================
  // RENDER
  // ======================================================
  return (
    // Cabecera principal de la página
    <header>
      <div>
        {/* { } permiten meter JavaScript dentro de JSX */}
        {/* Nombre principal del proyecto */}
        <h2>{project.name}</h2>
        {/* Descripción resumida del proyecto */}
        <p style={{ color: "#969696" }}>
          {project.description}
        </p>
      </div>
      {/* Solicita la eliminación del proyecto. Este componente NO borra el proyecto. Simplemente ejecuta el callback recibido desde el componente padre */}
      {/* ProjectHeader
          ↓
          No sabe borrar

          ProjectDetailsPage
          ↓
          Sí sabe borrar */}
      <button onClick={onDelete} style={{ backgroundColor: "red" }}>Delete Project</button>
    </header>
  )
}

// FLUJO:
  // Usuario pulsa Delete
  // ↓
  // onDelete()
  // ↓
  // ProjectDetailsPage
  // ↓
  // handleDeleteProject()
  // ↓
  // ProjectsManager
  // ↓
  // Firebase
  
  // ProjectHeader nunca elimina directamente.