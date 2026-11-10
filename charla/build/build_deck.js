// Presentacion: "La IA no te va a quitar el trabajo" - CINCIT 2026 / UNAJMA
// Uso: node build_deck.js [URL_DEL_FORMULARIO]
const pptxgen = require("pptxgenjs");
const path = require("path");
const SKILL =
  "C:/Users/user/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/" +
  "3322e9bf-c816-46e0-a6e9-3cf03751f355/556f024f-e179-4ef9-abd7-9eae674fb71c/skills/pptx";
const { applyTheme } = require(SKILL + "/scripts/apply_theme.js");

const A = (f) => path.join(__dirname, "..", "assets", f);
const OUT = path.join(__dirname, "..", process.env.DECK_OUT || "Charla_IA_no_te_quita_el_trabajo_CINCIT2026.pptx");
const FORM_URL = process.argv[2] || "";

// ---------------------------------------------------------------- tema
// DECK_THEME=claro  -> fondo blanco con azul alterno (v4). Sin la variable -> tema oscuro original (v3).
const LIGHT = process.env.DECK_THEME === "claro";
const THEME_DARK = {
  name: "CINCIT UNAJMA",
  headFontFace: "Segoe UI Semibold",
  bodyFontFace: "Segoe UI",
  colors: {
    dk1: "FFFFFF", lt1: "071A3E", dk2: "A9B8D6", lt2: "0F2A5C",
    accent1: "1FD18B", accent2: "17B5E0", accent3: "FF7F00", accent4: "00439E",
    accent5: "FFD23F", accent6: "E5484D", hlink: "17B5E0", folHlink: "A9B8D6",
  },
};
const THEME_LIGHT = {
  name: "CINCIT UNAJMA (claro)",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0B1F44", lt1: "FFFFFF", dk2: "4B5B7C", lt2: "EAF1FC",
    accent1: "0B4DB8", accent2: "0A7AA6", accent3: "D45A00", accent4: "0B4DB8",
    accent5: "F5B800", accent6: "D9363E", hlink: "0B4DB8", folHlink: "4B5B7C",
  },
};
const THEME = LIGHT ? THEME_LIGHT : THEME_DARK;
// hex para lo que no admite colores de tema (graficos)
const HEX = LIGHT
  ? { bg: "FFFFFF", card: "EAF1FC", text: "0B1F44", muted: "4B5B7C", barMuted: "9FB0CF", green: "0B4DB8", cyan: "0A7AA6",
      orange: "D45A00", red: "D9363E", yellow: "F5B800" }
  : { bg: "071A3E", card: "0F2A5C", text: "FFFFFF", muted: "A9B8D6", barMuted: "A9B8D6", green: "1FD18B", cyan: "17B5E0",
      orange: "FF7F00", red: "E5484D", yellow: "FFD23F" };
const GREEN = LIGHT ? "12A06B" : "1FD18B";        // verde "de verdad" (semaforo)
const GREEN_TXT = LIGHT ? "0B7A52" : "1FD18B";
const YELLOW_TXT = LIGHT ? "8A6500" : "FFD23F";
const NAVY = "0B1F44", BLUEBG = "0B4DB8";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "La IA no te va a quitar el trabajo";
pres.author = "Roberto Gutiérrez Brown";
pres.company = "CINCIT 2026 - UNAJMA";
const C = pres.SchemeColor;
const S = pres.shapes;

// ---------------------------------------------------------------- layouts
const LOGO_U = { w: 0.97, h: 0.382 };
const LOGO_C = { w: 0.83, h: 0.42 };
const LOGO_FILE = LIGHT ? "unajma_horizontal_color.png" : "unajma_horizontal_blanco.png";
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: C.background1 },
  objects: [
    ...(LIGHT ? [
      { rect: { x: 0, y: 0, w: 13.333, h: 0.16, fill: { color: C.accent1 } } },
      { rect: { x: 0.7, y: 6.86, w: 11.93, h: 0.02, fill: { color: "D3E0F5" } } },
    ] : []),
    { image: { path: A(LOGO_FILE), x: 0.7, y: 6.98, w: LOGO_U.w, h: LOGO_U.h } },
    { image: { path: A("cincit.png"), x: 11.8, y: 6.93, w: LOGO_C.w, h: LOGO_C.h } },
    { placeholder: { options: { name: "kicker", type: "body", x: 0.7, y: 0.32, w: 8, h: 0.3, fontSize: 13, bold: true,
      color: C.accent1, charSpacing: 4, margin: 0, valign: "middle" }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.62, w: 11.93, h: 1.0, fontSize: 34, bold: true,
      color: C.text1, margin: 0, valign: "middle", align: "left" }, text: "" } },
  ],
  slideNumber: { x: 10.9, y: 7.02, w: 0.7, h: 0.3, color: C.text2, fontSize: 11, align: "right" },
});
pres.defineSlideMaster({ title: "PORTADA", background: { color: C.background1 } });
// "AZUL": diapositiva de impacto con fondo azul (solo en el tema claro; en el oscuro es igual que PORTADA)
pres.defineSlideMaster({ title: "AZUL", background: { color: LIGHT ? BLUEBG : C.background1 } });

// ---------------------------------------------------------------- helpers
const T = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, margin: 0, color: C.text1, fontSize: 18, valign: "top" }, o));
const card = (s, x, y, w, h, o) => s.addShape(S.ROUNDED_RECTANGLE, Object.assign(
  { x, y, w, h, rectRadius: 0.12, fill: { color: C.background2 }, line: LIGHT ? { color: "D3E0F5", width: 1 } : { type: "none" } }, o || {}));
// tarjeta azul (tema claro) para alternar con las tarjetas claras; en el tema oscuro queda como una tarjeta normal
const cardBlue = (s, x, y, w, h) => card(s, x, y, w, h, LIGHT ? { fill: { color: BLUEBG }, line: { type: "none" } } : {});
// colores de texto sobre tarjeta azul / clara
const onBlue = (blue, normal) => (LIGHT ? (blue ? "FFFFFF" : normal) : normal);
const onBlueSoft = (blue, normal) => (LIGHT ? (blue ? "DCE8FB" : normal) : normal);
const outline = (s, x, y, w, h, color) => s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12,
  fill: { color: C.background1 }, line: { color: color || C.accent1, width: 2.5 } });
