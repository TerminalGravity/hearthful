# Event Planning

The Event Planning feature enables families to create, manage, and coordinate events within their family groups.

## Overview

Event Planning in Hearthful allows families to:
- Create and manage family events
- Send invitations and track RSVPs
- Share event details and updates
- Coordinate meals and activities
- Upload event photos and memories

## Features

### Event Creation
- Create events with detailed information
- Set date, time, and location
- Add description and agenda
- Upload event cover image
- Set event privacy and visibility

### Event Types
1. **One-time Events**
   - Family gatherings
   - Celebrations
   - Special occasions
   - Holiday events

2. **Recurring Events**
   - Weekly dinners
   - Monthly meetups
   - Annual celebrations
   - Birthday reminders

### RSVP Management
- Send invitations to family members
- Track attendance responses
- Manage guest list
- Send reminders
- Update event capacity

### Event Coordination

#### Meal Planning
- Create meal sign-up sheets
- Track dietary restrictions
- Coordinate potluck items
- Share recipes

#### Activity Planning
- Schedule activities
- Assign responsibilities
- Create task lists
- Track completion status

## Usage Examples

### Creating an Event

```typescript
// Using the Event Planning UI
1. Navigate to Events page
2. Click "Create New Event"
3. Fill in event details:
   - Title
   - Date & Time
   - Location
   - Description
4. Configure settings
5. Send invitations

// Using the API
const response = await fetch('/api/events', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Summer Family BBQ',
    date: '2024-07-04T18:00:00Z',
    location: '123 Family Street',
    description: 'Annual summer gathering',
    familyId: 'family_123'
  })
});
```

### Managing RSVPs

```typescript
// Track responses
const responses = {
  attending: 12,
  declined: 3,
  maybe: 2,
  noResponse: 5
};

// Send reminders
await sendReminders({
  eventId: 'event_123',
  filter: 'noResponse'
});
```

## Best Practices

1. **Event Creation**
   - Provide clear event descriptions
   - Set realistic timelines
   - Include all necessary details
   - Consider accessibility needs

2. **Invitation Management**
   - Send invitations early
   - Include RSVP deadlines
   - Provide contact information
   - Send timely reminders

3. **Event Coordination**
   - Assign clear responsibilities
   - Create detailed schedules
   - Plan for contingencies
   - Document decisions

## Common Issues

1. **RSVP Tracking**
   - Missing responses
   - Late responses
   - Changed responses
   - Capacity management

2. **Coordination**
   - Schedule conflicts
   - Task assignment
   - Resource allocation
   - Communication gaps

## Technical Details

### Data Model

```typescript
interface Event {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coverImage?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'attending' | 'declined' | 'maybe';
  guestCount?: number;
  notes?: string;
  respondedAt: Date;
}

interface EventTask {
  id: string;
  eventId: string;
  title: string;
  assignedTo?: string;
  status: 'pending' | 'completed';
  dueDate?: Date;
}
```

### State Management

```typescript
// React Query hooks for event management
const { data: event } = useQuery(['event', eventId], 
  () => fetchEvent(eventId)
);

const { mutate: updateEvent } = useMutation(
  (data) => updateEvent(eventId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId]);
    },
  }
);

// RSVP management
const { mutate: respondToEvent } = useMutation(
  (response) => submitRSVP(eventId, response),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['event', eventId, 'rsvps']);
    },
  }
);
```

## Integration Features

### Calendar Integration
- Google Calendar sync
- iCal export
- Outlook integration
- Calendar reminders

### Location Services
- Google Maps integration
- Directions
- Parking information
- Venue details

### Notifications
- Email notifications
- Push notifications
- SMS reminders
- RSVP updates

## Security and Privacy

1. **Event Privacy**
   - Family-only visibility
   - Invite-only access
   - Guest list privacy
   - Photo sharing controls

2. **Data Protection**
   - Location data security
   - RSVP information privacy
   - Guest list protection
   - Media access control

## Future Enhancements

1. **Planned Features**
   - Virtual event support
   - Hybrid event management
   - Advanced scheduling
   - Budget tracking

2. **Improvements**
   - Enhanced RSVP system
   - Better coordination tools
   - Improved notifications
   - More integration options 