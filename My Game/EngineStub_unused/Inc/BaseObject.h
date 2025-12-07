#ifndef ENGINE_STUB_BASE_OBJECT_H
#define ENGINE_STUB_BASE_OBJECT_H
#include "Defines.h"
class LBaseObject {
public:
    Vector2 m_vPos; bool m_bDead=false; LBaseObject(const Vector2& pos):m_vPos(pos){}
    virtual ~LBaseObject()=default;
};
#endif