const badge = (s, x, y, d, label, fill, textColor, size) => {
  s.addShape(S.OVAL, { x, y, w: d, h: d, fill: { color: fill || C.accent1 }, line: { type: "none" } });
  T(s, label, { x, y, w: d, h: d, align: "center", valign: "middle", bold: true, fontSize: size || 20,
    color: textColor || C.background1 });
};
const chip = (s, x, y, w, h, label, fill, textColor, size) => {
  s.addShape(S.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.2, fill: { color: fill || C.accent1 }, line: { type: "none" } });
  T(s, label, { x, y, w, h, align: "center", valign: "middle", bold: true, fontSize: size || 14, color: textColor || C.background1 });
};
// panel azul de la derecha para portada y cierre (tema claro): logo de CINCIT sobre tarjeta blanca + circulos decorativos
function panelAzul(s) {
  s.addShape(S.RECTANGLE, { x: 10.4, y: 0, w: 2.933, h: 7.5, fill: { color: BLUEBG }, line: { type: "none" } });
  s.addShape(S.OVAL, { x: 10.7, y: 3.9, w: 3.2, h: 3.2, fill: { color: "FFFFFF", transparency: 88 }, line: { type: "none" } });
  s.addShape(S.OVAL, { x: 10.55, y: 5.55, w: 1.6, h: 1.6, fill: { color: "FFFFFF", transparency: 80 }, line: { type: "none" } });
  s.addShape(S.ROUNDED_RECTANGLE, { x: 10.65, y: 0.55, w: 2.43, h: 1.5, rectRadius: 0.15, fill: { color: "FFFFFF" }, line: { type: "none" } });
  s.addImage({ path: A("cincit.png"), x: 10.8, y: 0.68, w: 2.13, h: 2.13 / 1.973, altText: "Logo CINCIT 2026" });
}
let n = 0;
function content(section, kicker, title, notes) {
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: section });
  s.addText(kicker, { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  s.addNotes(notes.trim());
  n++;
  return s;
}
function chartBase(extra) {
  return Object.assign({
    showLegend: false, showTitle: false, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisLabelColor: HEX.muted, catAxisLabelFontSize: 16, catAxisLabelFontFace: "+mn-lt",
    showValue: true, dataLabelColor: HEX.text, dataLabelFontSize: 18, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true,
    dataLabelPosition: "outEnd", barGapWidthPct: 55, catAxisLineShow: false,
  }, extra);
}

// ================================================================ 1. PORTADA
pres.addSection({ title: "Apertura" });
let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Apertura" });
if (LIGHT) {
  panelAzul(s);
  s.addImage({ path: A(LOGO_FILE), x: 0.7, y: 0.5, w: 3.1, h: 3.1 / 2.541, altText: "Logo UNAJMA" });
  T(s, "La IA no te va a quitar\nel trabajo", { x: 0.7, y: 2.35, w: 9.3, h: 2.0, fontSize: 52, bold: true, valign: "middle",
    fontFace: "Arial", color: NAVY });
  s.addShape(S.RECTANGLE, { x: 0.7, y: 4.5, w: 1.6, h: 0.08, fill: { color: C.accent1 }, line: { type: "none" } });
  T(s, "Lo que sí cambia: quién entra, cómo se aprende y qué vale", { x: 0.7, y: 4.75, w: 9.3, h: 0.9, fontSize: 24, color: C.accent1,
    valign: "top" });
  T(s, "Roberto Gutiérrez Brown", { x: 0.7, y: 5.8, w: 9, h: 0.45, fontSize: 22, bold: true });
  T(s, "Data Analytics Manager  ·  CINCIT 2026  ·  Universidad Nacional José María Arguedas", { x: 0.7, y: 6.3, w: 9.4, h: 0.4,
    fontSize: 15, color: C.text2 });
} else {
s.addShape(S.OVAL, { x: 8.6, y: 2.45, w: 4.3, h: 4.3, fill: { color: C.accent4, transparency: 75 }, line: { type: "none" } });
s.addShape(S.OVAL, { x: 10.5, y: 4.55, w: 2.3, h: 2.3, fill: { color: C.accent1, transparency: 80 }, line: { type: "none" } });
s.addImage({ path: A("unajma_horizontal_blanco.png"), x: 0.7, y: 0.5, w: 3.1, h: 3.1 / 2.541, altText: "Logo UNAJMA" });
s.addImage({ path: A("cincit.png"), x: 10.3, y: 0.4, w: 2.4, h: 2.4 / 1.973, altText: "Logo CINCIT 2026" });
T(s, "La IA no te va a quitar el trabajo", { x: 0.7, y: 2.45, w: 10.8, h: 1.8, fontSize: 56, bold: true, valign: "middle",
  fontFace: "Segoe UI Semibold" });
T(s, "Lo que sí cambia: quién entra, cómo se aprende y qué vale", { x: 0.7, y: 4.4, w: 10.5, h: 0.6, fontSize: 24, color: C.accent1,
  valign: "middle" });
T(s, "Roberto Gutiérrez Brown", { x: 0.7, y: 5.6, w: 9, h: 0.45, fontSize: 22, bold: true });
T(s, "Data Analytics Manager  ·  CINCIT 2026  ·  Universidad Nacional José María Arguedas", { x: 0.7, y: 6.1, w: 10.5, h: 0.4,
  fontSize: 16, color: C.text2 });
}
s.addNotes(`[0:00 · 1 min] Entra con energía y con el QR ya en la siguiente diapositiva.
"Hoy les voy a decir algo que suena a mentira: la IA no te va a quitar el trabajo. Y después les voy a decir por qué, aun así, deberían estar atentos."
Agradece a la UNAJMA y a CINCIT.`);
n++;

// ================================================================ 2. QR
s = content("Apertura", "ANTES DE EMPEZAR", "Cuéntanos de ti (60 segundos)",
`[0:00 – 0:03] Deja esta diapositiva en pantalla mientras la gente entra y mientras te presentas.
CUENTA REGRESIVA: el contador de la derecha baja de 60 a 0 solo, apenas aparece la diapositiva (es un GIF animado: funciona en modo presentación, F5; en la vista de edición solo ves el "60"). Si pasas de diapositiva y vuelves, empieza de nuevo. Al llegar a 0 se queda en "0".
"Escaneen el QR y respondan 8 preguntas. Les doy 60 segundos: es al toque. Es anónimo, no piden nombre ni DNI. Más adelante les voy a mostrar qué dijo esta sala, y lo vamos a hacer en vivo."
Mientras corre el contador, preséntate y agradece; no hace falta quedarse callado mirando el reloj.
Si alguien no puede escanear, dile que lo haga con su vecino. Si la conexión falla, usa tu internet móvil y comparte la red.
Mide cuántas respuestas llegan antes del minuto 25 (conviene tener al menos 30).`);
card(s, 0.7, 1.85, 5.0, 4.85, { fill: { color: "FFFFFF" }, line: LIGHT ? { color: BLUEBG, width: 3 } : { type: "none" } });
s.addImage({ path: A("qr_formulario.png"), x: 0.95, y: 2.1, w: 4.5, h: 4.5, altText: "Código QR del formulario" });
T(s, "Escanea el QR", { x: 6.4, y: 1.95, w: 6.2, h: 0.8, fontSize: 40, bold: true });
T(s, "8 preguntas de opción múltiple.\nSin nombre ni DNI.", { x: 6.4, y: 2.95, w: 4.0, h: 1.0, fontSize: 20, color: C.text2 });
// cuenta regresiva de 60 s (GIF animado; lo genera hacer_contador.py y se reproduce una vez al aparecer la diapositiva)
s.addImage({ path: A(LIGHT ? "contador_60s_claro.gif" : "contador_60s.gif"), x: 10.6, y: 1.7, w: 2.0, h: 2.0, altText: "Cuenta regresiva de 60 segundos" });
chip(s, 6.4, 4.2, 1.9, 0.5, "Anónimo", C.accent1, C.background1, 16);
chip(s, 8.45, 4.2, 2.2, 0.5, "60 segundos", C.accent2, C.background1, 16);
chip(s, 10.8, 4.2, 1.8, 0.5, "En vivo", C.accent3, C.background1, 16);
T(s, "Más adelante verás qué dijo esta sala.", { x: 6.4, y: 5.1, w: 6.2, h: 0.5, fontSize: 24, bold: true, color: C.accent1 });
if (FORM_URL) T(s, FORM_URL, { x: 6.4, y: 5.85, w: 6.2, h: 0.4, fontSize: 16, color: C.text2 });

// ================================================================ 3. QUIEN SOY
s = content("Apertura", "QUIÉN SOY", "Trabajo con datos y uso IA todos los días",
`[0:00 – 0:03] Preséntate en 30 segundos. Un solo mensaje:
"Trabajo con datos todos los días y uso IA todos los días. Por eso hoy les voy a mostrar dónde la IA brilla y dónde te deja mal parado."
Si quieres, suma 1 o 2 ejemplos reales de tu experiencia para darte credibilidad.`);
if (LIGHT) s.addShape(S.OVAL, { x: 0.8, y: 1.8, w: 4.2, h: 4.2, fill: { color: C.accent1 }, line: { type: "none" } });
s.addImage({ path: A("foto_ponente.png"), x: 0.95, y: 1.95, w: 3.9, h: 3.9, rounding: true, altText: "Roberto Gutiérrez Brown" });
T(s, "Roberto Gutiérrez Brown", { x: 5.4, y: 2.0, w: 7.2, h: 0.8, fontSize: 38, bold: true });
T(s, [
  { text: "Data Analytics Manager", options: { breakLine: true, bold: true, color: C.accent1 } },
  { text: "Head of Analytics", options: { breakLine: true } },
  { text: "Docente de Python for Data Analyst · Levo Learning Center", options: {} },
], { x: 5.4, y: 2.95, w: 7.2, h: 1.9, fontSize: 24, paraSpaceAfter: 6 });
cardBlue(s, 5.4, 5.0, 7.2, 1.3);
T(s, "“Hoy les muestro dónde la IA brilla y dónde te deja mal parado.”", { x: 5.7, y: 5.0, w: 6.6, h: 1.3, fontSize: 22,
  italic: true, valign: "middle", color: onBlue(true, C.text1) });

// ================================================================ 4. VOTO
pres.addSection({ title: "Gancho" });
s = content("Gancho", "PREGUNTA HONESTA", "¿La IA te quitará el trabajo?",
`[0:03 – 0:05] VOTO A MANO ALZADA (sin celular, por si falla la conexión).
"Levanten la mano si creen que SÍ." Cuenta y anota. "¿NO?" Cuenta y anota. "¿No saben?" Cuenta y anota.
Anota los tres números en un papel: los vamos a comparar al final.
Tip: pide a alguien que justifique su respuesta en una frase.`);
[["Sí", C.accent3], ["No", C.accent1], ["No sé", C.accent2]].forEach(([t, col], i) => {
  const x = 0.7 + i * 4.05;
  s.addShape(S.ROUNDED_RECTANGLE, { x, y: 2.2, w: 3.8, h: 3.2, rectRadius: 0.15, fill: { color: col }, line: { type: "none" } });
  T(s, t, { x, y: 2.2, w: 3.8, h: 3.2, fontSize: 64, bold: true, align: "center", valign: "middle", color: C.background1 });
});
T(s, "Levanta la mano. Cuento y anoto: lo repetimos al final.", { x: 0.7, y: 5.85, w: 11.9, h: 0.5, fontSize: 22, color: C.text2, align: "center" });

// ================================================================ 5. LA FRASE
s = pres.addSlide({ masterName: "AZUL", sectionTitle: "Gancho" });
if (LIGHT) {
  s.addShape(S.OVAL, { x: 9.6, y: 4.3, w: 3.6, h: 3.6, fill: { color: "FFFFFF", transparency: 88 }, line: { type: "none" } });
  s.addShape(S.OVAL, { x: -0.8, y: -1.2, w: 2.8, h: 2.8, fill: { color: "FFFFFF", transparency: 90 }, line: { type: "none" } });
} else {
  s.addShape(S.OVAL, { x: 9.4, y: 4.4, w: 3.0, h: 2.6, fill: { color: C.accent4, transparency: 80 }, line: { type: "none" } });
}
T(s, LIGHT ? "La IA no te va a\nquitar el trabajo." : "La IA no te va a quitar el trabajo.", { x: 0.9, y: 2.3, w: 11.5, h: 2.2, fontSize: 60, bold: true, align: "center", valign: "middle",
  color: LIGHT ? "FFFFFF" : C.text1 });
T(s, "Es lo que dice el título de esta charla.", { x: 0.9, y: 4.7, w: 11.5, h: 0.6, fontSize: 24, color: LIGHT ? "DCE8FB" : C.text2, align: "center" });
s.addNotes(`[0:05 – 0:06] Deja la frase sola y haz una pausa larga (3 segundos).
"Eso dice el título. Y yo lo creo… pero no significa que estén a salvo." (Pasa a la siguiente.)`);
n++;

// ================================================================ 6. EL MIEDO
s = content("Gancho", "DE DÓNDE VIENE EL MIEDO", "…y aun así, deberías estar atento",
`[0:06 – 0:07] "Cada semana alguien anuncia el fin de tu carrera. Y cada semana otro dice que no pasa nada. Las dos lecturas son cómodas. Y las dos están mal."
Pasa a los datos: "Veamos qué dicen, incluyendo los que contradicen lo que yo les digo."`);
card(s, 0.7, 1.95, 5.5, 3.1);
T(s, "Lo que dicen los titulares", { x: 1.0, y: 2.15, w: 5.0, h: 0.4, fontSize: 18, color: C.text2 });
T(s, "“Tu carrera desaparece”", { x: 1.0, y: 2.7, w: 5.0, h: 1.0, fontSize: 32, bold: true, color: C.accent3 });
T(s, "Pánico", { x: 1.0, y: 4.0, w: 5.0, h: 0.6, fontSize: 22, color: C.text2 });
card(s, 7.13, 1.95, 5.5, 3.1);
T(s, "Lo que dice el otro bando", { x: 7.43, y: 2.15, w: 5.0, h: 0.4, fontSize: 18, color: C.text2 });
T(s, "“No pasa nada”", { x: 7.43, y: 2.7, w: 5.0, h: 1.0, fontSize: 32, bold: true, color: C.accent2 });
T(s, "Comodidad", { x: 7.43, y: 4.0, w: 5.0, h: 0.6, fontSize: 22, color: C.text2 });
T(s, "Ninguna de las dos es cierta.", { x: 0.7, y: 5.45, w: 11.93, h: 0.7, fontSize: 32, bold: true, color: C.accent1, align: "center" });
T(s, "Veamos qué dicen los datos, incluso los que me contradicen.", { x: 0.7, y: 6.1, w: 11.93, h: 0.45, fontSize: 20, color: C.text2, align: "center" });

// ================================================================ 7. WEF
pres.addSection({ title: "Los datos" });
s = content("Los datos", "GLOBAL", "Se destruyen empleos… y se crean más",
`[0:07 – 0:09] Foro Económico Mundial, Future of Jobs 2025: proyección al 2030 con datos de más de 1,000 empresas.
- 170 millones de empleos creados, 92 millones desplazados, neto +78 millones.
- 22% de los empleos cambian; casi 40% de las habilidades requeridas serán distintas.
Mensaje: "no es que desaparezca el trabajo; cambia lo que se pide". Ojo honesto: son proyecciones, no hechos.`);
s.addChart(pres.charts.BAR, [{ name: "Millones de empleos", labels: ["Creados", "Desplazados", "Neto"], values: [170, 92, 78] }],
  chartBase({ x: 0.7, y: 1.85, w: 7.0, h: 4.7, barDir: "col", chartColors: [HEX.green, HEX.orange, HEX.cyan], valAxisMaxVal: 200,
    catAxisLabelFontSize: 18 }));
cardBlue(s, 8.1, 1.95, 4.53, 2.2);
T(s, "22%", { x: 8.4, y: 2.05, w: 4.0, h: 1.0, fontSize: 54, bold: true, color: onBlue(true, C.accent1) });
T(s, "de los empleos cambian al 2030", { x: 8.4, y: 3.1, w: 4.0, h: 0.8, fontSize: 20, color: onBlue(true, C.text1) });
card(s, 8.1, 4.4, 4.53, 2.2);
T(s, "≈ 40%", { x: 8.4, y: 4.5, w: 4.0, h: 1.0, fontSize: 54, bold: true, color: C.accent2 });
T(s, "de las habilidades requeridas serán distintas", { x: 8.4, y: 5.55, w: 4.0, h: 0.9, fontSize: 20 });
T(s, "Millones de empleos · Proyección al 2030 · Fuente: Foro Económico Mundial, Future of Jobs 2025", { x: 0.7, y: 6.62, w: 9.5, h: 0.3,
  fontSize: 12, color: C.text2 });

// ================================================================ 8. STANFORD VS CESIFO
s = content("Los datos", "JÓVENES", "La evidencia está dividida",
`[0:09 – 0:11] Dos estudios que se contradicen a medias. Muéstralos como dos "pruebas" en conflicto.
- Stanford (Brynjolfsson et al., versión de agosto 2026): los de 22 a 25 años en trabajos muy expuestos a IA tienen ~19% menos empleo que sus pares. La caída viene de que se contrata menos, no de despidos. Es descriptivo, no causal; el número cambió entre versiones (13% → 19%).
- CESifo (Fairlie y Wu, verano 2026): no encuentra un aumento significativo del desempleo de recién graduados frente a otros grupos. Es una foto temprana.
VERIFICA el estudio de CESifo en su fuente original antes de citarlo (lo vi en cobertura secundaria).
Mensaje: "es temprano; nadie sabe, y quien te lo asegura te vende algo".`);
card(s, 0.7, 1.95, 5.8, 3.85);
T(s, "STANFORD · ago. 2026", { x: 1.0, y: 2.15, w: 5.2, h: 0.35, fontSize: 14, bold: true, color: C.accent3, charSpacing: 3 });
T(s, "−19%", { x: 1.0, y: 2.6, w: 5.2, h: 1.2, fontSize: 72, bold: true, color: C.accent3 });
T(s, "de empleo para jóvenes de 22 a 25 años en trabajos muy expuestos a IA, frente a sus pares. Se contrata menos; no se despide.",
  { x: 1.0, y: 3.95, w: 5.2, h: 1.6, fontSize: 18 });
card(s, 6.83, 1.95, 5.8, 3.85);
T(s, "CESIFO · verano 2026", { x: 7.13, y: 2.15, w: 5.2, h: 0.35, fontSize: 14, bold: true, color: C.accent2, charSpacing: 3 });
T(s, "Sin alza", { x: 7.13, y: 2.6, w: 5.2, h: 1.2, fontSize: 60, bold: true, color: C.accent2 });
T(s, "general del desempleo de recién graduados frente a otros grupos. Es una foto temprana, no una garantía.",
  { x: 7.13, y: 3.95, w: 5.2, h: 1.6, fontSize: 18 });
T(s, "Es temprano. Y quien te lo asegura te está vendiendo algo.", { x: 0.7, y: 6.05, w: 11.93, h: 0.6, fontSize: 26, bold: true,
  color: C.accent1, align: "center" });

// ================================================================ 9. PERU
s = content("Los datos", "PERÚ", "¿Y en el Perú? Exposición, sí; certezas, pocas",
`[0:11 – 0:13] Tres cifras locales, con sus límites:
- 31% de los empleos con exposición a IA generativa (OIT y Banco Mundial, 2024): es exposición, no pérdida. La mayoría sería más productividad, no reemplazo total (entre 2% y 5% con riesgo de automatización total en la región).
- 13% de jóvenes de Lima se siente preparado para trabajar con IA (USIL, feb. 2026, 400 encuestados, solo Lima).
- 10.7% de desocupación juvenil en menores de 25 años (INEI 2025, vía Gestión): el doble del promedio nacional.
Advierte: son datos de prensa y encuestas pequeñas; no hay un estudio peruano con metodología publicada sobre egresados. Úsalos como referencia, no como verdad absoluta.`);
const stats = [["31%", "de los empleos peruanos con exposición a la IA generativa", "OIT y Banco Mundial, 2024", C.accent2],
  ["13%", "de jóvenes de Lima se siente preparado para trabajar con IA", "USIL, feb. 2026 (400 jóvenes)", C.accent3],
  ["10.7%", "de desocupación juvenil (menores de 25), el doble del promedio", "INEI 2025, vía Gestión", C.accent1]];
stats.forEach(([big, txt, src, col], i) => {
  const x = 0.7 + i * 4.05;
  const bl = i === 1;
  if (bl) cardBlue(s, x, 1.95, 3.85, 4.2); else card(s, x, 1.95, 3.85, 4.2);
  T(s, big, { x: x + 0.3, y: 2.15, w: 3.3, h: 1.3, fontSize: 64, bold: true, color: onBlue(bl, col) });
  T(s, txt, { x: x + 0.3, y: 3.6, w: 3.3, h: 1.6, fontSize: 20, color: onBlue(bl, C.text1) });
  T(s, src, { x: x + 0.3, y: 5.45, w: 3.3, h: 0.5, fontSize: 13, color: onBlueSoft(bl, C.text2) });
});
T(s, "Referencias de prensa y encuestas: úsalas como contexto, no como verdad absoluta.", { x: 0.7, y: 6.35, w: 11.9, h: 0.4,
  fontSize: 15, color: C.text2, italic: true });

// ================================================================ 10. ESCALERA
s = content("Los datos", "LA IDEA CLAVE", "El riesgo real: perder la escalera",
`[0:13 – 0:14] ESTA ES LA DIAPOSITIVA CLAVE de tu tesis.
"El riesgo no es solo que te quiten el trabajo. Es que se automaticen las tareas de entrada, esas donde antes aprendías el oficio: resumir, traducir, escribir código básico."
"Si lo básico lo hace la IA, ¿dónde aprendes lo básico?" (columna de Gestión: 'Sin escalera de aprendizaje').
Mensaje: hay que subir de otra manera: proyectos reales, verificación y criterio. Eso es lo que veremos hoy.`);
const steps = [["Resumir y\ntraducir", C.accent3], ["Código\nbásico", C.accent3], ["Análisis\nsimple", C.accent2], ["Diseñar\nsoluciones", C.accent1],
  ["Decidir y\nliderar", C.accent1]];
steps.forEach(([lab, col], i) => {
  const h = 0.9 + i * 0.75, x = 0.7 + i * 1.55;
  s.addShape(S.RECTANGLE, { x, y: 6.4 - h, w: 1.5, h, fill: { color: col, transparency: (!LIGHT && i < 2) ? 25 : 0 }, line: { type: "none" } });
  T(s, lab, { x, y: 6.4 - h, w: 1.5, h: Math.min(h, 0.9), fontSize: 15, bold: true, align: "center", valign: "middle", color: C.background1 });
});
T(s, "Aquí golpea primero la IA", { x: 0.7, y: 3.5, w: 3.1, h: 0.4, fontSize: 18, bold: true, color: C.accent3 });
T(s, "Y aquí se aprende el oficio", { x: 0.7, y: 3.9, w: 3.1, h: 0.4, fontSize: 16, color: C.text2 });
T(s, "Si lo básico lo hace la IA, ¿dónde aprendes lo básico?", { x: 8.6, y: 2.0, w: 4.0, h: 2.0, fontSize: 30, bold: true });
T(s, "Hay que subir de otra manera: proyectos reales, verificación y criterio.", { x: 8.6, y: 4.2, w: 4.0, h: 1.5, fontSize: 20, color: C.accent1 });
T(s, "Idea de la columna «Sin escalera de aprendizaje», Gestión", { x: 8.6, y: 6.3, w: 4.0, h: 0.4, fontSize: 12, color: C.text2 });

// ================================================================ 11. CAJEROS (PREGUNTA)
pres.addSection({ title: "Historias" });
s = content("Historias", "HISTORIA 1 · ADIVINA", "Los cajeros automáticos",
`[0:14 – 0:15] Pregunta al público y deja que adivinen a mano alzada:
"En 1970 empezaron los cajeros automáticos en EE. UU. ¿Hoy hay MENOS cajeros humanos, IGUAL, o MÁS?"
Cuenta las manos y pasa a la respuesta.`);
T(s, "¿Cuántos cajeros humanos creen que hay hoy en EE. UU., comparado con 1970?", { x: 0.9, y: 1.95, w: 11.5, h: 1.5, fontSize: 36, bold: true,
  align: "center", valign: "middle" });
[["Menos", C.accent3], ["Igual", C.accent2], ["Más", C.accent1]].forEach(([t, col], i) => {
  const x = 1.3 + i * 3.85;
  s.addShape(S.ROUNDED_RECTANGLE, { x, y: 3.9, w: 3.5, h: 1.9, rectRadius: 0.15, fill: { color: col }, line: { type: "none" } });
  T(s, t, { x, y: 3.9, w: 3.5, h: 1.9, fontSize: 48, bold: true, align: "center", valign: "middle", color: C.background1 });
});
T(s, "Levanta la mano por tu respuesta", { x: 0.9, y: 6.15, w: 11.5, h: 0.4, fontSize: 18, color: C.text2, align: "center" });

// ================================================================ 12. CAJEROS (RESPUESTA)
s = content("Historias", "HISTORIA 1 · LA RESPUESTA", "Se duplicaron: la tecnología cambió el trabajo",
`[0:15 – 0:16] Respuesta: MÁS. Se duplicaron, de ~250 mil a ~500 mil en 45 años (James Bessen).
Por qué: los cajeros automáticos redujeron los cajeros por sucursal (~un tercio), pero abrir sucursales se volvió más barato y las sucursales aumentaron ~40%. Los cajeros pasaron de contar billetes a atender y vender.
Ojo honesto (no lo omitas): críticas recientes sostienen que después el celular sí redujo ese empleo. Mensaje: la tecnología cambia el trabajo, y a veces tarda. No es una garantía, es una lección sobre cómo cambia.`);
s.addChart(pres.charts.BAR, [{ name: "Cajeros (miles)", labels: ["≈ 1970", "45 años después"], values: [250, 500] }],
  chartBase({ x: 0.7, y: 1.85, w: 6.4, h: 4.6, barDir: "col", chartColors: [HEX.barMuted, HEX.green], valAxisMaxVal: 600 }));
T(s, "Cajeros humanos en EE. UU. (miles)", { x: 0.7, y: 6.5, w: 6.4, h: 0.35, fontSize: 13, color: C.text2, align: "center" });
card(s, 7.6, 1.95, 5.03, 1.9);
T(s, "≈ −1/3", { x: 7.9, y: 2.05, w: 4.4, h: 0.9, fontSize: 44, bold: true, color: C.accent3 });
T(s, "cajeros por sucursal", { x: 7.9, y: 3.0, w: 4.4, h: 0.5, fontSize: 20 });
cardBlue(s, 7.6, 4.05, 5.03, 1.9);
T(s, "≈ +40%", { x: 7.9, y: 4.15, w: 4.4, h: 0.9, fontSize: 44, bold: true, color: onBlue(true, C.accent1) });
T(s, "más sucursales", { x: 7.9, y: 5.1, w: 4.4, h: 0.5, fontSize: 20, color: onBlue(true, C.text1) });
T(s, "Ojo: después el celular sí redujo el empleo bancario.", { x: 7.6, y: 6.15, w: 5.03, h: 0.6, fontSize: 15, color: C.text2, italic: true });

// ================================================================ 13. JUGADA 37
s = content("Historias", "HISTORIA 2", "La jugada 37: la máquina propuso lo impensable",
`[0:16 – 0:17] AlphaGo, 2016. Contra el campeón mundial Lee Sedol, la máquina hizo la jugada 37: los mejores jugadores del mundo la comentaron como algo "impensable", y esa jugada decidió la partida 100 movimientos después.
Lo más interesante: después los humanos aprendieron de la máquina. Magnus Carlsen, campeón mundial de ajedrez, dijo haberse influido por AlphaZero e incorporó sus ideas.
Mensaje: la IA no solo copia; puede proponer algo nuevo. Y el humano que la entiende aprende de ella. (Fuente: charla de Demis Hassabis en Cambridge.)`);
s.addShape(S.OVAL, { x: 0.95, y: 2.0, w: 3.7, h: 3.7, fill: { color: C.accent4 }, line: { color: C.accent2, width: 3 } });
T(s, "37", { x: 0.95, y: 2.0, w: 3.7, h: 3.7, fontSize: 120, bold: true, align: "center", valign: "middle", color: "FFFFFF" });
T(s, "AlphaGo vs. Lee Sedol · 2016", { x: 0.95, y: 5.85, w: 3.7, h: 0.4, fontSize: 15, color: C.text2, align: "center" });
const pts = [["La máquina propuso algo “impensable”", "Los mejores jugadores del mundo no lo vieron venir… y decidió la partida."],
  ["Los humanos aprendieron de ella", "Magnus Carlsen incorporó ideas de AlphaZero a su juego."],
  ["La IA no solo copia", "Puede proponer algo nuevo. El humano que la entiende, aprende."]];
pts.forEach(([h, d], i) => {
  const y = 2.2 + i * 1.5;
  badge(s, 5.4, y + 0.05, 0.7, String(i + 1), C.accent1, C.background1, 22);
  T(s, h, { x: 6.35, y, w: 6.3, h: 0.5, fontSize: LIGHT ? 20 : 24, bold: true, color: C.accent1 });
  T(s, d, { x: 6.35, y: y + 0.55, w: 6.3, h: 0.8, fontSize: 18 });
});

// ================================================================ 14. FRONTERA IRREGULAR
s = content("Historias", "HISTORIA 3", "La IA es brillante… y torpe a la vez",
`[0:17 – 0:18] Estudio con 758 consultores de BCG usando GPT-4 (Dell'Acqua, Mollick y otros).
- Dentro de lo que la IA domina: terminaron ~12% más tareas, ~25% más rápido y con calidad ~40% mayor.
- Fuera de esa "frontera": fueron ~19% MENOS propensos a dar la respuesta correcta; y sus argumentos sonaban igual de convincentes aunque estuvieran mal.
Mensaje: no sabes de antemano dónde está la frontera; por eso hay que verificar. (Verifica las cifras exactas en el artículo original o en el resumen de Mollick, 'One Useful Thing'.)`);
card(s, 0.7, 1.95, 5.8, 4.1);
chip(s, 1.0, 2.2, 3.2, 0.45, "DENTRO de la frontera", C.accent1, C.background1, 14);
T(s, "+12%", { x: 1.0, y: 2.9, w: 2.6, h: 0.9, fontSize: 44, bold: true, color: C.accent1 });
T(s, "más tareas", { x: 3.6, y: 3.15, w: 2.6, h: 0.5, fontSize: 18 });
T(s, "+25%", { x: 1.0, y: 3.9, w: 2.6, h: 0.9, fontSize: 44, bold: true, color: C.accent1 });
T(s, "más rápido", { x: 3.6, y: 4.15, w: 2.6, h: 0.5, fontSize: 18 });
T(s, "≈ +40%", { x: 1.0, y: 4.9, w: 2.6, h: 0.9, fontSize: 44, bold: true, color: C.accent1 });
T(s, "calidad", { x: 3.6, y: 5.15, w: 2.6, h: 0.5, fontSize: 18 });
card(s, 6.83, 1.95, 5.8, 4.1);
chip(s, 7.13, 2.2, 3.4, 0.45, "FUERA de la frontera", C.accent3, C.background1, 14);
T(s, "−19%", { x: 7.13, y: 2.9, w: 2.8, h: 0.9, fontSize: 44, bold: true, color: C.accent3 });
T(s, "menos probabilidad de acertar", { x: 10.0, y: 2.95, w: 2.5, h: 0.8, fontSize: 18 });
T(s, "Y sonaban igual de convincentes.", { x: 7.13, y: 4.1, w: 5.2, h: 0.8, fontSize: 24, bold: true });
T(s, "No sabes dónde está la frontera… por eso hay que verificar.", { x: 7.13, y: 5.0, w: 5.2, h: 0.9, fontSize: 18, color: C.text2 });
T(s, "758 consultores de BCG con GPT-4 · Dell’Acqua, Mollick et al.", { x: 0.7, y: 6.35, w: 11.9, h: 0.35, fontSize: 13, color: C.text2 });

// ================================================================ 15. SEMAFORO
pres.addSection({ title: "Tu carrera" });
s = content("Tu carrera", "DINÁMICA", "El semáforo de tareas",
`[0:18 – 0:23] DINÁMICA PRINCIPAL (5 min). Reparte tarjetas rojas, amarillas y verdes (o que levanten papeles de color o las manos).
1) Tú das una tarea y la sala vota: ROJO = la IA lo hace sola; AMARILLO = la IA ayuda y yo reviso; VERDE = solo un humano.
2) Pídeles que piensen 3 tareas de SU PROPIA carrera y las clasifiquen con el vecino (2 min).
3) Recoge 2 o 3 ejemplos al azar y discútelos.
Tareas para votar: traducir un texto simple; escribir un correo estándar; escribir una función en Python; resumir un artículo; analizar una encuesta; decidir qué producto construir; responder por un error ante un cliente; entender a una comunidad.
Mensaje: casi todo es amarillo. El valor está en revisar y decidir.`);
const tl = [["La IA lo hace sola", C.accent6, "ROJO", ["Traducir un texto simple", "Redactar un correo estándar"]],
  ["La IA ayuda, yo reviso", C.accent5, "AMARILLO", ["Escribir código", "Resumir un artículo", "Analizar una encuesta"]],
  ["Solo un humano", GREEN, "VERDE", ["Decidir qué construir", "Responder por un error", "Entender a una comunidad"]]];
tl.forEach(([h, col, tag, items], i) => {
  const x = 0.7 + i * 4.05;
  card(s, x, 1.95, 3.85, 3.95);
  s.addShape(S.OVAL, { x: x + 0.3, y: 2.15, w: 0.7, h: 0.7, fill: { color: col }, line: { type: "none" } });
  T(s, tag, { x: x + 1.15, y: 2.15, w: 2.5, h: 0.7, fontSize: 16, bold: true,
    color: tag === "AMARILLO" ? YELLOW_TXT : tag === "VERDE" ? GREEN_TXT : col, valign: "middle", charSpacing: 3 });
  T(s, h, { x: x + 0.3, y: 3.05, w: 3.3, h: 0.9, fontSize: 24, bold: true });
  T(s, items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })),
    { x: x + 0.3, y: 4.0, w: 3.3, h: 1.8, fontSize: 18, color: C.text2, paraSpaceAfter: 4 });
});
T(s, "Ahora tú: 3 tareas de TU carrera. Clasifícalas con tu vecino (2 min).", { x: 0.7, y: 6.1, w: 11.93, h: 0.5, fontSize: 24, bold: true,
  color: C.accent1, align: "center" });

