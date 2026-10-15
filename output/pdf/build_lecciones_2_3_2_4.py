from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, HRFlowable
)

OUT = "output/pdf/resumen-lecciones-2-3-2-4.pdf"

NAVY = colors.HexColor("#16345C")
BLUE = colors.HexColor("#2F75B5")
GREEN = colors.HexColor("#3E8E5B")
ORANGE = colors.HexColor("#D97928")
PURPLE = colors.HexColor("#7650A8")
LIGHT = colors.HexColor("#F4F7FB")
MID = colors.HexColor("#DCE6F2")
TEXT = colors.HexColor("#263238")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="TitleCustom", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=24, leading=29, textColor=NAVY, alignment=TA_CENTER,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="SubtitleCustom", parent=styles["Normal"], fontName="Helvetica",
    fontSize=11, leading=15, textColor=colors.HexColor("#52606D"),
    alignment=TA_CENTER, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1Custom", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=17, leading=21, textColor=NAVY, spaceBefore=12, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H2Custom", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12.5, leading=16, textColor=BLUE, spaceBefore=8, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.5, leading=13.5, textColor=TEXT, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallCustom", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.3, leading=11, textColor=TEXT, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="CodeCustom", parent=styles["Code"], fontName="Courier",
    fontSize=8.2, leading=10.5, textColor=colors.HexColor("#203040"),
    backColor=colors.HexColor("#EEF3F8"), borderColor=MID,
    borderWidth=0.5, borderPadding=6, spaceBefore=3, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="WhiteHead", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10, leading=12, textColor=colors.white, alignment=TA_LEFT,
))

def P(text, style="BodyCustom"):
    return Paragraph(text, styles[style])

def code(text):
    return Paragraph(text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>"), styles["CodeCustom"])

def bullet(text):
    return Paragraph("&#8226; " + text, styles["BodyCustom"])

def section(title, color=BLUE):
    return [Spacer(1, 4), Paragraph(title, styles["H1Custom"]), HRFlowable(width="100%", thickness=1.2, color=color, spaceAfter=8)]

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(MID)
    canvas.line(1.7*cm, 1.35*cm, A4[0]-1.7*cm, 1.35*cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#68737D"))
    canvas.drawString(1.7*cm, 0.85*cm, "BIM App - resumen de las lecciones 2.3 y 2.4")
    canvas.drawRightString(A4[0]-1.7*cm, 0.85*cm, f"Pagina {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(
    OUT, pagesize=A4, rightMargin=1.7*cm, leftMargin=1.7*cm,
    topMargin=1.55*cm, bottomMargin=1.7*cm,
    title="Resumen lecciones 2.3 y 2.4 - BIM App",
    author="Codex",
)

story = []
story += [Spacer(1, 0.8*cm), P("Resumen de las lecciones 2.3 y 2.4", "TitleCustom"),
          P("La cuadricula base del visor y la cuadricula de componentes BIM", "SubtitleCustom")]

intro = Table([[P("IDEA CENTRAL", "WhiteHead"), P("React proporciona el punto de montaje; That Open UI organiza la interfaz BIM mediante grids, templates, estados y layouts.", "BodyCustom")]], colWidths=[3.3*cm, 13.0*cm])
intro.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), NAVY), ("BACKGROUND", (1,0), (1,0), LIGHT),
    ("BOX", (0,0), (-1,-1), 0.7, MID), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
    ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9),
]))
story += [intro, Spacer(1, 12)]

story += section("1. Leccion 2.3 - cuadricula base del visor", BLUE)
story += [P("La leccion 2.3 crea el primer <b>bim-grid</b> en <b>ProjectDetailsPage</b>. Ese grid es la estructura general de la pagina BIM; todavia no es el motor 3D ni el modelo."),
          P("El visor necesita mas que un canvas: debe reservar zonas para herramientas, paneles, consultas y el viewport. El grid de That Open permite declarar esas zonas y definir como se distribuyen."),
          code("React monta <bim-grid>\nuseEffect espera al montaje\nsetupGrid() configura el grid\ngrid.elements declara las zonas\ngrid.layouts declara las distribuciones\ngrid.layout = \"Main\" activa una distribucion"),
          P("En el flujo actual, <b>setupGrid()</b> llama a <b>setupComponents()</b>. Esta funcion devuelve <b>{ components, viewport }</b>: el registro comun de servicios BIM y el elemento visual donde se dibuja el visor."),
          ]

