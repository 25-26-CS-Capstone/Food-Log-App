#ifndef ENGINE_STUB_KEYBOARD_H
#define ENGINE_STUB_KEYBOARD_H
#include <windows.h>
#include <cstring>
class LKeyboard {
    bool m_prev[256]{};
    bool m_curr[256]{};
public:
    void GetState(){
        for(int i=0;i<256;++i){ m_prev[i]=m_curr[i]; m_curr[i] = (GetAsyncKeyState(i)&0x8000)!=0; }
    }
    bool TriggerDown(int vk) const { return m_curr[vk] && !m_prev[vk]; }
    bool TriggerUp(int vk) const { return !m_curr[vk] && m_prev[vk]; }
};
#endif
