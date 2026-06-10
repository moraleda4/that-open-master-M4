// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// ProjectCard es un componente presentacional.

// Responsabilidades:
// 1. Mostrar la información resumida de un proyecto.
// 2. Transformar un objeto Project en una tarjeta visual.
// 3. Mostrar propiedades clave del proyecto.
//
// IMPORTANTE:
// No tiene estado.
// No modifica datos.
// No accede a Firebase.
// No accede a ProjectsManager.
// No implementa lógica de negocio.

// Solo renderiza información.

// ======================================================
// IMPORTACIONES
// ======================================================
// React necesario para transformar JSX
import * as React from 'react';
// Clase + tipado de la clase Project
import { Project } from "../../classes/Project"

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// Recibe un único proyecto que será mostrado visualmente.

// Project es una clase que representa un "proyecto tipo"
// interface Props representa lo que recibe el componente ProjectCard
interface Props {
  project: Project
}

// ======================================================
// COMPONENTE: ProjectCard (función + props)
// ======================================================
// ProjectCard → Componente funcional que recibe props.project (objeto completo del proyecto)
// props = datos que recibe el componente
// Este componente recibe un único dato (un Project) → Y lo transforma en UI (tarjeta visual)
  // Transformación: Project → Tarjeta visual (JSX)
export function ProjectCard(props: Props) {
  // ======================================================
  // ESTRUCTURA VISUAL
  // ======================================================
  // card-header
  // ↓
  // iniciales + nombre + descripción
  
  // card-content
  // ↓
  // status
  // role
  // cost
  // progress

  return (
    <div className="project-card">
      {/* Cabecera de la tarjeta. Muestra la identidad visual del proyecto. */}
      <div className="card-header">
        <p
          style={{
            // Color visual asociado al proyecto.
            backgroundColor: props.project.colour,
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1
          }}
        >
          {/* Iniciales generadas automáticamente a partir del nombre del proyecto. Ejemplo: "Hospital Central" → "HC" */}
          {props.project.getInitials()}
        </p>
        <div>
          {/* Nombre principal del proyecto */}
          <h5>{ props.project.name }</h5>
          {/* Resumen breve del proyecto */}
          <p>{ props.project.description }</p>
        </div>
      </div>
      {/* Propiedades principales del proyecto */}
      <div className="card-content">
        {/* Estado actual del proyecto */}
        <div className="card-property">
          <p style={{ color: "#969696" }}>Status</p>
          <p>{ props.project.status }</p>
        </div>
        {/* Rol responsable del proyecto */}
        <div className="card-property">
          <p style={{ color: "#969696" }}>Role</p>
          <p>{ props.project.userRole }</p>
        </div>
        {/* Coste del proyecto */}
        <div className="card-property">
          <p style={{ color: "#969696" }}>Cost</p>
          {/* Formatea el coste para mostrarlo de forma legible al usuario. Ejemplo: De 1000000 a 1,000,000.00 */}
          {/* El undefined significa: Usa la configuración regional del navegador del usuario */}
          <p>${props.project.cost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
        </div>
        {/* Progreso del proyecto */}
        <div className="card-property">
          <p style={{ color: "#969696" }}>Estimated Progress</p>
          {/* Convierte el progreso interno (0 → 1) a porcentaje visible. Ejemplo: de 0.75 a 75% */}
          <p>{Math.round(props.project.progress*100)}%</p>
        </div>
      </div>
    </div>
  )
}

// FLUJO:
// Project
// ↓
// ProjectCard
// ↓
// JSX
// ↓
// Tarjeta visual

// Este componente nunca modifica el proyecto que recibe.