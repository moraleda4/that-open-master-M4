// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// TodoList = componente de gestión de lista de tareas del proyecto

// 1. Muestra la lista de to-dos (UI)
// 2. Mantiene un estado local para renderizar y filtrar tareas.
// 3. Permite añadir nuevos to-dos (modal)
// 4. Coordina componentes hijos (TodoItem, TodoFormModal)
// 5. Actualiza el modelo (project) y notifica al padre (onUpdate)

// ✔ Tiene estado local (to-dos)
// ✔ Notifica cambios hacia arriba

// FLUJO COMPLETO:
// Usuario crea o edita una tarea
// ↓
// TodoFormModal
// ↓
// onAdd(todo)
// ↓
// handleAdd()
// ↓
// project.todos
// ↓
// Firebase
// ↓
// setTodos()
// ↓
// onUpdate()
// ↓
// React re-renderiza

// RELACIÓN ENTRE COMPONENTES:

// TodoFormModal (hijo):
  // → recoge input del usuario
  // → llama a onAdd(todo)

// TodoList (este componente):
  // → recibe todo
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

import { Project, TodoStatus, TodoPriority } from "../../classes/Project"
// Importo ProjectsManager
import { ProjectsManager } from "../../classes/ProjectsManager"
// Componente hijo → pinta cada tarea
import { TodoItem } from "./TodoItem"
// Componente hijo → crea nuevas tareas
import { TodoFormModal } from "./TodoFormModal"
// Importo el searchbox
import { SearchBox } from "../projects-page/SearchBox"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// project → fuente de verdad (datos)
// onUpdate → función del padre para re-render global
// Esto conecta con ProjectDetailsPage.tsx
interface Props {
  project: Project
  onUpdate: () => void
  projectsManager: ProjectsManager
}

// ======================================================
// COMPONENTE: TodoList
// ======================================================
export function TodoList({ project, onUpdate, projectsManager }: Props) {

  // Estado local utilizado para:
    // - renderizar la lista
    // - aplicar filtros de búsqueda

  // La fuente de verdad sigue siendo: project.todos
  // Este estado es una copia utilizada por React.

  // Creamos una copia LOCAL de project.todos
  // IMPORTANTE:
    // project.todos = datos reales
    // todos = estado para renderizar
  const [todos, setTodos] = React.useState(project.todos)

  // Necesario para implementar el searchbox de to-do items
  const [searchValue, setSearchValue] = React.useState("")

  // Necesario para modificar los to-do items
  // Guarda el ID de la tarea que se está editando.
      // null
      // ↓
      // modo creación
      
      // string
      // ↓
      // modo edición
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null)
  // Busca la tarea actualmente seleccionada.
    // editingTodoId
    // ↓
    // búsqueda en project.todos
    // ↓
    // objeto tarea o null

  // Este valor se envía al modal para precargar los campos.
  const editingTodo = project.todos.find(t => t.id === editingTodoId) || null

  // SINCRONIZACIÓN: ¿Qué hace? Cuando cambie el project → actualiza los todos 
  // "Si el proyecto cambia, refresca la lista" → Esto evita UI desactualizada
  // Si cambia el proyecto recibido por props, actualizamos el estado local. Evita mostrar tareas antiguas cuando React recibe otro proyecto.
  React.useEffect(() => {
    setTodos([...project.todos])
  }, [project])
  // REF DEL MODAL: ¿Qué es esto? Referencia directa al <dialog> (DOM)
  // Referencia directa al <dialog>. Permite abrir y cerrar el modal: modalRef.current?.showModal() y modalRef.current?.close() sin necesidad de usar estado React.
  const modalRef = React.useRef<HTMLDialogElement>(null)

  // Abrir modal: click → openModal → dialog.showModal()
  // Modo CREAR: elimina cualquier tarea en edición y abre el formulario vacío.
  const openModal = () => {
    // Esto es lo que realmente activa el modo creación.
    setEditingTodoId(null)
    modalRef.current?.showModal()
  }

  // Cuando existe una tarea seleccionada para editar:
    // editingTodo
    // ↓
    // abre automáticamente el modal
