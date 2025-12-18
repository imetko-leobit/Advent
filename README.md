# Well Being Quest

An interactive gamified wellness tracking application for Leobit employees. Users complete wellness tasks and track their progress on a visual quest map.

## Technology Stack

- **Frontend**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **UI Components**: PrimeReact
- **Animations**: Framer Motion
- **Authentication**: OpenID Connect (OIDC)
- **Data Source**: Google Sheets (CSV export)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Access to Leobit OIDC authentication
- Google Sheets CSV URL

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - VITE_GOOGLE_SHEET_URL
# - VITE_APP_AUTH_AUTHORITY
# - VITE_APP_AUTH_REDIRECT_URI
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Documentation

### Core Documentation

- **[QUEST_RULES.md](./QUEST_RULES.md)** - Complete business rules and quest lifecycle
  - Quest states and transitions
  - Task model and completion rules
  - Position calculation algorithm
  - User visibility rules
  - Finish conditions

- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration guide
  - All configurable values explained
  - Environment variables
  - Configuration change procedures
  - Common scenarios and examples

- **[CSV_SCHEMA.md](./CSV_SCHEMA.md)** - Google Sheets data contract
  - Required and optional columns
  - Data validation rules
  - Error handling behavior
  - Example CSV structure

### Technical Documentation

- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** - High-level architecture overview
- **[TECHNICAL_ASSESSMENT.md](./TECHNICAL_ASSESSMENT.md)** - Detailed technical assessment

## Project Structure

```
src/
├── config/           # Centralized configuration
│   └── questConfig.ts
├── domain/           # Business logic layer
│   ├── questRules.ts      # Quest business rules
│   └── csvValidation.ts   # Data validation
├── components/       # React components
├── consts/          # Constants and types
├── helpers/         # Utility functions
├── hooks/           # Custom React hooks
├── context/         # React context providers
├── pages/           # Page components
├── router/          # Routing configuration
└── assets/          # Static assets (SVG, images)
```

## Key Features

### Quest System

- **15 Positions**: Start (0) + 5 core tasks + 9 extended tasks
- **Milestone Celebrations**: First finish at position 9, final completion at position 14
- **Real-time Updates**: Data refreshes every 3 minutes
- **Visual Progress**: Interactive SVG map with animated user avatars

### Data Validation

- Runtime CSV validation with error recovery
- Graceful degradation for malformed data
- Detailed error logging for debugging

### Safety Features

- Fallback avatar for missing photos
- Previous data retained on fetch errors
- No application crashes on data issues

### Configuration

All magic numbers and external dependencies are configurable:

- Quest structure (task counts, finish thresholds)
- Data fetching (polling interval, CSV URL)
- External APIs (photo service URL)
- UI behavior (avatar counts, stacking)

## Configuration

### Quest Configuration

Located in `src/config/questConfig.ts`:

```typescript
export const QUEST_CONFIG = {
  TOTAL_POSITIONS: 15,
  CORE_TASKS_COUNT: 5,
  FIRST_FINISH_THRESHOLD: 9,
  FINAL_COMPLETION_THRESHOLD: 14,
  START_POSITION: 0,
};
```

See [CONFIGURATION.md](./CONFIGURATION.md) for complete details.

### Environment Variables

Create a `.env` file with:

```bash
VITE_GOOGLE_SHEET_URL=<Your Google Sheets CSV URL>
VITE_APP_AUTH_AUTHORITY=<Your OIDC Authority URL>
VITE_APP_AUTH_REDIRECT_URI=<Your App URL>
```

## Architecture Highlights

### Centralized Business Logic

All business rules are in one place:

```typescript
// Domain layer (src/domain/questRules.ts)
import { isFirstFinishMilestone, getFinishScreenType } from '../domain/questRules';

// Instead of scattered magic numbers
if (isFirstFinishMilestone(taskNumber)) {
  showFinishScreen();
}
```

### Data Validation

```typescript
// Validation with graceful error handling
import { processCsvData } from '../domain/csvValidation';

const { validData, validation } = processCsvData(csvData);
// Uses validData even if some rows are invalid
```

### Type Safety

- Full TypeScript coverage
- No `any` types (except where necessary with eslint-disable)
- Strict type checking enabled

## Development Guidelines

### Making Changes

1. **Configuration changes**: Update `src/config/questConfig.ts`
2. **Business logic changes**: Update `src/domain/questRules.ts`
3. **Data validation changes**: Update `src/domain/csvValidation.ts`
4. **UI changes**: Update components (keep business logic out)

### Before Committing

```bash
# Ensure code builds
npm run build

# Ensure linting passes
npm run lint
```

### Adding New Tasks

See [CONFIGURATION.md](./CONFIGURATION.md) for step-by-step guide.

## Troubleshooting

### Common Issues

**Users not appearing**:
- Check CSV column names match configuration
- Check browser console for validation errors

**Photos not loading**:
- Verify employee photo API URL
- Fallback avatar should appear automatically

**Data not updating**:
- Check Google Sheets URL is accessible
- Check browser console for fetch errors

See [CONFIGURATION.md](./CONFIGURATION.md) for more troubleshooting tips.

## Contributing

1. Create a feature branch
2. Make changes following existing patterns
3. Update documentation if needed
4. Ensure build and lint pass
5. Submit pull request

## License

Internal Leobit application.

## Support

For questions or issues, contact the Leobit development team.
