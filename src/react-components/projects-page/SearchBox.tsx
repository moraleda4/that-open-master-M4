import * as React from 'react';

interface Props {
  onChange: (value: string) => void
  placeholder?: string
  width?: string
}

export function SearchBox(props: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", columnGap: 10, width: props.width ?? "100%" }}>
      <input
        onChange={(e) => {props.onChange(e.target.value)}}
        type="text"
        placeholder={props.placeholder ?? "Search..."}
        style={{
          width: "100%",
          height: "30px",
          padding: "5px 10px",
          backgroundColor: "var(--background-200)",
          borderRadius: "6px",
          border: "none",
          fontSize: "12px"
        }}
      />
    </div>
  )
}