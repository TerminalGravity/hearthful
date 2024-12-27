<a href="https://hearthful.dev">
  <img alt="Hearthful – Building blocks for your Next project" src="https://hearthful.dev/opengraph-image" />
  <h1 align="center">Hearthful</h1>
</a>

<p align="center">
  Bringing families together, one gathering at a time
</p>

<p align="center">
  <a href="https://hearthful.family">
    <img src="public/hearth_logo_favicon.png" alt="Hearthful Logo" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#one-click-deploy"><strong>One-click Deploy</strong></a> ·
  <a href="#tech-stack--features"><strong>Tech Stack + Features</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a> ·
  <a href="#development-environment"><strong>Development Environment</strong></a> ·
  <a href="#author"><strong>Author</strong></a>
</p>
<br/>

## Introduction

Hearthful is a comprehensive family event management platform that helps families organize events, share photos, and stay connected. Built using the [Precedent](https://github.com/steven-tey/precedent) template, Hearthful offers features such as:

- Family member management
- Event planning and RSVPs
- Photo sharing
- Subscription management
- Recipe and game recommendations

install the dependencies with your package manager of choice:

```bash
npm install
# or
yarn
# or
pnpm install
```

spin up the dev server with:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Tech Stack + Features

![Tech Stack](https://github.com/user-attachments/assets/aef3c099-e371-43bf-b426-f5ba73185a7c)

### Frameworks

- [Next.js](https://nextjs.org/) – React framework for building performant apps with the best developer experience
- [Clerk](https://go.clerk.com/hearthful) - A comprehensive user management platform with beautifully designed, drop-in React components

### Platforms

- [Vercel](https://vercel.com/) – Easily preview & deploy changes with git

### UI

- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [Radix](https://www.radix-ui.com/) – Primitives like modal, popover, etc. to build a stellar user experience
- [Framer Motion](https://framer.com/motion) – Motion library for React to animate components with ease
- [Lucide](https://lucide.dev/) – Beautifully simple, pixel-perfect icons
- [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) – Optimize custom fonts and remove external network requests for improved performance
- [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response) – Generate dynamic Open Graph images at the edge

### Hooks and Utilities

- `useIntersectionObserver` – React hook to observe when an element enters or leaves the viewport
- `useLocalStorage` – Persist data in the browser's local storage
- `useScroll` – React hook to observe scroll position ([example](https://github.com/steven-tey/hearthful/blob/main/components/layout/navbar.tsx#L12))
- `nFormatter` – Format numbers with suffixes like `1.2k` or `1.2M`
- `capitalize` – Capitalize the first letter of a string
- `truncate` – Truncate a string to a specified length
- [`use-debounce`](https://www.npmjs.com/package/use-debounce) – Debounce a function call / state update

### Code Quality

- [TypeScript](https://www.typescriptlang.org/) – Static type checker for end-to-end typesafety
- [Prettier](https://prettier.io/) – Opinionated code formatter for consistent code style
- [ESLint](https://eslint.org/) – Pluggable linter for Next.js and TypeScript

### Miscellaneous

- [Vercel Analytics](https://vercel.com/analytics) – Track unique visitors, pageviews, and more in a privacy-friendly way

## Project Structure

The Hearthful project follows a structured and organized layout to ensure scalability and maintainability. Here's an overview of the key directories and files:

```plaintext
hearthful/
├── app/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   ├── families/
│   │   ├── games/
│   │   ├── meals/
│   │   └── photos/
│   ├── api/
│   │   └── recommendations/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── shared/
│   │   ├── home/
│   │   └── layout/
│   ├── docs/
│   ├── layout.tsx
│   ├── opengraph-image.tsx
│   └── page.tsx
├── components.json
├── package.json
├── prisma/
├── public/
├── styles/
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### Key Directories

- **app/**: Contains the main application code, including pages and layouts.
  - **(authenticated)/**: Protected routes that require user authentication.
    - **dashboard/**: User dashboard components.
    - **families/**: Family management components.
    - **games/**: Game-related components.
    - **meals/**: Meal-related components.
    - **photos/**: Photo gallery components.
  - **api/**: API routes for backend functionality.
    - **recommendations/**: Endpoints for AI recommendations.
  - **components/**: Reusable UI components.
    - **dashboard/**: Components specific to the dashboard.
    - **shared/**: Shared components across the app.
    - **home/**: Home page components.
    - **layout/**: Layout components like header and footer.
  - **docs/**: Documentation files.
- **components.json**: Configuration for component libraries.
- **prisma/**: Prisma ORM setup and schema.
- **public/**: Static assets like images and icons.
- **styles/**: Global and component-specific styles.
- **tailwind.config.js**: Tailwind CSS configuration.
- **tsconfig.json**: TypeScript configuration.
- **README.md**: Project documentation.

## Development Environment

To set up the development environment for Hearthful, follow these steps:

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Package Manager**: `npm`, `yarn`, or `pnpm`.
- **Git**: Version control system installed.

### Setup Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/steven-tey/hearthful.git
   cd hearthful
   ```

2. **Install Dependencies**

   Using `npm`:

   ```bash
   npm install
   ```

   Or using `yarn`:

   ```bash
   yarn
   ```

   Or using `pnpm`:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and add the necessary environment variables:

   ```env
   NEXT_PUBLIC_SITE_URL=https://hearthful.dev
   CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   ```

4. **Set Up Prisma**

   Generate Prisma client:

   ```bash
   npx prisma generate
   ```

   Apply database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. **Run the Development Server**

   Using `npm`:

   ```bash
   npm run dev
   ```

   Or using `yarn`:

   ```bash
   yarn dev
   ```

   Or using `pnpm`:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Additional Tools

- **VSCode Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma

- **Linting and Formatting**

  The project uses ESLint for linting and Prettier for code formatting. You can run the linter with:

  ```bash
  npm run lint
  ```

  To format the code, you can use:

  ```bash
  npm run format
  ```

## Author

- **Steven Tey** ([@steventey](https://twitter.com/steventey))

---

## License

MIT License

```
MIT License

Copyright (c) 2023 Steven Tey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[... License Text Continues ...]
```

---

## Acknowledgements

- Built using the [Precedent](https://github.com/steven-tey/precedent) template.
- Special thanks to [Clerk](https://clerk.com/) for their user management solutions.
- Inspired by various open-source projects and developer communities.