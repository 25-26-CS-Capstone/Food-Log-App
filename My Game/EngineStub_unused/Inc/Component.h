#ifndef ENGINE_STUB_COMPONENT_H
#define ENGINE_STUB_COMPONENT_H
#include "Audio.h"
#include "Keyboard.h"
#include "Timer.h"
#include "Sprite.h"
class LSpriteRenderer; //fwd
class LComponent {
protected:
    LSpriteRenderer* m_pRenderer = nullptr;
    LAudio* m_pAudio = new LAudio();
    LKeyboard* m_pKeyboard = new LKeyboard();
    LTimer* m_pTimer = new LTimer();
public:
    virtual ~LComponent(){ delete m_pRenderer; delete m_pAudio; delete m_pKeyboard; delete m_pTimer; }
};
#endif
