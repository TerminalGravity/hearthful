import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const events = await db.event.findMany({
      where: {
        OR: [
          { hostId: userId },
          { 
            eventParticipants: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        host: true,
        family: true
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('[ACTIVITIES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 