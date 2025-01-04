# Database Schema Documentation

## Core Models

### User
```prisma
model User {
  id            String         @id
  email         String        @unique
  displayName   String?
  preferences   Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Relationships
  familyMembers FamilyMember[]
  hostedEvents  Event[]       @relation("HostedEvents")
  
  @@index([email])
}
```

### Family
```prisma
model Family {
  id          String        @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relationships
  members     FamilyMember[]
  events      Event[]
  meals       Meal[]
  games       Game[]
  
  // Soft delete
  isDeleted   Boolean       @default(false)
  deletedAt   DateTime?
  
  @@index([name])
}
```

### FamilyMember
```prisma
model FamilyMember {
  id        String   @id @default(cuid())
  userId    String
  familyId  String
  name      String
  email     String
  role      Role     @default(MEMBER)
  joinedAt  DateTime @default(now())
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  family    Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  events    Event[]
  
  // Constraints
  @@unique([userId, familyId])
  @@index([userId])
  @@index([familyId])
}

enum Role {
  ADMIN
  MEMBER
  GUEST
}
```

### Event
```prisma
model Event {
  id          String       @id @default(cuid())
  name        String
  description String?
  date        DateTime
  type        EventType
  status      EventStatus  @default(SCHEDULED)
  familyId    String
  hostId      String
  
  // Relationships
  family      Family       @relation(fields: [familyId], references: [id], onDelete: Cascade)
  host        User         @relation("HostedEvents", fields: [hostId], references: [id])
  participants FamilyMember[]
  
  // Additional details
  details     Json?
  location    String?
  
  // Metadata
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  canceledAt  DateTime?
  
  // Soft delete
  isDeleted   Boolean      @default(false)
  deletedAt   DateTime?
  
  @@index([familyId])
  @@index([hostId])
  @@index([date])
}

enum EventType {
  MEAL
  GAME
  OTHER
}

enum EventStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELED
}
```

### Meal (Extends Event)
```prisma
model Meal {
  id          String   @id @default(cuid())
  eventId     String   @unique
  familyId    String
  type        MealType
  cuisine     String?
  dietary     String[]
  servings    Int?
  
  // Relationships
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  family      Family   @relation(fields: [familyId], references: [id])
  
  @@index([familyId])
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
  OTHER
}
```

### Game (Extends Event)
```prisma
model Game {
  id          String   @id @default(cuid())
  eventId     String   @unique
  familyId    String
  gameType    String
  minPlayers  Int?
  maxPlayers  Int?
  duration    Int?     // in minutes
  ageRange    String?
  
  // Relationships
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  family      Family   @relation(fields: [familyId], references: [id])
  
  @@index([familyId])
}
```

## Audit & Logging

### AuditLog
```prisma
model AuditLog {
  id          String      @id @default(cuid())
  userId      String
  action      String
  entityType  String
  entityId    String
  details     Json?
  timestamp   DateTime    @default(now())
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([timestamp])
}
```

## Best Practices

1. **Soft Deletion**
   - Use `isDeleted` and `deletedAt` fields for recoverable data
   - Implement cascade soft deletion for related records
   - Add middleware to filter soft-deleted records

2. **Indexing Strategy**
   - Index foreign keys for relationships
   - Index frequently queried fields
   - Use compound indexes for common query patterns

3. **Data Integrity**
   - Use foreign key constraints
   - Implement proper cascading behavior
   - Add unique constraints where needed

4. **Audit Trail**
   - Log all important data changes
   - Track user actions
   - Maintain history for compliance

## Migration Strategy

1. **Initial Setup**
```bash
# Generate migration
prisma migrate dev --name init

# Apply migration
prisma migrate deploy
```

2. **Adding New Features**
```bash
# Create migration
prisma migrate dev --name add_feature_x

# Update schema
prisma generate
```

3. **Rollback Strategy**
```bash
# Revert last migration
prisma migrate reset
prisma migrate dev
```

## Data Access Patterns

1. **User Authentication**
```typescript
// Get user with family memberships
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    familyMembers: {
      include: {
        family: true
      }
    }
  }
});
```

2. **Event Management**
```typescript
// Create event with participants
const event = await prisma.event.create({
  data: {
    name,
    date,
    type,
    family: { connect: { id: familyId } },
    host: { connect: { id: hostId } },
    participants: {
      connect: participantIds.map(id => ({ id }))
    }
  }
});
```

3. **Family Operations**
```typescript
// Get family with all relationships
const family = await prisma.family.findUnique({
  where: { id: familyId },
  include: {
    members: true,
    events: {
      where: {
        date: { gte: new Date() },
        isDeleted: false
      }
    }
  }
});
``` 