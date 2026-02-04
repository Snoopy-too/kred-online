# KRED i18n Implementation

## Overview

KRED now supports full internationalization (i18n) with English and Spanish translations for the manual and UI elements.

## Features Implemented

### ✅ Core Infrastructure
- **react-i18next** integration with automatic language detection
- Persistent language selection (stored in localStorage)
- Fallback to English for missing translations
- Browser language detection

### ✅ Translation Files
Organized translation namespaces in `src/locales/`:

#### English (en)
- `common.json` - UI elements, buttons, game terms
- `manual.json` - Complete manual content

#### Spanish (es)
- `common.json` - Spanish UI translations
- `manual.json` - Spanish manual translations

### ✅ React Components
- **LanguageSwitcher** - Dropdown for language selection (🇺🇸/🇪🇸)
- **GameHeader** - Reusable header with logo and language switcher
- **ManualViewer** - Complete manual viewer using i18n

### ✅ Documentation
- **I18N_GUIDE.md** - Comprehensive developer guide
- Examples for adding new languages
- Best practices and patterns

## Quick Start

### For Users

1. **Switch Language:**
   - Look for the language dropdown (🇺🇸 English / 🇪🇸 Español)
   - Select your preferred language
   - The selection is saved automatically

### For Developers

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('game.title')}</h1>
      <button>{t('actions.play')}</button>
    </div>
  );
}
```

See [I18N_GUIDE.md](./I18N_GUIDE.md) for complete documentation.

## File Structure

```
_KRED/
├── src/
│   ├── config/
│   │   └── i18n.ts                    # i18n configuration
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json            # English UI translations
│   │   │   └── manual.json            # English manual
│   │   └── es/
│   │       ├── common.json            # Spanish UI translations
│   │       └── manual.json            # Spanish manual
│   └── components/
│       └── shared/
│           ├── LanguageSwitcher.tsx   # Language selector
│           ├── GameHeader.tsx         # Header with switcher
│           └── ManualViewer.tsx       # i18n manual viewer
├── docs/
│   └── I18N_GUIDE.md                  # Developer guide
└── index.tsx                          # i18n initialization
```

## Translation Coverage

### Common Translations (common.json)
- ✅ Game states and messages
- ✅ Phase names (Campaign, Bureaucracy, Challenge, etc.)
- ✅ Action buttons (Play, Pass, Challenge, Accept, etc.)
- ✅ Game pieces (Pawn, Heel, Mark)
- ✅ Board locations (Office, Rostrum, Seat, Community)
- ✅ UI elements (Player, Turn, Settings, Language, etc.)
- ✅ In-game notifications

### Manual Translations (manual.json)
- ✅ Cover page and introduction
- ✅ Table of contents
- ✅ Complete glossary
- ✅ Game setup instructions
- ✅ Campaign phase rules
- ✅ Bureaucracy phase rules
- 🔄 Remaining sections (can be added incrementally)

## Adding New Languages

### 1. Create Translation Files
```bash
mkdir -p src/locales/fr
cp src/locales/en/common.json src/locales/fr/common.json
cp src/locales/en/manual.json src/locales/fr/manual.json
```

### 2. Translate Content
Edit the new JSON files with French translations

### 3. Update Configuration
Edit `src/config/i18n.ts` to import French translations

### 4. Add to Language Switcher
Edit `src/components/shared/LanguageSwitcher.tsx` to add French option

See [I18N_GUIDE.md](./I18N_GUIDE.md) for detailed instructions.

## Usage Examples

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function WelcomeScreen() {
  const { t } = useTranslation('common');
  
  return <h1>{t('game.title')}</h1>;
}
```

### With Interpolation
```tsx
const { t } = useTranslation('common');
<p>{t('messages.playerTurn', { playerName: 'Alice' })}</p>
```

### Multiple Namespaces
```tsx
const { t } = useTranslation(['common', 'manual']);
<div>
  <h1>{t('manual:cover.title')}</h1>
  <button>{t('common:actions.close')}</button>
</div>
```

### Language Switcher
```tsx
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

<LanguageSwitcher className="position-fixed top-0 end-0 m-3" />
```

### Complete Header
```tsx
import GameHeader from '@/components/shared/GameHeader';

<GameHeader showLanguageSwitcher={true} />
```

## Migration Strategy

To migrate existing components to use i18n:

1. **Identify hardcoded strings** in the component
2. **Add translation keys** to appropriate JSON file (`common.json` or `manual.json`)
3. **Import useTranslation** hook
4. **Replace strings** with `t('key.path')`
5. **Test** in both English and Spanish
6. **Document** any new translation keys

Example migration:
```tsx
// Before
<button>Play Tile</button>

// After
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <button>{t('actions.play')}</button>;
}
```

## Testing

### Build
```bash
cd /var/www/fly.on/_KRED
npm run build
```

### Development
```bash
npm run dev
```

### Manual Testing
1. Start the app
2. Look for language switcher (top-right corner)
3. Switch between English and Spanish
4. Verify all text updates correctly
5. Reload page - language preference should persist

## Configuration

### i18n Settings
Location: `src/config/i18n.ts`

- **Fallback language:** English (en)
- **Default namespace:** common
- **Detection order:** localStorage → browser → fallback
- **LocalStorage key:** `kred-language`

### Browser Language Detection
The app automatically detects the browser's language preference on first visit. Users can override this with the language switcher.

## Dependencies

```json
{
  "i18next": "^23.x.x",
  "react-i18next": "^15.x.x",
  "i18next-browser-languagedetector": "^8.x.x"
}
```

## Resources

- **Developer Guide:** [I18N_GUIDE.md](./I18N_GUIDE.md)
- **Translation Files:** `src/locales/`
- **Configuration:** `src/config/i18n.ts`
- **Components:** `src/components/shared/`

## Future Enhancements

Potential improvements for the i18n system:

- [ ] Add more languages (French, German, Portuguese, etc.)
- [ ] Complete translation of all manual sections
- [ ] Add translation management UI for easy editing
- [ ] Implement RTL (right-to-left) support for Arabic, Hebrew
- [ ] Add context-based translations for game-specific terms
- [ ] Create translation validation tests
- [ ] Add translation coverage reporting
- [ ] Implement lazy loading for translation files
- [ ] Add translation contribution guidelines

## Contributing

To contribute translations:

1. Fork the repository
2. Add or update translation files in `src/locales/`
3. Test your translations
4. Submit a pull request

For translation questions or suggestions, please open an issue.

---

**Current Status:** ✅ Fully functional with English and Spanish support

**Last Updated:** February 2026
