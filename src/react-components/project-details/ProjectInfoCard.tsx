// RESPONSABILIDADES DEL COMPONENTE:
// ProjectInfoCard = componente PRESENTACIONAL con interacción

// 1. Muestra información del proyecto (nombre, estado, coste, rol, fecha…)
// 2. Muestra elementos visuales (icono con iniciales y color)
// 3. Permite acciones del usuario (botón Edit)
// 4. Integra el editor de progreso (ProgressEditor)
// 5. Actúa como puente entre UI (ProgressEditor) y lógica del padre
// 6. NO gestiona estado global → delega en el padre (ProjectDetailsPage)

// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react"
import { Project } from "../../classes/Project"
import { ProgressEditor } from "./ProgressEditor"

// Define qué recibe el componente
interface Props {
  // Datos a mostrar
  project: Project
  // Función que viene del padre (ProjectDetailsPage): onEdit={() => setEditingProject(project)} abre el modal
  onEdit: () => void
  // Función que viene del padre (ProjectDetailsPage): onUpdate={() => projectsManager.updateProject()} fuerza re-render
  onUpdate: () => void
  // 
  onProgressChange: (value: number) => void
}

// ======================================================
// RELACIÓN ENTRE COMPONENTES:
//
// ProgressEditor (hijo):
// → Captura input del usuario (slider)
// → Emite nuevo valor (onChange)
//
// ProjectInfoCard (este componente):
// → Recibe el nuevo valor
// → Actualiza el modelo (project.progress)
// → Notifica al padre (onUpdate)
//
// ProjectDetailsPage (padre):
// → Llama a projectsManager.updateProject()
// → Fuerza re-render con setRefresh()
// → React vuelve a pintar la UI
// ======================================================

// ======================================================
// COMPONENTE: ProjectInfoCard
// ======================================================
export function ProjectInfoCard({ project, onEdit, onUpdate, onProgressChange }: Props) {
  
  // ======================================================
  // RENDER
  // ======================================================
  return (
    // Tarjeta visual con la info de proyecto
    <div className="dashboard-card" style={{ padding: "30px 0" }}>
      
      {/* ENCABEZADO */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px 30px",
        marginBottom: 30
      }}>
        {/* Icono de proyecto con las inciiales */}
        {/* project.colour = color del proyecto */}
        <div className="project-details-icon" style={{ backgroundColor: project.colour }}>
          {/* Método de la clase Project */}
          {project.getInitials()}
        </div>

        <button 
          className="btn-secondary"
          // Cuando haces click en el botón "Edit" se ejecuta onEdit() que en el padre es setEditingProject(project) → Se abre el modal
          onClick={onEdit}
        >
          Edit
        </button>

      </div>

      {/* CONTENIDO */}
      <div style={{ padding: "0 30px" }}>

        {/* NOMBRE + DESCRIPCIÓN */}
        <div>
          <h5>{project.name}</h5>
          <p>{project.description}</p>
        </div>

        {/* PROPIEDADES */}
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
            {/* Convierte Date → string */}
            <p>{project.finishDate.toLocaleDateString("es-ES")}</p>
          </div>
        </div>

       {/* FLUJO DE ACTUALIZACIÓN DEL PROGRESO:
        1. Usuario mueve el slider en ProgressEditor
        2. ProgressEditor llama a onChange(newValue)
        3. ProjectInfoCard recibe newValue
        4. ProjectInfoCard actualiza el modelo:
          → project.progress = newValue / 100   (mutación directa)
        5. Se llama a onUpdate() (padre)
        6. ProjectDetailsPage:
          → projectsManager.updateProject()
          → setRefresh(...) fuerza re-render
        7. React re-renderiza
        8. UI se actualiza con el nuevo valor
        */}
        <ProgressEditor
          value={project.progress * 100}
          onChange={(newValue) => {
            onProgressChange(newValue / 100)
          }}
        />
        
      </div>
    </div>
  )
}