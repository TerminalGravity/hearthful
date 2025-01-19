# Hearthful Development Roadmap

## Priority Tasks (Current Sprint)

### 1. Fix Headers() Iteration Errors
- Implementation Steps:
  1. Update `app/dashboard/page.tsx`:
     ```typescript
     // Ensure headers are properly awaited
     const headersList = await headers();
     const session = await auth();
     const { userId } = session || {};

     // Add proper error handling
     if (!userId) {
       redirect('/sign-in');
     }

     // Add type safety
     type SafeSession = {
       userId: string;
       user: {
         id: string;
         email: string;
       };
     };
     ```
  2. Update API routes pattern:
     - `app/api/events/route.ts`
     - `app/api/families/route.ts`
     - Use consistent pattern:
     ```typescript
     import { headers } from 'next/headers';
     import { auth } from '@clerk/nextjs';
     import { NextResponse } from 'next/server';

     export async function handler() {
       try {
         // 1. Headers and Auth
         const headersList = await headers();
         const session = await auth();
         const { userId } = session || {};
         
         if (!userId) {
           return new NextResponse("Unauthorized", { status: 401 });
         }

         // 2. Request Validation
         const validation = await validateRequest(req, schema);
         if (!validation.success) {
           return new NextResponse(validation.error, { status: 400 });
         }

         // 3. Business Logic
         const result = await processRequest(validation.data, userId);

         // 4. Response
         return NextResponse.json(result);
       } catch (error) {
         console.error(`[${route_name}]`, error);
         return new NextResponse("Internal Error", { status: 500 });
       }
     }
     ```

### 2. Event Creation Error Handling
- Implementation Steps:
  1. Add type validation:
     ```typescript
     // types/events.ts
     export interface EventCreationPayload {
       name: string;
       date: Date;
       familyId: string;
       hostId: string;
       type: 'meal' | 'game';
       participants: string[];
       details?: {
         cuisine?: string;
         dietaryNotes?: string;
         mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Other';
         gameType?: string;
         duration?: number;
       };
     }

     export interface EventResponse {
       id: string;
       name: string;
       date: Date;
       familyId: string;
       hostId: string;
       type: string;
       participants: Array<{
         id: string;
         userId: string;
         name: string;
       }>;
       details: Record<string, any>;
       createdAt: Date;
       updatedAt: Date;
     }
     ```
  2. Add validation middleware:
     ```typescript
     // middleware/validation.ts
     import { z } from 'zod';

     export const eventSchema = z.object({
       name: z.string().min(1).max(100),
       date: z.date(),
       familyId: z.string().uuid(),
       hostId: z.string().uuid(),
       type: z.enum(['meal', 'game']),
       participants: z.array(z.string().uuid()),
       details: z.record(z.any()).optional(),
     });

     export async function validateRequest<T>(
       req: Request, 
       schema: z.Schema<T>
     ) {
       const data = await req.json();
       return schema.safeParseAsync(data);
     }
     ```
  3. Implement error handling:
     ```typescript
     // utils/error-handling.ts
     export class AppError extends Error {
       constructor(
         public statusCode: number,
         public message: string,
         public code: string
       ) {
         super(message);
       }
     }

     export function handleError(error: unknown) {
       console.error('[Error]', {
         name: error?.name,
         message: error?.message,
         stack: error?.stack,
       });

       if (error instanceof AppError) {
         return new NextResponse(error.message, { 
           status: error.statusCode 
         });
       }

       return new NextResponse('Internal Server Error', { 
         status: 500 
       });
     }
     ```

### 3. Authentication Flow Improvements
- Implementation Steps:
  1. Create headers middleware:
     ```typescript
     // middleware/auth.ts
     import { headers } from 'next/headers';
     import { auth } from '@clerk/nextjs';
     import { NextResponse } from 'next/server';
     import { AppError } from '@/utils/error-handling';

     export async function withAuth(handler: Function) {
       return async (req: Request) => {
         try {
           const headersList = await headers();
           const session = await auth();
           const { userId } = session || {};

           if (!userId) {
             throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
           }

           // Add user info to request context
           const context = {
             userId,
             headers: headersList,
             session
           };

           return handler(req, context);
         } catch (error) {
           return handleError(error);
         }
       };
     }
     ```
  2. Add error boundaries:
     ```typescript
     // components/error-boundary.tsx
     'use client';

     import { Component } from 'react';

     export class ErrorBoundary extends Component {
       state = { hasError: false, error: null };

       static getDerivedStateFromError(error) {
         return { hasError: true, error };
       }

       render() {
         if (this.state.hasError) {
           return (
             <div className="error-container">
               <h2>Something went wrong</h2>
               <button onClick={() => this.setState({ hasError: false })}>
                 Try again
               </button>
             </div>
           );
         }

         return this.props.children;
       }
     }
     ```

