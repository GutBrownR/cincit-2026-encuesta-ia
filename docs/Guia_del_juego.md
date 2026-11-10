# El juego del QR: guía rápida

**Qué es:** una página web propia (sin Google) donde los asistentes responden **8 preguntas anónimas** desde el celular. A los ~30 minutos abres un **panel en vivo**, hecho para proyectarse: primero los datos clave, luego los 3 insights y después un gráfico por pantalla. Todo se calcula en el momento.

| Qué | Dónde |
|---|---|
| Formulario (lo que lleva el QR) | https://encuesta.cincit-encuesta-ia.workers.dev |
| Panel en vivo (solo tú) | https://encuesta.cincit-encuesta-ia.workers.dev/panel |
| Clave y atajos | `encuesta/ACCESOS.txt` (local, no se sube a GitHub) |
| Código de la página | carpeta `../encuesta` (Cloudflare: un Worker + base de datos D1; para publicar de nuevo: `npx.cmd wrangler deploy`) |

> Ahora corre en **Cloudflare** (cuenta `zgutbrown@gmail.com`). Ya no depende del almacenamiento de Vercel, que tenía un límite de operaciones al mes. Cloudflare permite 100 mil escrituras y 5 millones de lecturas **al día** gratis, así que 100 personas y un panel abierto no se acercan al tope.
> La copia vieja en Vercel (`cincit-encuesta-ia.vercel.app`) sigue en pie solo como respaldo; su clave se compartió en un chat, así que no la uses.

## Cómo funciona
1. El QR de la diapositiva 2 abre el formulario. Cada respuesta se guarda en la base D1 de tu cuenta de Cloudflare.
2. El panel lee las respuestas y grafica. Se actualiza solo (revisa cada 8 segundos si llegó alguien nuevo) y **no hace falta F5**: si entra gente mientras expones, los números cambian sin moverte de la pantalla en la que estás.
3. Respaldo: el botón **CSV** del panel baja las respuestas, y `python dashboard_asistentes.py respuestas.csv` produce el mismo análisis desde tu computadora.

## Cómo se maneja el panel de presentación
Son 9 pantallas, una idea por pantalla: datos clave, tres insights, carrera, ciclo, frecuencia, herramientas, miedo vs. preparación, para qué la usan y dónde quieren trabajar.

| Acción | Tecla |
|---|---|
| Siguiente pantalla | `→`, `↓`, `Espacio`, `Enter` o `Re Pág` |
| Pantalla anterior | `←`, `↑`, `Retroceso` o `Av Pág` |
| Ir al inicio / al final | `Inicio` / `Fin` |
| Pantalla completa | `F` (o `F11`) |
| Desde el celular o tablet | deslizar el dedo, o tocar los puntos de abajo |

Arriba a la derecha hay botones discretos: **Pantalla completa**, **Actualizar solo: sí/no** (si lo apagas, el panel queda congelado) y **CSV**. Si hay menos de 30 respuestas, el panel avisa que los porcentajes dicen poco.

## Insights: las reglas fijas y los que redacta Claude
- **Por defecto** el panel calcula los 3 insights con **reglas fijas** (plantillas con los números de la sala). **No hay IA en vivo** en ese camino. Los títulos cambian según los datos y, si hay pocos, el panel dice que aún no alcanzan para comparar.
- **Si quieres que Claude los redacte durante la charla**, abre esta sesión de Claude Code y escríbele, por ejemplo: «ya están metiendo la información». Claude corre `node herramientas/leer_respuestas.mjs` (lee las respuestas y resume solo a los alumnos), redacta 3 insights con los números reales y los publica con `node herramientas/publicar_insights.mjs`. En unos 8 segundos aparecen en la última pantalla del panel, con la nota «Redactados por Claude con las respuestas de N alumnos». Para actualizarlos con más gente, escríbele «actualiza».
- **Pídelos cuando ya haya unas 20 respuestas o más.** Claude tarda uno o dos minutos. Si no publica nada, el panel sigue con las reglas fijas: nunca queda vacío.
- Para quitarlos y volver a las reglas: `node herramientas/publicar_insights.mjs --borrar` (desde la carpeta `web-cf`).
- **En la charla di la verdad:** los insights de la pantalla son de Claude solo si los publicaste con este paso; si no, son cálculos automáticos del panel.

## Docentes, egresados y alumnos
La primera opción de «carrera» es **«Soy docente de la universidad»**; en «ciclo» hay **«Ya egresé»** y **«No aplica (soy docente)»**. Docentes y egresados pueden responder, pero el panel los cuenta **aparte**: las cifras y los insights son **solo de alumnos**. La pantalla «¿Quiénes están en la sala?» muestra a todos, con una barra de «Docentes». El formulario avisa y no deja enviar respuestas que se contradicen (docente con ciclo 5, «Nunca uso IA» pero marcó herramientas, maestría en ciclo 9, etc.).

## Protección contra respuestas repetidas y bots
Tres capas, sin pedir correo ni DNI:
1. **Entrada de un solo uso:** cada vez que alguien abre el formulario recibe una entrada que vale una sola vez y solo después de ~15 segundos. Sin entrada válida el servidor no guarda nada. Si la persona envía muy rápido, el formulario espera y reintenta solo.
2. **Turnstile (Cloudflare):** prueba invisible de que es una persona (el alumno normalmente no ve nada; a veces aparece una casilla). Las respuestas **sin esa prueba se guardan como «sin verificar» y NO cuentan**: no entran al análisis ni al contador. El panel muestra abajo «N sin verificar (no cuentan)».
3. **Huella cifrada** de IP y navegador de cada respuesta, solo para detectar grupos raros. No bloquea a nadie (en el Wi-Fi del lugar todos comparten IP).

