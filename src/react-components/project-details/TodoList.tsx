// RESPONSABILIDADES DEL COMPONENTE:
// TodoList = componente de gestión de lista de tareas del proyecto

// 1. Muestra la lista de to-dos (UI)
// 2. Sincroniza el estado local con project.todos
// 3. Permite añadir nuevos to-dos (modal)
// 4. Coordina componentes hijos (TodoItem, NewTodoModal)
// 5. Actualiza el modelo (project) y notifica al padre (onUpdate)

// ✔ Tiene estado local (to-dos)
// ✔ Modifica el modelo (project.addTodo)
// ✔ Notifica cambios hacia arriba

// FLUJO COMPLETO:
// 1. Usuario crea tarea (modal)
// 2. NewTodoModal → onAdd(description)
// 3. handleAdd:
//    → project.addTodo()
//    → setTodos()
//    → onUpdate()
// 4. ProjectDetailsPage:
//    → updateProject()
//    → re-render

// RELACIÓN ENTRE COMPONENTES:

// NewTodoModal (hijo):
  // → recoge input del usuario
  // → llama a onAdd(description)

// TodoList (este componente):
  // → recibe description
  // → añade el todo al proyecto
  // → actualiza estado local
  // → notifica al padre (onUpdate)

// ProjectDetailsPage (padre):
  // → llama a projectsManager.updateProject()
  // → fuerza re-render global

// ======================================================
// IMPORTACIONES
// ======================================================
// Tengo que utilizar los hooks de React: useState, useEffect y useRef
import * as React from "react"
// Necesito acceder a project.todos y project.addTodo()
import { Project } from "../../classes/Project"
// Componente hijo → pinta cada tarea
import { TodoItem } from "./TodoItem"
// Componente hijo → crea nuevas tareas
import { NewTodoModal } from "./NewTodoModal"

// project → fuente de verdad (datos)
// onUpdate → función del padre para re-render global
// Esto conecta con ProjectDetailsPage.tsx
interface Props {
  project: Project
  onUpdate: () => void
}

// ======================================================
// COMPONENTE: TodoList
// ======================================================
export function TodoList({ project, onUpdate }: Props) {

  // Creamos una copia LOCAL de project.todos
  // IMPORTANTE:
    // project.todos = datos reales
    // todos = estado para renderizar
  const [todos, setTodos] = React.useState(project.todos)
  // SINCRONIZACIÓN: ¿Qué hace? Cuando cambie el project → actualiza los todos 
  // "Si el proyecto cambia, refresca la lista" → Esto evita UI desactualizada
  React.useEffect(() => {
    setTodos(project.todos)
  }, [project])
  // REF DEL MODAL: ¿Qué es esto? Referencia directa al <dialog> (DOM)
  const modalRef = React.useRef<HTMLDialogElement>(null)

  // Abrir modal: click → openModal → dialog.showModal()
  const openModal = () => {
    modalRef.current?.showModal()
  }

  // Esta función se ejecuta cuando el modal envía datos
  const handleAdd = (description: string) => {
    
    // Modifica el modelo
    project.addTodo(description)
    // Copia nueva → React detecta cambio
    setTodos([...project.todos])

    // Añade un nuevo todo al proyecto y sincroniza UI + estado global
    // CLAVE: forzar actualización global → Notificación al padre
    onUpdate()
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="dashboard-card" style={{ padding: 20 }}>

      {/* TÍTULO Y BOTÓN "+" */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <h4>To-Do</h4>

        {/* Botón para abrir el modal de creación de tareas */}
        <span
          className="material-icons-round"
          style={{ cursor: "pointer" }}
          onClick={openModal}
        >
          add
        </span>
      </div>

      {/* LISTA DE TO-DOs */}
      <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
        {/* Caso 1: No hay tareas → mensaje */}
        {todos.length === 0 ? (
          <p style={{ color: "#969696" }}>No To-Do items yet</p>
        ) : (
          // Caso 2: hay tareas → renderiza cada item
          todos.map((todo, index) => (
            // props: todo → datos
            <TodoItem key={todo.id || index} todo={todo} />
          ))
        )}
      </div>

      {/* MODAL */}
      {/* ref → control del modal
          onAdd → callback hacia este componente */}
      {/* FLUJO: NewTodoModal → onAdd(description)
             ↓
          TodoList → handleAdd() */}
      <NewTodoModal ref={modalRef} onAdd={handleAdd} />

    </div>
  )
}