---
type: "manual"
---

# 🤖 Reglas para el Módulo de IA (Futuro)

## Objetivo

- El módulo `eflow/ai_agent.py` servirá como un asistente de ingeniería hidráulica.
- Sugiere cálculos, interpreta resultados, predice errores y propone métodos alternativos.

## Funcionalidades esperadas

- Analizar secciones y proponer método (Manning, flujo crítico, curva remanso).
- Verificar si resultados parecen inconsistentes.
- Generar perfil hidráulico completo con justificación.

## Integración

- La IA se conectará desde frontend con una vista tipo chat.
- Podrá usar APIs como Gemini, Ollama o modelos embebidos.

## Reglas

- Nunca toma decisiones finales, solo asiste.
- Siempre ofrece referencias o base empírica.
- No debe bloquear la ejecución normal del sistema.
