// Publica en el panel los insights redactados por Claude, o los quita.
// Uso:  node herramientas/publicar_insights.mjs insights.json      (archivo con { "items": [ {t,o,p,a,c}, ... ] }, de 1 a 3)
//       node herramientas/publicar_insights.mjs --borrar            (vuelve a los insights de reglas fijas)
//       agrega  --base URL --key CLAVE  solo para pruebas locales
// Cada insight: t = título (≤75), o = observación (≤260), p = por qué importa (≤260), a = acción (≤200), c = contexto opcional (≤200).
// Los límites existen para que el texto quepa en pantalla sin cortarse.
import fs from "node:fs";
import { config, leerDatos, rol, args, tiene } from "./util.mjs";

const { base, key } = config();
const url = `${base}/api/insights?key=${encodeURIComponent(key)}`;

if (tiene("borrar")) {
  const r = await fetch(url, { method: "DELETE" });
  console.log(r.ok ? "Listo: el panel vuelve a mostrar los insights de reglas fijas." : `Falló (${r.status}): ${await r.text()}`);
  process.exit(r.ok ? 0 : 1);
}
if (!args[0]) { console.error("Falta el archivo JSON con los insights."); process.exit(1); }
const cuerpo = JSON.parse(fs.readFileSync(args[0], "utf8"));
const d = await leerDatos();
cuerpo.nAlumnos = (d.respuestas || []).filter((r) => rol(r) === "alumno").length; // lo calcula el script, no el texto
const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
const t = await r.text();
console.log(r.ok ? `Publicado (${cuerpo.items.length} insights, con ${cuerpo.nAlumnos} alumnos). El panel los muestra en unos 8 segundos.` : `Falló (${r.status}): ${t}`);
process.exit(r.ok ? 0 : 1);
