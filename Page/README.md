# eFlood² - Página de Documentación

Esta es la página de documentación completa para eFlood², construida con HTML, CSS y JavaScript vanilla, siguiendo el diseño y estructura de opencode.ai y Docusaurus.

## 🚀 Características

- **Diseño Moderno**: Inspirado en opencode.ai con el sistema de diseño de eFlood²
- **Animaciones GSAP**: Animaciones fluidas y profesionales usando GSAP v3.13.0
- **Responsive**: Completamente adaptable a dispositivos móviles y desktop
- **Documentación Completa**: Estructura tipo Docusaurus con sidebar y tabla de contenidos
- **Syntax Highlighting**: Bloques de código con resaltado de sintaxis usando Prism.js
- **Navegación Avanzada**: Scroll spy, navegación por teclado y smooth scrolling

## 📁 Estructura del Proyecto

```
Page/
├── index.html              # Página principal
├── css/
│   ├── main.css            # Estilos principales
│   └── docs.css            # Estilos de documentación
├── js/
│   ├── main.js             # JavaScript principal
│   └── docs.js             # JavaScript de documentación
├── docs/
│   └── index.html          # Página de documentación
├── assets/
│   ├── logo.svg            # Logo de eFlood²
│   ├── Program.png         # Screenshot de la aplicación
│   ├── fonts/              # Fuentes Allenoire
│   └── images/             # Imágenes WebP del proyecto
└── README.md               # Este archivo
```

## 🎨 Sistema de Diseño

### Colores
- **Fondo Principal**: #131414
- **Fondo Secundario**: #1a1b1c
- **Texto Principal**: #ffffff
- **Texto Secundario**: #cccccc
- **Acento Azul**: #4a9eff
- **Acento Cyan**: #22d3ee

### Fuentes
- **Marca**: Allenoire (para elementos de branding)
- **Contenido**: Inter (para texto general)

### Gradientes
- **Primario**: linear-gradient(135deg, rgba(74, 158, 255, 0.3) 0%, rgba(34, 211, 238, 0.3) 100%)
- **Hover**: linear-gradient(135deg, rgba(74, 158, 255, 0.4) 0%, rgba(34, 211, 238, 0.4) 100%)

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables CSS, Grid, Flexbox, animaciones
- **JavaScript ES6+**: Funcionalidad interactiva
- **GSAP v3.13.0**: Animaciones avanzadas
- **ScrollTrigger**: Animaciones basadas en scroll
- **Prism.js**: Syntax highlighting para código
- **Google Fonts**: Fuente Inter

## 📱 Características Responsive

### Desktop (1200px+)
- Layout de 3 columnas en documentación (sidebar, contenido, TOC)
- Navegación completa visible
- Animaciones completas

### Tablet (768px - 1024px)
- Layout de 2 columnas (sidebar y contenido)
- TOC oculto
- Navegación adaptada

### Mobile (< 768px)
- Layout de 1 columna
- Sidebar colapsable
- Navegación hamburger
- Botones y texto optimizados

## 🎯 Funcionalidades Principales

### Página Principal (index.html)
- **Hero Section**: Título animado palabra por palabra
- **Features Grid**: 6 características principales con iconos SVG
- **Download Section**: Botones de descarga para múltiples plataformas
- **Footer**: Enlaces sociales y información del proyecto
- **Navegación**: Smooth scrolling y efectos hover

### Página de Documentación (docs/index.html)
- **Sidebar**: Navegación jerárquica con secciones colapsables
- **Contenido Principal**: Documentación completa con ejemplos
- **Table of Contents**: Navegación rápida dentro de la página
- **Breadcrumbs**: Navegación contextual
- **Code Blocks**: Syntax highlighting y botón de copia
- **Info Boxes**: Alertas y notas importantes

## 🎬 Animaciones GSAP

### Animaciones de Entrada
- Navegación desliza desde arriba
- Hero content fade-in con stagger
- Feature cards aparecen en secuencia
- Sidebar y TOC con entrada lateral

### Animaciones de Scroll
- Parallax sutil en hero background
- Feature cards aparecen al hacer scroll
- Secciones de documentación con fade-in
- Scroll spy para navegación activa

### Interacciones
- Hover effects en botones y cards
- Scale animations en clicks
- Smooth scrolling entre secciones
- Copy feedback visual

## 🚀 Cómo Usar

### Desarrollo Local
1. Abrir `index.html` en un navegador moderno
2. Para documentación, navegar a `docs/index.html`
3. Usar un servidor local para mejor rendimiento:
   ```bash
   # Con Python
   python -m http.server 8000

   # Con Node.js (http-server)
   npx http-server

   # Con PHP
   php -S localhost:8000
   ```

### Despliegue
- Subir todos los archivos a un servidor web
- Asegurar que las rutas relativas funcionen correctamente
- Configurar MIME types para fuentes si es necesario

## 📝 Personalización

### Cambiar Colores
Editar las variables CSS en `css/main.css`:
```css
:root {
  --bg-primary: #131414;
  --accent-blue: #4a9eff;
  /* ... más variables */
}
```

### Agregar Secciones
1. Crear nueva sección en HTML con ID único
2. Agregar enlace en sidebar
3. Actualizar tabla de contenidos
4. Configurar animaciones si es necesario

### Modificar Animaciones
Editar configuraciones GSAP en `js/main.js` y `js/docs.js`:
```javascript
gsap.to(element, {
  duration: 1,
  ease: 'power3.out',
  // ... propiedades
});
```

## 🔧 Mantenimiento

### Actualizar Contenido
- Editar archivos HTML directamente
- Mantener estructura semántica
- Actualizar enlaces de navegación

### Optimización
- Comprimir imágenes WebP
- Minificar CSS y JS para producción
- Optimizar fuentes con font-display: swap

### Compatibilidad
- Testear en navegadores modernos
- Verificar animaciones en dispositivos móviles
- Validar accesibilidad con herramientas

## 📞 Soporte

Para preguntas o problemas:
- **GitHub**: [cCornejoR/eFlow](https://github.com/cCornejoR/eFlow)
- **Email**: crhistian.cornejo03@gmail.com
- **LinkedIn**: [crhistian-cornejo](https://linkedin.com/in/crhistian-cornejo)

---

**Versión**: 1.0.0
**Última actualización**: Enero 2025
**Autor**: Crhistian Cornejo
