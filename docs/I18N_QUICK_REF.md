# i18n Quick Reference Card

## Import
```tsx
import { useTranslation } from 'react-i18next';
```

## Basic Usage
```tsx
const { t } = useTranslation('common');
<button>{t('actions.play')}</button>
```

## Multiple Namespaces
```tsx
const { t } = useTranslation(['common', 'manual']);
<h1>{t('manual:setup.title')}</h1>
<button>{t('common:actions.close')}</button>
```

## Common Keys

### Actions
- `t('actions.play')` → "Play" / "Jugar"
- `t('actions.pass')` → "Pass" / "Pasar"
- `t('actions.challenge')` → "Challenge" / "Desafiar"
- `t('actions.accept')` → "Accept" / "Aceptar"
- `t('actions.confirm')` → "Confirm" / "Confirmar"
- `t('actions.cancel')` → "Cancel" / "Cancelar"

### Game Elements
- `t('pieces.pawn')` → "Pawn" / "Peón"
- `t('pieces.heel')` → "Heel" / "Tacón"
- `t('pieces.mark')` → "Mark" / "Marca"
- `t('locations.office')` → "Office" / "Oficina"
- `t('locations.rostrum')` → "Rostrum" / "Podio"
- `t('locations.seat')` → "Seat" / "Asiento"

### Phases
- `t('phases.campaign')` → "Campaign" / "Campaña"
- `t('phases.bureaucracy')` → "Bureaucracy" / "Burocracia"
- `t('phases.challenge')` → "Challenge" / "Desafío"
- `t('phases.drafting')` → "Drafting" / "Selección de Fichas"

### UI
- `t('ui.player')` → "Player" / "Jugador"
- `t('ui.turn')` → "Turn" / "Turno"
- `t('ui.credibility')` → "Credibility" / "Credibilidad"
- `t('ui.funding')` → "Funding" / "Financiamiento"

## Components
```tsx
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import GameHeader from '@/components/shared/GameHeader';
import ManualViewer from '@/components/shared/ManualViewer';

<LanguageSwitcher />
<GameHeader showLanguageSwitcher={true} />
<ManualViewer />
```

## Change Language
```tsx
const { i18n } = useTranslation();
i18n.changeLanguage('es'); // Switch to Spanish
i18n.changeLanguage('en'); // Switch to English
```

## Current Language
```tsx
const { i18n } = useTranslation();
console.log(i18n.language); // 'en' or 'es'
```

## Interpolation
```json
// In translation file:
{ "welcome": "Welcome, {{name}}!" }
```
```tsx
// In component:
{t('welcome', { name: playerName })}
```

## Pluralization
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```
```tsx
{t('items', { count: itemCount })}
```

## Default Values
```tsx
{t('some.missing.key', { defaultValue: 'Fallback text' })}
```

## File Locations
- Config: `src/config/i18n.ts`
- English: `src/locales/en/`
- Spanish: `src/locales/es/`
- Components: `src/components/shared/`

## Full Guide
See [I18N_GUIDE.md](./I18N_GUIDE.md) for complete documentation.
