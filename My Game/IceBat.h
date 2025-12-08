/// \file IceBat.h
/// \brief Interface for the Ice Bat enemy class CIceBat.

#pragma once

#ifndef __L4RC_GAME_ICEBAT_H__
#define __L4RC_GAME_ICEBAT_H__

#include "EnemyBase.h"
#include "EventTimer.h"
#include "Common.h"

/// \brief The Ice Bat enemy class.
///
/// CIceBat is a flying enemy using simplified 64x64 flapping animations.
/// Only flaps - no idle/spawn/despawn states. Two animation states: normal flap and attack flap.

class CIceBat : public CEnemyBase {
public:
    /// Animation states for the bat
    enum class AnimState {
        Flap,       ///< Normal flying/flapping
        AttackFlap  ///< Harder/faster attack flapping
    };

private:
    // Animation system
    struct Animation {
        int row;            ///< Which row on sprite sheet (0 or 1)
        int frameCount;     ///< Number of frames in that row
        float frameTime;    ///< Time per frame in seconds
    };

    Animation m_animFlap;         ///< Normal flap animation
    Animation m_animAttack;       ///< Attack flap animation
    Animation* m_pCurrentAnim;    ///< Pointer to current animation
    
    float m_animTimer;            ///< Animation frame timer
    int m_currentFrame;           ///< Current frame index
    
    // Sprite sheet constants
    static constexpr int FRAME_W = 64;
    static constexpr int FRAME_H = 64;
    static constexpr int SHEET_COLS = 4;  ///< 4 frames per row
    
    eSprite m_currentSprite;      ///< Current sprite enum for rendering
    
    // Health and state
    float m_fHealth;              ///< Current health points
    float m_fMaxHealth;           ///< Maximum health points
    Vector2 m_vVelocity;          ///< Current velocity vector
    Vector2 m_vPatrolStart;       ///< Starting point of patrol route
    Vector2 m_vPatrolEnd;         ///< Ending point of patrol route
    
    // AI Behavior
    float m_fPatrolSpeed;         ///< Speed during patrol movement
    float m_fChaseSpeed;          ///< Speed when chasing player
    float m_fDetectionRange;      ///< Range to detect and chase player
    float m_fShootRange;          ///< Range to start shooting at player
    float m_fShootCooldown = 1.0f; ///< Seconds between shots
    
    float m_fShootTimer;          ///< Timer for shooting cooldown
    float m_fHitTimer;            ///< Timer for hit reaction duration
    
    // State Management
    enum class AIState {
        PATROL,                   ///< Patrolling between waypoints
        CHASE,                    ///< Chasing the player
        ATTACK,                   ///< Attacking the player
        HIT,                      ///< Taking damage reaction
        DEAD                      ///< Defeated state
    };
    AIState m_eAIState;           ///< Current AI behavior state
    
    bool m_bPatrolForward;        ///< True if moving toward patrol end
    bool m_bCanShoot;             ///< True if shooting cooldown is complete
    bool m_bFacingRight;          ///< True if facing right

    // Movement parameters
    float m_fMaxSpeed = 2.25f;
    float m_fSpeedInc = 0.5f;
    float m_fSpeedDec = 0.2f;

public:
    CIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd);
    virtual ~CIceBat();
    
    // Core behaviors
    virtual void update(float) override;
    virtual void move(float dt);
    virtual void draw() override;
    virtual void onCollision(CObject* obj) override;
    
    // Animation control
    void SetAnimState(AnimState state);
    // Speed control
    void SetPatrolSpeed(float s) { m_fPatrolSpeed = s; }
    void SetChaseSpeed(float s) { m_fChaseSpeed = s; }
    void SetDetectionRange(float r) { m_fDetectionRange = r; }
    void SetShootRange(float r) { m_fShootRange = r; }
    void SetShootCooldown(float c) { m_fShootCooldown = c; }
    
    // Ice Bat specific methods
    void updateAI();
    void updateAnimation(float dt);
    void shootProjectile();
    void takeDamage(float damage);
    
    // State queries
    bool isAlive() const;
    float getHealthPercent() const;
    AIState getAIState() const;

private:
    // Internal helpers
    void updatePatrolMovement();
    void updateChaseMovement();
    void updateAttackBehavior();
    void updateHitReaction();
    
    float getDistanceToPlayer() const;
    Vector2 getDirectionToPlayer() const;
    bool isPlayerInRange(float range) const;
};

#endif //__L4RC_GAME_ICEBAT_H__