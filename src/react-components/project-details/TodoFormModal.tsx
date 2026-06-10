// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// TodoFormModal = formulario modal reutilizable para crear y editar tareas.

// 1. Muestra un formulario dentro de un <dialog>
// 2. Captura el input del usuario, es decir, los datos de la tarea: descripción, estado y prioridad
// 3. Valida datos básicos
// 4. Devuelve los datos al componente padre mediante onAdd().
// 5. Controla apertura/cierre mediante ref (NO estado)

// ✔ No tiene estado propio
// ✔ No conoce el modelo (Project)
// ✔ Solo emite datos hacia arriba
// ✔ Controlado externamente mediante ref

// FLUJO COMPLETO:
// Usuario rellena el formulario
// ↓
// Submit
// ↓
// onSubmit()
// ↓
// FormData
// ↓
// props.onAdd(todo)
// ↓
// TodoList (padre)
// ↓
// Actualización del proyecto
// ↓
// React re-renderiza

// RELACIÓN ENTRE COMPONENTES:
// TodoList (padre):
// → controla el modal mediante ref
// → define handleAdd()

// TodoFormModal (este componente):
// → recoge input del usuario
// → llama a onAdd(text)

// ======================================================
// IMPORTACIONES
// ======================================================
// React → librería principal.
// forwardRef → permite exponer una referencia interna (<dialog>) al componente padre. Gracias a esto, TodoList puede hacer:
  // modalRef.current?.showModal()
  // modalRef.current?.close()
// aunque el <dialog> esté dentro de TodoFormModal.
// En ProjectFormModal se ha hecho diferentes, con el estado React isOpen={true}
import React, { forwardRef } from "react"
import { ITodo } from "../../classes/Project"

// 2 FORMAS DE HACER LO MISMO:
// ProjectFormModal:                           TodoFormModal:

  // ProjectDetailsPage                        TodoList
  // ↓                                         ↓
  // editingProject                            modalRef.current?.showModal()
  // ↓                                         ↓
  // isOpen={!!editingProject}                 TodoFormModal
  // ↓                                         ↓
  // ProjectFormModal                          dialog
  // ↓
  // useEffect()
  // ↓
  // dialog.showModal()

// ======================================================
// COMPONENTE: TodoFormModal
// ======================================================
export const TodoFormModal = forwardRef<
  // 1ºparámetro genérico: ¿A qué elemento apunta el ref? A HTMLDialogElement, es decir, modalRef.current será de tipo HTMLDialogElement
  // HTMLDialogElement: Tipo del elemento al que apunta el ref, que es un <dialog>
  // Por eso luego puedo hacer modalRef.current?.showModal() o modalRef.current?.close()
  HTMLDialogElement,
  // 2ºparámetro genérico: representa las props del componente → recibe: onAdd(description, status y priority), todoToEdit? y onClose?
  {
  // TodoFormModal
  // ↓
  // devuelve un objeto todo
  // ↓
  // el padre decide qué hacer con él
  onAdd: (todo: {
      description: string
      status: "Pending" | "In Progress" | "Completed"
      priority: "Low" | "Medium" | "High"
    }) => void
    // Sirve para distinguir MODO CREAR vs MODO EDITAR
      // todoToEdit === undefined → Crear tarea
      // todoToEdit = {...} → Editar tarea
    todoToEdit?: ITodo | null
    // Para cerrar el modal (opcional, puede existir o no)
    onClose?: () => void
  }
  // Función del componente
  // Aquí cambia la cosa. Normalmente (props) => {}, pero ahora (props, ref) => {}
  // ¿Qué es ref? Referencia al <dialog> desde el padre, es decir, viene de <TodoFormModal ref={modalRef} /> del archivo "TodoList.tsx"
  // props
  // ↓
  // datos del componente

  // ref
  // ↓
  // referencia al dialog
>((props, ref) => {

  // !! convierte cualquier valor a boolean
    // ¿Existe una tarea?
    // ↓
    // Sí → editar
    // No → crear
  const isEditing = !!props.todoToEdit

  // Es el manejador del formulario. Se ejecuta cuando el usuario pulsa Add
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

    // Comunicación hijo → padre. Esto hace: TodoFormModal → llama a TodoList
      // TodoFormModal
      // ↓
      // "He recogido los datos"
      // ↓
      // TodoList
      // ↓
      // "haz lo que quieras con ellos"
    props.onAdd({
      description,
      status,
      priority
    })

    // Limpia inputs del formulario
    form.reset()
    // Cierra el modal accediendo directamente al <dialog> vía ref
    // Uso (ref as any), porque TypeScript no sabe bien el tipo
      // ref
      // ↓
      // dialog
      // ↓
      // close()
    // Esto equivake conceptualmente a modalRef.current?.close()
    ;(ref as any).current?.close()
  }

  // TodoFormModal recoge datos del formulario y los devuelve al componente padre; nunca crea ni modifica tareas directamente.

  // ======================================================
  // RENDER
  // ======================================================
  return (
      // Es el modal real del navegador. Conecta el <dialog> con la referencia que viene desde TodoList.
      // Por eso desde el padre puedes hacer: modalRef.current?.showModal() o modalRef.current?.close()
          // TodoList
          // ↓
          // modalRef
          // ↓
          // TodoFormModal
          // ↓
          // dialog
      <dialog ref={ref}>
        {/* conecta lógica */}
        {/* onSubmit={onSubmit}: Cuando el usuario pulse Add se ejecutará const onSubmit = (...) que hemos analizado antes */}
        {/* key={props.todoToEdit?.id || "new"}  */}
        {/* Imagina que editas tarea A
            ↓
            Cierras
            ↓
            Editas tarea B */}
        {/* React podría reutilizar el mismo formulario. Y algunos valores podrían quedarse "enganchados". */}
        {/* Solución: Cuando cambia props.todoToEdit?.id también cambia key y React dice:
              Es otro formulario distinto
              ↓
              Lo reconstruyo desde cero
        */}
        <form key={props.todoToEdit?.id || "new"} onSubmit={onSubmit}>
          {/* Título dinámico
              isEditing === true → Edit To-Do
              isEditing === false → New To-Do
          */}
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
              
              {/* Usuario
                  ↓
                  Cancel
                  ↓
                  TodoFormModal
                  ↓
                  close()
                  ↓
                  onClose()
                  ↓
                  TodoList */}

              {/* BOTÓN "ADD": dispara onSubmit */}
              <button
                type="submit"
                style={{ backgroundColor: "rgb(18, 145, 18)" }}
              >
                {/* Modo crear: Add / Modo editar: Save */}
                {isEditing ? "Save" : "Add"}
              </button>

            </div>

          </div>
        </form>
      </dialog>
    )
})

// FLUJO COMPLETO RENDER:
// TodoList
// ↓
// abre modal mediante ref.showModal()
// ↓
// TodoFormModal
// ↓
// rellena formulario

// Modo crear:
  // título = New To-Do
  // botón = Add

// Modo editar:
  // título = Edit To-Do
  // botón = Save
  // campos precargados

// ↓
// Usuario envía
// ↓
// onSubmit()
// ↓
// props.onAdd(...)
// ↓
// TodoList actualiza project.todos
// ↓
// ProjectsManager.updateProject()
// ↓
// React re-renderiza
// ↓
// TodoItem muestra la nueva tarea