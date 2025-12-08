/// \file IceBat.cpp
/// \brief Simplified Ice Bat enemy with 64x64 flapping animations only.

#include "IceBat.h"
#include "SpriteRenderer.h"
#include "Common.h"
#include "Player.h"
#include "Projectile.h"
#include "ObjectManager.h"
#include <fstream>
#include <random>
//#include "Log.h"

/// Constructor - Initialize bat with patrol route
CIceBat::CIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd)
    : CEnemyBase(eSprite::IceBatFlap, pos),
      m_pCurrentAnim(nullptr),
      m_animTimer(0.0f),
      m_currentFrame(0),
      m_fHealth(100.0f),
      m_fMaxHealth(100.0f),
      m_vVelocity(Vector2::Zero),
      m_vPatrolStart(patrolStart),
      m_vPatrolEnd(patrolEnd),
      m_fPatrolSpeed(80.0f),
      m_fChaseSpeed(140.0f),
      m_fDetectionRange(400.0f),
      m_fShootRange(250.0f),
      m_fShootTimer(0.0f),
      m_fHitTimer(0.0f),
      m_eAIState(AIState::PATROL),
      m_bPatrolForward(true),
      m_bCanShoot(true),
      m_bFacingRight(true) {
    
    // Normal flap animation (row 0, 4 frames)
    m_animFlap.row = 0;
    m_animFlap.frameCount = 4;
    m_animFlap.frameTime = 0.12f;  // Slower flap
    
    // Attack flap animation (row 1, 4 frames)
    m_animAttack.row = 1;
    m_animAttack.frameCount = 4;
    m_animAttack.frameTime = 0.07f;  // Faster flap
    
    // Setup sprite system first (start with flap row)
    m_currentSprite = eSprite::IceBatFlap;
    
    // Setup local sprite descriptor
    // local rendering via renderer API
    
    // Now set animation state (just pointer & timers)
    m_pCurrentAnim = &m_animFlap;
    m_animTimer = 0.0f;
    m_currentFrame = 0;
    // //Log::Info("IceBat constructed (Flap state) at (" + std::to_string((double)m_vPos.x) + "," + std::to_string((double)m_vPos.y) + ")");
    
    // Set collision size to 64x64
    width = 64.0f;
    height = 64.0f;
    type = 'e';  // Enemy type
    
    m_vPos = patrolStart;
}

/// Destructor
CIceBat::~CIceBat() {
}

/// Set animation state (Flap or AttackFlap)
void CIceBat::SetAnimState(AnimState state) {
    switch (state) {
    case AnimState::Flap:
        m_pCurrentAnim = &m_animFlap;
        m_currentSprite = eSprite::IceBatFlap;
        // //Log::Info("IceBat animation -> Flap");
        break;
    case AnimState::AttackFlap:
        m_pCurrentAnim = &m_animAttack;
        m_currentSprite = eSprite::IceBatAttackFlap;
        // //Log::Info("IceBat animation -> AttackFlap");
        break;
    }
    
    m_animTimer = 0.0f;
    m_currentFrame = 0;
    m_currentFrame = 0;
}

/// Update animation frames
void CIceBat::updateAnimation(float dt) {
    if (!m_pCurrentAnim) return;
    m_animTimer += dt;
    
    if (m_animTimer >= m_pCurrentAnim->frameTime) {
        m_animTimer -= m_pCurrentAnim->frameTime;
        m_currentFrame++;
        
        if (m_currentFrame >= m_pCurrentAnim->frameCount) {
            m_currentFrame = 0;  // Loop
        }
        
        // Frame index updated locally (renderer ignores frames)
    }
}

/// Update entry point from ObjectManager
void CIceBat::update(float deltaTime) {
    move(deltaTime);
}

