// Preguntas del formulario: unica fuente de verdad (el formulario, la validacion y el CSV la usan).
// Para cambiar una opcion (por ejemplo las carreras), edita aqui y vuelve a desplegar.
// Fuentes de las opciones: https://unajma.edu.pe/facultades/ (escuelas profesionales) y https://posgrado.unajma.edu.pe/ (maestrias).
//
// Los docentes tambien pueden responder, pero el panel los cuenta aparte: las cifras del analisis son solo de alumnos.
// IMPORTANTE: estos tres textos tambien estan en public/panel.html (constantes DOCENTE, EGRESADO y NO_APLICA); deben coincidir.
export const DOCENTE = "Soy docente de la universidad";
export const NO_APLICA = "No aplica (soy docente)";
export const EGRESADO = "Ya egresé";
export const MAESTRIAS = [
  "Maestría en Ciencias de la Empresa (Gestión Pública)",
  "Maestría en Educación Intercultural (Educación y Pedagogía Intercultural)",
  "Maestría en Contabilidad (Auditoría y Control Interno)",
  "Maestría en Investigación y Docencia Universitaria",
  "Maestría en Ingeniería de Sistemas (Tecnologías de la Información y Comunicación)",
  "Maestría en Gerencia de Proyectos de Ingeniería",
];
export const MAX_CICLO_MAESTRIA = 6;
export const REGLAS = { docente: DOCENTE, noAplica: NO_APLICA, egresado: EGRESADO, maestrias: MAESTRIAS, maxCicloMaestria: MAX_CICLO_MAESTRIA };

export const PREGUNTAS = [
  { k: "carrera", t: "1. ¿Cuál es tu carrera?", tipo: "select",
    op: [DOCENTE, "Ingeniería de Sistemas", "Ingeniería Informática", "Ingeniería Agroindustrial", "Ingeniería Ambiental", "Ingeniería Civil",
      "Matemáticas y Estadística Aplicadas", "Administración de Empresas", "Contabilidad", "Enfermería", "Psicología",
      "Educación Primaria Intercultural", ...MAESTRIAS, "Otra"] },
  { k: "ciclo", t: "2. ¿En qué ciclo estás?", tipo: "select", op: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", EGRESADO, NO_APLICA] },
  { k: "frecuencia", t: "3. ¿Con qué frecuencia usas IA para estudiar o trabajar?", tipo: "radio",
    op: ["Nunca", "Alguna vez al mes", "Cada semana", "Casi todos los días"] },
  { k: "herramientas", t: "4. ¿Qué herramientas de IA usas? (marca todas las que uses)", tipo: "check",
    op: ["ChatGPT", "Gemini", "Copilot", "Claude", "Meta AI", "DeepSeek", "Otra", "Ninguna"] },
  { k: "uso", t: "5. ¿Para qué usas la IA? (marca todas las que uses)", tipo: "check",
    op: ["Estudiar o entender temas", "Programar", "Escribir o redactar", "Para conseguir trabajo", "Investigar", "Otro", "Ninguna"] },
  { k: "miedo", t: "6. Del 1 al 5, ¿cuánto temes que la IA te quite el trabajo?", tipo: "escala", a: "Nada", b: "Mucho" },
  { k: "prep", t: "7. Del 1 al 5, ¿qué tan preparado/a te sientes para trabajar con IA?", tipo: "escala", a: "Nada", b: "Mucho" },
  { k: "destino", t: "8. Cuando egreses, ¿dónde te gustaría trabajar?", tipo: "radio",
    op: ["En mi ciudad", "En otra ciudad", "En otro país", "De manera remota", "Emprender y hacer mis primeros 100K"] },
];

// Revisa que las respuestas no se contradigan. Devuelve el mensaje para la persona, o null si todo cuadra.
// (public/index.html tiene la misma logica para avisar antes de enviar.)
export function incoherencia(r) {
  const doc = r.carrera === DOCENTE;
  if (doc && r.ciclo !== NO_APLICA) return "Si eres docente, en «ciclo» elige «No aplica (soy docente)».";
  if (!doc && r.ciclo === NO_APLICA) return "«No aplica» es solo para docentes. Elige tu ciclo o «Ya egresé».";
  if (MAESTRIAS.includes(r.carrera) && typeof r.ciclo === "number" && r.ciclo > MAX_CICLO_MAESTRIA)
    return `Las maestrías tienen pocos ciclos (hasta ${MAX_CICLO_MAESTRIA}). Revisa tu ciclo.`;
  const ning = r.herramientas.includes("Ninguna");
  if (ning && r.herramientas.length > 1) return "Si marcas «Ninguna», desmarca las otras herramientas.";
  if (r.uso.includes("Ninguna") && r.uso.length > 1) return "Si marcas «Ninguna» en «para qué la usas», desmarca las otras opciones.";
  if (r.frecuencia === "Nunca" && !ning) return "Dijiste que nunca usas IA pero marcaste herramientas. Marca «Ninguna» o cambia la frecuencia.";
  if (ning && r.frecuencia !== "Nunca") return "Marcaste «Ninguna» pero dijiste que usas IA. Revisa la frecuencia o las herramientas.";
  return null;
}

// Devuelve el registro limpio o lanza un Error con el motivo.
export function validar(b) {
  const r = {};
  for (const p of PREGUNTAS) {
    const v = b[p.k];
    if (p.tipo === "check") {
      if (!Array.isArray(v) || v.length < 1 || v.length > p.op.length || !v.every((x) => p.op.includes(x))) throw new Error(p.k);
      r[p.k] = [...new Set(v)];
    } else if (p.tipo === "escala") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error(p.k);
      r[p.k] = n;
    } else {
      if (typeof v !== "string" || !p.op.includes(v)) throw new Error(p.k);
      r[p.k] = p.k === "ciclo" && /^\d+$/.test(v) ? Number(v) : v; // "1".."10" quedan como numero; "Ya egresé" y "No aplica" como texto
    }
  }
  const mal = incoherencia(r);
  if (mal) throw new Error(mal);
  return r;
}
