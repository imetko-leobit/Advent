# UI Configuration Guide

## Overview

The Well Being Quest application now supports **full UI configurability** through a central configuration file. This allows developers to:

- ✅ Swap SVG maps, images, or avatars without touching component code
- ✅ Change task positions and visual elements via configuration
- ✅ Update number of tasks/steps dynamically
- ✅ Replace animations, stars, clouds, or character images
- ✅ Modify finish screen assets
- ✅ Customize pointer/avatar appearance

## Configuration File Location

**Main Configuration:** `/src/config/uiConfig.ts`

This single file contains all UI-related configuration, keeping components clean and modular.

## Configuration Structure

The configuration is organized into logical sections:

### 1. Map Configuration

Controls the background and map SVG:

```typescript
map: {
  background: QuestBackground,  // Background image
  mapSvg: MapSvg,               // Main quest map SVG
}
```

**How to Change:**
- Replace the imported SVG files at the top of `uiConfig.ts`
- Or update the values to point to different assets

### 2. Step Markers Configuration

Defines step number images and shadows:

```typescript
steps: {
  images: [
    zeroStep,
    firstStep,
    // ... more step images
  ],
  shadow: {
    green: GreenStepShadow,     // Shadow for early steps
    purple: PurpleStepShadow,   // Shadow for later steps
    greenThreshold: 10,         // Tasks 0-9 use green, 10+ use purple
  },
}
```

**How to Change:**
- Add/remove step images in the `images` array
- Change the `greenThreshold` to adjust when purple shadows appear
- Replace shadow SVG files

**Important:** The number of images in the array should match the number of tasks.

### 3. Task Positions Configuration

Defines coordinates for each task on the map:

```typescript
taskPositions: [
  {
    taskTitle: tasksEnum.initialPosition,
    taskNumber: 0,
    cxPointers: 15.8,   // X coordinate for user pointers (%)
    cyPointers: 21,     // Y coordinate for user pointers (%)
    cxStep: 16.5,       // X coordinate for step marker (%)
    cyStep: 32.5,       // Y coordinate for step marker (%)
  },
  // ... more task positions
]
```

**How to Change:**
- Add new tasks by adding objects to the array
- Remove tasks by removing objects from the array
- Update coordinates (as percentages) to reposition tasks
- Coordinates are relative to the map SVG dimensions

**Flexible Task Count:** You can have any number of tasks - not limited to 15!

### 4. Animation Configurations

#### Stars

Configure multiple stars with different positions and animation speeds:

```typescript
animations: {
  stars: [
    { 
      top: "80%", 
      left: "60%", 
      height: "3%", 
      width: "3%", 
      duration: 1.2  // Animation duration in seconds
    },
    // ... more stars
  ],
```

**How to Change:**
- Add/remove star objects to change the number of stars
- Adjust `top` and `left` for positioning
- Modify `duration` to change animation speed
- Stars with the same duration will animate together

#### Clouds

Configure cloud animations:

```typescript
  clouds: [
    {
      top: "25%",
      left: "70%",
      height: "5%",
      width: "5%",
      duration: 5,              // Animation duration
      translateFrom: "-40%",    // Starting X position
      translateTo: "20%",       // Ending X position
    },
    // ... more clouds
  ],
```

**How to Change:**
- Add/remove cloud objects
- Adjust positions and sizes
- Modify `translateFrom` and `translateTo` for different movement patterns

#### Character (Girl with Shadow)

Configure the animated character:

```typescript
  character: {
    image: GirlSvg,           // Character image
    shadow: Shadow,           // Shadow image
    position: {
      left: "79.3%",
      top: "28%",
      height: "15%",
    },
    shadowPosition: {
      left: "81%",
      top: "37%",
      height: "2%",
    },
    animation: {
      translateFrom: "-45%",   // Vertical movement start
      translateTo: "-40%",     // Vertical movement end
      duration: 4,             // Animation duration
    },
    shadowAnimation: {
      scaleFrom: 0.8,          // Shadow scale start
      scaleTo: 1.2,            // Shadow scale end
      duration: 4,
    },
  },
}
```

**How to Replace Character:**
1. Import new character and shadow images at top of file
2. Update `image` and `shadow` properties
3. Adjust positions and animation parameters as needed

### 5. Finish Screens Configuration

Configure the finish screen images:

```typescript
finishScreens: {
  finish: FinishScreenSVG,    // First finish screen (task 9)
  dzen: DzenScreenSVG,        // Final finish screen (task 14)
}
```