/// Main AI and movement update
void CIceBat::move(float dt) {
    if (!isAlive()) {
        return;
    }
    // Update timers
    m_fShootTimer += dt;
    m_fHitTimer += dt;
    
    // Update AI and animation
    updateAI();
    updateAnimation(dt);
    
    // Apply velocity
    m_vPos += m_vVelocity * dt;
}

/// Update AI logic
void CIceBat::updateAI() {
    // If player not in detection range, stay idle
    if (!isPlayerInRange(m_fDetectionRange)) {
        m_vVelocity = Vector2::Zero;
        if (m_pCurrentAnim != &m_animFlap) {
            SetAnimState(AnimState::Flap);
        }
        return;
    }
    
    switch (m_eAIState) {
    case AIState::PATROL:
        updatePatrolMovement();
        break;
    case AIState::CHASE:
        updateChaseMovement();
        break;
    case AIState::ATTACK:
        updateAttackBehavior();
        break;
    case AIState::HIT:
        updateHitReaction();
        break;
    case AIState::DEAD:
        m_vVelocity = Vector2::Zero;
        break;
    }
}

/// Patrol movement between waypoints
void CIceBat::updatePatrolMovement() {
    // Move toward current patrol target
    Vector2 target = m_bPatrolForward ? m_vPatrolEnd : m_vPatrolStart;
    Vector2 direction = target - m_vPos;
    float distance = direction.Length();
    
    if (distance < 10.0f) {
        // Reached waypoint, pick new random target anywhere on map
        m_bPatrolForward = !m_bPatrolForward;
        
        // Generate random position within screen bounds (with margins)
        std::random_device rd;
        std::mt19937 rng(rd());
        std::uniform_real_distribution<float> xDist(64.0f, 1024.0f - 64.0f);
        std::uniform_real_distribution<float> yDist(64.0f, 768.0f - 64.0f);
        
        Vector2 newTarget(xDist(rng), yDist(rng));
        if (m_bPatrolForward) {
            m_vPatrolEnd = newTarget;
        } else {
            m_vPatrolStart = newTarget;
        }
    }
    
    if (direction.Length() > 0.01f) {
        direction.Normalize();
    }
    m_vVelocity = direction * m_fPatrolSpeed;
    
    // Update facing
    m_bFacingRight = (m_vVelocity.x > 0);
    
    // Use normal flap animation
    if (m_pCurrentAnim != &m_animFlap) {
        SetAnimState(AnimState::Flap);
    }
    
    // Check if player is in range
    if (isPlayerInRange(m_fDetectionRange)) {
        m_eAIState = AIState::CHASE;
    }
}

/// Chase player
void CIceBat::updateChaseMovement() {
    Vector2 direction = getDirectionToPlayer();
    m_vVelocity = direction * m_fChaseSpeed;
    
    // Update facing
    m_bFacingRight = (direction.x > 0);
    
    // Use attack flap animation when chasing
    if (m_pCurrentAnim != &m_animAttack) {
        SetAnimState(AnimState::AttackFlap);
        //Log::Info("IceBat state: CHASE -> using AttackFlap animation");
    }
    
    // Check if in shooting range
    if (isPlayerInRange(m_fShootRange) && m_bCanShoot) {
        m_eAIState = AIState::ATTACK;
    }
    
    // Return to patrol if player too far
    if (!isPlayerInRange(m_fDetectionRange + 100.0f)) {
        m_eAIState = AIState::PATROL;
    }
}

/// Attack behavior - shoot at player
void CIceBat::updateAttackBehavior() {
    // Slow down while attacking
    Vector2 direction = getDirectionToPlayer();
    m_vVelocity = direction * (m_fChaseSpeed * 0.5f);
    
    // Update facing
    m_bFacingRight = (direction.x > 0);
    
    // Use attack flap
    if (m_pCurrentAnim != &m_animAttack) {
        SetAnimState(AnimState::AttackFlap);
        //Log::Info("IceBat state: ATTACK -> AttackFlap animation active");
    }
    
    // Shoot projectile
    if (m_fShootTimer >= m_fShootCooldown && m_bCanShoot) {
        shootProjectile();
        m_fShootTimer = 0.0f;
        //Log::Info("IceBat fired projectile");
    }
    
    // Return to chase if out of shooting range
    if (!isPlayerInRange(m_fShootRange + 50.0f)) {
        m_eAIState = AIState::CHASE;
    }
}

