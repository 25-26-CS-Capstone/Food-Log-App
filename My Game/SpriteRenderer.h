#pragma once
#include "Defines.h"
#include "GameDefines.h"
#include "SpriteDesc.h"
#include "SpriteResource.h"
#include <string>
#include <memory>

// Sprite renderer that loads and manages PNG sprites from disk
class LSpriteRenderer {
private:
    std::unique_ptr<LSpriteResourceManager> m_resourceMgr;
    eSpriteMode m_mode;

public:
    explicit LSpriteRenderer(eSpriteMode mode = eSpriteMode::Scaled2x) 
        : m_mode(mode), m_resourceMgr(std::make_unique<LSpriteResourceManager>()) {}

    void Initialize(eSprite) {}
    
    void BeginResourceUpload() {}
    
    void Load(eSprite spriteId, const char* filename) {
        if (m_resourceMgr && filename) {
            m_resourceMgr->LoadSprite(spriteId, filename);
        }
    }
    
    void EndResourceUpload() {}

    void BeginFrame() {}
    void EndFrame() {}

    void Draw(eSprite spriteId, const Vector2& pos) {
        if (m_resourceMgr) {
            const SpriteResource* resource = m_resourceMgr->GetSprite(spriteId);
            if (resource && resource->pixels) {
                // Placeholder: just validate resource exists
                // Real implementation would render to backbuffer
            }
        }
    }
    
    void Draw(LSpriteDesc2D* pSprite) {
        if (pSprite && m_resourceMgr) {
            const SpriteResource* resource = m_resourceMgr->GetSprite((eSprite)0);
            // Render sprite descriptor with loaded texture
        }
    }
    
    void DrawScreenText(const char*, const Vector2&) {}

    float GetHeight(eSprite spriteId) const { 
        if (m_resourceMgr) {
            const SpriteResource* resource = m_resourceMgr->GetSprite(spriteId);
            if (resource) return (float)resource->height;
        }
        return 64.0f; 
    }
    
    Vector2 GetCameraPos() const { return Vector2::Zero; }
    
    LSpriteResourceManager* GetResourceManager() { return m_resourceMgr.get(); }
};
