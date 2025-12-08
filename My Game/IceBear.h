/// \file IceBear.h
/// \brief Interface for the Ice Bear enemy class CIceBear.

#pragma once

#ifndef __L4RC_GAME_ICEBEAR_H__
#define __L4RC_GAME_ICEBEAR_H__

#include "EnemyBase.h"
#include "EventTimer.h"
#include "Common.h"

/// \brief The Ice Bear enemy class.
///
/// CIceBear is a large, slow, tanky enemy that charges at the player every 3 seconds.
/// Higher health and damage than IceBat, but slower base movement.

class CIceBear : public CEnemyBase {
protected:
    float m_fHealth;              ///< Current health points
    float m_fMaxHealth;           ///< Maximum health points
    Vector2 m_vVelocity;          ///< Current velocity vector
    
    // AI Behavior
    float m_fBaseSpeed;           ///< Normal movement speed (slower than IceBat)
    float m_fRushSpeed;           ///< Rush/charge speed (2x dash speed)
    float m_fDetectionRange;      ///< Range to detect and chase player
    
    // Animation and Timing
    eSprite m_eCurrentSprite;     ///< Current sprite being displayed
    float m_fAnimationTimer;      ///< Timer for animation frame changes
    float m_fRushTimer;           ///< Timer for rush attack
    float m_fRushCooldown;        ///< Cooldown between rushes (3 seconds)
    LEventTimer* m_pFrameEvent = nullptr; ///< Frame event timer for animation
    int m_nCurrentFrame = 0;              ///< Current animation frame
    // Hit reaction timing
    float m_fHitTimer = 0.0f;     ///< Timer since entering HIT state
    float m_fHitDuration = 0.5f;  ///< How long to linger in HIT state (extended for visibility)
    
        // Animation speed tunables per state
        float m_fInactiveAnimSpeed = 0.20f;  ///< Slow breathing when inactive
        float m_fActiveAnimSpeed = 0.10f;    ///< Normal speed when active
        float m_fHitAnimSpeed = 0.08f;       ///< Fast flash when hit
    
    // State Management
    enum class AIState {
        CHASE,                    ///< Chasing the player normally
        RUSH,                     ///< Rushing toward player at high speed
        HIT,                      ///< Taking damage reaction
        DEAD                      ///< Defeated state
    };
    AIState m_eAIState;           ///< Current AI behavior state
    
    // Movement parameters
    float m_fXSpeed = 0.0f;
    float m_fYSpeed = 0.0f;
    float m_fMaxSpeed = 0.7f;     ///< Very slow base speed (was 1.0f)
    float m_fSpeedInc = 0.15f;    ///< Very slow acceleration (was 0.2f)
    float m_fSpeedDec = 0.08f;    ///< Very slow deceleration (was 0.1f)
    float m_fRushDuration = 0.5f; ///< Rush lasts half a second
    float m_fRushTimerActive = 0.0f; ///< Timer tracking rush progression

public:
    CIceBear(const Vector2& pos); ///< Constructor.
    virtual ~CIceBear(); ///< Destructor.
    
    // Core behaviors
    virtual void update(float) override;      ///< Per-frame update hook
    virtual void move() override;              ///< AI movement and behavior update
    virtual void draw() override;              ///< Draw Ice Bear
    virtual void onCollision(CObject* obj) override; ///< Handle collisions
    
    // Ice Bear specific methods
    void updateAI();                          ///< Update AI state and decision making
    void updateAnimation();                   ///< Update sprite animations
    void updateFrameNumber();                 ///< Advance animation frames
    void takeDamage(float damage);           ///< Take damage and update health
    
    // State queries
    bool isAlive() const;                    ///< Check if ice bear is still alive
    float getHealthPercent() const;          ///< Get health as percentage
    AIState getAIState() const;              ///< Get current AI state
    
    // Debug overlay control
    static void SetDebugOverlay(bool on) { s_bDebugOverlay = on; }

    // Player-style wrapper API (mirrors CPlayer naming for consistency) - simplified
    void IdleLeft()  { m_eCurrentSprite = eSprite::IceBearInactive128; m_nCurrentFrame = 0; }
    void IdleRight() { m_eCurrentSprite = eSprite::IceBearInactive128; m_nCurrentFrame = 0; }
    void IdleUp()    { m_eCurrentSprite = eSprite::IceBearInactive128; m_nCurrentFrame = 0; }
    void IdleDown()  { m_eCurrentSprite = eSprite::IceBearInactive128; m_nCurrentFrame = 0; }
    void RunLeft()   { m_eCurrentSprite = eSprite::IceBearActive128; }
    void RunRight()  { m_eCurrentSprite = eSprite::IceBearActive128; }
    void RunUp()     { m_eCurrentSprite = eSprite::IceBearActive128; }
    void RunDown()   { m_eCurrentSprite = eSprite::IceBearActive128; }
    void Attack()    { m_eCurrentSprite = eSprite::IceBearActive128; }
    void Die()       { m_fHealth = 0.0f; m_eAIState = AIState::DEAD; }

private:
    // Internal helper methods
    void updateChaseMovement();              ///< Handle player chasing
    void updateRushBehavior();               ///< Handle rush attack
    void updateHitReaction();                ///< Handle damage reaction
    
    float getDistanceToPlayer() const;       ///< Calculate distance to player
    Vector2 getDirectionToPlayer() const;    ///< Get normalized direction to player
    bool isPlayerInRange(float range) const; ///< Check if player is within specified range

    static bool s_bDebugOverlay;             ///< Global toggle for debug overlay
};

#endif //__L4RC_GAME_ICEBEAR_H__
