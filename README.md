# Prem Chand | 3D Portfolio

A high-performance React portfolio showcasing the creative and technical work of
**Prem Chand**, including interactive 3D scenes, animated sections, research,
projects, education, and contact flows.

## Features

- Interactive 3D Earth rendered with Three.js shaders.
- Motion-driven interactions, magnetic cursor effects, and responsive layouts.
- Project, research, education, journey, and certificate sections.
- Serverless API routes for the assistant and contact form.
- Static assets, robots rules, and sitemap ready for deployment.

## Tech stack

- React 19 and Vite
- Three.js with `@react-three/fiber` and `@react-three/drei`
- Framer Motion and GSAP
- Vanilla CSS with responsive and glassmorphism styling
- Vercel-compatible serverless API routes

## Project structure

```text
api/                 Serverless assistant and contact endpoints
docs/                Product, content, customization, and responsive docs
public/              Public images, 3D textures, robots.txt, and sitemap.xml
src/components/      Reusable UI and visual components
src/config/          Site and API configuration
src/hooks/           Shared React hooks
src/mobile/          Mobile-specific application UI
src/sections/        Portfolio page sections
timeline-component/  Standalone timeline implementation
```

## Local development

```bash
npm install
npm run dev
```

The development server runs on the Vite default port. Use `npm run build` to
create a production build and `npm run preview` to inspect it locally.

## Environment variables

Copy `.env.example` to `.env` and set the server-side API keys before testing
the assistant or contact endpoints. Never commit `.env`; it is excluded by
`.gitignore`.

## Validation

```bash
npm run lint
npm run build
```

© 2026 Prem Chand. All rights reserved.
