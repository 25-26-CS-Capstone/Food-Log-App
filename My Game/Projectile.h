/// \file Projectile.h
/// \brief Interface for the projectile class CProjectile.

#ifndef __L4RC_GAME_PROJECTILE_H__
#define __L4RC_GAME_PROJECTILE_H__

#include "Object.h"
#include "EventTimer.h"
#include "Common.h"

/// \brief The projectile object.
///
/// A projectile that moves in a straight line with a given velocity.
/// Used for both player attacks and enemy projectiles like Ice Bat shots.

class CProjectile : public CObject {
protected:
    Vector2 m_vVelocity; ///< Movement velocity vector.
    float m_fLifetime = 5.0f; ///< Time before projectile self-destructs.
    float m_fAge = 0.0f; ///< Current age of projectile.
    char m_cOwnerType = 'p'; ///< Owner type ('p' for player, 'e' for enemy).
    bool m_bTracking = false; ///< Enable player tracking for enemy projectiles.
    float m_fTrackingStrength = 100.0f; ///< Turn speed toward player.

public:
    CProjectile(eSprite t, const Vector2& pos, const Vector2& vel, char ownerType = 'p'); ///< Constructor.
    virtual ~CProjectile(); ///< Destructor.

    void move() override; ///< Internal movement + aging logic.
    virtual void update(float dt) override; ///< Per-frame update hook called by ObjectManager.
    bool IsOutOfBounds() const; ///< Check if projectile is out of screen bounds.
    char GetOwnerType() const { return m_cOwnerType; } ///< Get owner type.
    
    void onCollision(CObject* obj) override; ///< Handle collision with other objects.
}; //CProjectile

#endif //__L4RC_GAME_PROJECTILE_H__