elements = Table([
    [P("Concepto", "WhiteHead"), P("Significado", "WhiteHead")],
    [P("grid.elements", "SmallCustom"), P("Diccionario de elementos que el grid puede renderizar.", "SmallCustom")],
    [P("template", "SmallCustom"), P("Funcion de That Open UI que devuelve una plantilla HTML mediante BUI.html.", "SmallCustom")],
    [P("initialState", "SmallCustom"), P("Datos iniciales que recibe el template; conceptualmente parecido a props iniciales.", "SmallCustom")],
    [P("grid.layouts", "SmallCustom"), P("Diccionario de distribuciones posibles del mismo conjunto de elementos.", "SmallCustom")],
    [P("grid.layout", "SmallCustom"), P("Nombre del layout activo.", "SmallCustom")],
], colWidths=[4.3*cm, 12.0*cm])
elements.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), BLUE), ("BACKGROUND", (0,1), (-1,-1), colors.white),
    ("GRID", (0,0), (-1,-1), 0.35, MID), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [elements, Spacer(1, 8), P("El layout se escribe con una sintaxis parecida a CSS Grid:", "H2Custom"),
          code('"sidebar" auto\n"componentsGrid" 1fr\n/1fr'),
          bullet("auto: la fila ocupa el tamaño necesario para su contenido."),
          bullet("1fr: la fila o columna ocupa el espacio flexible restante."),
          bullet("/1fr: existe una única columna que ocupa todo el ancho."),
          P("La referencia React y la referencia de That Open cumplen una función parecida, pero pertenecen a sistemas diferentes:"),
          code('React: ref={viewerGrid}\nThat Open: ${BUI.ref(onCreated)}'),
          P("React crea el elemento raiz. That Open configura los grids internos cuando cada Web Component esta disponible."),
          ]

story += section("2. Leccion 2.4 - cuadricula de componentes BIM", GREEN)
story += [P("La leccion 2.4 introduce un segundo nivel de grid: <b>componentsGrid</b>. Su responsabilidad es organizar el area de trabajo BIM, no la pagina completa."),
          P("La separacion queda asi:"),
          code('bim-grid raiz\n  ├── sidebar\n  └── componentsGrid\n        ├── viewport\n        ├── models\n        ├── queries\n        └── itemsData'),
          P("El template actual es <b>componentsGridTemplate</b>. Recibe el estado { components, viewport } y conecta cada elemento con su template correspondiente."),
          ]

grid_table = Table([
    [P("Elemento", "WhiteHead"), P("Template conectado", "WhiteHead"), P("Responsabilidad", "WhiteHead")],
    [P("viewport", "SmallCustom"), P("viewportContainerTemplate", "SmallCustom"), P("Aloja el viewport creado por el motor.", "SmallCustom")],
    [P("models", "SmallCustom"), P("modelsPanelTemplate", "SmallCustom"), P("Muestra modelos y permite cargarlos.", "SmallCustom")],
    [P("queries", "SmallCustom"), P("queriesPanelTemplate", "SmallCustom"), P("Muestra y ejecuta consultas BIM.", "SmallCustom")],
    [P("itemsData", "SmallCustom"), P("itemsDataPanelTemplate", "SmallCustom"), P("Muestra propiedades de la seleccion.", "SmallCustom")],
], colWidths=[3.0*cm, 5.0*cm, 8.3*cm])
grid_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN), ("GRID", (0,0), (-1,-1), 0.35, MID),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [grid_table, Spacer(1, 8), P("El layout Models actual distribuye el espacio asi:", "H2Custom"),
          code('"models viewport itemsData" 1fr\n"queries viewport itemsData" 1fr\n/22rem 1fr 22rem'),
          P("El viewport ocupa las dos filas porque su nombre se repite. Las columnas laterales tienen 22rem y la columna central ocupa el espacio restante."),
          ]