**Qué hacer mañana si el panel dice «N sin verificar»:** escríbele a Claude «revisa las sin verificar». Corre `node herramientas/revisar.mjs` (informe: cuántas hay, si son idénticas o llegaron en ráfaga). Si parecen personas normales, `node herramientas/revisar.mjs aprobar --sin-verificar` las hace contar; si son bots, `borrar --sin-verificar`. También `borrar --duplicadas` quita copias idénticas.
**Si Turnstile molestara a los alumnos reales** (muchas «sin verificar» legítimas), se apaga con `npx.cmd wrangler secret delete TURNSTILE_SECRET` y publicar de nuevo (desde `web-cf`); el sitio vuelve a aceptar sin esa prueba.
**Lo que no se puede evitar:** alguien con varios celulares reales, uno por uno, sigue pudiendo responder varias veces. Sin identificar a la persona no hay forma de impedirlo.

## Las carreras del formulario
Ingeniería de Sistemas, Ingeniería Informática, Ingeniería Agroindustrial, Ingeniería Ambiental, Ingeniería Civil, Matemáticas y Estadística Aplicadas, Administración de Empresas, Contabilidad, Enfermería, Psicología, Educación Primaria Intercultural, las seis maestrías de la Escuela de Posgrado (según posgrado.unajma.edu.pe) y Otra. Para cambiarlas edita `../encuesta/src/config.js` y publica de nuevo (o pídeme que lo haga).

## Antes del evento (hazlo 1 o 2 días antes)
- [ ] Abre el formulario desde tu celular con **datos móviles** (no con tu Wi-Fi) y envía una respuesta de prueba.
- [ ] Abre el panel (`Abrir_panel.url`) y comprueba que aparece esa respuesta sin apretar F5.
- [ ] **Borra las respuestas de prueba** (esto es obligatorio, o se mezclarán con las reales):
  ```bash
  curl -X DELETE "https://encuesta.cincit-encuesta-ia.workers.dev/api/datos?confirmar=SI&key=TU_CLAVE"
  ```
  (El comando completo, con la clave, está en `ACCESOS.txt`.) Verifica que el contador vuelva a 0: `https://encuesta.cincit-encuesta-ia.workers.dev/api/datos?conteo=1`.
- [ ] Escanea el QR de la diapositiva 2 con tu celular desde la presentación proyectada. Usa el archivo `Charla_IA_no_te_quita_el_trabajo_CINCIT2026_v2_Cloudflare.pptx`, que ya trae el QR nuevo.
- [ ] Prueba la conexión del lugar. Si no confías en el Wi-Fi, comparte tus datos móviles.
- [ ] Ensaya con los datos inventados: `python dashboard_asistentes.py ensayo/respuestas_DEMO_inventadas.csv` (**nunca** los presentes como reales).

## El día del evento
1. Proyecta la diapositiva 2 desde el minuto 0 (el QR y el enlace `encuesta.cincit-encuesta-ia.workers.dev` para quien no pueda escanear).
2. Puedes ver en cualquier momento cuántos respondieron en `.../api/datos?conteo=1` o en el panel. Intenta tener **30 o más** antes de mostrarlo.
3. Mientras llenan el QR (con unas 20 respuestas o más), abre esta sesión de Claude Code y escribe «ya están metiendo la información»: Claude publica los insights (ver arriba).
4. Minuto ~31: abre el panel (doble clic en `Abrir_panel.url`), pon pantalla completa con `F` y avanza con las flechas. Los insights son la **última pantalla**; léelos con la estructura *observación → por qué importa → acción*.
5. Vuelve a la diapositiva 20 y cierra con la idea: la IA hizo el trabajo pesado, tú decides qué significa.

**Para que el paso con Claude funcione mañana:** la sesión de Claude Code abierta en esta computadora, la laptop despierta y con internet estable, y el modo de permisos que no te pida clics en plena charla. Ensáyalo antes con datos inventados: `node herramientas/sembrar_demo.mjs 30` (desde `web-cf`) mete respuestas **inventadas**; bórralas después con el comando de `ACCESOS.txt`.

## Si algo falla
- **No cargan los datos o la página:** usa `ensayo/dashboard.html` aclarando que son datos de ejemplo, o la diapositiva 19 como explicación.
- **El panel pide clave:** pégala desde `ACCESOS.txt`.
- **Alguien envía basura:** solo se aceptan opciones válidas; lo demás se rechaza. Si hace falta, borra todo y empieza de nuevo con el comando de arriba.
- **Quieres cambiar una pregunta u opción:** edita `../encuesta/src/config.js` y publica de nuevo.

## Privacidad
No se pide nombre, correo, teléfono ni DNI. Cada respuesta lleva un identificador aleatorio y la hora. Los datos viven en tu cuenta de Cloudflare y solo se leen con tu clave (el contador público solo muestra un número). Después del evento, borra las respuestas con el comando de arriba si no las necesitas.

## Limitaciones honestas
- Solo respondieron quienes escanearon; es auto-reporte y la muestra es pequeña. No es una encuesta representativa.
- No hay límite contra spam más allá de validar las opciones y ocultar un campo trampa para bots.
- Si Cloudflare tuviera una caída durante el evento, el juego no funciona: ten el dashboard de ensayo como plan B.
- Probé 120 envíos simultáneos sin fallos desde mi computadora; no probé con 100 celulares reales en la red del lugar.
