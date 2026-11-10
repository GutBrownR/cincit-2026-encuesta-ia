// SOLO PARA ENSAYOS: mete respuestas INVENTADAS en el sitio (alumnos, docentes, egresados, una maestría).
// Nunca las presentes como si fueran de la sala. Después bórralas con el comando de ACCESOS.txt.
// Uso:  node herramientas/sembrar_demo.mjs [cantidad_de_alumnos=30]   (+ --base URL para pruebas locales)
import { randomUUID } from "node:crypto";
import { config, args } from "./util.mjs";
import { PREGUNTAS, REGLAS } from "../src/config.js";

const { base } = config();
const nAlumnos = Number(args[0] || 30);
let s = 11; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const elige = (arr, w) => { let t = w.reduce((a, b) => a + b, 0) * R(), i = 0; while ((t -= w[i]) > 0) i++; return arr[i]; };
const alum = PREGUNTAS[0].op.filter((c) => c !== REGLAS.docente && !REGLAS.maestrias.includes(c) && c !== "Otra");
const pesosCarrera = [12, 7, 4, 3, 3, 2, 2, 2, 2, 1, 1];
const fre = PREGUNTAS[2].op, her = PREGUNTAS[3].op.filter((h) => h !== "Ninguna"), uso = PREGUNTAS[4].op.slice(0, 5), des = PREGUNTAS[7].op;
// Con la clave del ponente se siembra sin la entrada de un solo uso ni Turnstile (si no, el sitio las trataría como bots).
const { key } = config();
const post = (b) => fetch(`${base}/api/respuesta?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: randomUUID(), ...b }) });

function fila(carrera, ciclo) {
  const frecuencia = elige(fre, [1, 4, 11, 18]), k = fre.indexOf(frecuencia);
  const sis = /Sistemas|Informática/.test(carrera) ? 1 : 0;
  const herramientas = k === 0 ? ["Ninguna"] : [...new Set([elige(her, [10, 6, 3, 3, 2, 1, 1]), elige(her, [10, 6, 3, 3, 2, 1, 1])])];
  const usos = [...new Set([elige(uso, [8, 5, 4, 2, 2]), ...(R() < 0.6 ? [elige(uso, [8, 5, 4, 2, 2])] : []), ...(R() < 0.25 ? [elige(uso, [8, 5, 4, 2, 2])] : [])])];
  return { carrera, ciclo: String(ciclo), frecuencia, herramientas, uso: usos,
    miedo: Math.max(1, Math.min(5, Math.round(3.1 + (R() - .5) * 3 - 0.2 * (k - 2)))),
    prep: Math.max(1, Math.min(5, Math.round(2.6 + (R() - .5) * 3 + 0.9 * sis))), destino: elige(des, [4, 7, 1, 4, 3]) };
}
const lote = [];
for (let i = 0; i < nAlumnos; i++) lote.push(fila(elige(alum, pesosCarrera), 1 + Math.floor(R() * 10)));
for (let i = 0; i < 3; i++) lote.push(fila(REGLAS.docente, REGLAS.noAplica));
for (let i = 0; i < 2; i++) lote.push(fila(elige(alum, pesosCarrera), REGLAS.egresado));
lote.push(fila(REGLAS.maestrias[4], 2));
let ok = 0;
for (const f of lote) { const r = await post(f); if (r.ok) ok++; else console.log("falló una:", r.status, await r.text()); }
console.log(`Sembradas ${ok} de ${lote.length} respuestas INVENTADAS (${nAlumnos} alumnos, 3 docentes, 2 egresados, 1 maestría).`);
