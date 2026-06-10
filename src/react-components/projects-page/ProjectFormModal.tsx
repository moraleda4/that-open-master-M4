// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// Modal reutilizable para:
  // - crear proyectos
  // - editar proyectos

// Responsabilidades:
// 1. Mostrar el formulario (crear / editar)
// 2. Mostrar datos existentes en modo edición
// 3. Recoger los datos introducidos por el usuario
// 4. Construir un objeto IProject
// 5. Devolver los datos al componente padre (onSubmit)
// 6. Abrir y cerrar el diálogo según el estado recibido (isOpen)

// IMPORTANTE: Este componente NO:
  // - crea proyectos
  // - actualiza proyectos
  // - accede a Firebase
  // - accede a ProjectsManager
// Solo gestiona la interfaz y los datos del formulario.

// ======================================================
// COMUNICACIÓN PADRE ↔ HIJO
// ======================================================
// PADRE (ProjectDetailsPage) → HIJO (ProjectFormModal) → isOpen → projectToEdit
// HIJO (ProjectFormModal) → PADRE (ProjectDetailsPage) → onSubmit(data) → onClose()

// ======================================================
// IMPORTACIONES
// ======================================================
// Importa biblioteca principal de React → necesario para JSX y hooks: useRef() y useEffect()
import * as React from "react"
// Importa tipos de los datos utilizados por el formulario
  // IProject → estructura de datos generada al enviar el formulario
  // ProjectStatus y UserRole → tipos cerrados utilizados por los selectores del formulario
import { IProject, ProjectStatus, UserRole } from "../../classes/Project"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// Define toda la información que el componente necesita para funcionar.

// Interfaz Props que define lo que recibe el componente:
  // - onSubmit → función ejecutada cuando el usuario encía el formulario → envía datos al padre
    // Recibe un objeto IProject construido a partir de los campos introducidos por el usuario

  // - projectToEdit → Determina el modo de funcionamiento: null → modo creación vs IProject → modo edición)
    // Si existe, sus datos se utilizan para rellenar el formulario.

  // - onClose → Función opcional para cerrar el modal desde el padre (notifica cierre al padre)
    // Callback opcional ejecutado cuando el usuario cierra el modal. Permite sincronizar el estado del padre con el diálogo/modal.
  
  // - isOpen → control externo para la apertura del modal (boolean)
    // true → modal abierto
    // false → modal cerrado
    // La decisión se toma fuera de este componente.
interface Props {
  // onSubmit → nombre de la prop, que es una función en este caso
  // (data: IProject) => void → Tipo de la función
  // Significado: onSubmit es una función que recibe un IProject y no devuelve nada (void)
  onSubmit: (data: IProject) => void
  projectToEdit?: IProject | null
  onClose?: () => void
  isOpen: boolean
}

// IMPORTANTE: ProjectFormModal es un componente CONTROLADO EXTERNAMENTE. No decide por sí mismo:
  // - cuándo abrirse
  // - cuándo cerrarse
  // - qué proyecto editar
// Toda esa información la recibe mediante props.
// Resumen: ProjectFormModal es un formulario reutilizable controlado por un componente padre. Recibe datos mediante props y devuelve datos mediante callbacks.

// ======================================================
// COMPONENTE: ProjectFormModal
// ======================================================
// Desestructuración de props. Equivale a:
  // const onSubmit = props.onSubmit
  // const projectToEdit = props.projectToEdit
  // const onClose = props.onClose
  // const isOpen = props.isOpen
