export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
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
  participants: {
    id: string;
    name: string;
  }[];
}

export interface FamilyEventsProps {
  events: Event[];
  familyId: string;
} 