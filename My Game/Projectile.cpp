/// \file Projectile.cpp
/// \brief Code for the projectile class CProjectile.

#include "Projectile.h"
#include "Component.h"
#include "Player.h"
#include "Timer.h"

/// Create and initialize a projectile given its initial position and velocity.
/// \param t Sprite type.
/// \param pos Initial position of projectile.
/// \param vel Velocity vector.
/// \param ownerType Owner type ('p' for player, 'e' for enemy).

CProjectile::CProjectile(eSprite t, const Vector2& pos, const Vector2& vel, char ownerType)
    : CObject(t, pos), m_vVelocity(vel), m_cOwnerType(ownerType) {
    width = 32.0f;  // Match 32x32 icicle sprite
    height = 32.0f;
    type = 'a'; // 'a' for attack/projectile
    // Enable tracking for enemy projectiles
    m_bTracking = (ownerType == 'e');
} //constructor

/// Destructor.

CProjectile::~CProjectile() {
} //destructor

/// Move the projectile based on its velocity.

void CProjectile::move() {
    float t = 0.016f; // ~60fps fallback
    if (m_pTimer) t = m_pTimer->GetFrameTime();
    
    // Update age
    m_fAge += t;
    
    // Tracking behavior for enemy projectiles
    if (m_bTracking && m_pPlayer && !m_bDead) {
        Vector2 toPlayer = m_pPlayer->m_vPos - m_vPos;
        if (toPlayer.Length() > 0.1f) {
            toPlayer.Normalize();
            // Gradually steer velocity toward player
            Vector2 desired = toPlayer * m_vVelocity.Length();
            Vector2 steer = desired - m_vVelocity;
            float maxSteer = m_fTrackingStrength * t;
            if (steer.Length() > maxSteer) {
                steer.Normalize();
                steer *= maxSteer;
            }
            m_vVelocity += steer;
        }
    }
    
    // Move projectile
    if (!m_bDead)
        m_vPos += m_vVelocity * t;

    // Expire or out-of-bounds -> mark dead for removal
    if (m_fAge >= m_fLifetime || IsOutOfBounds()) {
        m_bDead = true;
    }
} //move

/// Per-frame update entry point.
/// ObjectManager calls this; we delegate to move() for motion/lifetime.
void CProjectile::update(float /*dt*/) {
    move();
} //update

/// Check if projectile is out of screen bounds.
/// \return True if out of bounds, false otherwise.

bool CProjectile::IsOutOfBounds() const {
    const float screenWidth = 1400.0f;  // From gamesettings.xml
    const float screenHeight = 760.0f;
    
    return (m_vPos.x < -50.0f || m_vPos.x > screenWidth + 50.0f ||
            m_vPos.y < -50.0f || m_vPos.y > screenHeight + 50.0f);
} //IsOutOfBounds

/// Handle collision with other objects.
/// \param obj Pointer to the object this projectile collided with.

void CProjectile::onCollision(CObject* obj) {
    if (obj == nullptr) return;
    
    // Don't collide with objects of the same owner type
    if (obj->type == m_cOwnerType) return;
    
    // Player projectiles hit enemies
    if (m_cOwnerType == 'p' && obj->type == 'e') {
        // TODO: integrate enemy damage interface when available
        m_bDead = true; // Destroy projectile immediately
    }
    // Enemy projectiles hit player  
    else if (m_cOwnerType == 'e' && obj->type == 'p') {
        if (CPlayer* player = dynamic_cast<CPlayer*>(obj)) {
            // Apply damage
            player->changeHealth(-1.0f);
            
            // Apply visual hit effect (red tint and damaged state)
            //player->applyHitEffect(); // TODO: Implement in Player
            
            // Apply knockback in the direction the projectile was traveling
            Vector2 knockbackDir = m_vVelocity;
            if (knockbackDir.Length() > 0.1f) {
                knockbackDir.Normalize();
            }
            
            // Apply knockback force (push player away from projectile direction)
            const float knockbackStrength = 150.0f;
            float dt = 0.016f;
            if (m_pTimer) dt = m_pTimer->GetFrameTime();
            player->m_vPos += knockbackDir * knockbackStrength * dt;
        }
        m_bDead = true; // Destroy projectile immediately
    }
} //onCollision