// RESPONSABILIDADES DEL COMPONENTE:
// TodoItem = componente PRESENTACIONAL de una tarea

// 1. Muestra los datos de un todo (descripción + fecha)
// 2. Aplica estilos dinámicos según el estado (status)
// 3. NO modifica datos
// 4. NO tiene estado propio
// 5. NO comunica eventos (solo visual)

// ✔ UI pura
// ✔ Sin lógica de negocio
// ✔ Depende completamente de props

// RELACIÓN ENTRE COMPONENTES:
// TodoList (padre):
// → recorre project.todos
// → renderiza un TodoItem por cada tarea

// TodoItem (este componente):
// → recibe un todo
// → lo muestra en pantalla

// Flujo:
// project.todos → TodoList → TodoItem → UI
// TodoList → pasa cada todo → TodoItem lo renderiza

// FLUJO COMPLETO (CON TODO EL SISTEMA)
// NewTodoModal → crea tarea
//         ↓
// TodoList → añade a project.todos
//         ↓
// ProjectDetailsPage → updateProject()
//         ↓
// React re-render
//         ↓
// TodoList.map()
//         ↓
// TodoItem → se pinta

// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react"

interface Todo {
  id?: string
  description: string
  status: string
  date: Date
}

interface Props {
  todo: Todo
}

// ======================================================
// COMPONENTE: TodoItem
// ======================================================
export function TodoItem({ todo }: Props) {

  // ======================================================
  // RENDER
  // ======================================================
  return (
    // todo.status.toLowerCase() convierte "In Progress" → "in-progress" y replace(" ", "-") convierte "in progress" → "in-progress"
    // Resultado final: className="todo-item in-progress"
    // ¿Para qué sirve esto? Para conectar con el CSS: (.todo-item.in-progress {background-color: #b45309;})
    // Aplica una clase dinámica según el estado del todo (pending, in-progress, completed)
    <div className={`todo-item ${todo.status.toLowerCase().replace(" ", "-")}`}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Muestra texto */}
        <p>{todo.description}</p>
        {/* Convierte Date → string */}
        {/* // Formatea la fecha para mostrarla de forma legible */}
        <p>{todo.date.toLocaleDateString()}</p>
      </div>
    </div>
  )
}