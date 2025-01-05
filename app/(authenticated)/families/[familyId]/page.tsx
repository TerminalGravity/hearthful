import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import FamilyMembers from "@/components/families/FamilyMembers";
import FamilyEvents from "@/components/families/FamilyEvents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Camera, UtensilsCrossed, GamepadIcon } from "lucide-react";
import { FamilyMember, Event, PhotoAlbum, Meal, Game } from "@prisma/client";

interface PageProps {
  params: {
    familyId: string;
  };
}

interface ExtendedEvent extends Event {
  familyMembers: FamilyMember[];
  photos: {
    id: string;
    url: string;
    albumId: string | null;
    album: PhotoAlbum | null;
  }[];
}

interface ExtendedPhotoAlbum extends PhotoAlbum {
  photos: {
    id: string;
    url: string;
  }[];
  event: Event | null;
}

interface ExtendedMeal extends Meal {
  photos: {
    id: string;
    url: string;
  }[];
}

interface ExtendedGame extends Game {
  photos: {
    id: string;
    url: string;
  }[];
}

interface ExtendedFamily {
  id: string;
  name: string;
  members: FamilyMember[];
  events: ExtendedEvent[];
  photoAlbums: ExtendedPhotoAlbum[];
  meals: ExtendedMeal[];
  games: ExtendedGame[];
}

export default async function FamilyPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const family = await db.family.findUnique({
    where: {
      id: params.familyId,
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          role: true,
          preferences: true,
          joinedAt: true,
        },
      },
      events: {
        include: {
          familyMembers: true,
          photos: {
            include: {
              album: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      },
      photoAlbums: {
        include: {
          photos: {
            select: {
              id: true,
              url: true,
            },
          },
          event: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      meals: {
        include: {
          photos: {
            select: {
              id: true,
              url: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      },
      games: {
        include: {
          photos: {
            select: {
              id: true,
              url: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      },
    },
  }) as ExtendedFamily | null;

  if (!family) {
    notFound();
  }

  // Check if user is a member of this family
  const isMember = family.members.some(member => member.userId === userId);
  if (!isMember) {
    redirect("/dashboard");
  }

  // Get user's role in the family
  const userRole = family.members.find(member => member.userId === userId)?.role;
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{family.name}</h1>
          <p className="text-gray-600 mt-2">
            {family.members.length} members
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-4">
            <a
              href={`/families/${family.id}/settings`}
              className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Settings
            </a>
          </div>
        )}
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>Manage and view family members</CardDescription>
          </CardHeader>
          <CardContent>
            <FamilyMembers 
              members={family.members}
              isAdmin={isAdmin}
              familyId={family.id}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Meals
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest family gatherings and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyEvents 
                  events={family.events}
                  familyId={family.id}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle>Photo Albums</CardTitle>
                <CardDescription>Memories from events and gatherings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {family.photoAlbums.map((album) => (
                    <div key={album.id} className="flex items-start space-x-4">
                      {album.photos[0] && (
                        <div className="h-24 w-24 rounded-lg overflow-hidden">
                          <img 
                            src={album.photos[0].url} 
                            alt={album.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{album.name}</h3>
                        <p className="text-sm text-gray-500">
                          {album.photos.length} photos
                        </p>
                        {album.event && (
                          <p className="text-sm text-primary">
                            From event: {album.event.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals">
            <Card>
              <CardHeader>
                <CardTitle>Recent Meals</CardTitle>
                <CardDescription>Family dinners and recipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {family.meals.map((meal) => (
                    <div key={meal.id} className="flex items-start space-x-4">
                      {meal.photos[0] && (
                        <div className="h-24 w-24 rounded-lg overflow-hidden">
                          <img 
                            src={meal.photos[0].url} 
                            alt={meal.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{meal.name}</h3>
                        <p className="text-sm text-gray-500">
                          {meal.participants.length} participants
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>Family game nights and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {family.games.map((game) => (
                    <div key={game.id} className="flex items-start space-x-4">
                      {game.photos[0] && (
                        <div className="h-24 w-24 rounded-lg overflow-hidden">
                          <img 
                            src={game.photos[0].url} 
                            alt={game.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <p className="text-sm text-gray-500">
                          {game.participants.length} participants
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 