// ================================================================ 16. AUTOR
s = content("Tu carrera", "LO QUE QUEDA", "Criterio, contexto y responsabilidad",
`[0:23 – 0:25] David Autor (MIT): la IA amplifica la experiencia, no la reemplaza. Su idea: valor = experiencia útil y escasa. "Si todos son expertos, nadie es experto" (traducción libre).
Matiz importante: la IA NO convierte a un principiante en experto; permite a quien ya tiene una base hacer más.
Lo que queda para los humanos: criterio (saber si está bien), contexto (Andahuaylas, el quechua, tu comunidad) y responsabilidad (alguien responde por el resultado).`);
cardBlue(s, 0.7, 1.95, 5.6, 4.2);
T(s, "“Si todos son expertos, nadie es experto.”", { x: 1.0, y: 2.25, w: 5.0, h: 2.2, fontSize: 32, bold: true, italic: true, color: onBlue(true, C.accent1), valign: "middle" });
T(s, "David Autor, economista del MIT (traducción libre)", { x: 1.0, y: 4.65, w: 5.0, h: 0.6, fontSize: 15, color: onBlueSoft(true, C.text2) });
T(s, "La IA no convierte a un principiante en experto: amplifica al que ya tiene base.", { x: 1.0, y: 5.3, w: 5.0, h: 0.8, fontSize: 16, color: onBlueSoft(true, C.text2) });
[["Criterio", "Saber si el resultado está bien"], ["Contexto", "Andahuaylas, el quechua, tu comunidad"], ["Responsabilidad", "Alguien responde por el resultado"]].forEach(([h, d], i) => {
  const y = 1.95 + i * 1.45;
  card(s, 6.7, y, 5.93, 1.3);
  T(s, h, { x: 7.0, y: y + 0.15, w: 5.4, h: 0.5, fontSize: 26, bold: true, color: C.accent1 });
  T(s, d, { x: 7.0, y: y + 0.72, w: 5.4, h: 0.45, fontSize: 18 });
});

