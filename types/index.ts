export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  dietaryRestrictions?: string[];
  gamePreferences?: string[];
  notes?: string;
}

export interface FamilyMembersProps {
  members: FamilyMember[];
  isAdmin: boolean;
  familyId: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string | null;
  participants: FamilyMember[];
}

export interface Family {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  events: Event[];
  _count: {
    members: number;
    events: number;
    meals: number;
    games: number;
  };
} 