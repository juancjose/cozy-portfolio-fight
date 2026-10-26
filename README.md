# Cozy Sport — Portfolio "Fight"

**Ver el sitio online:** [https://juancjose.github.io/cozy-portfolio-fight/](https://juancjose.github.io/cozy-portfolio-fight/)

Séptima versión del portfolio de Cozy Sport, industria nacional desde 1983. Sitio estático (HTML, CSS y JS sin build) inspirado en la estética "fight club": fondo carbón, fotos en blanco y negro, un solo acento verde, títulos condensados (Barlow Condensed), texto en Barlow, etiquetas técnicas en Lekton y secciones codificadas "0X / NOMBRE".

## Secciones

- Hero asimétrico con la triatleta recortada, marquesina "Cozy Sport — Desde 1983" y CTA a la tienda
- 01 Nosotros (industria nacional y números)
- 02 Disciplinas (footgolf, triatlón, running, ciclismo y MTB)
- 03 Servicios (indumentaria y accesorios)
- 04 Proceso (video de la mochila y pasos)
- 05 Historia (línea de tiempo desde 1983)
- 06 #TeamCozy (carrusel de deportistas)
- Cita
- 07 Equipo (formación titular)
- 08 Contacto y footer

## Animaciones

Revelados por línea, marquesinas con `requestAnimationFrame`, carrusel con avance automático cada 3 s. Las animaciones se reproducen siempre (también con `prefers-reduced-motion`), con fallback sin JavaScript y sin IntersectionObserver.

## Uso local

```bash
python3 -m http.server 8000
```
