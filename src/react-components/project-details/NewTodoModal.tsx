import React, { forwardRef } from "react"

export const NewTodoModal = forwardRef<
  HTMLDialogElement,
  { onAdd: (text: string) => void }
>((props, ref) => {

 const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const form = e.currentTarget
  const data = new FormData(form)
  const text = data.get("text") as string

  if (!text) return

  props.onAdd(text)

  form.reset()
  ;(ref as any).current?.close()
}

  return (
      <dialog ref={ref}>
        <form onSubmit={onSubmit}>
          <h2>New To-Do</h2>

          <div className="input-list">

            <div className="form-field-container">
              <label>Task</label>
              <input
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
              
              {/* CANCEL */}
              <button
                type="button"
                style={{ backgroundColor: "transparent" }}
                onClick={() => (ref as any).current?.close()}
              >
                Cancel
              </button>

              {/* ADD */}
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