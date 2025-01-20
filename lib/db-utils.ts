import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '@/utils/error-handling';

declare global {
  var cachedPrisma: PrismaClient;
}

export class DatabaseError extends AppError {
  public details?: any;
  public code: string;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;

// Add middleware for soft delete
prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  // Check if this is a soft-deletable model
  const softDeletableModels = ['Family', 'Event'];
  if (params.model && softDeletableModels.includes(params.model)) {
    if (params.action === 'delete') {
      // Convert delete to update
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Add deletedAt filter
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'findMany') {
      if (!params.args) params.args = { where: { deletedAt: null } };
      else if (!params.args.where) params.args.where = { deletedAt: null };
      else params.args.where = { ...params.args.where, deletedAt: null };
    }
  }
  return next(params);
});

export async function safeTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(operation);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new DatabaseError('Unique constraint violation', 'DB_UNIQUE_VIOLATION', error);
        case 'P2003':
          throw new DatabaseError('Foreign key constraint violation', 'DB_FOREIGN_KEY_VIOLATION', error);
        case 'P2025':
          throw new DatabaseError('Record not found', 'DB_RECORD_NOT_FOUND', error);
        default:
          throw new DatabaseError('Database error', `DB_ERROR_${error.code}`, error);
      }
    }
    throw new DatabaseError('Unknown database error', 'DB_UNKNOWN_ERROR', error);
  }
}

export const dbOperations = {
  // User operations
  async getUser(userId: string) {
    return await safeTransaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          userPreferences: true,
          familyMembers: {
            include: {
              family: true,
            },
          },
        },
      });
      if (!user) throw new DatabaseError('User not found', 'DB_USER_NOT_FOUND');
      return user;
    });
  },

  // Family operations
  async createFamily(data: Prisma.FamilyCreateInput) {
    return await safeTransaction(async (tx) => {
      return await tx.family.create({
        data,
        include: {
          members: true,
        },
      });
    });
  },

  async getFamilyWithMembers(familyId: string) {
    return await safeTransaction(async (tx) => {
      const family = await tx.family.findUnique({
        where: { id: familyId },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          events: {
            where: {
              date: { gte: new Date() },
              deletedAt: null,
            },
            include: {
              participants: true,
            },
          },
        },
      });
      if (!family) throw new DatabaseError('Family not found', 'DB_FAMILY_NOT_FOUND');
      return family;
    });
  },

  // Event operations
  async createEvent(data: Prisma.EventCreateInput) {
    return await safeTransaction(async (tx) => {
      // Verify family exists
      const family = await tx.family.findUnique({
        where: { id: data.family.connect?.id },
      });
      if (!family) throw new DatabaseError('Family not found', 'DB_FAMILY_NOT_FOUND');

      // Verify host is family member
      const hostMembership = await tx.familyMember.findFirst({
        where: {
          familyId: data.family.connect?.id,
          userId: data.host.connect?.id,
        },
      });
      if (!hostMembership) {
        throw new DatabaseError('Host must be family member', 'DB_INVALID_HOST');
      }

      return await tx.event.create({
        data,
        include: {
          family: true,
          host: true,
          participants: true,
        },
      });
    });
  },

  async getEvent(eventId: string) {
    return await safeTransaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          family: true,
          host: true,
          participants: true,
        },
      });
      if (!event) throw new DatabaseError('Event not found', 'DB_EVENT_NOT_FOUND');
      return event;
    });
  },
}; 