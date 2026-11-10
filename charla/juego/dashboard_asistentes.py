"""Dashboard automatico del juego "6 horas -> 20 minutos" (CINCIT 2026).

Lee el CSV exportado de Google Forms/Sheets, limpia, consolida, grafica y redacta
3 insights. Escribe dashboard.html e insights.txt y abre el dashboard en el navegador.

Uso:   python dashboard_asistentes.py respuestas.csv
Prueba: python dashboard_asistentes.py respuestas_DEMO_inventadas.csv
"""
import base64
import io
import sys
import textwrap
import time
import unicodedata
import webbrowser
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

T0 = time.time()
BG, CARD, TEXT, MUTED = "#071A3E", "#0F2A5C", "#FFFFFF", "#A9B8D6"
GREEN, CYAN, ORANGE = "#1FD18B", "#17B5E0", "#FF7F00"

FREQ_ORDEN = ["Nunca", "Alguna vez al mes", "Cada semana", "Casi todos los días"]
FREQ_PUNTOS = {f: i for i, f in enumerate(FREQ_ORDEN)}


def norm(s):
    s = unicodedata.normalize("NFD", str(s).lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def encontrar(cols, *palabras):
    for c in cols:
        if all(norm(p) in norm(c) for p in palabras):
            return c
    raise KeyError(f"No encontre la columna con: {palabras}")


def cargar(ruta):
    df = pd.read_csv(ruta, encoding="utf-8-sig")
    cols = list(df.columns)
    m = {
        "carrera": encontrar(cols, "carrera"),
        "ciclo": encontrar(cols, "ciclo"),
        "frecuencia": encontrar(cols, "frecuencia"),
        "herramientas": encontrar(cols, "herramientas"),
        "uso": encontrar(cols, "para que usas"),
        "miedo": encontrar(cols, "temes"),
        "prep": encontrar(cols, "preparado"),
        "destino": encontrar(cols, "donde"),
    }
    d = pd.DataFrame({k: df[v] for k, v in m.items()})
    # --- limpieza: espacios, mayusculas, duplicados exactos y filas vacias ---
    for c in ("carrera", "frecuencia", "uso", "destino"):
        d[c] = d[c].astype(str).str.strip()
    d["carrera"] = d["carrera"].str.replace(r"\s+", " ", regex=True)
    d["ciclo"] = pd.to_numeric(d["ciclo"].astype(str).str.extract(r"(\d+)")[0], errors="coerce")
    d["miedo"] = pd.to_numeric(d["miedo"], errors="coerce")
    d["prep"] = pd.to_numeric(d["prep"], errors="coerce")
    d = d.dropna(subset=["miedo", "prep"]).drop_duplicates().reset_index(drop=True)
    d["puntos_uso"] = d["frecuencia"].map(FREQ_PUNTOS)
    return d


def pct(x):
    return f"{100 * x:.0f}%"


def fig_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, facecolor=BG, bbox_inches="tight")
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode()


def estilo(ax, titulo):
    ax.set_facecolor(BG)
    ax.set_title(titulo, color=TEXT, fontsize=14, fontweight="bold", loc="left", pad=12)
    for s in ax.spines.values():
        s.set_visible(False)
    ax.tick_params(colors=MUTED, labelsize=11, length=0)
    ax.xaxis.label.set_color(MUTED)


def barras_h(serie, titulo, color=CYAN, resaltar_primero=True):
    serie = serie.sort_values()
    fig, ax = plt.subplots(figsize=(6.2, max(2.6, 0.5 * len(serie) + 1)))
    colores = [color] * len(serie)
    if resaltar_primero:
        colores[-1] = GREEN
    ax.barh(serie.index, serie.values, color=colores, height=0.62)
    for i, v in enumerate(serie.values):
        ax.text(v + serie.max() * 0.02, i, f"{v}", va="center", color=TEXT, fontsize=11)
    estilo(ax, titulo)
    ax.set_xticks([])
    ax.set_xlim(0, serie.max() * 1.15)
    fig.patch.set_facecolor(BG)
    return fig_b64(fig)


