// Utilidades comunes de las herramientas para que Claude lea las respuestas y publique insights.
// La clave se lee de ../ACCESOS.txt (o de --key); nunca se imprime.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const DOCENTE = "Soy docente de la universidad";
export const EGRESADO = "Ya egresé";
export const rol = (r) => (r.carrera === DOCENTE ? "docente" : r.ciclo === EGRESADO ? "egresado" : "alumno");

function arg(nombre) { const i = process.argv.indexOf("--" + nombre); return i > 0 ? process.argv[i + 1] : undefined; }
export const args = process.argv.slice(2).filter((x, i, a) => !x.startsWith("--") && !(i > 0 && a[i - 1].startsWith("--")));
export const tiene = (nombre) => process.argv.includes("--" + nombre);

export function config() {
  let base = arg("base"), key = arg("key");
  if (!base || !key) {
    const t = fs.readFileSync(path.join(aqui, "..", "ACCESOS.txt"), "utf8");
    base = base || (t.match(/Formulario[^\n]*\n\s*(https?:\/\/\S+)/) || [])[1];
    key = key || (t.match(/Clave de administrador:\s*(\S+)/) || [])[1];
  }
  if (!base || !key) throw new Error("No encuentro la dirección o la clave (revisa ACCESOS.txt).");
  return { base: base.replace(/\/+$/, ""), key };
}

export async function leerDatos() {
  const { base, key } = config();
  const r = await fetch(`${base}/api/datos?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (r.status === 401) throw new Error("La clave no coincide con la del servidor (401).");
  if (!r.ok) throw new Error("El servidor respondió " + r.status);
  return r.json();
}
