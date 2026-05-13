// RESPONSABILIDADES DEL COMPONENTE:
// NewTodoModal = formulario modal para crear nuevas tareas

// 1. Muestra un formulario dentro de un <dialog>
// 2. Captura el input del usuario (texto del to-do)
// 3. Valida datos básicos (no vacío)
// 4. Envía el dato al padre mediante onAdd(text)
// 5. Controla apertura/cierre mediante ref (NO estado)

// ✔ No tiene estado propio
// ✔ No conoce el modelo (Project)
// ✔ Solo emite datos hacia arriba
// ✔ Controlado externamente mediante ref

// FLUJO COMPLETO:
// Usuario escribe → submit
// → onAdd(text)
// → TodoList.handleAdd()

// → onUpdate()
// → React re-renderiza

// RELACIÓN ENTRE COMPONENTES:
// TodoList (padre):
// → controla el modal mediante ref
// → define handleAdd()

// NewTodoModal (este componente):
// → recoge input del usuario
// → llama a onAdd(text)

// ======================================================
// IMPORTACIONES
// ======================================================
// ¿Qué es forwardRef? Permite que el padre haga esto: modalRef.current?.showModal() aunque el <dialog> esté dentro de este componente
// "Le doy acceso al padre al DOM interno del componente"
import React, { forwardRef } from "react"

// ======================================================
// COMPONENTE: NewTodoModal
// ======================================================
export const NewTodoModal = forwardRef<
  // HTMLDialogElement: Tipo del elemento al que apunta el ref, que es un <dialog>
  HTMLDialogElement,
  // Props del componente → recibe: onAdd(description, status y priority)
  {
  onAdd: (todo: {
      description: string
      status: "Pending" | "In Progress" | "Completed"
      priority: "Low" | "Medium" | "High"
    }) => void
    todoToEdit?: any
    onClose?: () => void
  }
  // Función del componente
  // Aquí cambia la cosa. Normalmente (props) => {}, pero ahora (props, ref) => {}
  // ¿Qué es ref? Referencia al <dialog> desde el padre, es decir, viene de <NewTodoModal ref={modalRef} /> del archivo "TodoList.tsx"
>((props, ref) => {

  const isEditing = !!props.todoToEdit

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Evita recarga de la página por defecto
    e.preventDefault()

    // Obtener formulario: e.currentTarget es el <form>
    const form = e.currentTarget
    // Leer datos: extrae todos los inputs
    const data = new FormData(form)
    // Obtener la descripción, el status y la prioridad del to-do item
    const description = data.get("text") as string
    const status = data.get("status") as any
    const priority = data.get("priority") as any

    // Validación para evitar valores vacíos
    if (!description) return

    // Esto hace: NewTodoModal → llama a TodoList
    props.onAdd({
      description,
      status,
      priority
    })

    // Limpia inputs del formulario
    form.reset()
    // Cierra el modal accediendo directamente al <dialog> vía ref
    // Uso (ref as any), porque TypeScript no sabe bien el tipo
    ;(ref as any).current?.close()
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
      // Conecta el DOM con el ref
      <dialog ref={ref}>
        {/* conecta lógica */}
        <form key={props.todoToEdit?.id || "new"} onSubmit={onSubmit}>
          <h2>{isEditing ? "Edit To-Do" : "New To-Do"}</h2>

          <div className="input-list">

            {/* DESCRIPTION */}
            <div className="form-field-container">
              <label>Task</label>
              <input
                // Clave para: data.get("text")
                name="text"
                defaultValue={props.todoToEdit?.description || ""}
                placeholder="Write your task..."
                required
              />
            </div>

            {/* STATUS */}
            <div className="form-field-container">
              <label>Status</label>
              <select
                name="status"
                defaultValue={props.todoToEdit?.status || "Pending"}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div className="form-field-container">
              <label>Priority</label>
              <select
                name="priority"
                defaultValue={props.todoToEdit?.priority || "Medium"}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            
            <div style={{
              display: "flex",
              margin: "10px 0px 10px auto",
              columnGap: 10
            }}>
              
              {/* BOTÓN "CANCEL": cierra modal directamente */}
              <button
                type="button"
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  (ref as any).current?.close()
                  props.onClose?.() 
                }}
              >
                Cancel
              </button>

              {/* BOTÓN "ADD": dispara onSubmit */}
              <button
                type="submit"
                style={{ backgroundColor: "rgb(18, 145, 18)" }}
              >
                {isEditing ? "Save" : "Add"}
              </button>

            </div>

          </div>
        </form>
      </dialog>
    )
})