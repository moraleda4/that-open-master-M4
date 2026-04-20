// RESPONSABILIDADES DEL COMPONENTE:
// ProgressEditor = componente PRESENTACIONAL CONTROLADO

// 1. Representa visualmente el progreso (barra + porcentaje)
// 2. Permite modificar el valor mediante un input tipo range (slider)
// 3. NO tiene estado interno → recibe siempre el valor desde el padre
// 4. NO modifica el modelo de datos (Project)
// 5. Emite cambios hacia arriba mediante onChange(value)

// ✔ Componente controlado (controlled component)
// ✔ UI pura (sin lógica de negocio)
// ✔ Comunicación unidireccional: hijo → padre

// IMPORTANTE:
// Este componente NO guarda estado → depende completamente del padre.
// Si el padre no actualiza el valor → el slider NO se moverá.

// FUNCIONAMIENTO COMPLETO (flujo real):
// 1. Usuario mueve el slider
// 2. handleChange captura el valor del input (string → number)
// 3. Se ejecuta onChange(newValue)
// 4. ProjectInfoCard recibe el valor
// 5. ProjectInfoCard actualiza:
//    → project.progress = newValue / 100
// 6. ProjectInfoCard llama a onUpdate()
// 7. ProjectDetailsPage:
//    → projectsManager.updateProject()
//    → setRefresh(...) fuerza re-render
// 8. React re-renderiza
// 9. ProgressEditor recibe nuevo value actualizado
// 10. UI sincronizada

// ======================================================
// IMPORTACIONES
// ======================================================
import * as React from "react"

// Props = datos que el padre le pasa al hijo: ProjectInfoCard (padre) → le pasa value → ProgressEditor (hijo)
interface Props {
  // Número → ¿Qué representa value? → Es el estado que viene del padre (ProjectInfoCard.tsx): value={project.progress * 100}
  value: number 
  // Función que recibe un número → Es una función que viene del padre:
      //   onChange={(newValue) => {
      //   project.progress = newValue / 100
      //   onUpdate()
      // }}
    // Es decir: ProgressEditor NO guarda datos → le dice al padre: "oye, ha cambiado esto"
  onChange: (value: number) => void
}

// ======================================================
// COMPONENTE: ProgressEditor
// ======================================================
export function ProgressEditor({ value, onChange }: Props) {
  // Captura el valor del slider y lo envía al padre
  // e = evento del input (cuando mueves el slider) → React.ChangeEvent<HTMLInputElement> que significa evento que viene de un <input>
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.value: Lee el valor del input y devuelve siempre STRING. Ejemplo: "75"
    // Number("75"): convierte el STRING en NÚMERO
    const newValue = Number(e.target.value)
    // Llama a una función del PADRE: onChange (se envía al padre, no se guarda el valor aquí)
    onChange(newValue)
  }

  // ======================================================
  // RENDER
  // ======================================================
  // value controla completamente la UI:
  // - width de la barra
  // - texto del porcentaje
  // - posición del slider
  return (
    <div style={{ width: "100%" }}>
      {/* Barra de progreso (controlada por value) */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${value}%` }}
        />
        <div className="progress-label">
          {Math.round(value)}%
        </div>
      </div>

      {/* Slider controlado */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={handleChange}
        className="progress-slider"
      />
    </div>
  )
}