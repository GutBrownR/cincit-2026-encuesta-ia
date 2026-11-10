"""Genera respuestas INVENTADAS en el formato de Google Forms, solo para ensayar el dashboard.
NUNCA presentes estos datos como si fueran de la sala.

Uso: python generar_respuestas_demo.py   -> respuestas_DEMO_inventadas.csv
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
N = 72

CARRERAS = ["Ingeniería de Sistemas", "Ingeniería Agroindustrial", "Administración de Empresas",
            "Contabilidad", "Ingeniería Civil", "Enfermería", "Derecho", "Otra"]
P_CARRERAS = [0.38, 0.12, 0.12, 0.10, 0.09, 0.07, 0.06, 0.06]
FREQ = ["Nunca", "Alguna vez al mes", "Cada semana", "Casi todos los días"]
HERR = ["ChatGPT", "Gemini", "Copilot", "Claude", "Meta AI", "DeepSeek", "Otra"]
USOS = ["Estudiar o entender temas", "Programar", "Escribir o redactar", "Para conseguir trabajo", "Investigar"]
DESTINOS = ["Andahuaylas o Apurímac", "Cusco o Lima", "Otro país", "Trabajo remoto", "Emprender"]

carrera = rng.choice(CARRERAS, size=N, p=P_CARRERAS)
ciclo = rng.integers(1, 11, size=N)
frecuencia = rng.choice(FREQ, size=N, p=[0.05, 0.17, 0.33, 0.45])
sistemas = carrera == "Ingeniería de Sistemas"
prep = np.clip(np.round(rng.normal(2.7, 1.0, N) + 0.7 * sistemas), 1, 5).astype(int)
miedo = np.clip(np.round(rng.normal(3.1, 1.1, N) - 0.25 * (np.array([FREQ.index(f) for f in frecuencia]) - 2)), 1, 5).astype(int)


def herramientas(f):
    k = 0 if f == "Nunca" else int(rng.integers(1, 4))
    if k == 0:
        return "Ninguna"
    pesos = np.array([0.40, 0.25, 0.12, 0.10, 0.06, 0.05, 0.02]); pesos /= pesos.sum()
    return ", ".join(rng.choice(HERR, size=k, replace=False, p=pesos))


df = pd.DataFrame({
    "Marca temporal": pd.date_range("2026-11-20 09:30", periods=N, freq="20s").strftime("%d/%m/%Y %H:%M:%S"),
    "1. ¿Cuál es tu carrera?": carrera,
    "2. ¿En qué ciclo estás?": ciclo,
    "3. ¿Con qué frecuencia usas IA para estudiar o trabajar?": frecuencia,
    "4. ¿Qué herramientas de IA usas? (marca todas las que uses)": [herramientas(f) for f in frecuencia],
    "5. ¿Para qué usas más la IA?": rng.choice(USOS, size=N, p=[0.4, 0.25, 0.2, 0.05, 0.1]),
    "6. Del 1 al 5, ¿cuánto temes que la IA te quite el trabajo?": miedo,
    "7. Del 1 al 5, ¿qué tan preparado/a te sientes para trabajar con IA?": prep,
    "8. Cuando egreses, ¿dónde te gustaría trabajar?": rng.choice(DESTINOS, size=N, p=[0.2, 0.35, 0.08, 0.2, 0.17]),
})
df.to_csv("respuestas_DEMO_inventadas.csv", index=False, encoding="utf-8-sig")
print(f"respuestas_DEMO_inventadas.csv: {N} filas (datos inventados)")
