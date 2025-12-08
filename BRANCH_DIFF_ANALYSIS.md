# Branch Difference Analysis: basetest vs origin/master

## Executive Summary
The origin/master branch contains a **simplified Inuit player system with basic movement**, while the basetest branch adds **Ice Bat/Ice Bear enemy systems, projectiles, room clearing mechanics, and item spawning**. The changes are mostly **non-conflicting additions** but there are a few areas requiring integration attention.

---

## 1. GameDefines.h - Sprite Enumeration Changes

### Key Additions:
- **Screen resolution changed** from 1400x760 to 1024x768
- **New constants added:**
  - `kBorderMargin = 20.0f`
  - `kIceBatProjectileSpeed = 200.0f`
  - `kIceBatShootCooldown = 1.5f`

### New Sprites in eSprite enum:
```cpp
// Ice Bat sprites
IceBatFlap64Sheet, IceBatFlap, IceBatAttackFlap

// Projectile sprites
IceBatProjectile, PlayerProjectile

// Item pickups
Item

// Ice Bear sprites (multiple variants with different sizes)
IceBear, IceBear0-8
IceBear128Sheet, IceBearInactive128, IceBearActive128
IceBearSheet, IceBearInactive, IceBearActive
```

### Removed:
- Audio header include removed (`#include "Sound.h"`)
- Menu buttons remain in sprite enum

### ⚠️ Breaking Changes:
- **Screen resolution change** (1400x760 → 1024x768) affects all UI positioning
- This may require recalibration of player spawn positions and room layouts

---

## 2. Game.cpp - Major Logic Changes

### Audio System:
```cpp
// CHANGED: Audio system now DISABLED (commented out)
void CGame::LoadSounds(){
  // Audio disabled for now
  //m_pAudio->Initialize(eSound::Size);
  //m_pAudio->Load(eSound::Grunt, "grunt");
  //...
}
```

### Menu System:
```cpp
// CHANGED: StartMenu() now disabled - skips to game directly
void CGame::StartMenu() {
    // Menu disabled - start game directly
    BeginGame();
}

// CHANGED: MenuUpdate() now empty
void CGame::MenuUpdate() {
    // Menu disabled
}
```

### New Game Initialization:
```cpp
// NEW: Player spawn position changed
m_pPlayer = (CPlayer*)m_pObjectManager->create(eSprite::InuitIdleRight,
    Vector2(100.0f, h / 2.0f));  // Was: Vector2(300.0f, 300.0f)

// NEW: ObjectManager player reference
m_pObjectManager->SetPlayer(m_pPlayer);

// NEW: Enemy spawning call
SpawnEnemies();
```

### New Methods (3 Critical Additions):

#### 1. **SpawnEnemies()**
- Spawns enemies based on room type
- **Boss Room (type 999)**: Single Ice Bear at room center
- **Regular Rooms**: 3-4 Ice Bats in patrol patterns around room center
- Uses deterministic spawning for consistent testing
- Sets `m_nEnemyCount`, `m_bRoomCleared`, `m_bItemsSpawned` flags

```cpp
void CGame::SpawnEnemies() {
    if (roomType == 999) {
        // Boss: spawn one Ice Bear
        m_pObjectManager->spawnIceBear(center);
        m_nEnemyCount = 1;
    } else {
        // Regular: spawn 3-4 Ice Bats in patrol formations
        int batCount = 3 + (rand() % 2);
        for (int i = 0; i < batCount; i++) {
            m_pObjectManager->spawnIceBat(center, patrolStart, patrolEnd);
        }
        m_nEnemyCount = batCount;
    }
    m_bRoomCleared = false;
    m_bItemsSpawned = false;
}
```

#### 2. **CheckRoomCleared()**
- Monitors enemy count using `ObjectManager->countEnemies()`
- When all enemies defeated → triggers `SpawnRandomItems()`

#### 3. **SpawnRandomItems()**
- Spawns 1-3 random reward items
- Weighted item pool (health items more common)
- Items spawn near room center with slight randomization

### LoadImages Changes:
```cpp
// NEW: Ice Bat sprites loaded
m_pRenderer->Load(eSprite::IceBatFlap64Sheet, "IceBatFlap64Sheet");
m_pRenderer->Load(eSprite::IceBatFlap, "IceBatFlap");
m_pRenderer->Load(eSprite::IceBatAttackFlap, "IceBatAttackFlap");
m_pRenderer->Load(eSprite::IceBatProjectile, "IceBatProjectile");

// NEW: Ice Bear sprites loaded
m_pRenderer->Load(eSprite::IceBearInactive128, "IceBearInactive128");
m_pRenderer->Load(eSprite::IceBearActive128, "IceBearActive128");
```

### ⚠️ Breaking Changes:
- **Menu disabled entirely** - game skips to gameplay immediately
- **Player spawn position changed**
- **Audio system disabled**

