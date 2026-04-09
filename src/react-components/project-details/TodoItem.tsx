import * as React from "react"

export function TodoItem({ todo }: any) {
  return (
    <div className={`todo-item ${todo.status.toLowerCase().replace(" ", "-")}`}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <p>{todo.description}</p>
        <p>{todo.date.toLocaleDateString()}</p>
      </div>
    </div>
  )
}