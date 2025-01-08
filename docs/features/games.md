# Games and Activities

The Games feature helps families discover, plan, and organize fun activities and games for their gatherings.

## Overview

The Games feature in Hearthful enables families to:
- Get AI-powered game recommendations
- Plan activities for events
- Track favorite family games
- Share game experiences
- Organize game collections

## Features

### Game Discovery

#### AI Recommendations
- Age-appropriate suggestions
- Group size optimization
- Occasion-based games
- Indoor/outdoor options
- Skill level matching

#### Categories
- Board games
- Card games
- Party games
- Outdoor activities
- Ice breakers
- Team building

### Game Planning

#### Event Integration
- Activity scheduling
- Time management
- Equipment tracking
- Space requirements
- Weather considerations

#### Group Management
- Team formation
- Role assignments
- Skill matching
- Age grouping
- Participation tracking

### Game Library

#### Game Details
- Rules and instructions
- Playing time
- Player count
- Age range
- Difficulty level
- Equipment needed

#### Collections
- Family favorites
- Event specific
- Age groups
- Indoor/outdoor
- Quick games
- Tournament games

## Usage Examples

### Getting Game Recommendations

```typescript
// Using the Games UI
1. Navigate to Games page
2. Set preferences:
   - Number of players
   - Age range
   - Time available
   - Indoor/outdoor
3. Get recommendations

// Using the API
const response = await fetch('/api/games/recommend', {
  method: 'POST',
  body: JSON.stringify({
    players: {
      count: 8,
      ageRange: { min: 5, max: 70 }
    },
    duration: '30 minutes',
    location: 'indoor',
    occasion: 'family_gathering'
  })
});
```

### Planning Event Activities

```typescript
// Activity scheduling
const schedule = {
  event: 'Family Reunion',
  activities: [
    {
      time: '2:00 PM',
      game: 'Ice Breaker Bingo',
      duration: '30 minutes',
      location: 'Main Hall',
      equipment: ['Bingo cards', 'Markers']
    },
    {
      time: '3:00 PM',
      game: 'Outdoor Scavenger Hunt',
      duration: '45 minutes',
      location: 'Garden',
      teams: 4
    }
  ]
};
```

## Best Practices

1. **Game Selection**
   - Consider all age groups
   - Mix activity types
   - Plan alternatives
   - Check equipment
   - Test beforehand

2. **Activity Planning**
   - Schedule wisely
   - Include breaks
   - Have backups ready
   - Consider mobility
   - Check weather

3. **Group Management**
   - Balance teams fairly
   - Rotate activities
   - Include everyone
   - Monitor energy
   - Adapt as needed

## Technical Details

### Data Model

```typescript
interface Game {
  id: string;
  name: string;
  description: string;
  type: 'board' | 'card' | 'party' | 'outdoor' | 'ice_breaker';
  playerCount: {
    min: number;
    max: number;
    recommended: number;
  };
  ageRange: {
    min: number;
    max?: number;
  };
  duration: {
    min: number;  // minutes
    max: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  location: 'indoor' | 'outdoor' | 'both';
  equipment: string[];
  instructions: string;
  rules: string[];
  tips: string[];
  categories: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface GameCollection {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  games: string[];  // Game IDs
  createdAt: Date;
  updatedAt: Date;
}

interface ActivityPlan {
  id: string;
  eventId: string;
  activities: Array<{
    time: string;
    gameId: string;
    duration: number;
    location: string;
    equipment?: string[];
    teams?: number;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management

```typescript
// React Query hooks for game management
const { data: gameRecommendations } = useQuery(
  ['games', 'recommend', preferences],
  () => getRecommendations(preferences)
);

const { data: activityPlan } = useQuery(
  ['activity-plan', eventId],
  () => getActivityPlan(eventId)
);

// Activity planning mutations
const { mutate: updateActivity } = useMutation(
  (data) => updateActivityPlan(eventId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-plan', eventId]);
    },
  }
);
```

## Integration Features

### AI Integration
- Smart recommendations
- Age matching
- Group optimization
- Weather adaptation
- Learning preferences

### Event Integration
- Schedule coordination
- Equipment management
- Space allocation
- Team organization
- Backup planning

### Family Profiles
- Age tracking
- Skill levels
- Preferences
- Participation history
- Favorite games

## Security and Privacy

1. **Game Data**
   - Age-appropriate filtering
   - Content moderation
   - Family preferences
   - Usage tracking

2. **Activity Planning**
   - Event privacy
   - Participant privacy
   - Photo permissions
   - Location sharing

## Performance Optimization

1. **Recommendation Engine**
   - Cache popular games
   - Pre-compute matches
   - Background updates
   - Progressive loading

2. **Activity Planning**
   - Offline support
   - Quick updates
   - Real-time sync
   - Schedule optimization

## Future Enhancements

1. **Planned Features**
   - Virtual game support
   - Tournament planning
   - Achievement system
   - Rating system
   - Game sharing

2. **Smart Features**
   - Dynamic scheduling
   - Weather integration
   - Equipment sharing
   - Team balancing
   - Performance tracking 