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
import { TodoStatus, TodoPriority } from "../../classes/Project"
import { ITodo } from "../../classes/Project"

interface Todo {
  id?: string
  description: string
  status: TodoStatus
  priority: TodoPriority
  date: Date
}

interface Props {
  todo: ITodo
  // Añadir esto para luego pasarlo a TodoList.tsx
  onClick?: () => void
}

// ======================================================
// COMPONENTE: TodoItem
// ======================================================
export function TodoItem({ todo, onClick }: Props) {

  // ======================================================
  // COLORES DINÁMICOS
  // ======================================================
  const getBackgroundColor = () => {
    if (todo.priority === "High") {
      if (todo.status === "Completed") return "#14532d"   // verde oscuro
      if (todo.status === "In Progress") return "#7c2d12" // naranja oscuro
      return "#7f1d1d" // rojo oscuro (Pending)
    }

    if (todo.priority === "Medium") {
      if (todo.status === "Completed") return "#166534"
      if (todo.status === "In Progress") return "#b45309"
      return "#92400e"
    }

    // Low priority
    if (todo.status === "Completed") return "#15803d"
    if (todo.status === "In Progress") return "#1d4ed8"
    return "#374151"
  }

  // ======================================================
  // RENDER
  // ======================================================
  return (
    // todo.status.toLowerCase() convierte "In Progress" → "in-progress" y replace(" ", "-") convierte "in progress" → "in-progress"
    // Resultado final: className="todo-item in-progress"
    // ¿Para qué sirve esto? Para conectar con el CSS: (.todo-item.in-progress {background-color: #b45309;})
    // Aplica una clase dinámica según el estado del todo (pending, in-progress, completed)
     <div 
        className="todo-item"
        onClick={onClick}
        style={{
          backgroundColor: getBackgroundColor(),
          display: "grid",
          gridTemplateColumns: "1fr 180px 120px",
          alignItems: "center",
          padding: "15px 20px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >

        {/* COLUMNA 1 → NOMBRE */}
        <p style={{ fontWeight: 600 }}>
          {todo.description}
        </p>

        {/* COLUMNA 2 → STATUS + PRIORITY */}
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <p>Status: {todo.status}</p>
          <p>Priority: {todo.priority}</p>
        </div>

        {/* COLUMNA 3 → FECHA */}
        <p style={{ fontSize: 12, textAlign: "right" }}>
          {todo.date.toLocaleDateString()}
        </p>

    </div>
  )
}