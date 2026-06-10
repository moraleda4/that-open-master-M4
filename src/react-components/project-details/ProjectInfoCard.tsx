// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// ProjectInfoCard es un componente principalmente presentacional, pero con capacidad de emitir eventos.

// Responsabilidades:
// 1. Mostrar la información principal del proyecto (nombre, estado, coste, rol, fecha…)
// 2. Mostrar elementos visuales asociados al proyecto (icono con iniciales y color)
// 3. Permitir solicitar la edición del proyecto (botón Edit)
// 4. Integrar el componente ProgressEditor.
// 5. Notificar cambios de progreso al componente padre. Actúa como puente entre UI (ProgressEditor) y lógica del padre
// NO gestiona estado global → delega en el padre (ProjectDetailsPage)

// IMPORTANTE:
  // No modifica directamente el proyecto.
  // No accede a Firebase.
  // No accede a ProjectsManager.
  // No mantiene estado global.
// Solo muestra datos y emite eventos.

// ======================================================
// IMPORTACIONES
// ======================================================
// React necesario para JSX
import * as React from "react"
// Modelo de proyecto utilizado para tipar las props
import { Project } from "../../classes/Project"
// Componente encargado de editar visualmente el progreso
import { ProgressEditor } from "./ProgressEditor"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// project
// ↓
// Proyecto cuyos datos se mostrarán.

// onEdit
// ↓
// Callback ejecutado al pulsar el botón Edit.

// onProgressChange
// ↓
// Callback ejecutado cuando cambia el valor del ProgressEditor.

// Define qué recibe el componente
interface Props {
  // Datos a mostrar
  project: Project
  // Función que viene del padre (ProjectDetailsPage): onEdit={() => setEditingProject(project)} abre el modal
  onEdit: () => void
  // Función proporcionada por el padre. Se ejecuta cuando el usuario modifica el progreso mediante el slider.
  onProgressChange: (value: number) => void
}

// ======================================================
// FLUJO DE ACTUALIZACIÓN DEL PROGRESO:
  // Usuario mueve el slider
  // ↓
  // ProgressEditor (hijo): Captura input del usuario (slider) y emite nuevo valor (onChange)
  // ↓
  // onChange(value)
  // ↓
  // ProjectInfoCard
  // ↓
  // onProgressChange(value)
  // ↓
  // ProjectDetailsPage (padre)
  // ↓
  // project.progress = value
  // ↓
  // updateProjectInFirebase()
  // ↓
  // ProjectsManager.updateProject()
  // ↓
  // ProjectsManager dispara onProjectUpdated()
  // ↓
  // React re-renderiza

// ======================================================
// COMPONENTE: ProjectInfoCard
// ======================================================
export function ProjectInfoCard({ project, onEdit, onProgressChange }: Props) {
  
  // ======================================================
  // RENDER
  // ======================================================
  // Transformación:
  // Project
  // ↓
  // ProjectInfoCard
  // ↓
  // JSX
  // ↓
  // Tarjeta visual interactiva
  
  // Este componente no modifica el proyecto. Solo muestra información y emite eventos.

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
        {/* Identidad visual del proyecto.
              project.colour
              ↓
              color asociado al proyecto

              project.getInitials()
              ↓
              iniciales calculadas a partir del nombre
        */}
        <div className="project-details-icon" style={{ backgroundColor: project.colour }}>
          {/* Método de Project que genera automáticamente las iniciales. Ejemplo: "Hospital Central" → "HC" */}
          {project.getInitials()}
        </div>
        
        {/* Cuando haces click en Edit:
              ProjectInfoCard
              ↓
              onEdit()
              ↓
              ProjectDetailsPage
              ↓
              setEditingProject(project)
              ↓
              ProjectFormModal se abre */}
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
        {/* Información descriptiva principal del proyecto */}
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
            {/* Formatea el coste para mostrarlo de forma legible al usuario */}
            <p>${project.cost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
          </div>

          <div>
            <p style={{ color: "#969696" }}>Role</p>
            <p>{project.userRole}</p>
          </div>

          <div>
            <p style={{ color: "#969696" }}>Finish Date</p>
            {/* Convierte el objeto Date en una fecha legible para el usuario. Ejemplo: Date(...) → 15/09/2025 */}
            <p>{project.finishDate.toLocaleDateString("es-ES")}</p>
          </div>
        </div>

       {/* FLUJO DE ACTUALIZACIÓN DEL PROGRESO:
          1. Usuario mueve el slider
          2. ProgressEditor (hijo) emite el nuevo porcentaje mediante onChange(newValue)
          3. ProjectInfoCard reenvía el valor al padre mediante onProgressChange(newValue)
          4. ProjectDetailsPage (padre) actualiza:
            → project.progress
            → Firebase: updateProjectInFirebase()
            → ProjectsManager: ProjectsManager.updateProject()
          5. ProjectsManager dispara onProjectUpdated()
          6. React re-renderiza la UI
          7. ProgressEditor recibe el nuevo value actualizado
      */}
        <ProgressEditor
          // Internamente el progreso se guarda entre 0 y 1. Ejemplos: 0.25 → 25, 0.75 → 75, 1.00 → 100. El slider trabaja en porcentaje
          value={project.progress * 100}
          // El slider devuelve porcentajes: 25, 50, 75, 100. El modelo Project trabaja con valores entre 0 y 1. Por eso: 75 → 0.75
          onChange={(newValue) => {
            onProgressChange(newValue / 100)
          }}
        />
        
      </div>
    </div>
  )
}