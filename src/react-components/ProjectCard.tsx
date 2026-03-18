import * as React from 'react';

export function ProjectCard() {
  return (
    <div className="project-card">
      <div className="card-header">
        <p
          style={{
            backgroundColor: "#ca8134",
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1
          }}
        >
          HC
        </p>
        <div>
          <h5>Name</h5>
          <p>Description</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p style={{ color: "#969696" }}>Status</p>
          <p>Status</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Role</p>
          <p>Role</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Cost</p>
          <p>$1000</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Estimated Progress</p>
          <p>Done</p>
        </div>
      </div>
    </div>
  )
}