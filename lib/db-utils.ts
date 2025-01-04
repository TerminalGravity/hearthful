import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '@/utils/error-handling';

export class DatabaseError extends AppError {
  constructor(message: string, code: string, details?: any) {
    super(500, message, code);
    this.details = details;
  }
  details?: any;
}

export const prisma = new PrismaClient();

// Add middleware for soft delete
prisma.$use(async (params, next) => {
  // Check if this is a soft-deletable model
  const softDeletableModels = ['Family', 'Event'];
  if (softDeletableModels.includes(params.model)) {
    if (params.action === 'delete') {
      // Convert delete to update
      params.action = 'update';
      params.args.data = { isDeleted: true, deletedAt: new Date() };
    }
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Add isDeleted filter
      params.args.where = { ...params.args.where, isDeleted: false };
    }
    if (params.action === 'findMany') {
      if (!params.args) params.args = { where: { isDeleted: false } };
      else if (!params.args.where) params.args.where = { isDeleted: false };
      else params.args.where = { ...params.args.where, isDeleted: false };
    }
  }
  return next(params);
});

// Add middleware for audit logging
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  // Log write operations
  if (['create', 'update', 'delete', 'upsert'].includes(params.action)) {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.model,
        entityId: result?.id || 'unknown',
        details: {
          params: params.args,
          result,
        },
        userId: params.args?.userId || 'system',
      },
    }).catch(error => {
      console.error('Failed to create audit log:', error);
    });
  }
  
  return result;
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
              isDeleted: false,
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