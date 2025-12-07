/// \file ObjectManager.cpp
/// \brief Code for the the object manager class CObjectManager.

#include "ObjectManager.h"
#include "Component.h"
#include "Player.h"
#include "Enemy.h"
#include "IceBat.h"
#include "Attack.h"
#include "Item.h"
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
    case eSprite::healthPickup:
        pObj = new healthPickup(eSprite::healthPickup, pos, false, 0);
        break;
    case eSprite::maxHealthPickup:
        pObj = new maxHealthPickup(eSprite::maxHealthPickup, pos, false, 0);
        break;
    case eSprite::gold:
        pObj = new gold(eSprite::gold, pos, false, 0);
        break;
    case eSprite::explosion:
        pObj = new explosion(eSprite::explosion, pos);
        break;
    case eSprite::attackUp:
        pObj = new attackUp(eSprite::attackUp, pos, false, 0);
        break;
    case eSprite::attackSpeedUp:
        pObj = new attackSpeedUp(eSprite::attackSpeedUp, pos, false, 0);
        break;
    case eSprite::thornRoll:
        pObj = new thornRoll(eSprite::thornRoll, pos, false, 0);
        break;
    case eSprite::lifeDrop:
        pObj = new lifeDrop(eSprite::lifeDrop, pos, false, 0);
        break;
    case eSprite::goldDrop:
        pObj = new goldDrop(eSprite::goldDrop, pos, false, 0);
        break;
    case eSprite::backAttack:
        pObj = new backAttack(eSprite::backAttack, pos, false, 0);
        break;
    case eSprite::deathExplosion:
        pObj = new deathExplosion(eSprite::deathExplosion, pos, false, 0);
        break;
    case eSprite::damageShield:
        pObj = new damageShield(eSprite::damageShield, pos, false, 0);
        break;
    default: pObj = new CObject(t, pos);
    } //switch


    m_stdObjectList.push_back(pObj); //push pointer onto object list
    return pObj; //return pointer to created object
} //create

/// Spawn a projectile and add it to the managed object list.
/// \param sprite Projectile sprite type.
/// \param pos Initial position.
/// \param vel Initial velocity.
/// \param ownerType 'p' for player or 'e' for enemy.
/// \return Pointer to the created projectile.
CProjectile* CObjectManager::spawnProjectile(eSprite sprite, const Vector2& pos, const Vector2& vel, char ownerType) {
    CProjectile* proj = new CProjectile(sprite, pos, vel, ownerType);
    m_stdObjectList.push_back(proj);
    return proj;
}

/// Spawn an IceBat enemy with a patrol route and add to the object list.
/// \param pos Initial position (used as starting reference).
/// \param patrolStart First patrol waypoint.
/// \param patrolEnd Second patrol waypoint.
/// \return Pointer to the created IceBat as a CObject.
CIceBat* CObjectManager::spawnIceBat(const Vector2& pos, const Vector2& patrolStart, const Vector2& patrolEnd) {
    CIceBat* bat = new CIceBat(pos, patrolStart, patrolEnd);
    m_stdObjectList.push_back(bat);
    return bat;
}

/// Clear all enemies (and their projectiles) from the scene.
/// Used when changing rooms to prevent enemies from carrying over.
void CObjectManager::clearEnemies() {
    auto it = m_stdObjectList.begin();
    while (it != m_stdObjectList.end()) {
        CObject* obj = *it;
        // Check if object is an enemy or enemy projectile
        if (obj->GetCollisionType() == 'e' || 
            (dynamic_cast<CProjectile*>(obj) && dynamic_cast<CProjectile*>(obj)->GetOwnerType() == 'e')) {
            delete obj;
            it = m_stdObjectList.erase(it);
        }
        else {
            ++it;
        }
    }
}

/// Count the number of enemies currently alive in the scene.
/// \return Number of enemies with type 'e'.
int CObjectManager::countEnemies() const {
    int count = 0;
    for (const CObject* obj : m_stdObjectList) {
        if (obj && obj->GetCollisionType() == 'e') {
            count++;
        }
    }
    return count;
}

void CObjectManager::update(float deltaTime) {
    auto itA = m_stdObjectList.begin();
    while (itA != m_stdObjectList.end()) {
        CObject* a = *itA;
        Vector2 tempA = a->m_vPos;

        // Remove dead objects safely
        if (a->m_bDead) {
            delete a;
            itA = m_stdObjectList.erase(itA);
            continue;
        }

        // Basic cleanup for projectiles: remove if out of bounds
        if (auto proj = dynamic_cast<CProjectile*>(a)) {
            if (proj->IsOutOfBounds()) {
                a->m_bDead = true;
                delete a;
                itA = m_stdObjectList.erase(itA);
                continue;
            }
        }

        a->update(deltaTime);

        // Collision checks against subsequent objects
        auto itB = std::next(itA);
        while (itB != m_stdObjectList.end()) {
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

            if (overlap) {
                a->onCollision(b);
                b->onCollision(a);
            }

            ++itB;
        }

        ++itA;
    }
}