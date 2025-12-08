/// \file ObjectManager.h
/// \brief Interface for the object manager CObjectManager.

#ifndef __L4RC_GAME_OBJECTMANAGER_H__
#define __L4RC_GAME_OBJECTMANAGER_H__

#include "BaseObjectManager.h"
#include "Object.h"
#include "Common.h"

// Forward declarations
class CIceBat;
class CIceBear;
class CProjectile;
class CPlayer;

/// \brief The object manager.
///
/// A collection of all of the game objects.

class CObjectManager :
    public LBaseObjectManager<CObject>,
    public CCommon {
private:
    CPlayer* m_pPlayer = nullptr; ///< Pointer to player for projectile tracking.

public:
    void update(float);
    CObject* create(eSprite, const Vector2&); ///< Create new object.
    CObject* create(eSprite, const Vector2&, bool, int);
    
    // Enemy spawning
    CIceBat* spawnIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd);
    CIceBear* spawnIceBear(const Vector2& pos);
    CProjectile* spawnProjectile(eSprite sprite, const Vector2& pos, const Vector2& velocity, char ownerType);
    
    // Player reference for projectile tracking
    void SetPlayer(CPlayer* player) { m_pPlayer = player; } ///< Set player pointer for tracking.
    
    // Enemy tracking
    int countEnemies() const; ///< Count enemies in the level.
    void clearEnemies(); ///< Remove all enemies and their projectiles.
}; //CObjectManager

#endif //__L4RC_GAME_OBJECTMANAGER_H__
