# Dynamic Configuration Testing Guide

This document provides manual testing steps to verify the dynamic configuration and data source switching features.

## Prerequisites

1. Application built successfully (`npm run build` passes)
2. Linter passes (`npm run lint` passes)
3. Development server can start (`npm run dev`)

## Test 1: Basic Application Startup

**Goal:** Verify application starts with default configuration

**Steps:**
1. Run `npm run dev`
2. Open browser to `http://localhost:5173`
3. Verify application loads without errors
4. Check console for startup logs

**Expected Results:**
- Application loads successfully
- Default "Well Being Quest" configuration active
- Console shows: `[ConfigValidator] Configuration validation passed`
- No error messages displayed

**Status:** ✅ PASS / ❌ FAIL

---

## Test 2: Configuration Context Integration

**Goal:** Verify ConfigProvider is properly integrated

**Steps:**
1. Open browser DevTools console
2. Check for any React context errors
3. Navigate through the application
4. Verify no warnings about missing ConfigProvider

**Expected Results:**
- No "useConfig must be used within ConfigProvider" errors
- Application functions normally
- ConfigProvider wraps the entire app

**Status:** ✅ PASS / ❌ FAIL

---

## Test 3: Load Example Quest Configuration

**Goal:** Test loading custom quest configuration from JSON

**Steps:**
1. Ensure `/public/example-quest-config.json` exists
2. Open browser console
3. Run the following code:
```javascript
// This would be done via ConfigDemo component or custom implementation
// For manual testing, verify the file exists and is valid JSON
fetch('/example-quest-config.json')
  .then(r => r.json())
  .then(config => console.log('Config loaded:', config))
  .catch(err => console.error('Failed to load config:', err))
```

**Expected Results:**
- JSON file loads successfully
- Configuration structure is valid
- Contains required fields: name, taskCount, tasks, etc.

**Status:** ✅ PASS / ❌ FAIL

---

## Test 4: Config Validation

**Goal:** Verify configuration validation works correctly

**Steps:**
1. Check validation is applied at startup (see console logs)
2. Verify `src/utils/configValidator.ts` exports are used
3. Test with invalid config (if using ConfigDemo):
   - Load a config with missing required fields
   - Verify fallback to defaults occurs

**Expected Results:**
- Valid configs pass validation
- Invalid configs trigger errors
- Meaningful error messages logged
- Application falls back to defaults on error

**Status:** ✅ PASS / ❌ FAIL

---

## Test 5: Data Source Infrastructure

**Goal:** Verify data source switching infrastructure is in place

**Steps:**
1. Check that `src/services/providers/APIProvider.ts` exists
2. Verify `DataSourceType.API` is defined in types
3. Confirm factory supports all three provider types:
   - MOCK_CSV
   - GOOGLE_SHEETS
   - API

**Expected Results:**
- All provider files exist
- Types properly define all source types
- Factory can create all provider types
- No import errors

**Status:** ✅ PASS / ❌ FAIL

---

## Test 6: Default Data Provider

**Goal:** Verify default data provider works in DEV mode

