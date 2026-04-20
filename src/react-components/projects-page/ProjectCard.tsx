// El archivo ProjectCard.tsx:
// 1. SOLO muestra datos (UI)
// 2. NO tiene lógica
// 3. NO tiene estado
// 4. NO modifica nada

// ======================================================
// IMPORTACIONES
// ======================================================
// Necesario para JSX
import * as React from 'react';
// Clase + tipado de la clase Project
import { Project } from "../../classes/Project"

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
export function ProjectCard(props: Props) {
  return (
    <div className="project-card">
      <div className="card-header">
        <p
          style={{
            backgroundColor: props.project.colour,
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1
          }}
        >
          {props.project.getInitials()}
        </p>
        <div>
          <h5>{ props.project.name }</h5>
          <p>{ props.project.description }</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p style={{ color: "#969696" }}>Status</p>
          <p>{ props.project.status }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Role</p>
          <p>{ props.project.userRole }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Cost</p>
          <p>${ props.project.cost }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Estimated Progress</p>
          <p>{Math.round(props.project.progress*100)}%</p>
        </div>
      </div>
    </div>
  )
}