---
name: global-patterns
description: Guidelines for standardizing confirmation dialogs, password visibility toggles, and fractional star ratings inside the Village Made website.
---

# Global UI Coding Patterns

When modifying forms, checkout segments, accounts, or auth screens in the Village Made application, adhere to the following core patterns:

## 1. Deletion & Sensitive Actions Confirmation
Never use the raw browser `window.confirm` method. Always pull the custom styled global dialog utility `showConfirm` from `useApp` context:

```typescript
const { showConfirm } = useApp();

showConfirm(
  'Confirm Title',
  'Description explaining the consequences of this action.',
  () => {
    // Action callback to execute on confirmation
  }
);
```

## 2. Password Visibility Toggles
Provide inline eye buttons for masking/unmasking passwords (e.g. Login, Registration, and Recovery).
- Use `Eye` and `EyeOff` icons from `lucide-react`.
- Place inside a `.relative` wrapper div with absolute positioning for the toggle button:
```tsx
<div className="relative">
  <input type={showPassword ? "text" : "password"} ... />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
  >
    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
  </button>
</div>
```

## 3. Decimal/Fractional Star Ratings
When capturing or rendering reviews:
- Constrain numeric rating inputs to a single decimal place:
```typescript
let valStr = e.target.value;
if (valStr.includes('.')) {
  const [integerPart, decimalPart] = valStr.split('.');
  valStr = `${integerPart}.${decimalPart.slice(0, 1)}`;
}
```
- Draw precise star widths by stacking a gold star over a light gray base using absolute widths matching percentages:
```tsx
{[1, 2, 3, 4, 5].map((i) => {
  let fillWidth = '0%';
  if (rating >= i) fillWidth = '100%';
  else if (rating > i - 1) fillWidth = `${(rating - (i - 1)) * 100}%`;

  return (
    <div key={i} className="relative inline-block text-stone-200">
      <span>★</span>
      <div 
        className="absolute top-0 left-0 overflow-hidden h-full text-amber-500" 
        style={{ width: fillWidth }}
      >
        <span>★</span>
      </div>
    </div>
  );
})}
```
