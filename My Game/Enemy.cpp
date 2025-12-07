#include "Enemy.h"
#include "Component.h"
#include "ObjectManager.h"

CEnemy::CEnemy(eSprite t, const Vector2& p) : CObject(t, p) {
	width = 200.0f;
	height = 200.0f;
	type = 'e';
} //constructor

CEnemy::~CEnemy() {

}

void CEnemy::move() {

}

void CEnemy::update(float deltaTime) {
	if (currentHealth <= 0) {
		m_bDead = true;
		if (m_pPlayer->getLifeDrop() == true) {
			m_pObjectManager->create(eSprite::healthPickup, this->m_vPos);
		}
		if (m_pPlayer->getGoldDrop() == true) {
			m_pObjectManager->create(eSprite::gold, this->m_vPos);
		}
		if (m_pPlayer->getDeathExplosion() == true) {
			m_pObjectManager->create(eSprite::explosion, this->m_vPos);
		}
	}
	if (damaged = true) {
		invulnTime -= deltaTime;
		if (invulnTime <= 0) {
			damaged = false;
			invulnTime = 0.3f;
		}
	}
}


void CEnemy::onCollision(CObject* obj) {
	if (obj->type == 'p') {
		if (m_pPlayer->getRollAttack() == true && m_pPlayer->getPlayerState() == 1) {
			if (damaged == false) {
				currentHealth -= 1;
				damaged = true;
			}
		}
	}

	if (obj->type == 'a') {
		if (damaged == false) {
			currentHealth -= 1 * m_pPlayer->getAttackDamage();
			damaged = true;
		}
	}
}