**Steps:**
1. Ensure `.env.local` has `VITE_DEV_MODE=true` (or doesn't exist)
2. Start application
3. Check that mock data loads from `/public/mock-quest-data.csv`
4. Verify users appear on the map

**Expected Results:**
- Mock CSV provider is used automatically
- Data loads successfully
- Console shows: `MockCSVProvider: Successfully fetched X records`
- User pointers appear on map

**Status:** ✅ PASS / ❌ FAIL

---

## Test 7: MapRenderer Configuration

**Goal:** Verify MapRenderer accepts dynamic configuration

**Steps:**
1. Check `src/components/MapRenderer/MapRenderer.tsx`
2. Verify it accepts `mapImage` prop
3. Confirm it uses `uiConfig.map.mapSvg` from config
4. Test that positions are configurable

**Expected Results:**
- MapRenderer is config-driven
- No hardcoded paths in component
- Props allow dynamic image/SVG paths
- Positions come from config

**Status:** ✅ PASS / ❌ FAIL

---

## Test 8: Configuration Fallback

**Goal:** Test error handling and fallback behavior

**Steps:**
1. Review `src/utils/configFallback.ts`
2. Verify fallback functions are exported
3. Check that main.tsx uses config validation
4. Confirm graceful degradation on errors

**Expected Results:**
- Fallback utilities exist and are properly typed
- Application shows user-friendly errors
- Falls back to DEV mode on config failure
- Application continues running despite errors

**Status:** ✅ PASS / ❌ FAIL

---

## Test 9: Build and Lint

**Goal:** Verify code quality and build process

**Steps:**
1. Run `npm run lint`
2. Run `npm run build`
3. Check for warnings or errors

**Expected Results:**
- Lint passes with 0 errors, 0 warnings
- Build completes successfully
- All TypeScript types are correct
- No console errors during build

**Status:** ✅ PASS / ❌ FAIL

---

## Test 10: Documentation

**Goal:** Verify documentation is complete and accurate

**Steps:**
1. Check `/docs/DYNAMIC_CONFIGURATION.md` exists
2. Verify README.md has new section
3. Confirm code examples in docs are syntactically correct
4. Review inline code comments

**Expected Results:**
- Documentation files exist
- Examples are clear and correct
- All features are documented
- Code has helpful comments

**Status:** ✅ PASS / ❌ FAIL

---

## Test 11: ConfigDemo Component (Optional)

**Goal:** Test interactive demo component if implemented in a page

**Steps:**
1. Add ConfigDemo to a page (e.g., Quest.tsx)
2. Open application in browser
3. Click "🎮 Show Config Demo" button
4. Test configuration loading
5. Test data source switching buttons

**Expected Results:**
- Demo component renders
- Shows current configuration state
- Buttons trigger appropriate actions
- Loading states display correctly
- Errors are shown in UI

**Status:** ✅ PASS / ❌ FAIL / ⚠️ N/A (Not Implemented)

---

## Integration Test Summary

**Goal:** Verify all pieces work together

**Checklist:**
- [ ] Application builds successfully
- [ ] Linting passes with no errors
- [ ] Default configuration loads
- [ ] ConfigProvider is integrated
- [ ] Data providers exist and work
- [ ] MapRenderer uses configuration
- [ ] Validation and fallback work
- [ ] Documentation is complete
- [ ] No runtime errors
- [ ] DEV mode still functions

---

## Test Results Summary

**Date:** _________________

**Tester:** _________________

**Total Tests:** 11

**Passed:** _____ / 11

**Failed:** _____ / 11

**Notes:**
```
[Add any observations, issues found, or additional notes here]
```

---

## Known Limitations

1. **ConfigDemo Component:** Not automatically included in any page - must be manually added to test UI features
2. **API Provider:** Requires external API endpoint to fully test
3. **Google Sheets Provider:** Requires valid Google Sheets URL to test in production mode
4. **UI Testing:** Full UI testing would require manual integration of ConfigDemo or custom test implementation

---

## Next Steps

After all tests pass:

1. ✅ Code review requested
2. ✅ Security scan (CodeQL if configured)
3. ✅ Merge to main branch
4. ✅ Deploy to staging environment
5. ✅ Full end-to-end testing in staging

---

## Troubleshooting

**Build Fails:**
- Check for TypeScript errors
- Verify all imports are correct
- Run `npm install` to ensure dependencies

**Lint Errors:**
- Review eslint output
- Fix any type issues
- Ensure proper exports

**Runtime Errors:**
- Check browser console for errors
- Verify ConfigProvider wraps app
- Check network tab for fetch errors

**Config Won't Load:**
- Verify JSON is valid
- Check file path is correct
- Look for CORS issues if loading from URL
