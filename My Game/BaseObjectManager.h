#pragma once
#include <list>
#include "Defines.h"

// Simple base object manager used by CObjectManager.
template<typename T>
class LBaseObjectManager {
public:
    std::list<T*> m_stdObjectList;

    virtual ~LBaseObjectManager() { clear(); }

    void move() {
        for (auto* p : m_stdObjectList) if (p) p->move();
    }

    void draw() {
        for (auto* p : m_stdObjectList) if (p) p->draw();
    }

    void clear() {
        for (auto* p : m_stdObjectList) delete p;
        m_stdObjectList.clear();
    }
};
