# Cozy Sport — Portfolio "Fight"

**Ver el sitio online:** [https://juancjose.github.io/cozy-portfolio-fight/](https://juancjose.github.io/cozy-portfolio-fight/)

Séptima versión del portfolio de Cozy Sport, industria nacional desde 1983. Sitio estático (HTML, CSS y JS sin build) inspirado en la estética "fight club": fondo carbón, fotos en blanco y negro, un solo acento rosa, tipografías M PLUS 2 y Lekton, secciones numeradas.

## Secciones

- Hero con la triatleta recortada y marquesina
- 01 Industria nacional (números y quiénes somos)
- 02 Elegí tu disciplina (acordeón)
- 03 Cómo trabajamos (video de la mochila y pasos)
- 04 Nuestra historia (desde 1983)
- 05 #TeamCozy (carrusel de deportistas)
- Cita
- 06 Formación titular (equipo)
- Contacto y footer

## Animaciones

Revelados por línea, marquesinas con `requestAnimationFrame`, carrusel con avance automático cada 3 s. Las animaciones se reproducen siempre (también con `prefers-reduced-motion`), con fallback sin JavaScript y sin IntersectionObserver.

## Uso local

```bash
python3 -m http.server 8000
```
