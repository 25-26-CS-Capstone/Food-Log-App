/// \file ObjectManager.cpp
/// \brief Code for the the object manager class CObjectManager.

#include "ObjectManager.h"
#include "ComponentIncludes.h"
#include "Player.h"
#include "Enemy.h"
#include "Attack.h"
#include "Item.h"

/// Create an object and put a pointer to it at the back of the object list
/// `m_stdObjectList`, which it inherits from `LBaseObjectManager`.
/// \param t Sprite type.
/// \param pos Initial position.
/// \return Pointer to the object created.

CObject* CObjectManager::create(eSprite t, const Vector2& pos) {
    CObject* pObj = nullptr;

    switch (t) {
    case eSprite::InuitIdleLeft:
        pObj = new CPlayer(eSprite::InuitIdleLeft, pos);
        break;

    case eSprite::InuitIdleRight:
        pObj = new CPlayer(eSprite::InuitIdleRight, pos);
        break;

    case eSprite::InuitIdleUp:
        pObj = new CPlayer(eSprite::InuitIdleUp, pos);
        break;

    case eSprite::InuitIdleDown:
        pObj = new CPlayer(eSprite::InuitIdleDown, pos);
        break;

    case eSprite::InuitRunLeft:
        pObj = new CPlayer(eSprite::InuitRunLeft, pos);
        break;

    case eSprite::InuitRunRight:
        pObj = new CPlayer(eSprite::InuitRunRight, pos);
        break;

    case eSprite::InuitRunUp:
        pObj = new CPlayer(eSprite::InuitRunUp, pos);
        break;

    case eSprite::InuitRunDown:
        pObj = new CPlayer(eSprite::InuitRunDown, pos);
        break;
    case eSprite::InuitRoll:
        pObj = new CPlayer(eSprite::InuitRoll, pos);
        break;
    case eSprite::testEnemy:
        pObj = new CEnemy(eSprite::testEnemy, pos);
        break;
    case eSprite::PlayerAttack:
        pObj = new Attack(eSprite::PlayerAttack, pos);
        break;
    case eSprite::item:
        pObj = new gold(eSprite::item, pos);
        break;
    default: pObj = new CObject(t, pos);
    } //switch


    m_stdObjectList.push_back(pObj); //push pointer onto object list
    return pObj; //return pointer to created object
} //create

void CObjectManager::update(float deltaTime) {
    for (auto itA = m_stdObjectList.begin(); itA != m_stdObjectList.end(); ++itA) {
        auto itB = itA;
        ++itB;
        CObject* a = *itA;
        Vector2 tempA = a->m_vPos;

        if (a->m_bDead == true) {
            delete a;
            itA = m_stdObjectList.erase(itA);
            continue;
        }
        a->update(deltaTime);
        for (; itB != m_stdObjectList.end(); ++itB) {
            CObject* b = *itB;
            Vector2 tempB = b->m_vPos;
            float ax = tempA.x;
            float ay = tempA.y;
            float ah = a->height;
            float aw = a->width;
            float bx = tempB.x;
            float by = tempB.y;
            float bh = b->height;
            float bw = b->width;
            
            
            bool overlap = !(ax + aw < bx || bx + bw < ax ||
                ay + ah < by || by + bh < ay);

            if (overlap)
            {
                a->onCollision(b);
                b->onCollision(a);
            }
            //test a bounds vs b bounds
        }
    }
}