### 4. Database Constraints
- Implementation Steps:
  1. Update Event model relations:
     ```prisma
     // prisma/schema.prisma
     model Event {
       id          String   @id @default(cuid())
       name        String
       date        DateTime
       type        String
       familyId    String
       hostId      String
       family      Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
       host        User     @relation("HostedEvents", fields: [hostId], references: [id])
       participants FamilyMember[]
       details     Json?
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt

       @@index([familyId])
       @@index([hostId])
     }

     model FamilyMember {
       id        String   @id @default(cuid())
       userId    String
       familyId  String
       name      String
       email     String
       role      String
       events    Event[]
       family    Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
       user      User     @relation(fields: [userId], references: [id])

       @@unique([userId, familyId])
       @@index([familyId])
       @@index([userId])
     }
     ```
  2. Add validation checks:
     ```typescript
     // utils/validation.ts
     export async function validateEventCreation(
       prisma: PrismaClient,
       data: EventCreationPayload
     ) {
       // Check if family exists
       const family = await prisma.family.findUnique({
         where: { id: data.familyId },
         include: { members: true }
       });

       if (!family) {
         throw new AppError(404, 'Family not found', 'FAMILY_NOT_FOUND');
       }

       // Verify host is family member
       const host = family.members.find(m => m.userId === data.hostId);
       if (!host) {
         throw new AppError(403, 'Host must be family member', 'INVALID_HOST');
       }

       // Verify all participants are family members
       const invalidParticipants = data.participants.filter(
         p => !family.members.some(m => m.id === p)
       );

       if (invalidParticipants.length > 0) {
         throw new AppError(
           400, 
           'All participants must be family members',
           'INVALID_PARTICIPANTS'
         );
       }

       return { family, host };
     }
     ```

## Phase 1: Core Features & Stability (Current)
- [x] User Authentication with Clerk
- [x] Family Management
  - [x] Create/Join Families
  - [x] Family Member Roles
  - [ ] Family Settings & Preferences
- [x] Event Management
  - [x] Create Events (Meals/Games)
  - [x] Event Details & Participants
  - [ ] Event Reminders
  - [ ] RSVP System

### Immediate Tasks
1. Fix Authentication/Headers Issues
   - [ ] Properly handle headers in API routes
   - [ ] Implement consistent error handling
   - [ ] Add request validation middleware
   - [ ] Fix headers() iteration errors in:
     - [ ] app/dashboard/page.tsx
     - [ ] app/api/events/route.ts
     - [ ] app/api/families/route.ts
     - [ ] app/(authenticated)/families/[familyId]/page.tsx
   - [ ] Implement proper error handling for event creation
   - [ ] Fix TypeError in event creation payload
   - [ ] Add proper type checking for API responses
   - [ ] Implement consistent session handling across routes

2. Data Model Improvements
   - [ ] Add cascade deletion for related records
   - [ ] Implement soft delete for important entities
   - [ ] Add audit trails for critical operations
   - [ ] Fix foreign key constraints in Event model
   - [ ] Add proper validation for Event-FamilyMember relationships
   - [ ] Implement proper error handling for database operations

3. API Enhancements
   - [ ] Rate limiting
   - [ ] Request caching
   - [ ] API documentation with Swagger/OpenAPI
   - [ ] Implement proper response formatting
   - [ ] Add request/response logging
   - [ ] Add API versioning

4. Authentication Flow Improvements
   - [ ] Implement proper headers handling middleware
   - [ ] Add session persistence
   - [ ] Improve error messages for auth failures
   - [ ] Add proper redirect handling
   - [ ] Implement proper token refresh
   - [ ] Add rate limiting for auth endpoints

## Phase 2: Enhanced Features (Q1 2024)
1. Event System Expansion
   - [ ] Recurring Events
   - [ ] Event Categories & Tags
   - [ ] Event Templates
   - [ ] Calendar Integration (Google/Apple)
   - [ ] Location Services & Maps Integration