story += section("3. Evolucion del codigo actual respecto al Word", ORANGE)
story += [P("El material del modulo explica una primera version didactica con header, sidebar y componentsGrid. El codigo actual ya ha avanzado sobre esa base:"),
          bullet("El header del grid raiz ya no se configura."),
          bullet("El sidebar utiliza gridSidebarTemplate en lugar de ser un placeholder vacio."),
          bullet("componentsGrid dispone de los layouts Models, Queries y Viewer."),
          bullet("El evento elementcreated entrega al sidebar la referencia del componentsGrid cuando este ya existe."),
          bullet("ProjectDetailsPage guarda el Components manager y lo destruye con dispose() al desmontarse."),
          P("Por tanto, el Word debe leerse como la explicacion de la construccion progresiva; el repositorio contiene una version posterior y mas completa."),
          ]

story += section("4. Cambio de layouts y comunicacion por eventos", PURPLE)
story += [P("gridSidebarTemplate genera un boton por cada clave existente en grid.layouts. El sidebar no conoce de antemano si habra uno, dos o tres layouts."),
          code('Object.keys(grid.layouts)\n        ↓\nModels | Queries | Viewer\n        ↓\ngrid.layout = layout seleccionado'),
          P("El evento elementcreated resuelve una dependencia temporal: primero se crea el grid raiz, despues componentsGrid, y finalmente se actualiza el sidebar con la referencia al grid interno."),
          code('componentsGrid creado\n        ↓\n\"elementcreated\"\n        ↓\ngrid.updateComponent.sidebar({ grid: componentsGrid })'),
          ]

story += section("5. No confundir grid, viewport y World", BLUE)
compare = Table([
    [P("Pieza", "WhiteHead"), P("Que organiza", "WhiteHead")],
    [P("bim-grid", "SmallCustom"), P("La interfaz: paneles, sidebar, layouts y toolbar.", "SmallCustom")],
    [P("viewport", "SmallCustom"), P("El elemento visual donde se inserta el renderizado.", "SmallCustom")],
    [P("World", "SmallCustom"), P("El entorno 3D: escena, camara, renderer, raycaster y grid 3D.", "SmallCustom")],
], colWidths=[4.0*cm, 12.3*cm])
compare.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), NAVY), ("GRID", (0,0), (-1,-1), 0.35, MID),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 7),
    ("RIGHTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [compare, Spacer(1, 8), P("La jerarquia completa que debes visualizar es:"),
          code('React ProjectDetailsPage\n  └── bim-grid raiz\n        ├── gridSidebar\n        └── componentsGrid\n              ├── panels\n              └── viewportContainer\n                    └── bim-viewport\n                          └── World + renderer\n                                └── viewportGrid flotante'),
          ]

story += section("6. Ideas clave para fijar", GREEN)
for t in [
    "El grid no renderiza por si mismo la geometria BIM; organiza la interfaz que contiene el viewport.",
    "Un template es una funcion de That Open UI que devuelve una plantilla BUI.html.",
    "initialState es la entrada inicial del template, comparable conceptualmente a props.",
    "Los nombres de grid.elements y los nombres escritos en el layout deben coincidir exactamente.",
    "Un grid puede reutilizar los mismos elementos con varios layouts.",
    "BUI.ref sirve para configurar un Web Component despues de su creacion.",
    "elementcreated permite conectar componentes cuando se crean de forma asincrona o anidada.",
    "dispose() es necesario para liberar el motor BIM al desmontar la pagina.",
]:
    story.append(bullet(t))

story += [Spacer(1, 8), P("Frase resumen", "H2Custom"),
          P("La leccion 2.3 crea la estructura general del visor y la leccion 2.4 introduce el grid interno que organiza el area BIM. Juntos forman una arquitectura de grids anidados donde React monta, That Open UI compone y el World renderiza."),
          ]

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
