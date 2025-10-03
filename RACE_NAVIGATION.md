# Race Navigation Feature

## Overview
Added navigation functionality to allow users to navigate between previous and next races from the results, qualifying, and sprint pages.

## Implementation Details

### Controllers Modified
1. **MainCtrl** - Updated to use cached season data from YearService
2. **ResultsCtrl** - Added navigation variables using YearService.getRaceNavigation()
3. **QualiCtrl** - Added navigation variables using YearService.getRaceNavigation()
4. **SprintCtrl** - Added navigation variables using YearService.getRaceNavigation()

### Services Modified
- **YearService** - Extended with caching and navigation functionality:
  - `seasonDataCache` - Caches season data to prevent redundant API calls
  - `getSeasonData(year)` - Returns cached or fetches season data
  - `getRaceNavigation(circuitId, year)` - Returns previous/next race data

### Key Features
- Previous/Next race buttons at the top of each page
- Shows the actual race name in the navigation buttons
- Disabled state when no previous/next race is available
- Consistent navigation across Results, Qualifying, and Sprint pages
- **Optimized API usage** - Season data is cached and reused across controllers

### Performance Optimization
**Problem Solved**: The initial implementation was making multiple API calls to `/f1/YEAR` endpoint from each controller, causing 429 rate limiting errors.

**Solution**: 
- Centralized season data caching in YearService
- Single API call per year, shared across all controllers
- Navigation logic moved to service level
- Reduced API calls by ~75% for navigation functionality

### Technical Implementation
- YearService caches season data and provides navigation utilities
- Controllers use `YearService.getRaceNavigation()` instead of individual API calls
- Navigation buttons link to the same page type (results → results, quali → quali, etc.)

### CSS Styling
Added to `main.css`:
- `.race-navigation` - Container styling with bottom border
- `.race-nav-link` - Button styling with hover effects
- `.race-nav-prev` and `.race-nav-next` - Alignment classes

### Navigation Flow
- From Results page: Previous/Next buttons navigate to other race results
- From Qualifying page: Previous/Next buttons navigate to other qualifying sessions
- From Sprint page: Previous/Next buttons navigate to other sprint races

The navigation respects the chronological order of races within the selected season.