2. Communication Features
   - [ ] In-app Notifications
   - [ ] Email Notifications
   - [ ] Family Chat/Message Board
   - [ ] Shared Family Calendar

3. Media Management
   - [ ] Photo Upload & Gallery
   - [ ] Album Organization
   - [ ] Media Sharing Controls
   - [ ] Cloud Storage Integration

## Phase 3: Social & Engagement (Q2 2024)
1. Social Features
   - [ ] Activity Feed
   - [ ] Family Updates
   - [ ] Member Profiles
   - [ ] Family Milestones

2. Gamification
   - [ ] Family Points System
   - [ ] Achievements & Badges
   - [ ] Event Participation Rewards
   - [ ] Family Challenges

3. Content & Recommendations
   - [ ] AI-Powered Event Suggestions
   - [ ] Recipe Database
   - [ ] Game Recommendations
   - [ ] Family Activity Ideas

## Phase 4: Advanced Features (Q3 2024)
1. Planning Tools
   - [ ] Meal Planning
   - [ ] Shopping Lists
   - [ ] Task Assignment
   - [ ] Family Budget Tracking

2. Integration & API
   - [ ] Public API
   - [ ] Third-party Integrations
   - [ ] Webhook Support
   - [ ] Developer Documentation

3. Analytics & Insights
   - [ ] Family Activity Reports
   - [ ] Engagement Metrics
   - [ ] Usage Analytics
   - [ ] Custom Dashboards

## Phase 5: Platform Expansion (Q4 2024)
1. Mobile Apps
   - [ ] iOS App
   - [ ] Android App
   - [ ] Cross-platform Sync

2. Premium Features
   - [ ] Subscription Tiers
   - [ ] Premium Content
   - [ ] Advanced Analytics
   - [ ] Priority Support

3. Community Features
   - [ ] Family Groups
   - [ ] Event Discovery
   - [ ] Public/Private Events
   - [ ] Community Guidelines

## Technical Improvements (Ongoing)
1. Performance
   - [ ] Image Optimization
   - [ ] Code Splitting
   - [ ] Database Optimization
   - [ ] Caching Strategy

2. Security
   - [ ] Regular Security Audits
   - [ ] Data Encryption
   - [ ] Privacy Controls
   - [ ] GDPR Compliance

3. Infrastructure
   - [ ] CI/CD Pipeline
   - [ ] Automated Testing
   - [ ] Monitoring & Alerting
   - [ ] Backup & Recovery

## Long-term Vision
1. Enterprise Features
   - [ ] Organization Accounts
   - [ ] Team Management
   - [ ] Custom Branding
   - [ ] Advanced Security

2. Platform Growth
   - [ ] International Support
   - [ ] Language Localization
   - [ ] Regional Content
   - [ ] Cultural Adaptations

3. Community Building
   - [ ] User Forums
   - [ ] Knowledge Base
   - [ ] Support System
   - [ ] Feature Requests

## Notes
- Priority levels may be adjusted based on user feedback
- Timeline is tentative and subject to change
- Features may be added or removed based on market needs
- Regular updates will be made to this roadmap 


### Family Member Profile Modal Enhancement

#### Current Issues
- Modal UI does not follow ShadcnUI design patterns
- Missing cuisine preference selector component
- Inconsistent with existing cuisine-selector.tsx implementation

#### Required Changes
1. UI/UX Improvements
   - [ ] Implement ShadcnUI modal component pattern
   - [ ] Add cuisine preference field using existing selector
   - [ ] Improve form layout and spacing
   - [ ] Add validation and error handling
   - [ ] Enhanced mobile responsiveness

2. Profile Data Structure
   - [ ] Add cuisine preferences to member schema
   - [ ] Include dietary restrictions field
   - [ ] Support multiple preference selections
   - [ ] Allow preference ranking/weighting

3. Integration Points
   - [ ] Connect to meal planning algorithm
   - [ ] Feed into event planning filters
   - [ ] Support profile updates post-invite
   - [ ] Sync with family group preferences

#### Implementation Priority
This enhancement is critical as the family member profile serves as foundational data for:
- Personalized meal recommendations
- Event planning and filtering
- Group preference aggregation
- Family member onboarding flow

The profile data will be used extensively by both the meal generator and event planner tools to create customized experiences based on combined participant preferences.