---

## 3. Player.cpp - Movement & Animation Overhaul

### Removed Complex State Machine:
Old system had complex state handling:
- playerState 0: Normal movement
- playerState 1: Roll/dodge
- playerState 2: Damage (knockback)
- playerState 3: Wall collision

### NEW: Simplified Movement System
```cpp
// Uses raw Windows API keyboard input (GetAsyncKeyState)
const float step = 4.0f; // pixels per frame

if (GetAsyncKeyState('A') & 0x8000) { m_vPos.x -= step; RunLeft(); }
if (GetAsyncKeyState('D') & 0x8000) { m_vPos.x += step; RunRight(); }
if (GetAsyncKeyState('W') & 0x8000) { m_vPos.y += step; RunUp(); }
if (GetAsyncKeyState('S') & 0x8000) { m_vPos.y -= step; RunDown(); }

// If no movement keys held, show idle animation in last direction
if (!any) {
    switch (recentInput) {
    case 'A': IdleLeft();  break;
    case 'D': IdleRight(); break;
    case 'W': IdleUp();    break;
    case 'S': IdleDown();  break;
    }
}
```

### NEW: Animation Helper Methods
Added simple animation control methods:
```cpp
void IdleLeft(), IdleRight(), IdleUp(), IdleDown()
void RunLeft(),  RunRight(),  RunUp(),  RunDown()
void UpdateFramenumber()  // Increment animation frame timer
```

Each tracks:
- Sprite index
- Frame count (idle: 15-20 frames, run: 8 frames)
- Frame timing (idle: 0.12s, run: 0.07s per frame)

### Removed Complex Features:
- ❌ Roll/dodge mechanic (playerState 1)
- ❌ Complex knockback physics
- ❌ Speed accumulation (xspeed, yspeed)
- ❌ Speed clamping (MAXSPEED, SPEEDDEC)
- ❌ Wall collision handling (UpdateBasedOnTile)
- ❌ EventTimer-based frame updates

### Kept:
- ✅ Damage state (playerState 2) with shield logic
- ✅ Direction tracking (0=up, 1=right, 2=down, 3=left)
- ✅ Collision damage handling

### ⚠️ Breaking Changes:
- **Completely replaces movement system** - no velocity-based physics
- **Uses GetAsyncKeyState()** instead of engine keyboard object
- **Fixed step size** (4px/frame) instead of frame-time-based movement
- **Simple direct position update** instead of acceleration/deceleration

---

## 4. Media/XML/gamesettings.xml - New Sprite Definitions

### New Sprites Added:
```xml
<!-- Ice bat sprites -->
<sprite name="IceBatFlap64Sheet" file="icebat_flap_64.png"/>
<sprite name="IceBatFlap" sheet="IceBatFlap64Sheet" frames="4">
    <frame index="0" left="0"   top="0" right="64"  bottom="64"/>
    <frame index="1" left="64"  top="0" right="128" bottom="64"/>
    <frame index="2" left="128" top="0" right="192" bottom="64"/>
    <frame index="3" left="192" top="0" right="256" bottom="64"/>
</sprite>
<sprite name="IceBatAttackFlap" sheet="IceBatFlap64Sheet" frames="4">
    <!-- Same frames as IceBatFlap -->
</sprite>
<sprite name="IceBatProjectile" file="IceBatProjectile.png"/>
```

### Required Image Files:
- `icebat_flap_64.png` (256x64 spritesheet, 4 frames)
- `IceBatProjectile.png` (single image)

⚠️ **Note**: No Ice Bear sprite definitions in gamesettings.xml yet, but they're referenced in GameDefines.h

---

## 5. ObjectManager.cpp & .h - Enemy Spawning System

### New Class Members (ObjectManager.h):
```cpp
private:
    CPlayer* m_pPlayer = nullptr;  // For projectile tracking
```

### New Methods:

#### spawnIceBat()
```cpp
CIceBat* spawnIceBat(const Vector2& pos, 
                     const Vector2& patrolStart, 
                     const Vector2& patrolEnd)
```
- Creates Ice Bat with patrol behavior
- Adds to object list
- Returns pointer for further configuration

#### spawnIceBear()
```cpp
CIceBear* spawnIceBear(const Vector2& pos)
```
- Creates Ice Bear boss enemy
- Adds to object list

#### spawnProjectile()
```cpp
CProjectile* spawnProjectile(eSprite sprite, 
                            const Vector2& pos, 
                            const Vector2& velocity, 
                            char ownerType)  // 'p' or 'e'
```
- Creates projectiles for player or enemies
- Automatically sets player reference for tracking
- Adds to object list

#### countEnemies()
```cpp
int countEnemies() const
```
- Counts all objects with collision type 'e'
- Used by CheckRoomCleared()

