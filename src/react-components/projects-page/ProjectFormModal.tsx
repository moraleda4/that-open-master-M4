// RESPONSABILIDADES DEL COMPONENTE:
// 1. Muestra un formulario (crear / editar)
// 2. Rellena datos si está en modo edición
// 3. Recoge datos del usuario
// 4. Construye un objeto IProject
// 5. Se lo devuelve al padre (onSubmit)
// 6. Abre/cierra el modal según estado externo (isOpen)

// En este archivo estamos creando un componente reutilizable (CREAR + EDITAR proyectos) → FORMULARIO REUTILIZABLE
// UI + recoger datos + enviarlos (no crea proyectos, no actualiza proyectos y no accede al manager)

// FUNCIONAMIENTO:
// PADRE (ProjectDetailsPage) → HIJO (ProjectFormModal) → isOpen → projectToEdit
// HIJO (ProjectFormModal) → PADRE (ProjectDetailsPage) → onSubmit(data) → onClose()
// ======================================================
// IMPORTACIONES
// ======================================================
// Importa React → necesario para hooks (useRef y useEffect) y JSX
import * as React from "react"
// Importa tipos de los datos del formulario
import { IProject, ProjectStatus, UserRole } from "../../classes/Project"

// Interfaz Props que define lo que recibe el componente:
// - onSubmit → función que el modal ejecuta al enviar el formulario → envía datos al padre
// - projectToEdit → define modo (null → crear vs objeto → editar)
// - isOpen → controla externo para la apertura del modal (boolean)
// - onClose → Función opcional para cerrar el modal desde el padre (notifica cierre al padre)
interface Props {
  // onSubmit → nombre de la prop, que es una función en este caso
  // (data: IProject) => void → Tipo de la función
  // Significado: onSubmit es una función que recibe un IProject y no devuelve nada (void)
  onSubmit: (data: IProject) => void
  projectToEdit?: IProject | null
  onClose?: () => void
  isOpen: boolean
}

// ======================================================
// COMPONENTE: ProjectFormModal
// ======================================================
export function ProjectFormModal({ onSubmit, projectToEdit, onClose, isOpen }: Props) {

  // Referencia directa al DOM → "Quiero acceder al <dialog> real"
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  // Hook que reacciona a cambios: "El padre (ProjectDetailsPage) controla cuándo abrir/cerrar el modal" → El modal NO decide abrirse solo, sino que es controlado externamente
  React.useEffect(() => {
    // Control de apertura/cierre del modal desde el estado del padre
    if (isOpen) {
      // Se abre el modal
      dialogRef.current?.showModal()
    } else {
      // Se cierra el modal
      dialogRef.current?.close()
    }
    // }, [isOpen]) = Se ejecuta cuando cambia isOpen
  }, [isOpen])

  // Función que se ejecuta al enviar el formulario
  // Construye el objeto IProject a partir del formulario y lo envía al componente padre
  // e es el evento del formulario → Es lo que React te da cuando haces <form onSubmit={handleSubmit}>
  const handleSubmit = (e: React.FormEvent) => {
    // Evita comportamiento por defecto (recarga) del form
    e.preventDefault()

    // Obtenter el formulario
    // e.target = formulario → Es el elemento que ha disparado el evento. En este caso <form onSubmit={handleSubmit}> → El evento viene del <form> → e.target === <form>
    const form = e.target as HTMLFormElement
    // Extrae automáticamente todos los inputs
    // FormData es una clase nativa de JavaScript. JavaScript recorre el <form> y hace algo equivalente a: "coge todos los inputs, textarea, select..." "y guarda sus valores"
    const formData = new FormData(form)

    // Puede ser string o null
    const rawDate = formData.get("finishDate") as string

    // Construcción del objeto final (datos rellenados por el usuario en el formulario)
    const data: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      // Convierte string → número
      cost: Number(formData.get("cost")) || 0,
      // ?. → acceso opcional
      // ?? → valor por defecto
      // Si estás editando → usa progreso actual / Si no → 0
      progress: projectToEdit?.progress ?? 0,
      // Si hay fecha → usarla
      // Si no → +6 meses
      finishDate: rawDate
        ? new Date(rawDate)
        : new Date(new Date().setMonth(new Date().getMonth() + 6))
    }

    // Envío al padre (ProjectDetailsPage) → El modal no guarda nada → SOLO envía datos
    onSubmit(data)
    // Limpia el formulario
    form.reset()
    // Cierra el modal visualmente → Pero el estado real lo controla el padre
    onClose?.()
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <dialog ref={dialogRef}>
      <form onSubmit={handleSubmit}>
        <h2>{projectToEdit ? "Edit Project" : "New Project"}</h2>

        <div className="input-list">

          {/* NAME */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">apartment</span>Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={projectToEdit?.name || ""}
              placeholder="What's the name of your project?"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">subject</span>Description
            </label>
            <textarea
              name="description"
              rows={5}
              defaultValue={projectToEdit?.description || ""}
              placeholder="Give your project a nice description!"
            />
          </div>

          {/* ROLE */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">person</span>Role
            </label>
            <select
              name="userRole"
              defaultValue={projectToEdit?.userRole || "Architect"}
            >
              <option>Architect</option>
              <option>Engineer</option>
              <option>Developer</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">not_listed_location</span>
              Status
            </label>
            <select
              name="status"
              defaultValue={projectToEdit?.status || "Pending"}
            >
              <option>Pending</option>
              <option>Active</option>
              <option>Finished</option>
            </select>
          </div>

          {/* DATE */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">calendar_month</span>
              Finish Date
            </label>
            <input
              name="finishDate"
              type="date"
              defaultValue={
                projectToEdit?.finishDate
                  ? projectToEdit.finishDate.toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          {/* COST */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">payments</span>
              Cost
            </label>
            <input
              name="cost"
              type="number"
              defaultValue={projectToEdit?.cost || 0}
            />
          </div>

          {/* BUTTONS */}
          <div
            style={{
                display: "flex",
                margin: "10px 0px 10px auto",
                columnGap: 10
            }}
            >
            <button
                type="button"
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  dialogRef.current?.close()
                  // Cierra el modal y notifica al padre para sincronizar estado
                  onClose?.()
                }}
            >
                Cancel
            </button>

            <button
                type="submit"
                style={{ backgroundColor: "rgb(18, 145, 18)" }}
            >
                Accept
            </button>
            </div>

        </div>
      </form>
    </dialog>
  )
}