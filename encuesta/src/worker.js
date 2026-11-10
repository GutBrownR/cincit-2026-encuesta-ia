// Encuesta CINCIT 2026 en Cloudflare: un Worker (API) + archivos estaticos + base D1 (SQLite).
// Rutas: /api/config, /api/token, /api/respuesta, /api/datos, /api/insights, /api/revisar, /api/logo.
//
// Proteccion contra respuestas repetidas / bots (tres capas):
//  1. Entrada de un solo uso: cada vez que se abre el formulario el servidor firma una "entrada" (token) que vale una sola vez
//     y solo despues de MIN_ESPERA_MS. Sin entrada valida no se guarda nada.
//  2. Turnstile (Cloudflare): el celular prueba que es una persona. Las respuestas sin esa prueba se guardan marcadas como
//     "sin verificar" (v = 'no') y NO entran al analisis ni al contador; el ponente puede aprobarlas o borrarlas.
//  3. Huella (fp): hash secreto de IP + navegador, solo para detectar grupos raros despues. No sirve para bloquear.
// Una respuesta con v = 'ok' (verificada), 'admin' (puesta por el ponente) o 'revisada' (aprobada) cuenta; v = 'no' no cuenta.
import { PREGUNTAS, REGLAS, validar } from "./config.js";

const enc = new TextEncoder();
const cab = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" };
const J = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: cab });
const MIN_ESPERA_MS = 15000;          // una persona no llena 8 preguntas en menos de esto
const MAX_EDAD_MS = 6 * 3600 * 1000;  // la entrada caduca a las 6 horas
const ID_RE = /^[a-f0-9-]{36}$/;

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
function igual(a, b) { const x = enc.encode(a), y = enc.encode(b); return x.byteLength === y.byteLength && crypto.subtle.timingSafeEqual(x, y); }
function claveValida(k, esperada) {
  esperada = String(esperada || "").trim(); // tolera saltos de linea o marcas invisibles al guardar el secreto
  if (!esperada) return false;
  return igual(String(k || "").trim(), esperada);
}
async function hmac(clave, texto) {
  const k = await crypto.subtle.importKey("raw", enc.encode(clave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(texto)));
}
async function nuevoToken(env) {
  const ts = Date.now(), nonce = hex(crypto.getRandomValues(new Uint8Array(12)));
  return `${ts}.${nonce}.${await hmac(String(env.ADMIN_KEY).trim(), ts + "." + nonce)}`;
}
async function leerToken(env, tk) {
  const m = /^(\d{13})\.([a-f0-9]{24})\.([a-f0-9]{64})$/.exec(String(tk || ""));
  if (!m || !(await igualHmac(env, m))) return null;
  return { ts: Number(m[1]), nonce: m[2] };
}
async function igualHmac(env, m) { return igual(await hmac(String(env.ADMIN_KEY).trim(), m[1] + "." + m[2]), m[3]); }
async function huella(req, env) {
  const ip = req.headers.get("cf-connecting-ip") || "", ua = req.headers.get("user-agent") || "";
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(`${ip}|${ua}|${String(env.ADMIN_KEY).trim()}`))).slice(0, 12);
}
// Devuelve "ok" o "no". Si no hay secreto configurado, o si el servicio de verificacion falla, no castigamos a las personas.
async function verificarTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return "ok";
  if (typeof token !== "string" || !token || token.length > 2048) return "no";
  try {
    const f = new FormData();
    f.append("secret", String(env.TURNSTILE_SECRET).trim()); f.append("response", token); if (ip) f.append("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: f, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return "ok";
    return (await r.json()).success ? "ok" : "no";
  } catch { return "ok"; }
}

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