// ================================================================ 17. DEMO HUMANO VS IA
pres.addSection({ title: "Demo y juego" });
s = content("Demo y juego", "EN VIVO", "Demo: tú contra la IA",
`[0:25 – 0:29] DEMO (4 min). Elige un voluntario.
Tarea (ajusta al público): "Arma un plan de marketing para una asociación de productores de quinua (o palta, o turismo en la laguna de Pacucha)".
1) El voluntario lo hace en 2 minutos (en papel o pizarra).
2) La IA lo hace en 30 segundos (Gemini, ChatGPT o la que uses).
3) CAZAMOS EL ERROR: antes del evento, prepara el prompt para que la IA incluya un dato o cifra dudosa (por ejemplo, un precio o una estadística inventada). Pide al público que lo encuentre.
Checklist del analista: ¿Los datos existen? ¿Las cifras cuadran? ¿Sirve para esta región?
Mensaje: sin criterio, no lo ves. La IA acelera; tú verificas.
PLAN B: ten el resultado de la IA ya generado y guardado, por si falla la conexión.`);
cardBlue(s, 0.7, 1.95, 3.7, 4.2);
chip(s, 1.0, 2.2, 1.6, 0.42, "LA TAREA", LIGHT ? "FFFFFF" : C.accent2, LIGHT ? BLUEBG : C.background1, 13);
T(s, "Plan de marketing para una asociación de productores de quinua de Apurímac", { x: 1.0, y: 2.85, w: 3.1, h: 2.6, fontSize: 22, bold: true, color: onBlue(true, C.text1) });
T(s, "(Cámbialo por palta o turismo en Pacucha)", { x: 1.0, y: 5.5, w: 3.1, h: 0.5, fontSize: 13, color: onBlueSoft(true, C.text2) });
const flow = [["1", "Un voluntario lo hace", "2 minutos"], ["2", "La IA lo hace", "30 segundos"], ["3", "Cazamos el error", "El público lo encuentra"]];
flow.forEach(([num, h, d], i) => {
  const y = 1.95 + i * 1.4;
  badge(s, 4.8, y + 0.15, 0.8, num, C.accent1, C.background1, 26);
  T(s, h, { x: 5.8, y, w: 3.4, h: 0.55, fontSize: 24, bold: true });
  T(s, d, { x: 5.8, y: y + 0.6, w: 3.4, h: 0.45, fontSize: 18, color: C.text2 });
});
card(s, 9.45, 1.95, 3.18, 4.2);
T(s, "Checklist del analista", { x: 9.7, y: 2.15, w: 2.8, h: 0.5, fontSize: 20, bold: true, color: C.accent1 });
T(s, ["¿Los datos existen?", "¿Las cifras cuadran?", "¿Sirve para esta región?"].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < 2 } })),
  { x: 9.7, y: 2.85, w: 2.8, h: 2.8, fontSize: 19, paraSpaceAfter: 10 });

