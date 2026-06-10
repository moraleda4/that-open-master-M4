// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// ProgressEditor = componente PRESENTACIONAL CONTROLADO

// 1. Representa visualmente el progreso (barra + porcentaje)
// 2. Permite modificar el valor mediante un input tipo range (slider)
// 3. NO tiene estado interno → recibe siempre el valor desde el padre
// 4. NO modifica el modelo de datos (Project)
// 5. Emite cambios hacia arriba mediante onChange(value)

// ✔ Componente controlado (controlled component)
// ✔ UI pura (sin lógica de negocio)
// ✔ Comunicación unidireccional React: hijo ( onChange(value) ) → padre (value)
  // Padre
  // ↓ props
  // Hijo

  // Hijo
  // ↓ eventos
  // Padre

// IMPORTANTE:
// Este componente NO guarda estado → depende completamente del padre.
// Si el padre no actualiza el valor → el slider NO se moverá.

// FUNCIONAMIENTO COMPLETO (flujo real):
// 1. Usuario mueve slider
// 2. handleChange obtiene valor
// 3. onChange(newValue)
// 4. ProjectInfoCard convierte:
//    newValue / 100
// 5. ProjectDetailsPage actualiza:
//    project.progress
// 6. Firebase guarda
// 7. ProjectsManager.updateProject()
// 8. React re-renderiza
// 9. ProgressEditor recibe nuevo value

// ======================================================
// IMPORTACIONES
// ======================================================
// React necesario para JSX y para React.ChangeEvent
import * as React from "react"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// value
// ↓
// porcentaje actual del progreso

// onChange
// ↓
// callback ejecutado cuando el usuario mueve el slider


// Props = datos que el padre le pasa al hijo: ProjectInfoCard (padre) → le pasa value → ProgressEditor (hijo)
interface Props {
  // Número → ¿Qué representa value? → Es el estado que viene del padre (ProjectInfoCard.tsx): value={project.progress * 100}
  // Valor actual del progreso expresado en % (0 - 100).
  value: number 
  // Función proporcionada por el padre.
  //
  // ProgressEditor no guarda el valor.
  //
  // Cuando cambia el slider:
  //
  // ProgressEditor
  // ↓
  // onChange(nuevoValor)
  // ↓
  // Padre


  // Función que recibe un número → Es una función que viene del padre:
      //   onChange={(newValue) => {
        //   project.progress = newValue / 100
        //   onUpdate()
      // }}
    // Es decir: ProgressEditor NO guarda el valor → le dice al padre: "oye, ha cambiado esto mediante onChange(nuevoValor)"
  onChange: (value: number) => void
}

// ======================================================
// COMPONENTE: ProgressEditor
// ======================================================
export function ProgressEditor({ value, onChange }: Props) {
  // Captura el valor del slider y lo envía al padre
  // e = evento generado por el input cuando el usuario mueve el slider.
  // React.ChangeEvent<HTMLInputElement> significa evento que viene de un <input>
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.value: lee el valor del input y devuelve siempre STRING. Aunque el slider sea numérico, HTML siempre devuelve strings:
      // Slider = 75
      // ↓
      // e.target.value
      // ↓
      // "75"
      // Number("75"): convierte el STRING en NÚMERO
    const newValue = Number(e.target.value)
    // IMPORTANTE: Este componente NO actualiza la UI. Solo avisa al padre. Será el padre quien decida:
      // - actualizar el modelo
      // - guardar en Firebase
      // - provocar un re-render
    onChange(newValue)
  }

  // ======================================================
  // RENDER
  // ======================================================
  // value controla completamente:
    // width de la barra
    // ↓
    // % visible
    // ↓
    // posición del slider
    
    // Si value cambia, toda la UI se actualiza.

  return (
    <div style={{ width: "100%" }}>
      {/* Barra de progreso (controlada por value) */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            // Limita el valor entre 0 y 100. Ejemplos: -20 → 0, 50 → 50, 150 → 100
            width: `${Math.min(Math.max(value, 0), 100)}%`
          }}
        />
        <div className="progress-label">
          {/* Redondea el % para evitar decimales innecesarios */}
          {Math.round(value)}%
        </div>
      </div>

      {/* Slider controlado. value viene del padre. Si el padre no actualiza value, el slider permanecerá inmóvil */}
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

// FLUJO COMPLETO:
  // value
  // ↓
  // ProgressEditor
  // ↓
  // Usuario mueve slider
  // ↓
  // handleChange()
  // ↓
  // onChange(newValue)
  // ↓
  // Padre
  // ↓
  // Actualización del modelo
  // ↓
  // React re-renderiza
  // ↓
  // Nuevo value
  // ↓
  // ProgressEditor

  // ProgressEditor NO tiene estado. El valor real vive fuera. ProgressEditor solo muestra value y emite onChange().