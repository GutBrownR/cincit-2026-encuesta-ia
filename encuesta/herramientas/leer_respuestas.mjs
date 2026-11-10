// Lee las respuestas del sitio y imprime un resumen compacto SOLO de alumnos (docentes y egresados se cuentan aparte).
// Uso:  node herramientas/leer_respuestas.mjs            (usa ACCESOS.txt)
//       node herramientas/leer_respuestas.mjs --base http://localhost:8787 --key CLAVE   (pruebas locales)
import { leerDatos, rol } from "./util.mjs";

const d = await leerDatos();
const todos = d.respuestas || [];
const a = todos.filter((r) => rol(r) === "alumno");
const nDoc = todos.filter((r) => rol(r) === "docente").length, nEgr = todos.filter((r) => rol(r) === "egresado").length;
const n = a.length;
const pct = (x) => (n ? Math.round(100 * x / n) + "%" : "-");
const media = (v) => (v.length ? (v.reduce((s, x) => s + x, 0) / v.length).toFixed(2) : "-");
const cuenta = (campo, lista = a) => {
  const m = new Map();
  lista.forEach((r) => (Array.isArray(r[campo]) ? r[campo] : [r[campo]]).forEach((v) => m.set(v, (m.get(v) || 0) + 1)));
  return [...m.entries()].sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}: ${v} (${pct(v)})`).join(" | ");
};
const FREQ = ["Nunca", "Alguna vez al mes", "Cada semana", "Casi todos los días"];

console.log(`RESPUESTAS TOTALES (verificadas): ${todos.length}  →  alumnos: ${n} | docentes: ${nDoc} | egresados: ${nEgr}`);
if (d.sinVerificar) console.log(`⚠ Hay ${d.sinVerificar} respuesta(s) SIN VERIFICAR que no cuentan. Corre: node herramientas/revisar.mjs`);
console.log(`(Todo lo de abajo es SOLO de los ${n} alumnos.)`);
if (!n) process.exit(0);
console.log(`\nCarrera/programa: ${cuenta("carrera")}`);
console.log(`Ciclo: ${cuenta("ciclo")}`);
console.log(`Frecuencia de uso de IA: ${FREQ.map((f) => `${f}: ${a.filter((r) => r.frecuencia === f).length}`).join(" | ")}`);
console.log(`  → cada semana o más: ${pct(a.filter((r) => FREQ.indexOf(r.frecuencia) >= 2).length)} | casi todos los días: ${pct(a.filter((r) => FREQ.indexOf(r.frecuencia) === 3).length)} | nunca: ${pct(a.filter((r) => r.frecuencia === "Nunca").length)}`);
console.log(`Herramientas: ${cuenta("herramientas")}`);
console.log(`Para qué la usan: ${cuenta("uso")}`);
console.log(`Dónde quieren trabajar: ${cuenta("destino")}`);
const dist = (c) => [1, 2, 3, 4, 5].map((v) => `${v}:${a.filter((r) => r[c] === v).length}`).join(" ");
console.log(`\nMiedo a perder el trabajo (1-5): promedio ${media(a.map((r) => r.miedo))} | ${dist("miedo")} | 4-5: ${pct(a.filter((r) => r.miedo >= 4).length)}`);
console.log(`Preparación para trabajar con IA (1-5): promedio ${media(a.map((r) => r.prep))} | ${dist("prep")} | 4-5: ${pct(a.filter((r) => r.prep >= 4).length)}`);

console.log("\nCRUCES (útiles para los insights; ojo con grupos de menos de 5 personas):");
const porCarrera = {};
a.forEach((r) => (porCarrera[r.carrera] = porCarrera[r.carrera] || []).push(r));
for (const [c, v] of Object.entries(porCarrera).sort((x, y) => y[1].length - x[1].length)) {
  const semanal = Math.round(100 * v.filter((r) => FREQ.indexOf(r.frecuencia) >= 2).length / v.length);
  console.log(`  ${c} (n=${v.length}): preparación ${media(v.map((r) => r.prep))} | miedo ${media(v.map((r) => r.miedo))} | usa cada semana o más ${semanal}%`);
}
const grupo = (nombre, f) => { const v = a.filter(f); console.log(`  ${nombre} (n=${v.length}): preparación ${media(v.map((r) => r.prep))} | miedo ${media(v.map((r) => r.miedo))}`); };
grupo("Ciclos 1-4", (r) => typeof r.ciclo === "number" && r.ciclo <= 4);
grupo("Ciclos 5-6", (r) => r.ciclo === 5 || r.ciclo === 6);
grupo("Ciclos 7-10", (r) => typeof r.ciclo === "number" && r.ciclo >= 7);
grupo("Usan casi todos los días", (r) => r.frecuencia === "Casi todos los días");
grupo("Usan cada semana", (r) => r.frecuencia === "Cada semana");
grupo("Usan poco (nunca o alguna vez al mes)", (r) => FREQ.indexOf(r.frecuencia) <= 1);
const ins = d.insights;
console.log(`\nInsights publicados ahora: ${ins ? `sí (${ins.ts}, con ${ins.nAlumnos ?? "?"} alumnos)` : "ninguno (el panel muestra los de reglas fijas)"}`);