// ================================================================ 18. QUECHUA
s = content("Demo y juego", "TU VENTAJA", "La IA y el quechua chanka: ¿quién pone el contexto?",
`[0:29 – 0:31] Giro local. Hay trabajo serio sobre traducción automática español–quechua chanka (la variante de esta región). Una tesis de la Universidad de Chile usó un corpus de unos 119 mil pares de oraciones. Comparado con el español o el inglés, es muy poco, y eso se nota en los errores.
Una revista de la UCM advierte que estas herramientas deben hacerse CON las comunidades, protegiendo la soberanía de los datos.
Mensaje: la IA no entiende tu contexto si tú no lo pones. Los que hablan el idioma y viven el territorio son los que pueden mejorarla y verificarla.
No digas que existe un producto de Andahuaylas: no lo encontré. Es una oportunidad, no un hecho.`);
cardBlue(s, 0.7, 1.95, 4.5, 4.2);
T(s, "119 mil", { x: 1.0, y: 2.2, w: 4.0, h: 1.2, fontSize: 60, bold: true, color: onBlue(true, C.accent1) });
T(s, "pares de oraciones español–quechua chanka para entrenar un traductor (tesis, Universidad de Chile)", { x: 1.0, y: 3.55, w: 3.9, h: 2.2, fontSize: 18, color: onBlue(true, C.text1) });
[["Pocos datos, más errores", "Frente al español o al inglés, hay muy poco material."], ["El contexto lo tienen las comunidades", "Los datos y el conocimiento viven en quienes lo hablan."],
  ["Hacerlo con las comunidades", "Con participación y soberanía de datos (UCM)."]].forEach(([h, d], i) => {
  const y = 1.95 + i * 1.4;
  badge(s, 5.6, y + 0.1, 0.65, String(i + 1), C.accent2, C.background1, 20);
  T(s, h, { x: 6.45, y, w: 6.1, h: 0.5, fontSize: 22, bold: true, color: C.accent2 });
  T(s, d, { x: 6.45, y: y + 0.52, w: 6.1, h: 0.7, fontSize: 17 });
});
T(s, "Si hablas el idioma y vives el contexto, eso es una ventaja que la IA no tiene.", { x: 0.7, y: 6.3, w: 11.93, h: 0.45, fontSize: 20, bold: true, color: C.accent1, align: "center" });