def barras_v(serie, titulo, color=CYAN):
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    ax.bar([textwrap.fill(str(i), 11) for i in serie.index], serie.values, color=color, width=0.62)
    for i, v in enumerate(serie.values):
        ax.text(i, v + serie.max() * 0.02, f"{v}", ha="center", color=TEXT, fontsize=11)
    estilo(ax, titulo)
    ax.set_yticks([])
    plt.setp(ax.get_xticklabels(), rotation=0)
    fig.patch.set_facecolor(BG)
    return fig_b64(fig)


def analizar(d):
    n = len(d)
    res = {"n": n}
    res["carreras"] = d["carrera"].value_counts()
    res["ciclos"] = d["ciclo"].dropna().astype(int).value_counts().sort_index()
    res["freq"] = d["frecuencia"].value_counts().reindex(FREQ_ORDEN, fill_value=0)
    herr = d["herramientas"].astype(str).str.split(r"\s*,\s*").explode().str.strip()
    herr = herr[herr != ""]
    res["herramientas"] = herr.value_counts()
    res["destino"] = d["destino"].value_counts()
    res["uso_semanal"] = (d["puntos_uso"] >= 2).mean()
    res["prep_alta"] = (d["prep"] >= 4).mean()
    res["miedo_alto"] = (d["miedo"] >= 4).mean()
    res["miedo_prom"] = d["miedo"].mean()
    res["prep_prom"] = d["prep"].mean()
    res["multi_herr"] = (d["herramientas"].astype(str).str.contains(",")).mean()
    return res


def insights(d, r):
    out = []
    # 1) brecha entre usar IA y sentirse preparado
    out.append({
        "titulo": "Usan la IA, pero no se sienten preparados",
        "obs": f"{pct(r['uso_semanal'])} la usa cada semana o más, pero solo {pct(r['prep_alta'])} se siente preparado "
               f"(4 o 5 de 5).",
        "por_que": "Usar una herramienta no es dominarla: sin método no sabes cuándo se equivoca.",
        "accion": "Pasar del uso informal a un uso con estructura y verificación.",
        "ctx": "Referencia: en Lima (USIL, feb. 2026) solo 13% se sintió preparado. Otra encuesta y otra pregunta: "
               "es un contexto, no una comparación exacta.",
    })
    # 2) contraste entre grupos: carreras con >=5 respuestas, si no, ciclos
    grp = d.groupby("carrera")["prep"].agg(["mean", "count"])
    grp = grp[grp["count"] >= 5]
    if len(grp) >= 2:
        hi, lo = grp["mean"].idxmax(), grp["mean"].idxmin()
        out.append({
            "titulo": "La preparación no es pareja entre carreras",
            "obs": f"{hi} se siente más preparado ({grp.loc[hi, 'mean']:.1f}/5) que {lo} ({grp.loc[lo, 'mean']:.1f}/5).",
            "por_que": "La IA llega a todas las carreras, pero no todas la practican igual.",
            "accion": "Llevar ejemplos de IA a cada carrera, no solo a computación.",
            "ctx": f"Se comparan solo carreras con al menos 5 respuestas (n total = {r['n']}).",
        })
    else:
        av = d[d["ciclo"] >= 7]["prep"].mean()
        ini = d[d["ciclo"] <= 4]["prep"].mean()
        out.append({
            "titulo": "Ciclos avanzados vs. iniciales",
            "obs": f"Ciclos 7+ se sienten preparados {av:.1f}/5; ciclos 1–4, {ini:.1f}/5.",
            "por_que": "La experiencia con la IA depende de en qué etapa estás.",
            "accion": "Diseñar rutas distintas según el ciclo.",
            "ctx": "Pocas respuestas por carrera; se comparan ciclos.",
        })
    # 3) miedo vs frecuencia de uso, o destino laboral
    frecuentes = d[d["puntos_uso"] >= 3]["miedo"].mean()
    raros = d[d["puntos_uso"] <= 1]["miedo"].mean()
    if pd.notna(frecuentes) and pd.notna(raros) and (d["puntos_uso"] >= 3).sum() >= 5 and (d["puntos_uso"] <= 1).sum() >= 5:
        if frecuentes < raros - 0.2:
            frase = (f"Quienes la usan casi todos los días temen menos ({frecuentes:.1f}/5) que quienes la usan poco "
                     f"({raros:.1f}/5).")
            por_que = "Conocer la herramienta reduce el miedo."
        elif frecuentes > raros + 0.2:
            frase = (f"Quienes la usan casi todos los días temen más ({frecuentes:.1f}/5) que quienes la usan poco "
                     f"({raros:.1f}/5).")
            por_que = "Verla de cerca también hace evidente lo que puede automatizar."
        else:
            frase = f"El miedo es parecido entre quienes la usan mucho ({frecuentes:.1f}/5) y poco ({raros:.1f}/5)."
            por_que = "Usarla más no cambia el miedo: hace falta criterio, no solo práctica."
        out.append({
            "titulo": "Miedo y uso: qué relación hay",
            "obs": frase,
            "por_que": por_que,
            "accion": "Acercar la herramienta con práctica guiada, no solo con información.",
            "ctx": f"Miedo alto (4–5): {pct(r['miedo_alto'])} de la sala.",
        })
    else:
        top = r["destino"].index[0]
        out.append({
            "titulo": "A dónde quieren ir",
            "obs": f"La opción más elegida para trabajar al egresar es: {top} ({pct(r['destino'].iloc[0] / r['n'])}).",
            "por_que": "Define dónde necesitan que la IA les abra puertas.",
            "accion": "Mostrar cómo la IA permite trabajar remoto o emprender desde la región.",
            "ctx": f"n = {r['n']}.",
        })
    return out


