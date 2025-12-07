#ifndef ENGINE_STUB_SETTINGS_H
#define ENGINE_STUB_SETTINGS_H
#include "Defines.h"
class LSettings {
public:
    int m_nWinWidth = 1280;
    int m_nWinHeight = 720;
    Vector2 m_vWinCenter = Vector2((float)m_nWinWidth/2.0f,(float)m_nWinHeight/2.0f);
};
#endif
