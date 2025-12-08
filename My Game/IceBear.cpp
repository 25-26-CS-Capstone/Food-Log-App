/// \file IceBear.cpp
/// \brief Code for the Ice Bear enemy class CIceBear.

#include "IceBear.h"
#include "Component.h"
#include "Common.h"
#include "Player.h"
#include "Projectile.h"
#include "ObjectManager.h"
#include "Timer.h"

/// Create and initialize an Ice Bear at the specified position.
/// \param pos Initial position of the Ice Bear.

CIceBear::CIceBear(const Vector2& pos)
    : CEnemyBase(eSprite::IceBear0, pos),
            m_fHealth(10.0f),        // Boss with 10 HP
            m_fMaxHealth(10.0f),
            m_vVelocity(Vector2::Zero),
            m_fBaseSpeed(35.0f),      // Very slow base speed (was 50.0f)
            m_fRushSpeed(200.0f),     // Reduced rush speed (was 250.0f)
            m_fDetectionRange(9999.0f), // Always detect player
            m_eCurrentSprite(eSprite::IceBear0),
            m_fAnimationTimer(0.0f),
            m_fRushTimer(0.0f),
            m_fRushCooldown(3.0f),    // Rush every 3 seconds
            m_eAIState(AIState::CHASE) {
    
    // Set Ice Bear properties - larger than IceBat
    width = 100.0f;   // Wider to match bear's natural proportions
    height = 70.0f;   // Better presence and visibility
    
    type = 'e';      // Enemy type
    
    // Initialize position
    m_vPos = pos;

    // Animation frame timer and setup (will be adjusted per state)
    m_nCurrentFrame = 0;
    // Start on inactive animation (only idle/move supported)
    m_eCurrentSprite = eSprite::IceBearInactive128;
} //constructor

/// Destructor.
CIceBear::~CIceBear() {
    // Nothing to clean up
} //destructor

bool CIceBear::s_bDebugOverlay = false; // initialize static member

/// Per-frame update entry point invoked by ObjectManager.
void CIceBear::update(float /*deltaTime*/) {
    move();
}

/// Draw the Ice Bear and optional debug info.
void CIceBear::draw() {
    // Apply engagement tint then draw
    ApplyEngagementTint();
    // Simple draw using current sprite and position
    m_pRenderer->Draw(m_eCurrentSprite, m_vPos);
    
    // Draw health bar above the ice bear
    if (isAlive()) {
        const float barTotalWidth = 100.0f;
        const float barOffsetY = 60.0f; // Above the bear
        
        Vector2 barCenterPos = m_vPos;
        barCenterPos.y += barOffsetY;
        
        float healthPercent = m_fHealth / m_fMaxHealth;
        
        // Draw 10 health segments (one per HP)
        const int maxSegments = 10;
        const float segmentWidth = 8.0f;
        const float segmentSpacing = 2.0f;
        const float totalBarWidth = maxSegments * (segmentWidth + segmentSpacing);
        
        for (int i = 0; i < maxSegments; i++) {
            Vector2 segmentPos = barCenterPos;
            segmentPos.x += (i - maxSegments / 2.0f) * (segmentWidth + segmentSpacing);
            
            LSpriteDesc2D segDesc = {};
            if (i < (int)m_fHealth) {
                // Filled segment (green)
                segDesc.m_nSpriteIndex = static_cast<int>(eSprite::healthBar);
                segDesc.m_f4Tint = XMFLOAT4(0.0f, 1.0f, 0.0f, 1.0f);
            } else {
                // Empty segment (red background)
                segDesc.m_nSpriteIndex = static_cast<int>(eSprite::healthBarBackground);
                segDesc.m_f4Tint = XMFLOAT4(0.5f, 0.0f, 0.0f, 1.0f);
            }
            segDesc.m_vPos = segmentPos;
            m_pRenderer->Draw(&segDesc);
        }
    }
}

