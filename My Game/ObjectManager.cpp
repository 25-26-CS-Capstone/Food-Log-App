#include "ObjectManager.h"
#include "Player.h"

CObject* CObjectManager::create(eSprite t, const Vector2& pos) {
	CObject* pObj = nullptr;

    switch (t) {
    case eSprite::PIGSPRITE: pObj = new CPlayer(pos); break;
    default: pObj = new CObject(t, pos);
    }

    m_stdObjectList.push_back(pObj);
    return pObj;
}