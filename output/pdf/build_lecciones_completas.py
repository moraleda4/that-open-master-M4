from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak

OUT = "output/pdf/resumen-completo-lecciones-2-3-2-4.pdf"
NAVY = colors.HexColor("#16345C")
BLUE = colors.HexColor("#2F75B5")
GREEN = colors.HexColor("#3E8E5B")
ORANGE = colors.HexColor("#D97928")
PURPLE = colors.HexColor("#7650A8")
LIGHT = colors.HexColor("#F4F7FB")
MID = colors.HexColor("#DCE6F2")
TEXT = colors.HexColor("#263238")

s = getSampleStyleSheet()
s.add(ParagraphStyle(name="TitleX", parent=s["Title"], fontName="Helvetica-Bold", fontSize=23, leading=28, textColor=NAVY, alignment=TA_CENTER, spaceAfter=7))
s.add(ParagraphStyle(name="SubX", parent=s["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, textColor=colors.HexColor("#52606D"), alignment=TA_CENTER, spaceAfter=17))
s.add(ParagraphStyle(name="H1X", parent=s["Heading1"], fontName="Helvetica-Bold", fontSize=16.5, leading=20, textColor=NAVY, spaceBefore=12, spaceAfter=7))
s.add(ParagraphStyle(name="H2X", parent=s["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=BLUE, spaceBefore=8, spaceAfter=4))
s.add(ParagraphStyle(name="BodyX", parent=s["BodyText"], fontName="Helvetica", fontSize=9.3, leading=13.2, textColor=TEXT, spaceAfter=5))
s.add(ParagraphStyle(name="SmallX", parent=s["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10.7, textColor=TEXT, spaceAfter=3))
s.add(ParagraphStyle(name="CodeX", parent=s["Code"], fontName="Courier", fontSize=7.7, leading=10, textColor=colors.HexColor("#203040"), backColor=colors.HexColor("#EEF3F8"), borderColor=MID, borderWidth=.4, borderPadding=6, spaceBefore=3, spaceAfter=7))
s.add(ParagraphStyle(name="WhiteX", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=9.5, leading=11.5, textColor=colors.white))

def para(t, style="BodyX"):
    return Paragraph(t, s[style])

def code(t):
    esc=t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\n","<br/>")
    return Paragraph(esc, s["CodeX"])

def bullet(t):
    return para("&#8226; " + t)

def heading(t, color=BLUE):
    return [Spacer(1, 3), Paragraph(t, s["H1X"]), HRFlowable(width="100%", thickness=1.1, color=color, spaceAfter=7)]

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(MID); canvas.line(1.7*cm,1.3*cm,A4[0]-1.7*cm,1.3*cm)
    canvas.setFont("Helvetica",8); canvas.setFillColor(colors.HexColor("#68737D"))
    canvas.drawString(1.7*cm,.82*cm,"BIM App - explicacion completa de las lecciones 2.3 y 2.4")
    canvas.drawRightString(A4[0]-1.7*cm,.82*cm,f"Pagina {doc.page}"); canvas.restoreState()

doc=SimpleDocTemplate(OUT,pagesize=A4,leftMargin=1.7*cm,rightMargin=1.7*cm,topMargin=1.45*cm,bottomMargin=1.7*cm,title="Explicacion completa de las lecciones 2.3 y 2.4")
story=[]
story += [Spacer(1,.6*cm), para("Explicacion completa de las lecciones 2.3 y 2.4","TitleX"), para("La cuadricula base del visor y la cuadricula de componentes BIM","SubX")]
box=Table([[para("IDEA CENTRAL","WhiteX"),para("React proporciona el punto de montaje; That Open UI organiza la interfaz BIM mediante grids, templates, estados y layouts.")]],colWidths=[3.3*cm,13*cm])
box.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),NAVY),("BACKGROUND",(1,0),(1,0),LIGHT),("BOX",(0,0),(-1,-1),.6,MID),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [box, Spacer(1,10)]

# LECCION 2.3
story += heading("Leccion 2.3: creacion de la cuadricula base del visor",BLUE)
story += [para("Esta leccion es el primer punto en el que la aplicacion deja de ser unicamente una app de gestion de proyectos y empieza a preparar el espacio BIM."),para("La idea central es:"),para("<b>ProjectDetailsPage</b> crea un <b>&lt;bim-grid&gt;</b> raiz y That Open UI se encarga de organizar dentro de el las distintas zonas del visor."),para("Archivo principal: <b>src/react-components/project-details/ProjectDetailsPage.tsx</b>","SmallX")]
story += [para("1. Que problema resuelve <b>bim-grid</b>","H2X"),para("Un visor BIM no es solamente un canvas. Necesita organizar varias zonas:"),code("┌──────────────────────────────────────────────┐\n│ Sidebar / selector de layouts                 │\n├──────────────────────────────────────────────┤\n│ Models       │                               │\n│ Queries      │        Viewport 3D            │\n│              │                               │\n└──────────────┴──────────────────────────────┘"),para("El componente <b>&lt;bim-grid&gt;</b> permite declarar elementos visuales, definir layouts, cambiar de distribucion, insertar templates y mantener la UI BIM separada de React. Es el sistema de composicion visual de That Open UI.")]
story += [para("2. El punto de entrada: ProjectDetailsPage","H2X"),para("La parte BIM comienza con una referencia React al grid raiz:"),code('const viewerGrid = React.useRef<BUI.Grid<["Main"]>>(null)'),para("Esta referencia representa al <b>&lt;bim-grid&gt;</b> raiz que aparece en el JSX:"),code('<bim-grid ref={viewerGrid} className="viewer-grid"></bim-grid>'),para("Hay dos momentos diferentes:"),code("Render inicial de React\n        ↓\nSe crea fisicamente <bim-grid>\n        ↓\nviewerGrid.current apunta al elemento\n        ↓\nuseEffect ejecuta setupGrid()\n        ↓\nThat Open configura el grid")]
story += [para("3. Diferencia entre useRef y BUI.ref","H2X"),para("En ProjectDetailsPage se usa la referencia React <b>ref={viewerGrid}</b>. En los templates de That Open se usa <b>${BUI.ref(onCreated)}</b>. Ambos permiten acceder a un elemento despues de su creacion, pero pertenecen a sistemas diferentes."),code("React JSX\n  → ref={viewerGrid}\n\nThat Open template\n  → ${BUI.ref(onCreated)}")]
story += [para("4. setupGrid: el puente React → That Open","H2X"),code("const setupGrid = async () => {\n  const { current: grid } = viewerGrid\n  if (!grid) return\n  const { components, viewport } = await setupComponents()\n  ...\n}"),para("La funcion obtiene el grid creado por React, inicializa el motor BIM mediante setupComponents() y entrega los objetos BIM al sistema de templates."),code("components\n    └── registro comun de servicios BIM\n\nviewport\n    └── elemento visual donde se dibuja el visor")]
story += [para("5. El estado inicial de un template","H2X"),para("Cada elemento del grid se configura con <b>template</b> e <b>initialState</b>. El template es una funcion que construye la interfaz y initialState son los datos iniciales que recibe, conceptualmente parecidos a props."),code("React:\n<Component components={components} />\n\nThat Open:\n{\n  template: componentsGridTemplate,\n  initialState: { components }\n}")]
story += [para("6. Configuracion actual del grid raiz","H2X"),para("En el codigo actual el grid raiz tiene dos elementos: sidebar y componentsGrid. La leccion original hablaba de header, sidebar y componentsGrid, pero la version actual ha evolucionado: el header ha desaparecido, el sidebar utiliza un template real y componentsGrid recibe { components, viewport }."),code("Grid raiz\n    ├── sidebar\n    └── componentsGrid")]
story += [para("7. El layout Main","H2X"),code('Main: {\n  template: `\n    "sidebar" auto\n    "componentsGrid" 1fr\n    /1fr\n  `\n}'),para("auto significa que la fila ocupa el tamano que necesita su contenido. 1fr significa una fraccion flexible que ocupa el espacio restante. /1fr indica una unica columna flexible.")]
story += [para("8. El componentsGrid","H2X"),para("El grid raiz solo organiza grandes zonas. El contenido BIM se construye dentro de componentsGridTemplate, que define cuatro elementos:"),code("componentsGrid\n    ├── viewport\n    ├── itemsData\n    ├── models\n    └── queries"),para("Cada elemento conecta con otro template: viewportContainerTemplate, itemsDataPanelTemplate, modelsPanelTemplate y queriesPanelTemplate.")]
story += [para("9. El layout Models","H2X"),code('Models: {\n  template: `\n    "models viewport itemsData" 1fr\n    "queries viewport itemsData" 1fr\n    /22rem 1fr 22rem\n  `\n}'),para("El viewport ocupa las dos filas porque su nombre se repite. Las columnas laterales tienen 22rem y la columna central ocupa el espacio restante."),code("┌───────────────┬──────────────────────┬───────────────┐\n│ Models        │                      │ ItemsData     │\n│               │                      │               │\n├───────────────┤      Viewport        │               │\n│ Queries       │                      │               │\n│               │                      │               │\n└───────────────┴──────────────────────┴───────────────┘")]
story += [para("10. Los layouts actuales adicionales","H2X"),para("El codigo actual ya tiene tres layouts: Models, Queries y Viewer. Models muestra todos los paneles; Queries muestra principalmente Viewport y Queries; Viewer muestra unicamente Viewport. Los elementos no se duplican: se reutilizan los mismos templates y cambia su distribucion."),code("mismos componentes\n        │\n        ├── layout Models\n        ├── layout Queries\n        └── layout Viewer")]
story += [para("11. Como se cambia de layout","H2X"),para("gridSidebarTemplate genera un boton por cada clave existente en grid.layouts. El sidebar descubre los layouts registrados y no necesita conocerlos de antemano."),code("grid.layouts\n    │\n    ├── Models\n    ├── Queries\n    └── Viewer\n            │\n            ▼\ngrid.layout = layout seleccionado")]
story += [para("12. El evento elementcreated","H2X"),para("El evento resuelve una dependencia temporal: primero se crea el grid raiz, despues componentsGrid y finalmente se actualiza el sidebar con la referencia al grid interno."),code('componentsGrid creado\n        ↓\n"elementcreated"\n        ↓\ngrid.updateComponent.sidebar({ grid: componentsGrid })')]
story += [para("13. Limpieza del motor BIM","H2X"),code("let engineManager: OBC.Components | null = null\n\nengineManager = components\n\nreturn () => {\n  engineManager?.dispose()\n  engineManager = null\n}"),para("dispose() libera recursos WebGL, workers, listeners, camaras, escenas, modelos, materiales y referencias internas.")]
story += [para("14. Relacion entre los tres tipos de grid","H2X"),code("Grid raiz de ProjectDetailsPage\n    │\n    └── componentsGrid\n            │\n            └── viewportContainer\n                    │\n                    └── viewportGrid flotante\n                            │\n                            └── viewerToolbar")]
story += [para("15. Diferencia entre bim-grid y World","H2X"),para("bim-grid organiza la interfaz: paneles, layouts, sidebar, toolbar y viewport-container. World organiza el motor 3D: scene, camera, renderer, raycaster y grid 3D. El bim-grid no renderiza geometria BIM; solo organiza la interfaz que contiene el viewport.")]
story += [para("16. Diferencia entre React y los templates de That Open","H2X"),para("React utiliza JSX/TSX y un arbol de renderizado React. That Open UI utiliza BUI.html y templates basados en Lit. En ProjectDetailsPage ambos sistemas colaboran: React monta bim-grid y That Open configura sus elementos y layouts.")]
story += [para("17. Diferencias entre la leccion y el codigo actual","H2X"),bullet("El material explica una primera version con header, sidebar y componentsGrid."),bullet("El codigo actual utiliza un sidebar real y layouts Models, Queries y Viewer."),bullet("El evento elementcreated conecta el sidebar con componentsGrid."),bullet("ProjectDetailsPage libera el motor con dispose() al desmontarse."),para("El Word debe leerse como la explicacion de la construccion progresiva; el repositorio contiene una version posterior y mas completa.")]

# LECCION 2.4
story += [PageBreak()]
story += heading("Leccion 2.4: creacion de la cuadricula de componentes BIM",GREEN)
story += [para("La leccion 2.3 creo el grid general de la pagina BIM. La 2.4 crea un grid interno especializado para organizar el espacio de trabajo BIM."),para("La diferencia conceptual es:"),code("Grid raiz\n    → estructura general de la pantalla\n\nComponentsGrid\n    → espacio de trabajo BIM")]
story += [para("1. El archivo principal","H2X"),para("El archivo actual es <b>src/ui-templates/grids/components/index.ts</b>. Recibe components y viewport. components permite acceder a los servicios BIM y viewport es el componente visual donde se dibuja el modelo.")]
story += [para("2. Declaracion de los elementos","H2X"),code("grid.elements = {\n  viewport: { template: viewportContainerTemplate, initialState: { viewport } },\n  itemsData: { template: itemsDataPanelTemplate, initialState: { components } },\n  models: { template: modelsPanelTemplate, initialState: { components } },\n  queries: { template: queriesPanelTemplate, initialState: { components } },\n}"),para("Cada nombre tiene tres partes: nombre del elemento, template que debe utilizar y estado inicial que recibe.")]
story += [para("3. El viewport no se crea aqui","H2X"),para("componentsGrid no crea la escena, la camara ni el renderer. Solo coloca el viewport creado previamente en create-world.ts."),code("createWorld()\n    └── crea World\n          ├── Scene\n          ├── Camera\n          ├── Renderer\n          └── Viewport\n\ncomponentsGrid\n    └── recibe ese Viewport\n          └── lo coloca visualmente")]
story += [para("4. El layout Models","H2X"),code('Models: {\n  template: `\n    "models viewport itemsData" 1fr\n    "queries viewport itemsData" 1fr\n    /22rem 1fr 22rem\n  `\n}'),para("La repeticion de viewport hace que ocupe las dos filas. 22rem define los paneles laterales y 1fr define el visor central flexible.")]
story += [para("5. Los tres layouts actuales","H2X"),para("Aunque la leccion empieza con un unico layout, el codigo actual contiene Models, Queries y Viewer. La ventaja es que los elementos no se duplican: se reutilizan los mismos templates y solo cambia su distribucion."),code("mismos componentes\n        │\n        ├── layout Models\n        ├── layout Queries\n        └── layout Viewer")]
story += [para("6. BUI.ref(onCreated)","H2X"),code('return BUI.html`\n  <bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>\n`'),para("BUI.ref(onCreated) indica que, cuando el grid exista, debe ejecutarse onCreated y entregarse el elemento creado. Dentro del callback ya se pueden configurar grid.elements, grid.layouts y grid.layout.")]
story += [para("7. Por que se comprueba if (!e) return","H2X"),para("El callback recibe e?: Element, por lo que e puede ser undefined. La proteccion evita configurar un grid inexistente. Despues se hace casting porque TypeScript conoce un Element generico, pero nosotros sabemos que es un ComponentsGrid.")]
story += [para("8. Organizacion de tipos","H2X"),code("ui-templates/grids/components/\n    ├── index.ts\n    └── src/\n          ├── index.ts\n          └── types.ts"),para("types.ts define el contrato estatico del grid. No crea nada visual. components/index.ts crea y configura el grid en ejecucion.")]
story += [para("9. Diferencia entre tipos y ejecucion","H2X"),code("Tipo TypeScript\n    ≠\nComponente visual"),para("El tipo ayuda al editor y al compilador a comprobar elementos, layouts y estados; el template es el que crea la interfaz real.")]
story += [para("10. Relacion con create-world.ts","H2X"),code("ProjectDetailsPage\n    │\n    ▼\nsetupComponents()\n    │\n    ▼\ncreateWorld()\n    ├── World\n    └── Viewport\n    │\n    ▼\ncomponentsGridTemplate\n    ├── Models panel\n    ├── Queries panel\n    ├── ItemsData panel\n    └── ViewportContainer\n            │\n            ▼\n        Viewport 3D")]
story += [para("11. Diferencias entre la leccion y el codigo actual","H2X"),bullet("La leccion empieza con un unico elemento viewport y un unico layout Models."),bullet("El codigo actual ya incluye viewport, models, queries e itemsData."),bullet("El codigo actual dispone de los layouts Models, Queries y Viewer."),bullet("El sidebar descubre dinamicamente los layouts y genera sus botones."),para("Hay una observacion tecnica importante: el archivo de tipos actual parece parcialmente desactualizado respecto al template ejecutable. El template registra queries, pero la tupla ComponentsGridElements no lo declara; ademas, los layouts Queries y Viewer aparecen en el tipo, aunque no todos los elementos estan representados en esa tupla."),para("Esto no cambia la idea de la leccion, pero conviene distinguir entre el template ejecutable, que define la configuracion real, y types.ts, que define el contrato estatico que deberia describirla.")]
story += [para("12. Idea esencial de la leccion","H2X"),para("La leccion 2.4 ensena a organizar el visor por composicion: un grid grande contiene otro grid, que contiene paneles y viewport, que contiene un grid flotante, que contiene la toolbar."),code("Cada nivel tiene una responsabilidad distinta:\n\nGrid raiz        → estructura general de la pagina\ncomponentsGrid   → area de trabajo BIM\nviewportContainer → aloja el viewport\nviewportGrid     → superpone herramientas\nviewerToolbar    → acciones de interaccion BIM")]
story += [para("Resumen conjunto de 2.3 y 2.4","H2X"),code("React\n  └── ProjectDetailsPage\n        └── bim-grid raiz\n              ├── Sidebar\n              └── componentsGrid\n                    ├── Models\n                    ├── Queries\n                    ├── ItemsData\n                    └── Viewport\n                          └── World\n                                ├── Scene\n                                ├── Camera\n                                ├── Renderer\n                                └── modelos BIM"),para("La frase resumen es: la leccion 2.3 crea la estructura general del visor y la 2.4 introduce el grid interno que organiza el area de trabajo BIM. React monta la estructura, That Open UI compone la interfaz y el World se encarga del renderizado 3D.")]

doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
