#ifndef ENGINE_STUB_BASE_OBJECT_MANAGER_H
#define ENGINE_STUB_BASE_OBJECT_MANAGER_H
#include <list>
#include "Defines.h"
template<class T> class LBaseObjectManager {
protected:
    std::list<T*> m_stdObjectList;
public:
    virtual ~LBaseObjectManager(){ clear(); }
    void draw(){ for(auto* o : m_stdObjectList) o->draw(); }
    void move(){ for(auto* o : m_stdObjectList) o->move(); }
    void clear(){ for(auto* o : m_stdObjectList) delete o; m_stdObjectList.clear(); }
};
#endif
