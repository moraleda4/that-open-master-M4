import * as React from "react"
import { Project } from "../../classes/Project"

interface Props {
  project: Project
  onChange?: () => void
}

export function ProgressEditor({ project, onChange }: Props) {

  const [value, setValue] = React.useState(project.progress * 100)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)

    setValue(newValue)
    project.progress = newValue / 100

    if (onChange) onChange()
  }

  return (
    <div style={{ width: "100%" }}>

        {/* CONTENEDOR COMÚN */}
        <div style={{ width: "100%" }}>

        {/* BARRA */}
        <div className="progress-container" style={{ position: "relative" }}>
            <div
            className="progress-bar"
            style={{
                width: `${value}%`,
                backgroundColor: "green"
            }}
            />

            <div className="progress-label">
            {value}%
            </div>
        </div>

        {/* SLIDER */}
        <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={handleChange}
            className="progress-slider"
        />

        </div>

    </div>
  )
}