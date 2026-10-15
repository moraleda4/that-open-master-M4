// ======================================================
// RESPONSABILIDADES DEL COMPONENTE
// ======================================================
// SearchBox es un componente reutilizable para búsqueda por texto.

// Responsabilidades:
// 1. Mostrar un campo de búsqueda.
// 2. Capturar el texto introducido.
// 3. Notificar cambios al componente padre.
//
// IMPORTANTE:
// No realiza búsquedas.
// No filtra datos.
// No tiene lógica de negocio.

// Solo recoge texto y lo envía mediante un callback.

// React necesario para JSX.
import * as React from 'react';

// ======================================================
// PROPS DEL COMPONENTE
// ======================================================
// onChange
// ↓
// función ejecutada cuando cambia el contenido del input

// placeholder
// ↓
// texto mostrado cuando el campo está vacío

// width
// ↓
// ancho visual del componente

interface Props {
  // Callback ejecutado cada vez que el usuario modifica el texto. Recibe el contenido actual del campo de búsqueda.
  onChange: (value: string) => void
  // Texto de ayuda mostrado cuando el input está vacío. Prop opcional
  placeholder?: string
  // Ancho del componente. Ejemplos: "300px", "100%" y "50vw". Prop opcional
  width?: string
}

// ======================================================
// COMPONENTE: SearchBox
// ======================================================
// Componente controlado por eventos.

// Captura texto del usuario y lo comunica al padre.

export function SearchBox(props: Props) {
  return (
    // Contenedor visual del buscador
    // width: props.width ?? "100%" → Si el padre proporciona un ancho, se utiliza. Si no: width = "100%"
    <div style={{ display: "flex", alignItems: "center", columnGap: 10, width: props.width ?? "100%" }}>
      {/* Campo de entrada de texto */}
      <bim-text-input
        // Cada pulsación del usuario:
          // input
          // ↓
          // e.target.value: Texto actual contenido dentro del input.
          // ↓
          // props.onChange(...)
          debounce="200"
        oninput={(e) => {props.onChange(e.target.value)}}
        // Placeholder personalizado. Si no se proporciona: "Search..."
        placeholder={props.placeholder ?? "Search..."}
      ></bim-text-input>
    </div>
  )
}

// FLUJO:
  // Usuario escribe
  // ↓
  // onChange
  // ↓
  // SearchBox
  // ↓
  // props.onChange(value)
  // ↓
  // Componente padre
  // ↓
  // Filtrado de datos
  
  // SearchBox nunca realiza la búsqueda directamente.