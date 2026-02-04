# Internationalization (i18n) Guide for KRED

## Overview

KRED now supports multiple languages using **react-i18next**. Currently supported languages:
- 🇺🇸 **English** (en) - Default
- 🇪🇸 **Español** (es) - Spanish

## Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('game.title')}</h1>
      <p>{t('game.tagline')}</p>
      <button>{t('actions.play')}</button>
    </div>
  );
}
```

### Multiple Namespaces

```tsx
import { useTranslation } from 'react-i18next';

function ManualComponent() {
  // Load both 'common' and 'manual' namespaces
  const { t } = useTranslation(['common', 'manual']);
  
  return (
    <div>
      <h1>{t('manual:cover.title')}</h1>
      <p>{t('manual:cover.intro1')}</p>
      <button>{t('common:actions.close')}</button>
    </div>
  );
}
```

## File Structure

```
_KRED/
├── src/
│   ├── config/
│   │   └── i18n.ts                 # i18n configuration
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json         # UI text, buttons, common terms
│   │   │   └── manual.json         # Manual/documentation content
│   │   └── es/
│   │       ├── common.json         # Spanish UI translations
│   │       └── manual.json         # Spanish manual translations
│   └── components/
│       └── shared/
│           ├── LanguageSwitcher.tsx # Language selector component
│           ├── GameHeader.tsx       # Header with logo and lang switcher
│           └── ManualViewer.tsx     # Manual viewer using i18n
```

## Translation Namespaces

### `common` - UI Elements
- `game.*` - Game title, loading states, etc.
- `phases.*` - Game phase names (Campaign, Bureaucracy, etc.)
- `actions.*` - Button labels (Play, Pass, Challenge, etc.)
- `pieces.*` - Game piece names (Pawn, Heel, Mark)
- `locations.*` - Board locations (Office, Rostrum, Seat, etc.)
- `ui.*` - General UI labels (Player, Turn, Settings, etc.)
- `messages.*` - In-game messages and notifications

### `manual` - Documentation
- `cover.*` - Cover page content
- `contents.*` - Table of contents
- `glossary.*` - Game terminology
- `setup.*` - Game setup instructions
- `campaign.*` - Campaign phase rules
- `bureaucracy.*` - Bureaucracy phase rules

## Components

### LanguageSwitcher
Dropdown to change language. Automatically persists selection to localStorage.

```tsx
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

<LanguageSwitcher className="my-custom-class" />
```

### GameHeader
Header with KRED logo and optional language switcher.

```tsx
import GameHeader from '@/components/shared/GameHeader';

<GameHeader showLanguageSwitcher={true} />
```

### ManualViewer
Full manual viewer component using translations.

```tsx
import ManualViewer from '@/components/shared/ManualViewer';

<ManualViewer />
```

## Adding New Translations

### 1. Add to English (en)
Edit `/src/locales/en/common.json` or `/src/locales/en/manual.json`:

```json
{
  "mySection": {
    "myKey": "My English text"
  }
}
```

### 2. Add to Spanish (es)
Edit `/src/locales/es/common.json` or `/src/locales/es/manual.json`:

```json
{
  "mySection": {
    "myKey": "Mi texto en español"
  }
}
```

### 3. Use in Components
```tsx
const { t } = useTranslation('common');
<div>{t('mySection.myKey')}</div>
```

## Adding a New Language

### 1. Create Translation Files
```bash
mkdir -p src/locales/fr
cp src/locales/en/common.json src/locales/fr/common.json
cp src/locales/en/manual.json src/locales/fr/manual.json
# Translate content in the new files
```

### 2. Update i18n Config
Edit `src/config/i18n.ts`:

```typescript
import frManual from '../locales/fr/manual.json';
import frCommon from '../locales/fr/common.json';

const resources = {
  en: { ... },
  es: { ... },
  fr: {  // Add new language
    manual: frManual,
    common: frCommon,
  },
};
```

### 3. Update LanguageSwitcher
Edit `src/components/shared/LanguageSwitcher.tsx`:

```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },  // Add new language
];
```

## Best Practices

### 1. Use Nested Keys
```json
{
  "actions": {
    "play": "Play",
    "pass": "Pass",
    "challenge": "Challenge"
  }
}
```

### 2. Keep Keys Descriptive
❌ Bad: `t('btn1')`  
✅ Good: `t('actions.play')`

### 3. Use Default Values
```tsx
{t('some.key', { defaultValue: 'Fallback text' })}
```

### 4. Interpolation for Dynamic Content
```json
{
  "welcome": "Welcome, {{playerName}}!"
}
```

```tsx
{t('welcome', { playerName: player.name })}
```

### 5. Pluralization
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

```tsx
{t('items', { count: 5 })}  // "5 items"
```

## Language Detection

Languages are detected in this order:
1. **localStorage** - Previously selected language
2. **Browser settings** - Navigator language
3. **Fallback** - English (en)

Selected language is automatically saved to localStorage as `kred-language`.

## Testing Translations

### 1. Switch Language
Use the LanguageSwitcher component or programmatically:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const switchToSpanish = () => {
    i18n.changeLanguage('es');
  };
  
  return <button onClick={switchToSpanish}>Cambiar a Español</button>;
}
```

### 2. Check Current Language
```tsx
const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
```

### 3. Listen for Language Changes
```tsx
useEffect(() => {
  const handleLanguageChange = (lng: string) => {
    console.log('Language changed to:', lng);
  };
  
  i18n.on('languageChanged', handleLanguageChange);
  
  return () => {
    i18n.off('languageChanged', handleLanguageChange);
  };
}, [i18n]);
```

## Migration Checklist

When adding i18n to existing components:

- [ ] Import `useTranslation` hook
- [ ] Replace hardcoded strings with `t()` calls
- [ ] Add translation keys to JSON files
- [ ] Test in both languages
- [ ] Update component documentation

## Example: Migrating a Component

**Before:**
```tsx
function MyButton() {
  return <button>Play</button>;
}
```

**After:**
```tsx
import { useTranslation } from 'react-i18next';

function MyButton() {
  const { t } = useTranslation('common');
  return <button>{t('actions.play')}</button>;
}
```

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- Translation files: `_KRED/src/locales/`
- Configuration: `_KRED/src/config/i18n.ts`

## Support

For questions or issues with translations:
1. Check existing translation files in `src/locales/`
2. Review this guide
3. Test with the LanguageSwitcher component
4. Check browser console for i18n warnings
