// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// TodoItem = componente PRESENTACIONAL de una tarea

// 1. Muestra los datos de un todo (descripción + fecha)
// 2. Aplica estilos dinámicos según el estado (status)
// 3. NO modifica datos
// 4. NO tiene estado propio.
// 5. Puede emitir un evento de click al padre.
// 6. No contiene lógica de negocio.

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
// TodoFormModal → crea tarea
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
// Tipos utilizados para tipar tareas
import { TodoStatus, TodoPriority } from "../../classes/Project"
// Interfaz principal de una tarea
import { ITodo } from "../../classes/Project"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// todo
// ↓
// tarea que se mostrará

// onClick
// ↓
// callback opcional ejecutado al pulsar sobre la tarea
interface Props {
  todo: ITodo
  // Callback opcional utilizado para notificar al componente padre que el usuario ha seleccionado esta tarea.
  onClick?: () => void
}

// ======================================================
// COMPONENTE: TodoItem
// ======================================================
export function TodoItem({ todo, onClick }: Props) {

  // ======================================================
  // ESTILO DINÁMICO SEGÚN PRIORIDAD Y ESTADO
  // ======================================================
  // Determina el color de fondo de la tarea. Combina: priority + status para generar una representación visual.
  const getBackgroundColor = () => {
    // Prioridad alta: colores más intensos para destacar.
    if (todo.priority === "High") {
      if (todo.status === "Completed") return "#14532d"   // verde oscuro
      if (todo.status === "In Progress") return "#7c2d12" // naranja oscuro
      return "#7f1d1d" // rojo oscuro (Pending)
    }

    // Prioridad media: colores intermedios.
    if (todo.priority === "Medium") {
      if (todo.status === "Completed") return "#166534"
      if (todo.status === "In Progress") return "#b45309"
      return "#92400e"
    }

    // Prioridad baja: colores más suaves.
    if (todo.status === "Completed") return "#15803d"
    if (todo.status === "In Progress") return "#1d4ed8"
    return "#374151"
  }

  // ======================================================
  // RENDER
  // ======================================================
  // Transformación:
    // ITodo
    // ↓
    // TodoItem
    // ↓
    // Tarjeta visual
  return (
     <div 
        className="todo-item"
        // onClick: Si el padre proporciona un callback, se ejecutará al pulsar la tarea. TodoItem no decide qué hacer
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

        {/* COLUMNA 1 → Descripción principal de la tarea: NOMBRE */}
        <p style={{ fontWeight: 600 }}>
          {todo.description}
        </p>

        {/* COLUMNA 2 → Estado actual y prioridad: STATUS + PRIORITY */}
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <p>Status: {todo.status}</p>
          <p>Priority: {todo.priority}</p>
        </div>

        {/* COLUMNA 3 → Fecha formateada para el usuario: FECHA */}
        <p style={{ fontSize: 12, textAlign: "right" }}>
          {/* Convierte el objeto Date en una fecha legible. Ejemplo: de 2025-09-01T00:00:00Z a 01/09/2025 */}
          {todo.date.toLocaleDateString()}
        </p>

    </div>
  )
}

// FLUJO:
  // project.todos
  // ↓
  // TodoList
  // ↓
  // TodoItem
  // ↓
  // UI
  
  // Usuario hace click
  // ↓
  // onClick()
  // ↓
  // TodoList
  
  // TodoItem nunca modifica directamente una tarea.