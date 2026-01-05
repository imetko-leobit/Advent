# Quick Start Guide

Get up and running with Well Being Quest in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Run the Application

```bash
npm run dev
```

That's it! Open http://localhost:5173 in your browser.

## What Just Happened?

✅ **You're automatically logged in** as `dev@leobit.com`  
✅ **Mock data is loaded** from `/public/mock-quest-data.csv`  
✅ **All features work** - animations, quest map, user progress  
✅ **No configuration needed** - works out of the box

## Next Steps

### Option 1: Explore with Mock Data (Recommended for First Time)

Just start using the app! It has sample users and quest progress already loaded.

### Option 2: Connect to Real Authentication

Create `.env.local`:

```bash
VITE_APP_AUTH_AUTHORITY=https://your-oidc-provider.com
VITE_APP_AUTH_REDIRECT_URI=http://localhost:5173
```

Restart dev server:
```bash
npm run dev
```

### Option 3: Use Your Own Data

Edit `/public/mock-quest-data.csv` or connect to Google Sheets:

```bash
# In .env.local
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv
```

## Common Commands

```bash
# Development
npm run dev         # Start dev server

# Production
npm run build       # Build for production
npm run preview     # Preview production build

# Code Quality
npm run lint        # Run linter
```

## Customizing the UI

All visual elements are configurable in `/src/config/uiConfig.ts`:

- Change the map SVG
- Reposition tasks
- Replace animations
- Update colors and assets

See [UI Configuration Guide](/docs/UI_CONFIGURATION.md) for details.

## Need Help?

- **Full Documentation:** [README.md](/README.md)
- **Authentication Issues:** [docs/AUTHENTICATION.md](/docs/AUTHENTICATION.md)
- **Customization:** [docs/UI_CONFIGURATION.md](/docs/UI_CONFIGURATION.md)
- **Data Sources:** [docs/QUEST_DATA_SERVICE.md](/docs/QUEST_DATA_SERVICE.md)

## Troubleshooting

**App won't start?**
- Make sure you ran `npm install`
- Check Node.js version (need v16+)

**No users showing on map?**
- Check `/public/mock-quest-data.csv` exists
- Open browser console for errors

**Redirect loop?**
- Clear browser storage: `localStorage.clear()` in console
- Restart dev server

---

**You're ready to start developing! 🚀**
