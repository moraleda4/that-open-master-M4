import * as React from "react";

export function ProjectsPage () {
    return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
    {/* Generamos un id para referenciar el elemento dialog */}
    <dialog id="new-project-modal">
        {/* Generamos un id para referenciar el formulario */}
        <form id="new-project-form">
        <h2>New Project</h2>
        <div className="input-list">
            <div className="form-field-container">
            <label>
                <span className="material-icons-round">apartment</span>Name
            </label>
            <input
                name="name"
                type="text"
                placeholder="What's the name of your project?"
            />
            <p
                style={{
                color: "gray",
                fontSize: "var(--font-sm)",
                marginTop: 5,
                fontStyle: "italic"
                }}
            >
                TIP: Give it a short name
            </p>
            </div>
            <div className="form-field-container">
            <label>
                <span className="material-icons-round">subject</span>Description
            </label>
            <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description! So people is jealous about it."
                defaultValue={""}
            />
            </div>
            <div className="form-field-container">
            <label>
                <span className="material-icons-round">person</span>Role
            </label>
            <select name="userRole">
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
            </select>
            </div>
            <div className="form-field-container">
            <label>
                <span className="material-icons-round">not_listed_location</span>
                Status
            </label>
            <select name="status">
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
            </select>
            </div>
            <div className="form-field-container">
            <label>
                <span className="material-icons-round">payments</span>
                Cost
            </label>
            <input name="cost" type="number" min={0} placeholder="Project cost" />
            </div>
            <div className="form-field-container">
            <label htmlFor="finishDate">
                <span className="material-icons-round">calendar_month</span>
                Finish Date
            </label>
            <input name="finishDate" type="date" />
            </div>
            <div
            style={{
                display: "flex",
                margin: "10px 0px 10px auto",
                columnGap: 10
            }}
            >
            {/* El tipo de botón de Cancel es "button" y el tipo de botón Accept es "submit" */}
            {/* Añadimos un ID al botón Cancel para poder referenciarlo en Javascript */}
            <button
                id="cancel-project-btn"
                type="button"
                style={{ backgroundColor: "transparent" }}
            >
                Cancel
            </button>
            <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
                Accept
            </button>
            </div>
        </div>
        </form>
    </dialog>
    <header>
        <h2>Projects</h2>
        {/* Para dar estilo a los botones de exportación/importación y de "Nuevo proyecto" */}
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
        {/* Creo un ID para que al clicar en el botón de subida de archivos se pueda importar un JSON con una lista de proyectos */}
        <span
            id="import-projects-btn"
            className="material-icons-round action-icon"
        >
            file_upload
        </span>
        {/* Creo un ID para que al clicar en el botón de descarga se pueda descargar la lista de los proyectos */}
        <span
            id="export-projects-btn"
            className="material-icons-round action-icon"
        >
            file_download
        </span>
        {/* Creo un ID para el botón de creación de nuevo proyecto para poder referenciarlo en Javascript */}
        <button id="new-project-btn">
            <span className="material-icons-round">add</span>New Project
        </button>
        </div>
    </header>
    {/* Creo un ID para el contenedor de la lista de proyectos para luego referenciarlo en Javascript y poder insertar dinámicamente nuevos proyectos */}
    {/* Los proyectos insertados ya en el HTML son "hardcodeados", es decir, son solo mockups iniciales */}
    {/* Por este motivo, se borran todas las tarjetas de proyecto, para que se creen directamente desde el formulario */}
    <div id="projects-list" />
    </div>
    )
}