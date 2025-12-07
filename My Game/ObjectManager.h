/// \file ObjectManager.h
/// \brief Interface for the object manager CObjectManager.

#ifndef __L4RC_GAME_OBJECTMANAGER_H__
#define __L4RC_GAME_OBJECTMANAGER_H__

#include "BaseObjectManager.h"
#include "Object.h"
#include "Common.h"

// Forward declarations
class CIceBat;
class CProjectile;

/// \brief The object manager.
///
/// A collection of all of the game objects.

class CObjectManager :
    public LBaseObjectManager<CObject>,
    public CCommon {
public:
    void update(float);
    CObject* create(eSprite, const Vector2&); ///< Create new object.
    CObject* create(eSprite, const Vector2&, bool, int);
    
    // Enemy spawning
    CIceBat* spawnIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd);
    CProjectile* spawnProjectile(eSprite sprite, const Vector2& pos, const Vector2& velocity, char ownerType);
    
    // Enemy tracking
    int countEnemies() const; ///< Count enemies in the level.
    void clearEnemies(); ///< Remove all enemies and their projectiles.
}; //CObjectManager

#endif //__L4RC_GAME_OBJECTMANAGER_H__
