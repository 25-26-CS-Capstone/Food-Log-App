# Enemy Spawn System Guide

## Overview
The game uses a tile-based spawn system where enemy spawn points are marked in room map files using special characters.

## Spawn Tile Markers

### Current Implementation
- **'E'** = Enemy spawn marker
  - Placed in map .txt files (Media/Maps/Room*.txt)
  - Automatically detected when room loads
  - Converted to floor ('F') for rendering
  - Position stored in `m_vecEnemySpawns` vector

### Room File Format Example
```
WWWWWWWWWWWWWWWWWWWWWWW
WEFFFFFFFFFIFFFFFFFFFEW   <- E markers in corners
WFFFFFFFFFFIFFFFFFFFFFW
WFFFFFFFFFFIFFFFFFFFFFW
WEFFFFFFFFFIFFFFFFFFFEW   <- More E markers
WWWWWWWWWWWWWWWWWWWWWWW
```

## How Spawning Works

### 1. Room Loading (Room.cpp - LoadRoom method)
```cpp
// When 'E' is found in map file:
if (buffer[index] == 'E') {
    float worldX = (j + 0.5f) * m_fTileSize;
    float worldY = (i + 0.5f) * m_fTileSize;
    m_vecEnemySpawns.push_back(Vector2(worldX, worldY));
    buffer[index] = 'F'; // Replace with floor for rendering
}
```

### 2. Enemy Creation (Game.cpp - SpawnEnemies method)
```cpp
void CGame::SpawnEnemies() {
    const std::vector<Vector2>& spawns = m_pRoom->GetEnemySpawns();
    int spawnIndex = 0;
    for (const Vector2& spawnPos : spawns) {
        // Create varied patrol routes based on position
        Vector2 patrolStart = spawnPos;
        Vector2 patrolEnd;
        
        // Alternate directions for variety
        switch (spawnIndex % 4) {
            case 0: patrolEnd = spawnPos + Vector2(150.0f, 0.0f);   // Right
            case 1: patrolEnd = spawnPos + Vector2(0.0f, 150.0f);   // Down
            case 2: patrolEnd = spawnPos + Vector2(-150.0f, 0.0f);  // Left
            case 3: patrolEnd = spawnPos + Vector2(0.0f, -150.0f);  // Up
        }
        
        m_pObjectManager->spawnIceBat(spawnPos, patrolStart, patrolEnd);
        spawnIndex++;
    }
}
```

### 3. Bat Behavior (IceBat.cpp)
- Spawned at the marker position
- Patrols between patrolStart and patrolEnd
- Chases player when in detection range
- Returns to patrol when player leaves range

## Adding New Spawn Points

### To add spawns to a room:
1. Open the room file: `Media/Maps/Room#.txt`
2. Replace any 'F' (floor) tile with 'E' where you want enemies
3. Save the file
4. Copy to both locations:
   - `Media/Maps/Room#.txt`
   - `Game Exe/Media/Maps/Room#.txt` (if exists)

### Best Practices:
- **Corner spawns**: Good for flanking player
- **Center spawns**: Creates pressure in middle of room
- **Ice tile spawns**: Extra challenging (enemies on ice)
- **Near hazards**: Forces player into danger zones
- **2-6 enemies per room**: Balanced difficulty

## Current Spawn Counts by Room

| Room | Spawns | Notes |
|------|--------|-------|
| Room0 | 0 | Starting room, no enemies |
| Room1 | 4 | Corner spawns, basic layout |
| Room2 | 4 | Corner spawns with hazards |
| Room3 | 4 | Mixed floor/ice/hazards |
| Room4 | 4 | Heavy hazard layout |
| Room5 | 6 | Ice lanes + center spawns |
| Room6 | 4 | Vertical pillar layout |

## Enemy Types

### IceBat (Current)
- Flying enemy
- Patrol behavior
- Chase behavior
- Medium health
- Fast movement

### IceBear (Available)
- Ground enemy
- Rush attack
- High health
- Slow but powerful

## Future Enhancements

### Spawn Variations
- Add spawn type markers: 'E' = bat, 'B' = bear, 'S' = special
- Random spawn chance per marker
- Wave-based spawning
- Spawn on player proximity

### Patrol Improvements
- Waypoint-based patrols using multiple markers
- Circular patrols around hazards
- Guard behavior at specific tiles
- Group formations

### Example Extended Marker System
```
WWWWWWWWWWWWWWWWWWWWWWW
WEBFFFFFFFFFFFFFFFFFFFEW   <- EB = bear spawn
WFFFFFFFFFFIFFFFFFFFFFW
WFFFFFFFFFFSFFFFFFFFFFW    <- S = special spawn
WEFFFFFFFFFFFFFFFFFFFEFW   <- E = bat spawn
WWWWWWWWWWWWWWWWWWWWWWW
```

## Debugging

### View Spawn Positions
Spawn positions are stored in `CRoom::m_vecEnemySpawns`:
```cpp
const std::vector<Vector2>& spawns = m_pRoom->GetEnemySpawns();
// Each Vector2 contains world-space coordinates
```

### Common Issues
1. **Enemies not spawning**: Check if 'E' markers exist in map file
2. **Wrong positions**: Verify tile size calculation (default 64x64)
3. **Enemies stuck**: Ensure spawn isn't inside wall tile
4. **Too many/few enemies**: Count 'E' markers in map file

## Related Files
- `Room.h/cpp` - Reads spawn markers from map files
- `Game.cpp` - SpawnEnemies() creates enemies at spawn points
- `ObjectManager.cpp` - spawnIceBat() factory method
- `IceBat.h/cpp` - Flying enemy AI and behavior
- `IceBear.h/cpp` - Ground enemy AI (available)
- `Media/Maps/*.txt` - Room layout files with spawn markers
