# Architecture Overview

This document provides a high-level overview of Hearthful's architecture and technical design decisions.

## System Architecture

Hearthful follows a modern full-stack architecture with the following key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │   API Routes    │     │   PostgreSQL    │
│  (React + SSR)  │────▶│  (Next.js API)  │────▶│    Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Clerk      │     │     Prisma      │     │      AWS S3     │
│ (Authentication)│     │      (ORM)      │     │  (File Storage) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Key Components

### Frontend

- **Next.js 15**: Server-side rendering and static site generation
- **React 18**: UI component library
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **Clerk**: Authentication and user management
- **AWS S3**: Photo and file storage

### Infrastructure

- **Vercel**: Hosting and deployment
- **PostgreSQL**: Database hosting
- **AWS**: File storage
- **Stripe**: Payment processing

## Data Flow

1. **User Authentication**
   ```
   Client ──▶ Clerk Auth ──▶ JWT Token ──▶ API Routes
   ```

2. **Data Operations**
   ```
   Client ──▶ API Routes ──▶ Prisma ──▶ PostgreSQL
   ```

3. **File Operations**
   ```
   Client ──▶ S3 Presigned URL ──▶ AWS S3
   ```

## Security Architecture

### Authentication Flow

1. User signs in via Clerk
2. JWT token is generated
3. Token is validated on API routes
4. User session is maintained

### Data Protection

- All API routes are protected
- Database is encrypted at rest
- S3 buckets use private ACLs
- Environment variables are secured

## Performance Optimizations

1. **Frontend**
   - Static page generation
   - Image optimization
   - Code splitting
   - Client-side caching

2. **Backend**
   - API route caching
   - Database indexing
   - Connection pooling
   - Edge functions

## Scalability Considerations

### Current Scale

- Serverless architecture
- Auto-scaling databases
- CDN for static assets
- Edge caching

### Future Scale

- Redis caching layer
- Read replicas
- Sharding strategy
- Multi-region deployment

## Monitoring and Logging

1. **Application Monitoring**
   - Vercel Analytics
   - Error tracking
   - Performance metrics

2. **Infrastructure Monitoring**
   - Database metrics
   - API latency
   - Storage usage

## Development Workflow

1. **Local Development**
   - Bun package manager
   - Hot module reloading
   - TypeScript compilation
   - ESLint + Prettier

2. **Deployment Pipeline**
   - GitHub Actions
   - Automated testing
   - Preview deployments
   - Production releases

## Future Considerations

1. **Planned Improvements**
   - GraphQL API
   - WebSocket support
   - Service worker
   - Native app support

2. **Technical Debt**
   - Regular dependency updates
   - Code refactoring
   - Performance optimization
   - Security audits 