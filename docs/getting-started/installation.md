# Installation Guide

This guide will walk you through setting up Hearthful for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **Bun**: Latest version (recommended package manager)
- **Git**: For version control
- **PostgreSQL**: v14 or higher

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/steven-tey/hearthful.git
   cd hearthful
   ```

2. **Install Dependencies**

   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install

   # Or using pnpm
   pnpm install
   ```

3. **Environment Setup**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in your `.env`:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   DATABASE_URL=your-postgresql-url
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   bun prisma generate

   # Run migrations
   bun prisma migrate dev
   ```

5. **Start Development Server**

   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:3000`

## Configuration

### Required Services

1. **Clerk Authentication**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys to `.env`

2. **PostgreSQL Database**
   - Set up a local PostgreSQL instance
   - Or use a cloud provider (e.g., Supabase, Railway)
   - Update `DATABASE_URL` in `.env`

3. **Stripe (for payments)**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys
   - Add to `.env`

### Optional Services

1. **AWS S3 (for photo storage)**
   - Create an S3 bucket
   - Configure access credentials
   - Update AWS-related environment variables

2. **OpenAI (for AI features)**
   - Get an API key from OpenAI
   - Add to `.env`

## Troubleshooting

### Common Issues

1. **Prisma Generate Errors**
   - Ensure PostgreSQL is running
   - Check `DATABASE_URL` format
   - Run `bun prisma generate` again

2. **Build Errors**
   - Clear `.next` directory
   - Remove `node_modules`
   - Run `bun install` again

3. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in `.env`
   - Restart the development server

### Getting Help

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/steven-tey/hearthful/issues)
2. Join our [Discord community](https://discord.gg/hearthful)
3. Create a new issue with detailed information 