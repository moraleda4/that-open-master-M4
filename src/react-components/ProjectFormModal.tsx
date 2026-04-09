import * as React from "react"
import { IProject, ProjectStatus, UserRole } from "../classes/Project"

interface Props {
  onSubmit: (data: IProject) => void
  projectToEdit?: IProject | null
}

export function ProjectFormModal({ onSubmit, projectToEdit }: Props) {

  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    if (projectToEdit) {
      dialogRef.current?.showModal()
    }
  }, [projectToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const rawDate = formData.get("finishDate") as string

    const data: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      cost: Number(formData.get("cost")) || 0,
      progress: projectToEdit?.progress ?? 0,
      finishDate: rawDate
        ? new Date(rawDate)
        : new Date(new Date().setMonth(new Date().getMonth() + 6))
    }

    onSubmit(data)
    form.reset()
    dialogRef.current?.close()
  }

  return (
    <dialog ref={dialogRef}>
      <form onSubmit={handleSubmit}>
        <h2>{projectToEdit ? "Edit Project" : "New Project"}</h2>

        <div className="input-list">

          {/* NAME */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">apartment</span>Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={projectToEdit?.name || ""}
              placeholder="What's the name of your project?"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">subject</span>Description
            </label>
            <textarea
              name="description"
              rows={5}
              defaultValue={projectToEdit?.description || ""}
              placeholder="Give your project a nice description!"
            />
          </div>

          {/* ROLE */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">person</span>Role
            </label>
            <select
              name="userRole"
              defaultValue={projectToEdit?.userRole || "Architect"}
            >
              <option>Architect</option>
              <option>Engineer</option>
              <option>Developer</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">not_listed_location</span>
              Status
            </label>
            <select
              name="status"
              defaultValue={projectToEdit?.status || "Pending"}
            >
              <option>Pending</option>
              <option>Active</option>
              <option>Finished</option>
            </select>
          </div>

          {/* DATE */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">calendar_month</span>
              Finish Date
            </label>
            <input
              name="finishDate"
              type="date"
              defaultValue={
                projectToEdit?.finishDate
                  ? projectToEdit.finishDate.toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          {/* COST */}
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">payments</span>
              Cost
            </label>
            <input
              name="cost"
              type="number"
              defaultValue={projectToEdit?.cost || 0}
            />
          </div>

          {/* BUTTONS */}
          <div
            style={{
                display: "flex",
                margin: "10px 0px 10px auto",
                columnGap: 10
            }}
            >
            <button
                type="button"
                style={{ backgroundColor: "transparent" }}
                onClick={() => dialogRef.current?.close()}
            >
                Cancel
            </button>

            <button
                type="submit"
                style={{ backgroundColor: "rgb(18, 145, 18)" }}
            >
                Accept
            </button>
            </div>

        </div>
      </form>
    </dialog>
  )
}