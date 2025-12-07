/// \file ObjectManager.h
/// \brief Interface for the object manager CObjectManager.

#ifndef __L4RC_GAME_OBJECTMANAGER_H__
#define __L4RC_GAME_OBJECTMANAGER_H__

#include "BaseObjectManager.h"
#include "Object.h"
#include "Common.h"
class CProjectile;
class CIceBat;

/// \brief The object manager.
///
/// A collection of all of the game objects.

class CObjectManager :
    public LBaseObjectManager<CObject>,
    public CCommon {
public:
    void update(float);
    CObject* create(eSprite, const Vector2&); ///< Create new object.
    // Spawn a projectile with velocity and team owner
    CProjectile* spawnProjectile(eSprite sprite, const Vector2& pos, const Vector2& vel, char ownerType);
    // Spawn an IceBat enemy with patrol route
    CIceBat* spawnIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd);
    // Clear all enemies from the scene
    void clearEnemies();
    // Count remaining enemies in scene
    int countEnemies() const;
}; //CObjectManager

#endif //__L4RC_GAME_OBJECTMANAGER_H__
