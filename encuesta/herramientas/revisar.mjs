// Revisa respuestas sin verificar o sospechosas, y las aprueba o borra. Solo con la clave del ponente.
// Uso:  node herramientas/revisar.mjs                         -> informe (no cambia nada)
//       node herramientas/revisar.mjs aprobar --sin-verificar  -> las sin verificar pasan a contar
//       node herramientas/revisar.mjs borrar --sin-verificar   -> borra las sin verificar
//       node herramientas/revisar.mjs borrar --duplicadas      -> borra las copias idénticas (deja la primera de cada grupo de 3 o más)
//       node herramientas/revisar.mjs borrar --ids id1,id2     -> borra esas respuestas
//       (pruebas locales: agrega --base URL --key CLAVE)
import { config, args, tiene } from "./util.mjs";

const { base, key } = config();
const llamar = async (ruta, opciones) => {
  const r = await fetch(`${base}${ruta}${ruta.includes("?") ? "&" : "?"}key=${encodeURIComponent(key)}`, opciones);
  if (r.status === 401) throw new Error("La clave no coincide con la del servidor (401).");
  return r.json();
};
const idx = process.argv.indexOf("--ids");
const ids = idx > 0 ? (process.argv[idx + 1] || "").split(",").filter(Boolean) : [];

async function actuar(accion, cuerpo) {
  const r = await llamar("/api/revisar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accion, ...cuerpo }) });
  console.log(r.ok ? `Listo: ${r.afectadas} respuesta(s) ${accion === "aprobar" ? "aprobadas (ahora cuentan)" : "borradas"}.` : "Falló: " + JSON.stringify(r));
}

const d = await llamar("/api/datos?todas=1");
const todas = d.respuestas || [];
const sinVer = todas.filter((r) => r.v === "no");
const limpia = (r) => JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => !["id", "ts", "v", "fp"].includes(k))));
const grupos = new Map();
todas.forEach((r) => { const k = limpia(r); grupos.set(k, [...(grupos.get(k) || []), r]); });
const identicas = [...grupos.values()].filter((g) => g.length >= 3);
const copias = identicas.flatMap((g) => g.slice(1)); // se conserva la primera de cada grupo

if (args[0] === "aprobar" && tiene("sin-verificar")) await actuar("aprobar", { sinVerificar: true });
else if (args[0] === "borrar" && tiene("sin-verificar")) await actuar("borrar", { sinVerificar: true });
else if (args[0] === "borrar" && tiene("duplicadas")) await actuar("borrar", { ids: copias.map((r) => r.id) });
else if (args[0] === "borrar" && ids.length) await actuar("borrar", { ids });
else {
  console.log(`RESPUESTAS: ${todas.length} guardadas → ${todas.length - sinVer.length} cuentan | ${sinVer.length} sin verificar (no cuentan)`);
  // Ráfagas: muchas respuestas de la misma huella en pocos segundos (en el Wi-Fi del lugar todos comparten IP, así que se mira el ritmo)
  const porHuella = new Map();
  todas.forEach((r) => porHuella.set(r.fp, [...(porHuella.get(r.fp) || []), r]));
  const rafagas = [];
  for (const [fp, g] of porHuella) {
    const t = g.map((r) => Date.parse(r.ts)).sort((a, b) => a - b);
    for (let i = 0; i + 9 < t.length; i++) if (t[i + 9] - t[i] <= 30000) { rafagas.push({ fp, n: g.length }); break; } // 10 o más en 30 s desde la misma huella
  }
  console.log(`\nSin verificar (${sinVer.length}):`);
  sinVer.slice(0, 15).forEach((r) => console.log(`  ${r.id}  ${r.ts.slice(11, 19)}  ${r.carrera}  huella ${r.fp}`));
  if (sinVer.length > 15) console.log(`  … y ${sinVer.length - 15} más`);
  console.log(`\nGrupos de respuestas IDÉNTICAS (3 o más): ${identicas.length}${identicas.length ? " → " + identicas.map((g) => g.length + " iguales").join(", ") + `; se podrían borrar ${copias.length} copias (--duplicadas)` : ""}`);
  console.log(`Ráfagas (10 o más en 30 s desde la misma huella): ${rafagas.length}${rafagas.length ? " → " + rafagas.map((x) => `huella ${x.fp} (${x.n} en total)`).join(", ") : ""}`);
  console.log("\nSi las sin verificar parecen personas normales (distintas entre sí, repartidas en el tiempo), apruébalas con: aprobar --sin-verificar.");
  console.log("Si son muchas, casi iguales o seguidas, bórralas con: borrar --sin-verificar. No se cambia nada sin pedirlo.");
}
