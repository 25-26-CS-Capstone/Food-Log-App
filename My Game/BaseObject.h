#pragma once
#include "Defines.h"
#include "SpriteDesc.h"

// Minimal base object matching the interfaces used by game code.
class LBaseObject : public LSpriteDesc2D {
public:
    Vector2 m_vPos{ 0.0f, 0.0f };
    XMFLOAT4 m_f4Tint{ 1.0f, 1.0f, 1.0f, 1.0f };
    bool m_bDead = false;

    LBaseObject() = default;
    explicit LBaseObject(const Vector2& pos) : m_vPos(pos) {}
    virtual ~LBaseObject() = default;
};
