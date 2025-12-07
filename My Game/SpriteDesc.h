#pragma once
#include "Defines.h"

// Minimal sprite description compatible with renderer stubs.
struct LSpriteDesc2D {
    int m_nSpriteIndex = 0;
    int m_nCurrentFrame = 0;
    Vector2 m_vPos{ 0.0f, 0.0f };
};