def html(d, r, ins, seg):
    graficos = {
        "carreras": barras_h(r["carreras"], "¿Quiénes están en la sala? (carrera)"),
        "ciclos": barras_v(r["ciclos"], "Ciclo"),
        "freq": barras_v(r["freq"], "¿Con qué frecuencia usan IA?", GREEN),
        "herr": barras_h(r["herramientas"], "¿Qué herramientas usan?"),
        "destino": barras_h(r["destino"], "¿Dónde quieren trabajar al egresar?"),
    }
    # miedo vs preparacion (distribucion 1-5)
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    escala = [1, 2, 3, 4, 5]
    m = d["miedo"].value_counts().reindex(escala, fill_value=0)
    p = d["prep"].value_counts().reindex(escala, fill_value=0)
    ancho = 0.38
    ax.bar([e - ancho / 2 for e in escala], m.values, ancho, color=ORANGE, label="Miedo a perder el trabajo")
    ax.bar([e + ancho / 2 for e in escala], p.values, ancho, color=GREEN, label="Preparación para trabajar con IA")
    estilo(ax, "Miedo vs. preparación (1 = nada, 5 = mucho)")
    ax.set_xticks(escala)
    ax.set_yticks([])
    ax.legend(frameon=False, labelcolor=TEXT, fontsize=10, loc="upper center", ncol=2, bbox_to_anchor=(0.5, -0.12))
    fig.patch.set_facecolor(BG)
    graficos["mp"] = fig_b64(fig)

    kpis = [("Respuestas", f"{r['n']}"), ("Usan IA cada semana o más", pct(r["uso_semanal"])),
            ("Se sienten preparados (4–5)", pct(r["prep_alta"])), ("Temen perder el trabajo (4–5)", pct(r["miedo_alto"]))]
    kpi_html = "".join(f'<div class="kpi"><div class="v">{v}</div><div class="l">{l}</div></div>' for l, v in kpis)
    ins_html = ""
    for i, x in enumerate(ins, 1):
        ins_html += (f'<div class="ins"><div class="n">{i}</div><h3>{x["titulo"]}</h3>'
                     f'<p><b>Observación:</b> {x["obs"]}</p><p><b>Por qué importa:</b> {x["por_que"]}</p>'
                     f'<p><b>Acción:</b> {x["accion"]}</p><p class="ctx">{x["ctx"]}</p></div>')
    img = lambda k: f'<img src="data:image/png;base64,{graficos[k]}" alt="{k}">'
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard en vivo · CINCIT 2026</title>
<style>
body{{margin:0;background:{BG};color:{TEXT};font-family:'Segoe UI',Arial,sans-serif;padding:32px 48px}}
h1{{font-size:36px;margin:0 0 4px}} .sub{{color:{MUTED};font-size:18px;margin-bottom:24px}}
.kpis{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}}
.kpi{{background:{CARD};border-radius:14px;padding:18px 22px}} .kpi .v{{font-size:44px;font-weight:700;color:{GREEN}}}
.kpi .l{{color:{MUTED};font-size:16px}}
h2{{font-size:26px;margin:28px 0 14px}}
.ins-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}
.ins{{background:{CARD};border-radius:14px;padding:20px 24px}} .ins .n{{width:38px;height:38px;border-radius:50%;
background:{GREEN};color:{BG};font-weight:700;display:flex;align-items:center;justify-content:center;font-size:20px}}
.ins h3{{font-size:21px;margin:12px 0 8px;color:{GREEN}}} .ins p{{font-size:16px;line-height:1.4;margin:6px 0}}
.ins .ctx{{color:{MUTED};font-size:13px}}
.grid{{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}} .grid div{{background:{BG};}}
.grid img{{width:100%;border-radius:12px}} .foot{{color:{MUTED};font-size:14px;margin-top:28px}}
@media(max-width:1000px){{.kpis{{grid-template-columns:repeat(2,1fr)}}.ins-grid,.grid{{grid-template-columns:1fr}}}}
</style></head><body>
<h1>Lo que dijo esta sala</h1><div class="sub">CINCIT 2026 · datos anónimos de los asistentes · procesado automáticamente</div>
<div class="kpis">{kpi_html}</div>
<h2>Tres insights</h2><div class="ins-grid">{ins_html}</div>
<h2>Los datos</h2><div class="grid">{img('carreras')}{img('freq')}{img('herr')}{img('mp')}{img('ciclos')}{img('destino')}</div>
<div class="foot">Procesado en {seg} segundos. Los insights son una propuesta automática: <b>tú decides qué significan</b>.</div>
</body></html>"""


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    ruta = Path(sys.argv[1])
    d = cargar(ruta)
    r = analizar(d)
    ins = insights(d, r)
    carpeta = ruta.resolve().parent
    pagina = html(d, r, ins, "@@SEG@@")
    seg = time.time() - T0
    (carpeta / "dashboard.html").write_text(pagina.replace("@@SEG@@", f"{seg:.1f}"), encoding="utf-8")
    txt = [f"Respuestas: {r['n']}"]
    for i, x in enumerate(ins, 1):
        txt += [f"\nINSIGHT {i} · {x['titulo']}", f"  Observación: {x['obs']}", f"  Por qué importa: {x['por_que']}",
                f"  Acción: {x['accion']}", f"  ({x['ctx']})"]
    (carpeta / "insights.txt").write_text("\n".join(txt), encoding="utf-8")
    print("\n".join(txt))
    print(f"\nListo en {seg:.1f} s -> {carpeta / 'dashboard.html'}")
    webbrowser.open((carpeta / "dashboard.html").as_uri())


if __name__ == "__main__":
    main()
