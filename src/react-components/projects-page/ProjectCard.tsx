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
import { appIcons } from "../../globals"

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
        <bim-label
            style={{
              backgroundColor: props.project.colour,
              color: "white",
              fontSize: "1.1rem",
              width: 50,
              height: 50,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
        >
          {/* Iniciales generadas automáticamente a partir del nombre del proyecto. Ejemplo: "Hospital Central" → "HC" */}
          {props.project.getInitials()}
        </bim-label>
        <div>
          {/* Nombre principal del proyecto */}
          <bim-label style={{color:"white", fontSize: "1.2rem"}}>{props.project.name}</bim-label>
          {/* Resumen breve del proyecto */}
          <bim-label>{props.project.description}</bim-label>
        </div>
      </div>
      {/* Propiedades principales del proyecto */}
      <div className="card-content">
        {/* Estado actual del proyecto */}
        <div className="card-property">
          <bim-label icon={appIcons.STATUS} style={{ color: "#969696" }}>Status</bim-label>
          <bim-label style={{ color: "white"}}>{ props.project.status }</bim-label>
        </div>
        {/* Rol responsable del proyecto */}
        <div className="card-property">
          <bim-label icon={appIcons.ROLE} style={{ color: "#969696" }}>Role</bim-label>
          <bim-label style={{ color: "white"}}>{ props.project.userRole }</bim-label>
        </div>
        {/* Coste del proyecto */}
        <div className="card-property">
          <bim-label icon={appIcons.COST} style={{ color: "#969696" }}>Cost</bim-label>
          {/* Formatea el coste para mostrarlo de forma legible al usuario. Ejemplo: De 1000000 a 1,000,000.00 */}
          {/* El undefined significa: Usa la configuración regional del navegador del usuario */}
          <bim-label style={{ color: "white"}}>${props.project.cost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</bim-label>
        </div>
        {/* Progreso del proyecto */}
        <div className="card-property">
          <bim-label icon={appIcons.PROGRESS} style={{ color: "#969696" }}>Estimated Progress</bim-label>
          {/* Convierte el progreso interno (0 → 1) a porcentaje visible. Ejemplo: de 0.75 a 75% */}
          <bim-label style={{ color: "white"}}>{Math.round(props.project.progress*100)}%</bim-label>
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