/// Main movement and AI update function called each frame.
void CIceBear::move() {
    if (!isAlive()) return;
    const float frameDt = m_pTimer ? m_pTimer->GetFrameTime() : 0.016f;
    
    // Update timers
    m_fAnimationTimer += frameDt;
    m_fRushTimer += frameDt;

    // Track hit timer for lingering HIT state
    m_fHitTimer += frameDt;

    // Update engagement (INACTIVE/ACTIVE/HIT) before heavy AI
    UpdateEngagement();
    if (m_eEngagement == EngagementState::INACTIVE) {
        // Idle breathing handled by spritesheet animation; just keep movement minimal
        // Gentle damp
        m_fXSpeed *= 0.9f; m_fYSpeed *= 0.9f;
        const float padding = kBorderMargin;
        if (m_vPos.x < padding) m_vPos.x = padding;
        if (m_vPos.x > screenWidth - padding) m_vPos.x = screenWidth - padding;
        if (m_vPos.y < padding) m_vPos.y = padding;
        if (m_vPos.y > screenHeight - padding) m_vPos.y = screenHeight - padding;
        return; // Skip rush/AI logic while inactive
    }
    
    // Update AI behavior
    updateAI();
    
    // Handle movement based on state
    if (m_eAIState == AIState::RUSH) {
        updateRushBehavior();
    }
    else if (m_eAIState == AIState::CHASE) {
        Vector2 dir = getDirectionToPlayer();
        // Slower acceleration than IceBat
        m_fXSpeed += dir.x * m_fSpeedInc;
        m_fYSpeed += dir.y * m_fSpeedInc;
    }
    else if (m_eAIState == AIState::HIT) {
        // Heavy speed reduction when hit
        m_fXSpeed *= 0.1f;
        m_fYSpeed *= 0.1f;
    }

    // Clamp speeds
    if (m_fXSpeed > m_fMaxSpeed) m_fXSpeed = m_fMaxSpeed;
    if (m_fXSpeed < -m_fMaxSpeed) m_fXSpeed = -m_fMaxSpeed;
    if (m_fYSpeed > m_fMaxSpeed) m_fYSpeed = m_fMaxSpeed;
    if (m_fYSpeed < -m_fMaxSpeed) m_fYSpeed = -m_fMaxSpeed;

    // Apply friction
    if (m_eAIState != AIState::RUSH) {
        if (m_fXSpeed > 0) m_fXSpeed -= m_fSpeedDec; else if (m_fXSpeed < 0) m_fXSpeed += m_fSpeedDec;
        if (m_fYSpeed > 0) m_fYSpeed -= m_fSpeedDec; else if (m_fYSpeed < 0) m_fYSpeed += m_fSpeedDec;
        const float ax = (m_fXSpeed >= 0.0f) ? m_fXSpeed : -m_fXSpeed;
        const float ay = (m_fYSpeed >= 0.0f) ? m_fYSpeed : -m_fYSpeed;
        if (ax < (m_fSpeedDec * 1.5f)) m_fXSpeed = 0.0f;
        if (ay < (m_fSpeedDec * 1.5f)) m_fYSpeed = 0.0f;
    }

    // Apply movement
    const float scalar = 200.0f * frameDt;
    m_vPos.x += scalar * m_fXSpeed;
    m_vPos.y += scalar * m_fYSpeed;

    // Update animation (single source-of-truth)
    updateAnimation();
    // Advance frame like player does (timer-driven)
    updateFrameNumber();
    
    // Keep Ice Bear within screen bounds with border (parameterized)
    const float padding = kBorderMargin;
    if (m_vPos.x < padding) m_vPos.x = padding;
    if (m_vPos.x > screenWidth - padding) m_vPos.x = screenWidth - padding;
    if (m_vPos.y < padding) m_vPos.y = padding;
    if (m_vPos.y > screenHeight - padding) m_vPos.y = screenHeight - padding;
} //move

/// Handle collisions with other game objects.
void CIceBear::onCollision(CObject* obj) {
    if (!isAlive()) return;
    
    switch (obj->type) {
        case 'a': // Attack/Projectile
            {
                CProjectile* projectile = dynamic_cast<CProjectile*>(obj);
                if (projectile && projectile->GetOwnerType() == 'p') {
                    takeDamage(15.0f); // Takes less damage due to thick hide
                }
            }
            break;
            
        case 'p': // Player collision - deal MORE damage than IceBat
            {
                CPlayer* player = dynamic_cast<CPlayer*>(obj);
                if (player) {
                    // Calculate knockback direction
                    Vector2 knockbackDir = player->m_vPos - m_vPos;
                    if (knockbackDir.Length() > 0.1f) {
                        knockbackDir.Normalize();
                    }
                    
                    // Apply HEAVY knockback (Ice Bear is strong)
                    const float knockbackStrength = 300.0f;
                    const float dt = (m_pTimer ? m_pTimer->GetFrameTime() : 0.016f);
                    //player->ApplyKnockback(knockbackDir, knockbackStrength, dt); // TODO: Implement in Player

                    // Deal damage unless player is invincible
                    //if (!player->GetInvincible()) { // TODO: Implement GetInvincible in Player
                        player->changeHealth(-2.0f);
                        //player->applyHitEffect(); // TODO: Implement in Player
                    //}
                }
            }
            break;
            
        default:
            break;
    }
} //onCollision

/// Update AI state machine and decision making.
void CIceBear::updateAI() {
    float distanceToPlayer = getDistanceToPlayer();
    
    switch (m_eAIState) {
        case AIState::CHASE:
            updateChaseMovement();
            
            // Rush every 3 seconds
            if (m_fRushTimer >= m_fRushCooldown) {
                m_eAIState = AIState::RUSH;
                m_fRushTimerActive = 0.0f;
                m_fRushTimer = 0.0f; // Reset cooldown
            }
            break;
            
        case AIState::RUSH:
            // Rush movement handled in move()
            break;
            
        case AIState::HIT:
            updateHitReaction();
            break;
            
        case AIState::DEAD:
            m_vVelocity = Vector2::Zero;
            break;
    }
} //updateAI