// ================================================================ 19. JUEGO: REVELACION
s = content("Demo y juego", "EL JUEGO", "Ustedes ya me dieron sus datos",
`[0:31 – 0:36] LA REVELACIÓN (la parte que más se recuerda).
"Al inicio escanearon un QR. Esos datos ya llegaron. Hacer lo que viene a continuación a mano toma una tarde: limpiar las respuestas, unirlas, hacer los gráficos, escribir los hallazgos."
1) Abre el panel en vivo (doble clic en 'Abrir_panel.url' o entra a encuesta.cincit-encuesta-ia.workers.dev/panel con tu clave). Pantalla completa con F y avanza con las flechas: son 9 pantallas, una idea por pantalla. Se actualiza solo (cada ~8 s), no hace falta F5.
2) El panel cuenta solo a alumnos; docentes y egresados salen aparte en la pantalla "¿Quiénes están en la sala?". Si hay menos de 30 respuestas, el propio panel avisa que los porcentajes dicen poco.
3) Respaldo: en el panel, botón CSV y luego 'python dashboard_asistentes.py respuestas.csv' hace lo mismo desde tu computadora.
Importante: la cifra "6 horas" es una estimación tuya, no un dato medido. Dilo como experiencia: "a mí esto me tomaba una tarde".`);
s.addChart(pres.charts.BAR, [{ name: "Minutos", labels: ["A mano (estimado)", "Con IA, hoy (estimado)"], values: [360, 20] }],
  chartBase({ x: 0.7, y: 1.9, w: 6.6, h: 3.7, barDir: "bar", chartColors: [HEX.barMuted, HEX.green], valAxisMaxVal: 560, catAxisOrientation: "maxMin",
    catAxisLabelFontSize: 16, dataLabelFormatCode: '0" min"' }));
