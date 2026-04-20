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
// → project.addTodo()
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
  // Props del componente → recibe: onAdd(text)
  { onAdd: (text: string) => void }
  // Función del componente
  // Aquí cambia la cosa. Normalmente (props) => {}, pero ahora (props, ref) => {}
  // ¿Qué es ref? Referencia al <dialog> desde el padre, es decir, viene de <NewTodoModal ref={modalRef} /> del archivo "TodoList.tsx"
>((props, ref) => {

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Evita recarga de la página por defecto
    e.preventDefault()

    // Obtener formulario: e.currentTarget es el <form>
    const form = e.currentTarget
    // Leer datos: extrae todos los inputs
    const data = new FormData(form)
    // Obtener texto del input
    const text = data.get("text") as string

    // Validación para evitar valores vacíos
    if (!text) return

    // Esto hace: NewTodoModal → llama a TodoList
    props.onAdd(text)

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
        <form onSubmit={onSubmit}>
          <h2>New To-Do</h2>

          <div className="input-list">

            <div className="form-field-container">
              <label>Task</label>
              <input
                // Clave para: data.get("text")
                name="text"
                placeholder="Write your task..."
                required
              />
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
                onClick={() => (ref as any).current?.close()}
              >
                Cancel
              </button>

              {/* BOTÓN "ADD": dispara onSubmit */}
              <button
                type="submit"
                style={{ backgroundColor: "rgb(18, 145, 18)" }}
              >
                Add
              </button>

            </div>

          </div>
        </form>
      </dialog>
    )
})