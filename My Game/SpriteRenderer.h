#pragma once
#include "Defines.h"
#include "GameDefines.h"
#include "SpriteDesc.h"
#include <string>

// Minimal renderer stub to keep the game loop functional without the engine.
class LSpriteRenderer {
public:
    explicit LSpriteRenderer(eSpriteMode) {}

    void Initialize(eSprite) {}
    void BeginResourceUpload() {}
    void Load(eSprite, const char*) {}
    void EndResourceUpload() {}

    void BeginFrame() {}
    void EndFrame() {}

    void Draw(eSprite, const Vector2&) {}
    void Draw(LSpriteDesc2D*) {}
    void DrawScreenText(const char*, const Vector2&) {}

    float GetHeight(eSprite) const { return 64.0f; }
    Vector2 GetCameraPos() const { return Vector2::Zero; }
};
