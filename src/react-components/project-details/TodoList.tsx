import * as React from "react"
import { Project } from "../../classes/Project"
import { TodoItem } from "./TodoItem"
import { NewTodoModal } from "./NewTodoModal"

interface Props {
  project: Project
  onUpdate: () => void
}

export function TodoList({ project, onUpdate }: Props) {

  const [todos, setTodos] = React.useState(project.todos)
  React.useEffect(() => {
    setTodos(project.todos)
  }, [project])
  const modalRef = React.useRef<HTMLDialogElement>(null)

  const openModal = () => {
    modalRef.current?.showModal()
  }

  const handleAdd = (description: string) => {
   
    project.addTodo(description)
    setTodos([...project.todos])

    // CLAVE: forzar actualización global
    onUpdate()
  }

  return (
    <div className="dashboard-card" style={{ padding: 20 }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <h4>To-Do</h4>

        <span
          className="material-icons-round"
          style={{ cursor: "pointer" }}
          onClick={openModal}
        >
          add
        </span>
      </div>

      {/* LISTA */}
      <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
        {todos.length === 0 ? (
          <p style={{ color: "#969696" }}>No To-Do items yet</p>
        ) : (
          todos.map((todo, index) => (
            <TodoItem key={todo.id || index} todo={todo} />
          ))
        )}
      </div>

      {/* MODAL */}
      <NewTodoModal ref={modalRef} onAdd={handleAdd} />

    </div>
  )
}