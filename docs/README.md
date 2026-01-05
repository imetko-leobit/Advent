# Technical Documentation

This directory contains detailed technical documentation for the Well Being Quest application.

## Documentation Index

### Core Architecture

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication system documentation
  - Dual-mode architecture (DEV and OIDC)
  - Auth flow diagrams
  - Redirect loop prevention
  - Configuration validation
  - Troubleshooting guide

- **[DOMAIN_LAYER_REFACTORING.md](./DOMAIN_LAYER_REFACTORING.md)** - Domain layer architecture
  - Business logic services
  - Framework-independent design
  - Service descriptions and usage
  - Design principles

- **[SERVICE_LAYER_IMPLEMENTATION.md](./SERVICE_LAYER_IMPLEMENTATION.md)** - Service layer patterns
  - Data abstraction layer
  - Service factory pattern
  - Environment-based configuration

### Data & Configuration

- **[QUEST_DATA_SERVICE.md](./QUEST_DATA_SERVICE.md)** - Quest data service documentation
  - Service API reference
  - Data source configuration
  - Polling behavior
  - Adding new data sources
  - Usage examples

- **[UI_CONFIGURATION.md](./UI_CONFIGURATION.md)** - UI configuration guide
  - Complete customization reference
  - Asset management
  - Task positioning
  - Animation configuration
  - Examples and best practices

### Implementation Details

- **[AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)** - Auth implementation summary
  - Technical implementation details
  - Component integration
  - State management

- **[AUTH_TEST_PLAN.md](./AUTH_TEST_PLAN.md)** - Authentication testing guide
  - Test scenarios
  - Manual testing procedures
  - Common test cases

### Analysis & Planning

- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** - Codebase analysis and structure
  - Code organization
  - Architecture overview
  - Technical decisions

- **[CODE_EXAMPLES.md](./CODE_EXAMPLES.md)** - Code examples and patterns
  - Common usage patterns
  - Best practices
  - Code snippets

- **[TECHNICAL_ASSESSMENT.md](./TECHNICAL_ASSESSMENT.md)** - Technical assessment and design decisions
  - Architecture choices
  - Technology stack rationale
  - Trade-offs and considerations

## Quick Navigation

### For New Developers

Start here to understand the application:

1. **[Main README](../README.md)** - Start here for quick setup and overview
2. **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Understand the auth system
3. **[DOMAIN_LAYER_REFACTORING.md](./DOMAIN_LAYER_REFACTORING.md)** - Learn the business logic
4. **[UI_CONFIGURATION.md](./UI_CONFIGURATION.md)** - Customize the UI

### For Extending Functionality

Based on what you want to do:

**Adding authentication features:**
- Read: [AUTHENTICATION.md](./AUTHENTICATION.md)
- Read: [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)

**Adding new data sources:**
- Read: [QUEST_DATA_SERVICE.md](./QUEST_DATA_SERVICE.md)
- Read: [SERVICE_LAYER_IMPLEMENTATION.md](./SERVICE_LAYER_IMPLEMENTATION.md)

**Customizing UI/UX:**
- Read: [UI_CONFIGURATION.md](./UI_CONFIGURATION.md)
- Check: `/src/config/uiConfig.ts`

**Modifying quest logic:**
- Read: [DOMAIN_LAYER_REFACTORING.md](./DOMAIN_LAYER_REFACTORING.md)
- Check: `/src/domain/` directory

### For Troubleshooting

**Authentication issues:**
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Section: "Common Redirect Loop Causes & Prevention"
- [AUTH_TEST_PLAN.md](./AUTH_TEST_PLAN.md) - Test scenarios

**Data issues:**
- [QUEST_DATA_SERVICE.md](./QUEST_DATA_SERVICE.md) - API reference and configuration
- [Main README](../README.md) - Section: "Common Issues & Troubleshooting"

**UI issues:**
- [UI_CONFIGURATION.md](./UI_CONFIGURATION.md) - Configuration reference
- [Main README](../README.md) - Section: "Common Issues & Troubleshooting"

## Documentation Maintenance

When updating the application:

- **Add new features** → Update relevant docs and examples
- **Change architecture** → Update architecture docs (DOMAIN_LAYER, SERVICE_LAYER)
- **Modify UI config** → Update UI_CONFIGURATION.md
- **Change auth flow** → Update AUTHENTICATION.md
- **Add data sources** → Update QUEST_DATA_SERVICE.md

## Document Conventions

- **Code examples** are in TypeScript/TSX
- **File paths** are absolute from project root
- **Commands** assume project root as working directory
- **Environment variables** are prefixed with `VITE_`

---

**Note:** The main [README.md](../README.md) in the project root provides a comprehensive overview suitable for onboarding. These technical documents provide deeper implementation details.
