# La IA no te va a quitar el trabajo · CINCIT 2026

Material de la charla de **Roberto Gutiérrez Brown** en el CINCIT 2026 (Universidad Nacional José María Arguedas, Andahuaylas) y del juego interactivo que la acompaña: los asistentes responden una encuesta anónima desde el celular y un panel proyectado muestra los resultados en vivo, con tres insights al final.

## Cómo está organizado

| Carpeta | Qué contiene |
|---|---|
| [`encuesta/`](encuesta) | La aplicación: Worker de Cloudflare, formulario, panel en vivo y herramientas de línea de comandos |
| [`docs/`](docs) | Arquitectura (diagrama interactivo), guía del juego, estructura de la charla y guion del orador |
| [`charla/`](charla) | La presentación (`.pptx`), su generador, imágenes, QR y los scripts de ensayo |

## Arquitectura

Diagrama interactivo: [`docs/arquitectura_encuesta.html`](docs/arquitectura_encuesta.html) (se abre en el navegador; hecho con [Archify](https://github.com/tt-a1i/archify), su fuente editable es `docs/arquitectura_encuesta.archify.json`).

```
Alumnos ──QR──▶ Formulario ──POST──▶ Worker «encuesta» ──SQL──▶ D1 (SQLite)
                    │                    │   ▲   ▲
                    └─ token anti-bot ─▶ Turnstile ◀┘   │
Ponente ──proyecta──▶ Panel ──datos cada 8 s──▶ Worker   │
Ponente ──«procesa»──▶ Claude ──ejecuta──▶ Herramientas ─┘ (API con clave)
```

- **Formulario y panel**: páginas estáticas (`encuesta/public`) servidas por el mismo Worker.
- **Worker** (`encuesta/src/worker.js`): valida las respuestas, aplica la protección y calcula los datos.
- **D1**: guarda respuestas, insights publicados y las entradas ya usadas.
- **Herramientas** (`encuesta/herramientas`): scripts que leen las respuestas, publican insights y revisan respuestas sospechosas. Se usan con la clave del ponente.

## Reglas importantes

- **Solo alumnos cuentan.** Docentes y egresados pueden responder, pero el panel y los insights los dejan aparte.
- **Protección contra bots y repetidos**, sin pedir correo ni DNI: una entrada de un solo uso (entre 15 s y 6 h), Cloudflare Turnstile y una huella cifrada de IP y navegador. Las respuestas sin verificar se guardan pero no cuentan hasta aprobarlas.
- **Los insights son de Claude solo si se publicaron con `publicar_insights.mjs`.** Si no, el panel muestra cálculos de reglas fijas.
- **No es una encuesta representativa:** es autorreporte de quienes escanearon el QR.

## Puesta en marcha

Requisitos: Node.js 20 o superior y una cuenta de Cloudflare.

```bash
cd encuesta
npm install

# 1. Crear la base de datos y cargar el esquema
npx wrangler d1 create cincit-encuesta        # copia el database_id en wrangler.jsonc
npx wrangler d1 execute cincit-encuesta --remote --file schema.sql

# 2. Secretos (nunca se suben al repositorio)
npx wrangler secret put ADMIN_KEY            # clave del ponente
npx wrangler secret put TURNSTILE_SECRET     # secreto de Turnstile

# 3. Publicar
npx wrangler deploy
```

Pon la clave de Turnstile **pública** en `TURNSTILE_SITEKEY` dentro de `wrangler.jsonc`.

Para desarrollo local crea `encuesta/.dev.vars` (está en `.gitignore`):

```
ADMIN_KEY=una-clave-de-prueba
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

La segunda línea es el secreto de prueba de Turnstile, que siempre aprueba. Luego `npx wrangler dev --local`.

Las herramientas leen la dirección y la clave de `encuesta/ACCESOS.txt` (copia `ACCESOS.example.txt` y complétalo; el archivo real está en `.gitignore`).

## Herramientas

```bash
cd encuesta
node herramientas/leer_respuestas.mjs            # resumen solo de alumnos
node herramientas/publicar_insights.mjs insights.json   # publica 3 insights (o --borrar)
node herramientas/revisar.mjs                    # informe de sin verificar y duplicadas
node herramientas/sembrar_demo.mjs 30            # datos INVENTADOS, solo para ensayar
```

## Privacidad

No se pide nombre, correo, teléfono ni DNI. Cada respuesta lleva un identificador aleatorio y la hora. Este repositorio **no incluye respuestas reales**, claves ni archivos de acceso.

## Más documentación

- [`docs/Guia_del_juego.md`](docs/Guia_del_juego.md): cómo usar el juego antes y durante la charla.
- [`docs/Estructura_charla.md`](docs/Estructura_charla.md) y [`docs/Guion_del_orador.md`](docs/Guion_del_orador.md): contenido de la charla.

## Limitaciones conocidas

- Los scripts de `charla/juego/` (`dashboard_asistentes.py`, `generar_respuestas_demo.py`) son de una versión anterior del formulario y no reflejan las preguntas actuales.
- `charla/build/build_deck.js` regenera la presentación; la versión final es el `.pptx` de `charla/`.