**How to Change:**
- Import new SVG files and update the properties

### 6. Pointers/Avatars Configuration

Configure colored pointers for different social network points:

```typescript
pointers: {
  colored: [
    // Social network point 0
    [zero_red, zero_yellow, zero_cyan, zero_green, zero_orange, zero_purple],
    // Social network point 1
    [one_red, one_yellow, one_cyan, one_green, one_orange, one_purple],
    // ... more levels
  ],
}
```

**How to Change:**
- Add/remove pointer colors
- Change the number of social network point levels
- Replace individual pointer images

### 7. Avatar Fallback

Configure a fallback avatar if user's avatar is missing:

```typescript
avatar: {
  fallbackUrl: undefined,  // Set to a URL for fallback avatar
}
```

## Making Changes

### To Change Visual Assets (Images/SVGs)

1. **Add your new asset** to the appropriate folder under `/src/assets/`
2. **Import it** at the top of `/src/config/uiConfig.ts`:
   ```typescript
   import MyNewMap from "../assets/map/MyNewMap.svg";
   ```
3. **Update the config** to use the new import:
   ```typescript
   map: {
     mapSvg: MyNewMap,  // Changed from MapSvg to MyNewMap
   }
   ```

### To Change Number of Tasks

1. **Update `taskPositions` array** - add or remove task objects
2. **Update `steps.images` array** - ensure you have step images for each task
3. **No changes needed in components** - they automatically adapt!

### To Reposition Tasks

Simply update the coordinate values in `taskPositions`:
- Values are **percentages** (0-100)
- `cxPointers`/`cyPointers`: Where user avatars appear
- `cxStep`/`cyStep`: Where the step number marker appears

### To Add/Remove Animation Elements

1. **Stars**: Add/remove objects in `animations.stars` array
2. **Clouds**: Add/remove objects in `animations.clouds` array
3. Both automatically render based on the array length

## Testing Your Changes

After making configuration changes:

1. **Run in DEV mode:**
   ```bash
   npm run dev
   ```

2. **Check the browser** - your changes should be visible immediately

3. **Build for production:**
   ```bash
   npm run build
   ```

## Examples

### Example: Adding a New Task

```typescript
// In taskPositions array, add:
{
  taskTitle: tasksEnum.goodDeed,
  taskNumber: 15,  // Next task number
  cxPointers: 80,
  cyPointers: 20,
  cxStep: 81,
  cyStep: 30,
}

// Add corresponding step image to steps.images array:
import fifteenthStep from "../assets/steps/15.svg";

steps: {
  images: [
    // ... existing images
    fifteenthStep,  // Add new step image
  ],
}
```

### Example: Changing Map to a Different SVG

```typescript
// At top of file:
import WinterMap from "../assets/map/WinterMap.svg";

// In config:
map: {
  background: QuestBackground,
  mapSvg: WinterMap,  // Changed from MapSvg
}
```

### Example: Adding More Stars

```typescript
animations: {
  stars: [
    // ... existing stars
    // Add new star:
    { 
      top: "50%", 
      left: "50%", 
      height: "2%", 
      width: "2%", 
      duration: 1.5 
    },
  ],
}
```

## Architecture Benefits

✅ **Single Source of Truth** - All UI config in one place  
✅ **No Code Changes** - Update visuals without touching components  
✅ **Flexible Layout** - Support any number of tasks/steps  
✅ **Easy Maintenance** - Quick visual updates for designers  
✅ **Type-Safe** - TypeScript interfaces prevent configuration errors  
✅ **Modular Components** - Components remain clean and reusable  

## Migration Notes

This refactoring replaces the old hardcoded approach:

**Before (Old):**
- Task positions in `/src/consts/taskPositions.ts` ❌
- SVG steps in `/src/consts/svgSteps.ts` ❌
- Colored pointers in `/src/consts/colors.ts` ❌
- Hardcoded positions in component files ❌

**After (New):**
- Everything in `/src/config/uiConfig.ts` ✅
- Components use the config ✅
- Clean separation of concerns ✅

## Need Help?

If you need to make complex changes:
1. Review the TypeScript interfaces in `uiConfig.ts`
2. Check existing configuration examples
3. Test in DEV mode before building for production
4. Refer to component source code if needed

---

**Remember:** The goal is to make UI changes **without editing component code**. If you find yourself modifying a component for a visual change, consider if that configuration should be added to `uiConfig.ts` instead.