T(s, "Tiempo estimado por el ponente, en minutos", { x: 0.7, y: 5.65, w: 6.6, h: 0.35, fontSize: 13, color: C.text2 });
T(s, "Limpiar las respuestas", { x: 7.9, y: 2.0, w: 4.7, h: 0.5, fontSize: LIGHT ? 20 : 24, bold: true });
T(s, "Unirlas y calcular porcentajes", { x: 7.9, y: 2.75, w: 4.7, h: 0.5, fontSize: LIGHT ? 20 : 24, bold: true });
T(s, "Graficar", { x: 7.9, y: 3.5, w: 4.7, h: 0.5, fontSize: LIGHT ? 20 : 24, bold: true });
T(s, "Escribir los hallazgos", { x: 7.9, y: 4.25, w: 4.7, h: 0.5, fontSize: LIGHT ? 20 : 24, bold: true });
[2.15, 2.9, 3.65, 4.4].forEach((y) => s.addShape(S.OVAL, { x: 7.5, y, w: 0.2, h: 0.2, fill: { color: C.accent1 }, line: { type: "none" } }));
T(s, "Ahora lo hacemos en vivo. Mira la pantalla.", { x: 0.7, y: 6.1, w: 11.93, h: 0.55, fontSize: 28, bold: true, color: C.accent1, align: "center" });

// ================================================================ 20. JUEGO: INSIGHTS
s = content("Demo y juego", "EL JUEGO", "La IA hizo el trabajo pesado. Tú decides qué significa",
`[0:33 – 0:36] Muestra el panel en vivo en pantalla completa. Los 3 insights están en la ÚLTIMA pantalla: léelos con la estructura observación → por qué importa → acción.
DI LA VERDAD sobre quién los redactó. Por defecto el panel los calcula con reglas fijas (plantillas con los números de la sala): no hay IA en vivo en ese camino. Solo si durante la charla le escribiste a Claude («ya están metiendo la información») y publicó los insights, la pantalla dice «Redactados por Claude con las respuestas de N alumnos»; en ese caso sí puedes decir que los redactó la IA con los datos reales. Pídeselos con unas 20 respuestas o más; si no publica nada, el panel sigue con las reglas fijas.
Compara el % de "preparados" con el 13% de la USIL (Lima), aclarando que fue otra encuesta y otra pregunta.
Luego vuelve a esta diapositiva y di:
"El sistema que armé con IA limpió, calculó y graficó. Pero no sabe si esto significa algo. ¿Quién respondió? ¿Es representativo? ¿Qué hacemos con esto? Eso lo decido yo. Esa es la tesis de esta charla, hecha con sus propios datos."
Cuidado con las limitaciones: solo respondieron quienes escanearon, es auto-reporte y n es pequeño.`);
card(s, 0.7, 1.95, 5.7, 3.4);
chip(s, 1.0, 2.2, 2.2, 0.45, "LO HIZO LA IA", C.accent2, C.background1, 14);
T(s, ["Limpiar y unir respuestas", "Calcular porcentajes", "Graficar", "Proponer 3 insights"].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < 3 } })),
  { x: 1.0, y: 2.95, w: 5.1, h: 2.3, fontSize: 22, paraSpaceAfter: 8 });
cardBlue(s, 6.93, 1.95, 5.7, 3.4);
chip(s, 7.23, 2.2, 2.2, 0.45, "LO DECIDO YO", LIGHT ? "FFFFFF" : C.accent1, LIGHT ? BLUEBG : C.background1, 14);
T(s, ["¿Es relevante?", "¿Quién respondió y quién no?", "¿Qué hacemos con esto?"].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < 2 } })),
  { x: 7.23, y: 2.95, w: 5.1, h: 2.3, fontSize: 22, paraSpaceAfter: 8, color: onBlue(true, C.text1) });
T(s, "Cuidado: solo respondieron quienes escanearon, es auto-reporte y la muestra es pequeña.", { x: 0.7, y: 5.65, w: 11.93, h: 0.5, fontSize: 18, color: C.text2, italic: true,
  align: "center" });
T(s, "Observación  →  Por qué importa  →  Acción", { x: 0.7, y: 6.15, w: 11.93, h: 0.5, fontSize: 28, bold: true, color: C.accent1, align: "center" });

// ================================================================ 21. HABITOS
pres.addSection({ title: "Qué hacer" });
s = content("Qué hacer", "TRES HÁBITOS", "Qué hacer desde mañana",
`[0:36 – 0:39] Tres hábitos, apoyados en el consejo de Demis Hassabis (DeepMind, Premio Nobel) a estudiantes de Cambridge:
- Nadie sabe qué se viene; incluso diseñar un plan de estudios de tres años es difícil porque cambia el contenido.
- Sigue valiendo aprender a programar y matemáticas: te permiten usar la IA de forma más profunda.
- La programación se abre a más gente (lenguaje natural) y los ingenieros pueden hacer mucho más.
- Entrénate para aprender información nueva muy rápido y usa estas herramientas en tu tiempo libre.
Parafrasea; no cites literal. Contrasta: es una opinión optimista de alguien del sector; por eso la combinamos con los datos de hoy.`);
[["1", "Aprende a aprender rápido", "Nadie sabe qué viene. Entrénate para dominar herramientas nuevas con rapidez."],
  ["2", "Usa la IA a diario… y verifica", "Practica todos los días, pero comprueba lo que te dice."],
  ["3", "Construye cosas", "Un proyecto real vale más que un certificado."]].forEach(([num, h, d], i) => {
  const x = 0.7 + i * 4.05;
  const bl = LIGHT && i % 2 === 0;
  if (bl) cardBlue(s, x, 1.95, 3.85, 3.9); else card(s, x, 1.95, 3.85, 3.9);
  badge(s, x + 0.3, 2.2, 0.75, num, bl ? "FFFFFF" : C.accent1, bl ? BLUEBG : C.background1, 26);
  T(s, h, { x: x + 0.3, y: 3.15, w: 3.3, h: 1.2, fontSize: 24, bold: true, color: bl ? "FFFFFF" : C.accent1 });
  T(s, d, { x: x + 0.3, y: 4.4, w: 3.3, h: 1.4, fontSize: 18, color: bl ? "FFFFFF" : C.text1 });
});
T(s, "Basado en el consejo de Demis Hassabis a estudiantes de Cambridge.",
  { x: 0.7, y: 6.1, w: 11.93, h: 0.6, fontSize: 15, color: C.text2, italic: true });

