#pragma once
#include "Defines.h"
#include "GameDefines.h"
#include "SpriteDesc.h"
#include "SpriteResource.h"
#include "Window.h"
#include <string>
#include <memory>
#include <windows.h>

// Forward declare window accessor
extern Window* GetWindow();

// Sprite renderer that loads and manages PNG sprites and renders to GDI
class LSpriteRenderer {
private:
    std::unique_ptr<LSpriteResourceManager> m_resourceMgr;
    eSpriteMode m_mode;
    HDC m_hDC = nullptr;

public:
    explicit LSpriteRenderer(eSpriteMode mode = eSpriteMode::Scaled2x) 
        : m_mode(mode), m_resourceMgr(std::make_unique<LSpriteResourceManager>()) {}

    void Initialize(eSprite) {
        Window* pWin = GetWindow();
        if (pWin) m_hDC = pWin->GetBackDC();
    }
    
    void BeginResourceUpload() {}
    
    void Load(eSprite spriteId, const char* filename) {
        if (m_resourceMgr && filename) {
            m_resourceMgr->LoadSprite(spriteId, filename);
        }
    }
    
    void EndResourceUpload() {}

    void BeginFrame() {
        if (m_hDC) {
            // Clear to black
            RECT rc = { 0, 0, 1024, 768 };
            FillRect(m_hDC, &rc, (HBRUSH)GetStockObject(BLACK_BRUSH));
        }
    }
    
    void EndFrame() {
        // Frame is complete, will be blitted by window's WM_PAINT
    }

    void Draw(eSprite spriteId, const Vector2& pos) {
        if (m_resourceMgr && m_hDC) {
            const SpriteResource* resource = m_resourceMgr->GetSprite(spriteId);
            if (resource && resource->pixels) {
                // Draw a colored rectangle as placeholder for sprite
                RECT rc = { 
                    (LONG)pos.x, 
                    (LONG)pos.y,
                    (LONG)(pos.x + resource->width),
                    (LONG)(pos.y + resource->height)
                };
                
                // Use different colors for different sprites for visibility
                COLORREF color = RGB(
                    resource->pixels[0],
                    resource->pixels[1],
                    resource->pixels[2]
                );
                
                HBRUSH brush = CreateSolidBrush(color);
                FillRect(m_hDC, &rc, brush);
                DeleteObject(brush);
            }
        }
    }
    
    void Draw(LSpriteDesc2D* pSprite) {
        if (pSprite && m_resourceMgr && m_hDC) {
            // Draw sprite descriptor with loaded texture
            Vector2 pos = pSprite->GetPos();
            Draw((eSprite)0, pos);
        }
    }
    
    void DrawScreenText(const char* text, const Vector2& pos) {
        if (m_hDC && text) {
            SetBkMode(m_hDC, TRANSPARENT);
            SetTextColor(m_hDC, RGB(255, 255, 255));
            TextOutA(m_hDC, (int)pos.x, (int)pos.y, text, (int)strlen(text));
        }
    }

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