/// Update sprite animations based on current state.
void CIceBear::updateAnimation() {
    // Select spritesheet animation by engagement state (3 frames each)
    eSprite prevSprite = m_eCurrentSprite;
    if (m_eEngagement == EngagementState::INACTIVE) {
        m_eCurrentSprite = eSprite::IceBearInactive128;
    } else if (m_eEngagement == EngagementState::ACTIVE) {
        m_eCurrentSprite = eSprite::IceBearActive128;
    } else { // HIT
        // No hit sprite; stay on active animation during hit
        m_eCurrentSprite = eSprite::IceBearActive128;
    }
    // Reset frame when switching sprite to keep animation coherent
    if (m_eCurrentSprite != prevSprite) m_nCurrentFrame = 0;
} //updateAnimation

/// Advance animation frame number (player-style frame cycling).
void CIceBear::updateFrameNumber() {
    // Pause animation on middle frame during hit for visual emphasis
    if (m_eEngagement == EngagementState::HIT && m_nCurrentFrame == 4) {
        return; // Hold on middle frame for strong visual feedback
    }
    
    // Cycle through all 9 animation frames (0-8)
    m_nCurrentFrame = (m_nCurrentFrame + 1) % 9;
    
    // Update sprite based on current frame
    m_eCurrentSprite = static_cast<eSprite>(static_cast<int>(eSprite::IceBear0) + m_nCurrentFrame);
}

/// Apply damage to the Ice Bear.
void CIceBear::takeDamage(float damage) {
    if (!isAlive()) return;
    
    m_fHealth -= damage;
    
    if (m_fHealth <= 0.0f) {
        m_fHealth = 0.0f;
        m_eAIState = AIState::DEAD;
        m_bDead = true; // Mark for removal
        return;
    }
    // Enter brief hit reaction state
    m_eAIState = AIState::HIT;
    m_fHitTimer = 0.0f;
    m_eEngagement = EngagementState::HIT; // reflect tri-state
} //takeDamage

/// Check if the Ice Bear is still alive.
bool CIceBear::isAlive() const {
    return m_fHealth > 0.0f;
}

/// Get current health as a percentage.
float CIceBear::getHealthPercent() const {
    return m_fHealth / m_fMaxHealth;
}

/// Get the current AI state.
CIceBear::AIState CIceBear::getAIState() const {
    return m_eAIState;
}

/// Handle chasing the player.
void CIceBear::updateChaseMovement() {
    Vector2 directionToPlayer = getDirectionToPlayer();
    m_vVelocity = directionToPlayer * m_fBaseSpeed;
}

/// Handle rush attack behavior.
void CIceBear::updateRushBehavior() {
    // Initialize rush direction if just started
    if (m_fRushTimerActive == 0.0f) {
        Vector2 dir = getDirectionToPlayer();
        m_fXSpeed = dir.x * 6.0f; // Very fast rush
        m_fYSpeed = dir.y * 6.0f;
    }
    // Guard timer access
    m_fRushTimerActive += (m_pTimer ? m_pTimer->GetFrameTime() : 0.016f);
    
    // End rush after duration
    if (m_fRushTimerActive >= m_fRushDuration) {
        m_eAIState = AIState::CHASE;
        m_fRushTimerActive = 0.0f;
    }
}

/// Handle hit reaction timing.
void CIceBear::updateHitReaction() {
    // Briefly linger in HIT state before resuming CHASE
    const float dt = m_pTimer ? m_pTimer->GetFrameTime() : 0.016f;
    m_fHitTimer += dt;
    // Dampen movement while hit
    m_fXSpeed *= 0.5f;
    m_fYSpeed *= 0.5f;
    // Visual feedback: brief tint pulse
    // Pulse from white to normal across hit duration
    const float t = m_fHitTimer / m_fHitDuration;
    const float pulse = (t < 0.5f) ? (1.0f) : (1.0f - (t - 0.5f) * 2.0f); // down after mid
    m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f); // simplified - no pulse scaling
    if (m_fHitTimer >= m_fHitDuration) {
        m_fHitTimer = 0.0f;
        m_f4Tint = XMFLOAT4(1,1,1,1);
        m_eAIState = AIState::CHASE;
        // Evaluate engagement after recovering
        const float dist = getDistanceToPlayer();
        if (dist > m_fEngageRange + m_fEngageBuffer) m_eEngagement = EngagementState::INACTIVE; else m_eEngagement = EngagementState::ACTIVE;
    }
}

/// Calculate distance to the player character.
float CIceBear::getDistanceToPlayer() const {
    if (!m_pPlayer) return 9999.0f;
    
    Vector2 diff = m_pPlayer->m_vPos - m_vPos;
    return diff.Length();
}

/// Get normalized direction vector pointing toward the player.
Vector2 CIceBear::getDirectionToPlayer() const {
    if (!m_pPlayer) return Vector2::Zero;
    
    Vector2 direction = m_pPlayer->m_vPos - m_vPos;
    if (direction.Length() > 0.1f) {
        direction.Normalize();
    }
    return direction;
}

/// Check if the player is within a specified range.
bool CIceBear::isPlayerInRange(float range) const {
    return getDistanceToPlayer() <= range;
}

// (engagement update now provided by CEnemyBase::UpdateEngagement)