#### clearEnemies()
```cpp
void clearEnemies()
```
- Removes all enemies and their projectiles
- Iterates safely with proper erase handling

#### SetPlayer()
```cpp
void SetPlayer(CPlayer* player)
```
- Stores player reference for projectile tracking

### New Includes:
```cpp
#include "IceBat.h"
#include "IceBear.h"
#include "Projectile.h"
```

### Forward Declarations (ObjectManager.h):
```cpp
class CIceBat;
class CIceBear;
class CProjectile;
class CPlayer;
```

---

## 6. Game.h - New Member Variables & Methods

### New Methods:
```cpp
void SpawnEnemies();        // Spawn enemies based on room type
void CheckRoomCleared();    // Check if all enemies defeated
void SpawnRandomItems();    // Spawn reward items
```

### New Member Variables:
```cpp
int m_nEnemyCount = 0;              // Number of enemies spawned
bool m_bRoomCleared = false;        // Whether room cleared
bool m_bItemsSpawned = false;       // Whether items spawned
bool m_bDeterministicSpawns = true; // For testing
```

### New Include:
```cpp
#include "IceBat.h"
```

---

## Integration Recommendations

### 1. **Screen Resolution Conflict** ⚠️ HIGH PRIORITY
**Problem**: origin/master has 1024x768, basetest may have different
**Solution**:
- Decide on single resolution (1024x768 is more standard)
- Update all UI/room generation to use consistent dimensions
- Test room boundaries with new resolution

### 2. **Movement System Incompatibility** ⚠️ CRITICAL
**Problem**: Complete replacement of physics-based movement
**Solution**:
- **Option A**: Keep basetest system (current)
- **Option B**: Adopt origin/master's simpler system if gameplay is acceptable
- **Option C**: Hybrid - Use new animation helpers with old physics
- **Test**: Player collision with walls and enemies

### 3. **Audio System** ⚠️ MEDIUM
**Problem**: Audio disabled in origin/master
**Solution**: 
- Re-enable if audio is needed: uncomment LoadSounds()
- Or accept silent gameplay for now

### 4. **Menu System** ⚠️ MEDIUM
**Problem**: Menu completely disabled in origin/master
**Solution**:
- Re-enable StartMenu() logic if menu needed
- Or keep auto-start for faster testing

### 5. **Room Clearing & Item Spawning** ✅ ADDITIVE
**Problem**: None - basetest can adopt these systems
**Solution**:
- These are pure additions that enhance gameplay
- Integrate CheckRoomCleared() into main ProcessFrame()
- Ensure item pickup collision works

### 6. **Missing Ice Bear Sprites in XML** ⚠️ MEDIUM
**Problem**: Ice Bear sprites referenced in GameDefines.h but not in gamesettings.xml
**Solution**:
- Add Ice Bear sprite definitions to gamesettings.xml
- Create/obtain Ice Bear image files
- Ensure sprite naming matches references in code

### 7. **Player Reference in ObjectManager** ✅ CLEAN
**Problem**: None - is a clean addition
**Solution**:
- Call `m_pObjectManager->SetPlayer(m_pPlayer)` after player creation
- Already implemented in origin/master's CreateObjects()

### 8. **Collision Type System** ⚠️ VERIFY
**Problem**: countEnemies() relies on collision type 'e' 
**Solution**:
- Ensure IceBat and IceBear set collision type to 'e'
- Verify GetCollisionType() implementation
- Test with countEnemies() call

---

## Summary of Merged Changes Needed

If fully integrating both systems:

1. **Keep basetest's movement system** OR adopt origin/master's simpler version
2. **Adopt**: Enemy spawning system (SpawnEnemies, CheckRoomCleared)
3. **Adopt**: Item spawning system (SpawnRandomItems)
4. **Adopt**: ObjectManager spawning methods (spawnIceBat, spawnIceBear, spawnProjectile)
5. **Add Ice Bear sprite definitions** to gamesettings.xml
6. **Resolve**: Screen resolution to consistent 1024x768
7. **Integrate**: Call CheckRoomCleared() in main game loop

---

## File-by-File Comparison

| File | Status | Impact | Action |
|------|--------|--------|--------|
| GameDefines.h | Modified | Resolution change, new sprites | Review & adopt new sprites |
| Game.cpp | Major changes | Menu/audio disabled, spawning added | Selective merge |
| Game.h | Minor additions | New methods/vars | Accept all additions |
| Player.cpp | Major rewrite | Movement system replaced | Choose: keep or adopt |
| Player.h | Likely changed | Animation method signatures | Verify consistency |
| ObjectManager.h | Minor additions | New spawn methods | Accept all |
| ObjectManager.cpp | Minor additions | New spawn methods | Accept all |
| gamesettings.xml | New entries | Ice bat sprites | Add missing Ice Bear entries |

