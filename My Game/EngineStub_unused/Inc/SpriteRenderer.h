#ifndef ENGINE_STUB_SPRITE_RENDERER_H
#define ENGINE_STUB_SPRITE_RENDERER_H
#include "Sprite.h"
#include <unordered_map>
#include <string>
#include <windows.h>
enum class eSpriteMode { Batched2D };
class LSpriteRenderer {
    std::unordered_map<int,std::string> m_resources; 
    HWND m_hWnd = nullptr; 
    bool m_inFrame = false; 
    int m_height = 64; 
public:
    LSpriteRenderer(eSpriteMode){}
    void Initialize(eSprite){}
    void BeginResourceUpload(){}
    void Load(eSprite s, const char* tag){ m_resources[(int)s]=tag; }
    void EndResourceUpload(){}
    void BeginFrame(){ m_inFrame=true; }
    void Draw(eSprite, const Vector2&){}
    void Draw(eSprite, const Vector2&, float /*angle*/ ){}
    void Draw(LSpriteDesc2D*){}
    void DrawScreenText(const char*, const Vector2&){}
    void EndFrame(){ m_inFrame=false; }
    float GetHeight(eSprite) const { return (float)m_height; }
    Vector2 GetCameraPos() const { return Vector2(0,0); }
};
#endif
