# Dictado de Macroscopía por voz

Prueba de concepto para **dictar por voz las descripciones macroscópicas** de Anatomía Patológica, en vez de escribirlas a mano.

## Objetivo
El patólogo describe la muestra mientras la manipula y tiene las manos ocupadas. Dictar el texto ahorra tiempo y evita transcribir después.

## Cómo funciona
- Usa la **Web Speech API** del navegador (`SpeechRecognition`) en español de Chile (`es-CL`).
- Reconocimiento **continuo** y con resultados parciales mientras se habla.
- Las descripciones dictadas se guardan en una lista y se pueden **copiar al portapapeles**.
- Sin servidor ni dependencias: HTML, CSS y JavaScript puros.

## Uso
Abrir `index.html` en **Chrome o Edge** (son los que soportan `SpeechRecognition`) y permitir el micrófono. Para usar el micrófono hace falta servirlo desde `localhost` o HTTPS:
```bash
python3 -m http.server 8000
```