// Esto permite:
  // click en TodoItem
  // ↓
  // setEditingTodoId()
  // ↓
  // modal de edición
  React.useEffect(() => {
    if (editingTodo) {
      modalRef.current?.showModal()
    }
  }, [editingTodo])

  // ======================================================
  // CREAR O EDITAR UNA TAREA
  // ======================================================
  // Esta función se ejecuta cuando el modal envía datos
  const handleAdd = async (todo: {
    description: string
    status: TodoStatus
    priority: TodoPriority
  }) => {
    
    // 1. Actualizar en memoria (CREATE o UPDATE)
      // editingTodo existe
      // ↓
      // estamos editando
      
      // editingTodo es null
      // ↓
      // estamos creando
    if (editingTodo) {
      // EDITAR
      const index = project.todos.findIndex(t => t.id === editingTodoId)

      if (index !== -1) {
        project.todos[index] = {
          ...project.todos[index],
          ...todo
        }
      }

    } else {
      // CREAR
      project.todos = [
        ...project.todos,
        {
          id: crypto.randomUUID(),
          ...todo,
          date: new Date()
        }
      ]
    }

    // 2. Guardar en Firebase
    // Persistencia. Guarda el proyecto completo, incluyendo la lista actualizada de tareas.
    await projectsManager.updateProjectInFirebase(project)

    // 3. Actualizar UI
    // Copia nueva → React detecta cambio 
    // Nueva referencia de array.React detecta el cambio y actualiza la lista visual.
    setTodos([...project.todos])

    // 4. Notificar al padre
    // Añade un nuevo todo al proyecto y sincroniza UI + estado global
    // CLAVE: forzar actualización global → Notificación al padre
    onUpdate()
    setEditingTodoId(null)
  }

  // Lista de to-do items filtrada
  // Lista filtrada según el texto introducido en el SearchBox. El filtrado es insensible a mayúsculas y minúsculas.
  const filteredTodos = todos.filter(todo =>
    todo.description.toLowerCase().includes(searchValue.toLowerCase())
  )

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="dashboard-card" style={{ padding: 20 }}>

      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 10,
        marginBottom: 20
      }}>

        {/* COLUMNA 1 → TÍTULO */}
        <h4 style={{ whiteSpace: "nowrap" }}>To-Do</h4>

        {/* COLUMNA 2 → SEARCH */}
        <SearchBox
          onChange={(value) => setSearchValue(value)}
          placeholder="Search tasks..."
        />

        {/* COLUMNA 3 → BOTÓN + */}
        <span
          className="material-icons-round"
          style={{ cursor: "pointer", justifySelf: "end" }}
          // Abre el formulario en modo CREAR
          onClick={openModal}
        >
          add
        </span>

      </div>

      {/* LISTA DE TO-DOs */}
      <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
        {/* Caso 1: No hay tareas → mensaje */}
        {filteredTodos.length === 0 ? (
          <p style={{ color: "#969696" }}>No To-Do items yet</p>
        ) : (
          // Caso 2: hay tareas → renderiza cada item
          filteredTodos.map((todo, index) => (
            <TodoItem
              key={todo.id || index}
              todo={todo}
              // Selecciona la tarea. Esto activa:
                // editingTodoId
                // ↓
                // editingTodo
                // ↓
                // useEffect
                // ↓
                // apertura del modal
              onClick={() => {
                setEditingTodoId(todo.id)
              }}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      {/* ref → control del modal
          onAdd → callback hacia este componente */}
      {/* FLUJO: TodoFormModal → onAdd(description)
             ↓
          TodoList → handleAdd() */}
      {/* TodoFormModal

          CREAR:
            editingTodo = null

          EDITAR:
            editingTodo = objeto tarea

          El modal decide automáticamente qué modo utilizar.
      */}
      <TodoFormModal
        ref={modalRef}
        onAdd={handleAdd}
        todoToEdit={editingTodo}
        onClose={() => setEditingTodoId(null)}
      />

    </div>
  )
}