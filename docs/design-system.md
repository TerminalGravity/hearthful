# Hearthful Design System

## Color System

### Brand Colors

```css
Primary (Blue)
- Default: #4A90E2 - Main actions, links, and primary buttons
- Hover: #357ABD - Hover state for primary elements
- Light: #7FB1EB - Backgrounds, highlights
- Dark: #2C5C8F - Text on light backgrounds

Secondary (Teal)
- Default: #50E3C2 - Secondary actions and accents
- Hover: #3BC7A7 - Hover state for secondary elements
- Light: #7EEBD5 - Subtle backgrounds
- Dark: #2B9C82 - Text on light backgrounds
```

### Status Colors

```css
Success: #7ED321 - Positive actions and confirmations
Warning: #F5A623 - Warnings and important notices
Error: #D0021B - Error states and destructive actions
```

### Neutral Colors

```css
White: #FFFFFF (neutral-100)
Light Gray: #F7F7F7 (neutral-200) - Background
Border Gray: #E5E5E5 (neutral-300)
Medium Gray: #808080 (neutral-500)
Text Gray: #333333 (neutral-800)
Dark Gray: #1C1C1C (neutral-900)
```

## Typography

### Font Families
```css
Sans: var(--font-sans), system-ui, sans-serif
Heading: var(--font-heading), system-ui, sans-serif
```

### Text Styles

```css
.heading-1 { /* Large titles */
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.heading-2 { /* Section headers */
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.heading-3 { /* Subsections */
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
}

.text-body { /* Body text */
  font-size: 1rem;
  line-height: 1.75;
}
```

## Components

### Buttons

```jsx
// Primary Button
<button className="button-primary">
  Primary Action
</button>

// Secondary Button
<button className="button-secondary">
  Secondary Action
</button>

// Success Button
<button className="button-success">
  Confirm Action
</button>

// Warning Button
<button className="button-warning">
  Warning Action
</button>

// Error Button
<button className="button-error">
  Delete Action
</button>
```

### Cards

```jsx
// Basic Card
<div className="card">
  Card Content
</div>

// Card with Shadow
<div className="card-shadow">
  Card Content with Shadow
</div>
```

### Status Badges

```jsx
// Success Badge
<span className="badge-success">Success</span>

// Warning Badge
<span className="badge-warning">Warning</span>

// Error Badge
<span className="badge-error">Error</span>
```

### Form Elements

```jsx
// Basic Input
<input className="input-base" type="text" />

// Textarea
<textarea className="input-base" />

// Select
<select className="input-base">
  <option>Option 1</option>
</select>
```

## Layout Utilities

### Container
```jsx
<div className="container-padding">
  // Content with responsive padding
</div>
```

### Grid
```jsx
<div className="grid-responsive">
  // Responsive grid with 1-3 columns
</div>
```

### Flexbox
```jsx
<div className="flex-center">
  // Centered content
</div>
```

## Animations

```css
.animate-fade-in { /* Fade in animation */
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-in { /* Slide in from left */
  animation: slideIn 0.3s ease-in-out;
}

.animate-slide-up { /* Slide up from bottom */
  animation: slideUp 0.3s ease-in-out;
}
```

## Dark Mode

The design system includes a comprehensive dark mode that automatically adjusts colors and contrasts. To enable dark mode, add the `dark` class to any parent element:

```html
<div class="dark">
  <!-- Content will use dark mode styles -->
</div>
```

## Accessibility

The design system follows WCAG guidelines:
- All colors meet AA contrast requirements
- Focus states are clearly visible
- Interactive elements have appropriate hover/focus states
- Reduced motion preferences are respected

## Best Practices

1. Use semantic color names rather than raw hex values
2. Maintain consistent spacing using the spacing scale
3. Use provided utility classes for common patterns
4. Follow accessibility guidelines for interactive elements
5. Test components in both light and dark modes 