/// Handle hit reaction
void CIceBat::updateHitReaction() {
    m_vVelocity *= 0.9f;  // Slow down
    
    if (m_fHitTimer >= 0.3f) {
        m_eAIState = AIState::CHASE;
        m_fHitTimer = 0.0f;
    }
}

/// Draw the bat using LARC sprite system
void CIceBat::draw() {
    if (!m_pRenderer) return;
    
    // Create sprite descriptor with current frame and animation state
    LSpriteDesc2D desc;
    desc.m_nSpriteIndex = static_cast<int>(m_currentSprite);
    desc.m_nCurrentFrame = m_currentFrame;  // Set to current animation frame
    desc.m_vPos = m_vPos;
    desc.m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f);  // White, full opacity
    
    m_pRenderer->Draw(&desc);
}

/// Shoot a projectile toward the player
void CIceBat::shootProjectile() {
    if (!m_pPlayer) return;
    
    Vector2 direction = getDirectionToPlayer();
    Vector2 spawnPos = m_vPos + direction * 30.0f;  // Spawn slightly ahead
    Vector2 velocity = direction * 280.0f;  // Ice projectile speed
    // Create projectile via object manager
    if (m_pObjectManager) {
        m_pObjectManager->spawnProjectile(eSprite::IceBatProjectile, spawnPos, velocity, 'e');
    }
}

/// Take damage
void CIceBat::takeDamage(float damage) {
    if (!isAlive()) return;
    
    m_fHealth -= damage;
    
    if (m_fHealth <= 0.0f) {
        m_fHealth = 0.0f;
        m_eAIState = AIState::DEAD;
        m_bDead = true;
        //Log::Info("IceBat died.");
    } else {
        m_eAIState = AIState::HIT;
        m_fHitTimer = 0.0f;
        //Log::Info("IceBat took damage. Health: " + std::to_string((double)m_fHealth));
    }
}

/// Handle collision with other objects
void CIceBat::onCollision(CObject* obj) {
    if (!obj) return;
    
    // Only handle PLAYER attack collision, ignore enemy projectiles and player body collision
    if (obj->type == 'a') {  // Attack object (projectile)
        // Check if it's a PLAYER projectile (not an enemy one)
        CProjectile* proj = dynamic_cast<CProjectile*>(obj);
        if (proj && proj->GetOwnerType() == 'p') {
            // Only take damage from player projectiles
            takeDamage(25.0f);
        }
    }
    // Don't damage the bat on player body collision (type 'p')
}

/// Check if bat is alive
bool CIceBat::isAlive() const {
    return m_fHealth > 0.0f && m_eAIState != AIState::DEAD;
}

/// Get health percentage
float CIceBat::getHealthPercent() const {
    return m_fHealth / m_fMaxHealth;
}

/// Get current AI state
CIceBat::AIState CIceBat::getAIState() const {
    return m_eAIState;
}

/// Get distance to player
float CIceBat::getDistanceToPlayer() const {
    if (!m_pPlayer) return 9999.0f;
    return (m_pPlayer->m_vPos - m_vPos).Length();
}

/// Get normalized direction to player
Vector2 CIceBat::getDirectionToPlayer() const {
    if (!m_pPlayer) return Vector2(1.0f, 0.0f);
    
    Vector2 direction = m_pPlayer->m_vPos - m_vPos;
    direction.Normalize();
    return direction;
}

/// Check if player is within range
bool CIceBat::isPlayerInRange(float range) const {
    return getDistanceToPlayer() <= range;
}
