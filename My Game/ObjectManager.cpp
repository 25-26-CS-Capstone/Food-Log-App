/// \file ObjectManager.cpp
/// \brief Code for the the object manager class CObjectManager.

#include "ObjectManager.h"
#include "ComponentIncludes.h"
#include "Player.h"
#include "Enemy.h"
#include "Attack.h"
#include "Item.h"
#include "IceBat.h"
#include "IceBear.h"
#include "Projectile.h"

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
    case eSprite::explosion:
        pObj = new explosion(eSprite::explosion, pos);
        break;
    default: pObj = new CObject(t, pos);
    } //switch


    m_stdObjectList.push_back(pObj); //push pointer onto object list
    return pObj; //return pointer to created object
} //create

CObject* CObjectManager::create(eSprite t, const Vector2& pos, bool shop, int price) {
    CObject* pObj = nullptr;

    switch (t) {
    case eSprite::healthPickup:
        pObj = new healthPickup(eSprite::healthPickup, pos, shop, price);
        break;
    case eSprite::maxHealthPickup:
        pObj = new maxHealthPickup(eSprite::maxHealthPickup, pos, shop, price);
        break;
    case eSprite::gold:
        pObj = new gold(eSprite::gold, pos, shop, price);
        break;
    case eSprite::attackUp:
        pObj = new attackUp(eSprite::attackUp, pos, shop, price);
        break;
    case eSprite::attackSpeedUp:
        pObj = new attackSpeedUp(eSprite::attackSpeedUp, pos, shop, price);
        break;
    case eSprite::thornRoll:
        pObj = new thornRoll(eSprite::thornRoll, pos, shop, price);
        break;
    case eSprite::lifeDrop:
        pObj = new lifeDrop(eSprite::lifeDrop, pos, shop, price);
        break;
    case eSprite::goldDrop:
        pObj = new goldDrop(eSprite::goldDrop, pos, shop, price);
        break;
    case eSprite::backAttack:
        pObj = new backAttack(eSprite::backAttack, pos, shop, price);
        break;
    case eSprite::deathExplosion:
        pObj = new deathExplosion(eSprite::deathExplosion, pos, shop, price);
        break;
    case eSprite::damageShield:
        pObj = new damageShield(eSprite::damageShield, pos, shop, price);
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

/// Spawn an ice bat enemy with patrol behavior.
/// \param pos Starting position.
/// \param patrolStart First patrol point.
/// \param patrolEnd Second patrol point.
/// \return Pointer to created bat.
CIceBat* CObjectManager::spawnIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd) {
    CIceBat* bat = new CIceBat(pos, patrolStart, patrolEnd);
    m_stdObjectList.push_back(bat);
    return bat;
}

/// Spawn an ice bear enemy.
/// \param pos Starting position.
/// \return Pointer to created bear.
CIceBear* CObjectManager::spawnIceBear(const Vector2& pos) {
    CIceBear* bear = new CIceBear(pos);
    m_stdObjectList.push_back(bear);
    return bear;
}

/// Spawn a projectile.
/// \param sprite Sprite type for projectile.
/// \param pos Starting position.
/// \param velocity Velocity vector.
/// \param ownerType 'p' for player, 'e' for enemy.
/// \return Pointer to created projectile.
CProjectile* CObjectManager::spawnProjectile(eSprite sprite, const Vector2& pos, const Vector2& velocity, char ownerType) {
    CProjectile* proj = new CProjectile(sprite, pos, velocity, ownerType);
    if (m_pPlayer) {
        proj->SetPlayer(m_pPlayer);  // Set player for tracking
    }
    m_stdObjectList.push_back(proj);
    return proj;
}

/// Count the number of enemies in the level.
/// \return Number of enemies (objects with collision type 'e').
int CObjectManager::countEnemies() const {
    int count = 0;
    for (const CObject* obj : m_stdObjectList) {
        if (obj && obj->GetCollisionType() == 'e') {
            count++;
        }
    }
    return count;
}

/// Clear all enemies and their projectiles from the level.
void CObjectManager::clearEnemies() {
    auto it = m_stdObjectList.begin();
    while (it != m_stdObjectList.end()) {
        CObject* obj = *it;
        if (obj->GetCollisionType() == 'e') {
            // Enemy object
            delete obj;
            it = m_stdObjectList.erase(it);
        } else {
            // Check if it's an enemy projectile
            CProjectile* proj = dynamic_cast<CProjectile*>(obj);
            if (proj && proj->GetOwnerType() == 'e') {
                delete obj;
                it = m_stdObjectList.erase(it);
            } else {
                ++it;
            }
        }
    }
}