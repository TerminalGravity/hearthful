# Recipe Management

The Recipe Management feature enables families to share, discover, and preserve family recipes across generations.

## Overview

Recipe Management in Hearthful allows families to:
- Create and share family recipes
- Organize recipes by category
- Plan meals for events
- Scale recipes for different group sizes
- Preserve cooking traditions

## Features

### Recipe Creation
- Add detailed recipes
- Upload recipe photos
- Include cooking tips
- Set preparation time
- Add nutritional info

### Recipe Organization

#### Categories
- Main dishes
- Side dishes
- Desserts
- Beverages
- Family favorites
- Holiday specials

#### Collections
- Family traditions
- Holiday recipes
- Quick meals
- Kid-friendly
- Dietary specific
- Event menus

### Recipe Details

#### Basic Information
- Recipe name
- Preparation time
- Cooking time
- Servings
- Difficulty level
- Cost estimate

#### Ingredients
- Ingredient lists
- Quantity measurements
- Substitution options
- Scaling calculations
- Shopping lists

#### Instructions
- Step-by-step guide
- Cooking techniques
- Tips and tricks
- Common mistakes
- Success indicators

## Usage Examples

### Creating a Recipe

```typescript
// Using the Recipe UI
1. Navigate to Recipes page
2. Click "Add New Recipe"
3. Fill in recipe details:
   - Name and description
   - Ingredients
   - Instructions
   - Photos
4. Add tags and categories
5. Save and share

// Using the API
const response = await fetch('/api/families/${familyId}/recipes', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Grandma\'s Apple Pie',
    description: 'A traditional family recipe',
    servings: 8,
    prepTime: '30 minutes',
    cookTime: '45 minutes',
    ingredients: [
      { item: 'Apples', amount: '6', unit: 'large' },
      { item: 'Sugar', amount: '1', unit: 'cup' }
    ],
    instructions: [
      'Preheat oven to 375°F',
      'Prepare pie crust...'
    ]
  })
});
```

### Recipe Scaling

```typescript
// Scale recipe for different serving sizes
function scaleRecipe(recipe, targetServings) {
  const scaleFactor = targetServings / recipe.servings;
  return {
    ...recipe,
    servings: targetServings,
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: ingredient.amount * scaleFactor
    }))
  };
}
```

## Best Practices

1. **Recipe Creation**
   - Use clear measurements
   - Include prep details
   - Add helpful photos
   - Note special equipment
   - Include serving suggestions

2. **Recipe Organization**
   - Use consistent categories
   - Add relevant tags
   - Include occasion tags
   - Note dietary restrictions
   - Mark family favorites

3. **Recipe Sharing**
   - Include family history
   - Add personal notes
   - Share cooking tips
   - Note modifications
   - Credit original sources

## Technical Details

### Data Model

```typescript
interface Recipe {
  id: string;
  familyId: string;
  createdBy: string;
  name: string;
  description?: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  costEstimate?: 'budget' | 'moderate' | 'expensive';
  photos: string[];
  categories: string[];
  tags: string[];
  ingredients: Array<{
    item: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    text: string;
    photo?: string;
  }>;
  notes?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeCollection {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  recipeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MealPlan {
  id: string;
  familyId: string;
  eventId?: string;
  name: string;
  date: Date;
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipes: string[];
    notes?: string;
  }>;
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management

```typescript
// React Query hooks for recipe management
const { data: recipe } = useQuery(['recipe', recipeId], 
  () => fetchRecipe(recipeId)
);

const { mutate: updateRecipe } = useMutation(
  (data) => updateRecipe(recipeId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['recipe', recipeId]);
    },
  }
);

// Shopping list generation
const { data: shoppingList } = useQuery(
  ['shopping-list', mealPlanId],
  () => generateShoppingList(mealPlanId)
);
```

## Integration Features

### AI Features
- Recipe suggestions
- Ingredient substitutions
- Cooking tips
- Nutritional analysis
- Similar recipe finding

### Meal Planning
- Event menu planning
- Grocery list generation
- Cost estimation
- Dietary tracking
- Portion calculation

### Shopping Integration
- Grocery list export
- Online shopping links
- Price comparison
- Ingredient availability
- Store recommendations

## Security and Privacy

1. **Recipe Access**
   - Family-only recipes
   - Public sharing options
   - Version control
   - Attribution tracking

2. **Data Protection**
   - Recipe ownership
   - Sharing permissions
   - Usage tracking
   - Backup systems

## Performance Optimization

1. **Recipe Loading**
   - Image optimization
   - Lazy loading
   - Cache management
   - Prefetching

2. **Search Optimization**
   - Recipe indexing
   - Smart filtering
   - Quick suggestions
   - Category caching

## Future Enhancements

1. **Planned Features**
   - Video tutorials
   - Voice instructions
   - Kitchen timer
   - Unit conversion
   - Print formatting

2. **Smart Features**
   - AI recipe creation
   - Taste preferences
   - Dietary tracking
   - Cost optimization
   - Seasonal suggestions 