export function ProjectFormModal({ onSubmit, projectToEdit, onClose, isOpen }: Props) {

  // Referencia persistente al elemento <dialog> real del DOM. Permite utilizar métodos nativos: dialog.showModal() y dialog.close() sin depender de React State.
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  // ======================================================
  // SINCRONIZACIÓN DEL MODAL
  // ======================================================
  // Mantiene sincronizado:
    // Estado React (isOpen)
    // ↓
    // Elemento DOM (<dialog>)

  // Si el padre cambia isOpen, este efecto abre o cierra visualmente el diálogo.

  // Hook que reacciona a cambios: "El padre (ProjectDetailsPage) controla cuándo abrir/cerrar el modal" → El modal NO decide abrirse solo, sino que es controlado externamente
  React.useEffect(() => {
    // Control de apertura/cierre del modal desde el estado del padre
    if (isOpen) {
      // Método nativo de HTMLDialogElement. Abre el diálogo en modo modal.
      dialogRef.current?.showModal()
    } else {
      // Método nativo de HTMLDialogElement. Cierra el diálogo
      dialogRef.current?.close()
    }
    // }, [isOpen]) = Se ejecuta cuando cambia isOpen, es decir, no se ejecuta en cada render, sino solo cuando cambia isOpen
  }, [isOpen])

  // ======================================================
  // ENVÍO DEL FORMULARIO
  // ======================================================
  // Función que se ejecuta al enviar el formulario. Se ejecuta cuando el usuario pulsa el botón Save / Create.
  
  // Responsabilidades:
  // 1. Leer el formulario.
  // 2. Construir un IProject.
  // 3. Enviar los datos al padre.
  // 4. Limpiar el formulario.
  // 5. Solicitar el cierre del modal.

  // e es el evento del formulario → Es lo que React te da cuando haces <form onSubmit={handleSubmit}>
  const handleSubmit = (e: React.FormEvent) => {
    // Evita comportamiento por defecto (recarga) del form
    e.preventDefault()

    // Obtenter el formulario
    // e.target = formulario → Es el elemento que ha disparado el evento. En este caso <form onSubmit={handleSubmit}> → El evento viene del <form> → e.target === <form>
    const form = e.target as HTMLFormElement
    // Extrae automáticamente todos los inputs
    // FormData es una clase nativa de JavaScript. JavaScript recorre el <form> y hace algo equivalente a: "coge todos los inputs, textarea, select..." "y guarda sus valores"
    // Permite acceder a los campos usando el atributo "name". Ejemplo:
      // formData.get("name")
      // formData.get("description")
    const formData = new FormData(form)

    // Fecha obtenida desde el input. Todavía es texto. Ejemplo: "2026-12-31"
    // Puede ser string o null
    const rawDate = formData.get("finishDate") as string

    // ======================================================
    // CONSTRUCCIÓN DEL OBJETO IProject
    // ======================================================
    // Se transforman los valores del formulario en un objeto compatible con el modelo de la aplicación.

    // Construcción del objeto final (datos rellenados por el usuario en el formulario)
    const data: IProject = {
      // Obtiene el valor del input name="name"
      name: formData.get("name") as string,
      // Obtiene el valor del input description="description"
      description: formData.get("description") as string,
      // Convierte el valor seleccionado al tipo ProjectStatus.
      status: formData.get("status") as ProjectStatus,
       // Convierte el valor seleccionado al tipo UserRoles.
      userRole: formData.get("userRole") as UserRole,
      //  cost: (() => {: Función autoejecutable. Se utiliza para transformar el texto introducido por el usuario en un número válido.
      // Convierte string → número
      cost: (() => {
        // Valor original introducido en el formulario. Ejemplos: "1.000" o "1.500,25"
        const rawCost = (formData.get("cost") as string) || "0"

        // Number(...) convierte el texto final en número.
        return Number(
          rawCost
            // Elimina todos los separadores de miles. De "1.500.000" a "1500000"
            .replace(/\./g, "")
            // Convierte la coma decimal al formato esperado por JavaScript. De "1500,25" a "1500.25"
            .replace(",", ".")
        ) || 0
      })(),
      // ?. → acceso opcional
      // ?? → valor por defecto
      // Si estás editando → usa progreso actual / Si no → 0
      progress: projectToEdit?.progress ?? 0,
      // Convierte la fecha introducida por el usuario: "2026-06-01" en Date
        // Si hay fecha → usarla
        // Si no → se genera automáticamente una fecha 6 meses posterior a la fecha actual.
      finishDate: rawDate
        ? new Date(rawDate)
        : new Date(new Date().setMonth(new Date().getMonth() + 6))
    }

    // Comunicación HIJO → PADRE. El modal entrega los datos, pero NO los guarda.
    // Envío al padre (ProjectDetailsPage) → El modal no guarda nada → SOLO envía datos
    onSubmit(data)
    // Limpia el formulario. Restablece todos los campos del formulario a sus valores iniciales
    form.reset()
    // Solicita al componente padre que cierre el modal. El cierre real depende del estado controlado externamente (isOpen).
    // Cierra el modal visualmente → Pero el estado real lo controla el padre
    onClose?.()
  }

  // FLUJO COMPLETO:
  // Usuario
  // ↓
  // Formulario HTML
  // ↓
  // FormData
  // ↓
  // IProject
  // ↓
  // onSubmit(data)
  // ↓
  // Componente padre
  // ↓
  // ProjectsManager
  // ↓
  // Firebase

  // ======================================================
  // RENDER DEL FORMULARIO
  // ======================================================
  // El formulario funciona en dos modos:
    // CREAR
    // ↓
    // projectToEdit = null
    // ↓
    // campos vacíos
  
    // EDITAR
    // ↓
    // projectToEdit contiene datos
    // ↓
    // campos precargados
  return (
    // Elemento HTML nativo utilizado como ventana modal. Se controla mediante dialogRef y el estado isOpen.
    <dialog ref={dialogRef}>
      <form
        // Fuerza a React a reconstruir completamente el formulario cuando cambia el proyecto editado. Sin esta key:
          // Proyecto A
          //   ↓
          //   Proyecto B
        // podría seguir mostrando valores antiguos.
        key={projectToEdit ? (projectToEdit as any).id : "new-project"}
        onSubmit={handleSubmit}
      >
        {/* Título dinámico según el modo de funcionamiento. */}
        <h2>{projectToEdit ? "Edit Project" : "New Project"}</h2>

        <div className="input-list">

          {/* ==================================================
              DATOS BÁSICOS DEL PROYECTO
              ================================================== */}
          {/* NAME */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">apartment</span>Name
            </label>
            <input
              name="name"
              type="text"
              // Si estamos editando: muestra el nombre actual. Si estamos creando: comienza vacío.
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
              // Precarga la descripción cuando existe un proyecto en edición.
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
              // Valor actual del proyecto o valor por defecto para nuevos proyectos.
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
              // Estado actual o valor inicial.
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
                  // Convierte Date al formato esperado por el input type="date". Ejemplo: Date a "2026-05-01"
                  ? projectToEdit.finishDate.toISOString().split("T")[0]
                  : ""
              }
            />
          </div>
          
          {/* ==================================================
              COSTE DEL PROYECTO
              ================================================== */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">payments</span>
              Cost
            </label>
            <input
              name="cost"
              type="text"
              defaultValue={
                projectToEdit
                  // Formatea el número utilizando formato español: de 1000000 a 1.000.000
                  ? projectToEdit.cost.toLocaleString("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    })
                  : "0"
              }
              placeholder="0"

              // ==================================================
              // VALIDACIÓN DE TECLADO
              // ==================================================
              // Permite:
                // - números
                // - coma decimal
                // - teclas de navegación
              // Bloquea:
                // - letras
                // - símbolos
                // - punto (.)

              onKeyDown={(e) => {

                // Bloquear punto
                // El punto se reserva para el separador de miles, que se aplicará automáticamente al formatear el número.
                if (e.key === ".") {
                  e.preventDefault()
                  return
                }

                // Teclas necesarias para editar cómodamente el campo. Permitir:
                  // números
                  // coma
                  // teclas de control
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab"
                ]

                // Comprueba si la tecla pulsada es un dígito numérico.
                const isNumber = /^[0-9]$/.test(e.key)
                const isComma = e.key === ","
                const isAllowedControl = allowedKeys.includes(e.key)

                // Bloquear cualquier otra cosa
                if (!isNumber && !isComma && !isAllowedControl) {
                  e.preventDefault()
                }
              }}
            />
          </div>

          {/* ==================================================
              ACCIONES DEL FORMULARIO
              ================================================== */}
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
                  // Cierra visualmente el diálogo
                  dialogRef.current?.close()
                  // Notifica al componente padre para sincronizar el estado React
                  onClose?.()
                }}
            >
                Cancel
            </button>

            <button
                // Dispara el evento submit del formulario.
                  // handleSubmit()
                  // ↓
                  // construcción IProject
                  // ↓
                  // onSubmit(data)
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

// FLUJO COMPLETO:
  // Usuario
  // ↓
  // Rellena formulario
  // ↓
  // handleSubmit()
  // ↓
  // Construcción IProject
  // ↓
  // onSubmit(data)
  // ↓
  // Componente padre
  
  // CREAR:
  // ProjectsPage
  
  // EDITAR:
  // ProjectDetailsPage
  // ↓
  // ProjectsManager
  // ↓
  // Firebase