// ================================================================ 22. PLAN 30 DIAS
s = content("Qué hacer", "PLAN DE 30 DÍAS", "Tu escalera, paso a paso",
`[0:39 – 0:41] Un plan concreto para que no se vayan solo con ideas:
Semana 1: úsala todos los días para estudiar, y verifica lo que te dice.
Semana 2: construye algo pequeño con ella (una app, un análisis, un asistente).
Semana 3: súbelo (GitHub o LinkedIn) y pide feedback.
Semana 4: enséñaselo a otra persona.
Puente: "Para la semana 2, el taller de vibe coding es el primer paso."`);
[["Semana 1", "Úsala a diario para estudiar", "…y verifica lo que te dice"], ["Semana 2", "Construye algo pequeño", "Una app, un análisis, un asistente"],
  ["Semana 3", "Súbelo y pide feedback", "GitHub o LinkedIn"], ["Semana 4", "Enséñaselo a otro", "Enseñar es la mejor prueba"]].forEach(([w, h, d], i) => {
  const x = 0.7 + i * 3.04;
  const bl = LIGHT && i % 2 === 0;
  if (bl) cardBlue(s, x, 2.1, 2.81, 3.7); else card(s, x, 2.1, 2.81, 3.7);
  T(s, w, { x: x + 0.25, y: 2.3, w: 2.4, h: 0.4, fontSize: 15, bold: true, color: bl ? "DCE8FB" : C.accent1, charSpacing: 3 });
  T(s, h, { x: x + 0.25, y: 2.95, w: 2.4, h: 1.5, fontSize: 24, bold: true, color: bl ? "FFFFFF" : C.text1 });
  T(s, d, { x: x + 0.25, y: 4.6, w: 2.4, h: 1.0, fontSize: 17, color: bl ? "DCE8FB" : C.text2 });
});
T(s, "El taller de vibe coding es tu primer paso.", { x: 0.7, y: 6.1, w: 11.93, h: 0.5, fontSize: 24, bold: true, color: C.accent1, align: "center" });

// ================================================================ 23. RE-VOTO
pres.addSection({ title: "Cierre" });
s = content("Cierre", "ÚLTIMA PREGUNTA", "¿La IA te quitará el trabajo?",
`[0:41 – 0:43] Repite el voto a mano alzada con las mismas tres opciones y compara con el inicial.
"¿Cambió algo?" (Probablemente más gente pasa del 'sí' o 'no' al 'depende'; si es así, díselo: eso es justo lo que buscaba.)
Cierra con la frase: "La pregunta ya no es si la IA te quitará el trabajo, sino qué trabajo vas a hacer tú con ella."`);
[["Sí", C.accent3], ["No", C.accent1], ["No sé", C.accent2]].forEach(([t, col], i) => {
  const x = 0.7 + i * 4.05;
  s.addShape(S.ROUNDED_RECTANGLE, { x, y: 2.0, w: 3.8, h: 1.9, rectRadius: 0.15, fill: { color: col }, line: { type: "none" } });
  T(s, t, { x, y: 2.0, w: 3.8, h: 1.9, fontSize: 48, bold: true, align: "center", valign: "middle", color: C.background1 });
});
T(s, "La pregunta ya no es si la IA te quitará el trabajo, sino qué trabajo vas a hacer tú con ella.",
  { x: 1.2, y: 4.4, w: 10.9, h: 1.9, fontSize: 34, bold: true, color: C.accent1, align: "center", valign: "middle" });

// ================================================================ 24. COMPROMISO + PUENTE
s = content("Cierre", "TU PRIMER PASO", "Mi primera acción esta semana",
`[0:43 – 0:45] Reparte hojas o pide que usen una hoja de su cuaderno.
"Escriban UNA acción para esta semana. Una sola. Algo que puedan hacer con IA y verificar."
Puente al taller: "En el taller de vibe coding vamos a poner esto en práctica: van a construir su propio asistente de IA."
Cierra agradeciendo a la UNAJMA y a CINCIT.`);
cardBlue(s, 0.7, 1.95, 5.8, 4.25);
chip(s, 1.0, 2.2, 1.7, 0.42, "AHORA", LIGHT ? "FFFFFF" : C.accent1, LIGHT ? BLUEBG : C.background1, 13);
T(s, "Escríbelo en un papel", { x: 1.0, y: 2.9, w: 5.2, h: 0.7, fontSize: 32, bold: true, color: onBlue(true, C.text1) });
T(s, "Una sola acción para esta semana. Algo que puedas hacer con IA… y verificar.", { x: 1.0, y: 3.75, w: 5.2, h: 1.8, fontSize: 22, color: onBlueSoft(true, C.text2) });
outline(s, 6.83, 1.95, 5.8, 4.25, C.accent2);
chip(s, 7.13, 2.2, 1.9, 0.42, "SIGUIENTE", C.accent2, C.background1, 13);
T(s, "Taller: construye tu asistente de IA con vibe coding", { x: 7.13, y: 2.9, w: 5.2, h: 1.6, fontSize: 32, bold: true });
T(s, "Pasamos de las ideas a la práctica.", { x: 7.13, y: 4.75, w: 5.2, h: 0.8, fontSize: 22, color: C.text2 });

// ================================================================ 25. GRACIAS
s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Cierre" });
if (LIGHT) {
  panelAzul(s);
  s.addImage({ path: A(LOGO_FILE), x: 0.7, y: 0.5, w: 3.1, h: 3.1 / 2.541, altText: "Logo UNAJMA" });
} else {
s.addShape(S.OVAL, { x: 8.6, y: 2.45, w: 4.3, h: 4.3, fill: { color: C.accent4, transparency: 75 }, line: { type: "none" } });
s.addShape(S.OVAL, { x: 10.5, y: 4.55, w: 2.3, h: 2.3, fill: { color: C.accent1, transparency: 80 }, line: { type: "none" } });
s.addImage({ path: A("unajma_horizontal_blanco.png"), x: 0.7, y: 0.5, w: 3.1, h: 3.1 / 2.541, altText: "Logo UNAJMA" });
s.addImage({ path: A("cincit.png"), x: 10.3, y: 0.4, w: 2.4, h: 2.4 / 1.973, altText: "Logo CINCIT 2026" });
}
T(s, "Gracias", { x: 0.7, y: 2.4, w: 9, h: 1.5, fontSize: 80, bold: true, valign: "middle", color: LIGHT ? NAVY : C.text1 });
T(s, "La IA acelera. Tú verificas y decides.", { x: 0.7, y: 4.1, w: 10, h: 0.7, fontSize: 30, color: C.accent1 });
T(s, "Roberto Gutiérrez Brown", { x: 0.7, y: 5.5, w: 9, h: 0.5, fontSize: 24, bold: true });
T(s, "Data Analytics Manager", { x: 0.7, y: 6.0, w: 9, h: 0.4, fontSize: 18, color: C.text2 });
s.addNotes("Agradece. Recuerda que el taller continúa. Si te piden las fuentes, la siguiente diapositiva las lista.");
n++;

// ================================================================ 26. FUENTES (anexo)
s = content("Cierre", "ANEXO", "Fuentes (verifica antes de citar)",
`Anexo para quien pida las fuentes. Las cifras de prensa o encuestas pequeñas (USIL, INEI vía Gestión, CESifo vía cobertura secundaria) conviene contrastarlas en su documento original antes de citarlas en un trabajo formal.`);
const fuentes = [
  "Foro Económico Mundial · Future of Jobs Report 2025 (weforum.org)",
  "Stanford Digital Economy Lab · Brynjolfsson, Chandar y Chen · «Canaries in the Coal Mine» (digitaleconomy.stanford.edu)",
  "CESifo · Fairlie y Wu · desempleo de recién graduados, verano 2026 (cobertura: letsdatascience.com, techspot.com)",
  "Dell’Acqua, Mollick et al. · «Navigating the Jagged Technological Frontier» · resumen: oneusefulthing.org",
  "David Autor · «Applying AI to Rebuild Middle Class Jobs» · NBER",
  "James Bessen · cajeros automáticos y empleo · conversableeconomist.com",
  "OIT y Banco Mundial (2024) · IA generativa y empleo en América Latina · worldbank.org; Forbes Perú",
  "USIL · Generación Z, trabajo y futuro laboral (feb. 2026) · INEI 2025 vía Gestión · «Sin escalera de aprendizaje», Gestión",
  "Universidad de Chile · traducción neuronal español–quechua chanka · UCM · IA y preservación del quechua",
  "Demis Hassabis · conferencia en la Universidad de Cambridge (preguntas y respuestas)",
];
T(s, fuentes.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < fuentes.length - 1 } })),
  { x: 0.7, y: 1.85, w: 11.93, h: 4.9, fontSize: 16, color: C.text2, paraSpaceAfter: 9 });

// ================================================================ guardar
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK:", OUT, "diapositivas:", pres.slides.length);
})();
