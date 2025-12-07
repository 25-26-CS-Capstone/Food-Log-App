/// \file EnemyBase.h
/// \brief Shared enemy base class providing engagement tri-state utilities.

#pragma once

#ifndef __L4RC_GAME_ENEMYBASE_H__
#define __L4RC_GAME_ENEMYBASE_H__

#include "Object.h"
#include "Player.h"

class CEnemyBase : public CObject {
public:
    enum class EngagementState { INACTIVE, ACTIVE, HIT };

protected:
    EngagementState m_eEngagement = EngagementState::INACTIVE;
    float m_fEngageRange = 600.0f;   // default detection distance for ACTIVE
    float m_fEngageBuffer = 50.0f;   // hysteresis buffer to avoid toggling

public:
    CEnemyBase(eSprite t, const Vector2& p) : CObject(t, p) { type = 'e'; }
    virtual ~CEnemyBase() = default;

    // Utility: distance to player
    float DistanceToPlayer() const {
        if (!m_pPlayer) return 9999.0f;
        Vector2 diff = m_pPlayer->m_vPos - m_vPos;
        return diff.Length();
    }

    // Update engagement based on distance and current state (HIT wins)
    void UpdateEngagement(bool forceHit = false) {
        if (forceHit) { m_eEngagement = EngagementState::HIT; return; }
        const float dist = DistanceToPlayer();
        if (m_eEngagement == EngagementState::INACTIVE) {
            if (dist <= m_fEngageRange) m_eEngagement = EngagementState::ACTIVE;
        } else { // ACTIVE or HIT previously
            if (dist > m_fEngageRange + m_fEngageBuffer) m_eEngagement = EngagementState::INACTIVE;
            else if (m_eEngagement != EngagementState::HIT) m_eEngagement = EngagementState::ACTIVE;
        }
    }

    // Set detection range and buffer
    void SetEngagementRanges(float range, float buffer) { m_fEngageRange = range; m_fEngageBuffer = buffer; }

    // Convenience query helpers
    bool IsEngaged() const { return m_eEngagement == EngagementState::ACTIVE || m_eEngagement == EngagementState::HIT; }
    bool IsInactive() const { return m_eEngagement == EngagementState::INACTIVE; }
    bool IsHitEngagement() const { return m_eEngagement == EngagementState::HIT; }

    // Visual feedback per engagement state (tint/alpha)
    void ApplyEngagementTint() {
        switch (m_eEngagement) {
            case EngagementState::INACTIVE:
                m_f4Tint = XMFLOAT4(0.85f, 0.90f, 1.0f, 0.95f); // subtle cool tint
                break;
            case EngagementState::ACTIVE:
                m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f); // normal
                break;
            case EngagementState::HIT:
                m_f4Tint = XMFLOAT4(1.2f, 0.3f, 0.3f, 1.0f); // bright red flash
                break;
        }
    }
};

#endif // __L4RC_GAME_ENEMYBASE_H__