async function filas(env, todas) {
  const { results } = await env.DB.prepare(`SELECT data, v, fp FROM respuestas ${todas ? "" : "WHERE v <> 'no'"} ORDER BY ts ASC`).all();
  return results.map((r) => (todas ? { ...JSON.parse(r.data), v: r.v, fp: r.fp } : JSON.parse(r.data)));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "");
    const q = url.searchParams;
    try {
      if (p === "/api/config" && req.method === "GET")
        return J({ preguntas: PREGUNTAS, reglas: REGLAS, tk: await nuevoToken(env), ts: env.TURNSTILE_SITEKEY || "" });
      if (p === "/api/token" && req.method === "GET") return J({ tk: await nuevoToken(env) });

      if (p === "/api/logo" && req.method === "GET") {
        const n = String(q.get("n") || "").replace(/[^a-z0-9_-]/gi, "");
        return n ? Response.redirect(`${url.origin}/img/${n}.png`, 302) : new Response(null, { status: 404 });
      }

      if (p === "/api/respuesta") {
        if (req.method !== "POST") return J({ error: "Método no permitido" }, 405);
        const texto = await req.text();
        if (texto.length > 5000) return J({ error: "Datos inválidos" }, 413);
        let b;
        try { b = JSON.parse(texto); } catch { return J({ error: "Datos inválidos" }, 400); }
        if (!b || typeof b !== "object") return J({ error: "Datos inválidos" }, 400);
        if (b.web) return J({ ok: true }); // trampa para bots: los humanos no ven este campo
        if (typeof b.id !== "string" || !ID_RE.test(b.id)) return J({ error: "Identificador inválido" }, 400);
        let registro;
        try { registro = { id: b.id, ts: new Date().toISOString(), ...validar(b) }; }
        catch (e) { return J({ error: "Respuesta inválida: " + e.message }, 400); }

        // El ponente (con su clave) puede sembrar respuestas sin entrada ni verificacion: se usa para ensayos y pruebas.
        let v = "admin";
        if (!claveValida(q.get("key"), env.ADMIN_KEY)) {
          const t = await leerToken(env, b.tk);
          if (!t) return J({ error: "Recarga la página para responder.", codigo: "token" }, 400);
          const edad = Date.now() - t.ts;
          if (edad > MAX_EDAD_MS) return J({ error: "La página estuvo abierta mucho tiempo. Recárgala.", codigo: "token" }, 400);
          if (edad < MIN_ESPERA_MS) return J({ error: "Un momento…", codigo: "espera", espera: Math.ceil((MIN_ESPERA_MS - edad) / 1000) }, 425);
          try { await env.DB.prepare("INSERT INTO usados (nonce, ts) VALUES (?1, ?2)").bind(t.nonce, registro.ts).run(); }
          catch { return J({ error: "Esa sesión ya se usó. Recarga la página.", codigo: "token" }, 400); }
          v = await verificarTurnstile(env, b.cf, req.headers.get("cf-connecting-ip"));
        }
        try {
          await env.DB.prepare("INSERT INTO respuestas (id, ts, data, v, fp) VALUES (?1, ?2, ?3, ?4, ?5)")
            .bind(registro.id, registro.ts, JSON.stringify(registro), v, await huella(req, env)).run();
        } catch (e) {
          if (/UNIQUE|constraint/i.test(String(e && e.message))) return J({ error: "Ya respondiste" }, 409);
          console.error("insert falló:", e);
          return J({ error: "No se pudo guardar" }, 500);
        }
        return J({ ok: true }); // no se le dice a nadie si quedo verificada o no
      }

      // Insights redactados por Claude: los publica el ponente (con su clave) y el panel los muestra en vez de las reglas fijas.
      if (p === "/api/insights") {
        if (!claveValida(q.get("key"), env.ADMIN_KEY)) return J({ error: "Clave incorrecta" }, 401);
        if (req.method === "DELETE") { await env.DB.prepare("DELETE FROM insights").run(); return J({ ok: true }); }
        if (req.method !== "POST") return J({ error: "Método no permitido" }, 405);
        const texto = await req.text();
        if (texto.length > 8000) return J({ error: "Demasiado largo" }, 413);
        let b;
        try { b = JSON.parse(texto); } catch { return J({ error: "JSON inválido" }, 400); }
        const items = b && b.items;
        const campo = (v, max, obligatorio) => typeof v === "string" && v.trim().length <= max && (!obligatorio || v.trim().length > 0);
        if (!Array.isArray(items) || items.length < 1 || items.length > 3
          || !items.every((x) => x && campo(x.t, 75, true) && campo(x.o, 260, true) && campo(x.p, 260, true) && campo(x.a, 200, true) && (x.c === undefined || campo(x.c, 200, false))))
          return J({ error: "Formato inválido: 1 a 3 insights con t (≤75), o (≤260), p (≤260), a (≤200) y c opcional (≤200 caracteres)" }, 400);
        const limpio = { items: items.map((x) => ({ t: x.t.trim(), o: x.o.trim(), p: x.p.trim(), a: x.a.trim(), c: (x.c || "").trim() })),
          nAlumnos: Number.isInteger(b.nAlumnos) && b.nAlumnos >= 0 ? b.nAlumnos : null };
        const ts = new Date().toISOString();
        await env.DB.prepare("INSERT OR REPLACE INTO insights (id, data, ts) VALUES (1, ?1, ?2)").bind(JSON.stringify(limpio), ts).run();
        return J({ ok: true, ts });
      }

      // Revision de respuestas sin verificar o sospechosas: aprobar (pasan a contar) o borrar. Solo con clave.
      if (p === "/api/revisar") {
        if (!claveValida(q.get("key"), env.ADMIN_KEY)) return J({ error: "Clave incorrecta" }, 401);
        if (req.method !== "POST") return J({ error: "Método no permitido" }, 405);
        let b;
        try { b = JSON.parse(await req.text()); } catch { return J({ error: "JSON inválido" }, 400); }
        if (!b || !["aprobar", "borrar"].includes(b.accion)) return J({ error: "accion debe ser aprobar o borrar" }, 400);
        const ids = Array.isArray(b.ids) ? b.ids.filter((s) => typeof s === "string" && ID_RE.test(s)).slice(0, 400) : [];
        if (!ids.length && !b.sinVerificar) return J({ error: "Indica ids o sinVerificar: true" }, 400);
        const donde = []; const args = [];
        if (ids.length) { donde.push(`id IN (${ids.map((_, i) => "?" + (i + 1)).join(",")})`); args.push(...ids); }
        if (b.sinVerificar) donde.push("v = 'no'");
        const w = donde.join(" OR ");
        const r = b.accion === "aprobar"
          ? await env.DB.prepare(`UPDATE respuestas SET v = 'revisada' WHERE v = 'no' AND (${w})`).bind(...args).run()
          : await env.DB.prepare(`DELETE FROM respuestas WHERE ${w}`).bind(...args).run();
        return J({ ok: true, accion: b.accion, afectadas: r.meta.changes });
      }

      if (p === "/api/datos") {
        // Conteo publico (solo numeros): respuestas que cuentan, las que estan sin verificar, y la "version" de los insights.
        if (req.method === "GET" && q.get("conteo")) {
          const r = await env.DB.prepare("SELECT SUM(v <> 'no') AS n, SUM(v = 'no') AS sv FROM respuestas").first();
          const v = await env.DB.prepare("SELECT ts FROM insights WHERE id = 1").first().catch(() => null);
          return J({ n: r.n || 0, sv: r.sv || 0, v: v ? v.ts : "" });
        }
        if (!claveValida(q.get("key"), env.ADMIN_KEY)) return J({ error: "Clave incorrecta" }, 401);

        if (req.method === "DELETE") {
          if (q.get("confirmar") !== "SI") return J({ error: "Agrega confirmar=SI" }, 400);
          const r = await env.DB.prepare("DELETE FROM respuestas").run();
          await env.DB.prepare("DELETE FROM insights").run().catch(() => null); // los insights viejos no deben sobrevivir a un borrado
          await env.DB.prepare("DELETE FROM usados").run().catch(() => null);
          return J({ borradas: r.meta.changes });
        }
        if (req.method !== "GET") return J({ error: "Método no permitido" }, 405);

        const datos = await filas(env, q.get("todas") === "1");
        if (q.get("format") === "csv") {
          const solo = q.get("todas") === "1" ? datos : datos;
          const head = ["Marca temporal", ...PREGUNTAS.map((x) => x.t)];
          const f = solo.map((d) => [d.ts, ...PREGUNTAS.map((x) => (Array.isArray(d[x.k]) ? d[x.k].join(", ") : d[x.k]))]);
          const csv = [head, ...f].map((x) => x.map(esc).join(",")).join("\r\n");
          return new Response("﻿" + csv, {
            status: 200,
            headers: { ...cab, "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="respuestas.csv"' },
          });
        }
        const sv = await env.DB.prepare("SELECT COUNT(*) AS n FROM respuestas WHERE v = 'no'").first();
        const ins = await env.DB.prepare("SELECT data, ts FROM insights WHERE id = 1").first().catch(() => null);
        return J({ n: datos.length, sinVerificar: sv.n, respuestas: datos, insights: ins ? { ...JSON.parse(ins.data), ts: ins.ts } : null });
      }

      return J({ error: "No encontrado" }, 404);
    } catch (e) {
      console.error("worker falló:", e);
      return J({ error: "Error del servidor" }, 500);
    }
  },
};
