#include "Enemy.h"
#include "ComponentIncludes.h"
#include "ObjectManager.h"

CEnemy::CEnemy(eSprite t, const Vector2& p) : CObject(t, p) {
	if (t == eSprite::testEnemy) {
		width = 100.0f;
		height = 100.0f;
		type = 'e';
	}
	else {
		width = 300.0f;
		height = 300.0f;
		type = 'e';
	}
} //constructor

CEnemy::~CEnemy() {

}

void CEnemy::move() {

}

void CEnemy::update(float deltaTime) {
	if (currentHealth <= 0) {
		m_pPlayer->GetCurrentNode()->changeEnemyCount(-1);
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
	if (moveCount == 20) {
		moveCount = 0;
		default_random_engine rng(chrono::system_clock::now().time_since_epoch().count());
		mt19937 generator(rng);
		uniform_int_distribution<> distribution(1, 4);
	    moveDir = distribution(generator);
	}
	if (moveDir == 1 && m_vPos.y < screenHeight) {
		m_vPos += Vector2(0.0f, 1.0f);
	}
	else if (moveDir == 2 && m_vPos.x < screenWidth) {
		m_vPos += Vector2(1.0f, 0.0f);
	}
	else if (moveDir == 3 && m_vPos.y < 0.0f) {
		m_vPos += Vector2(0.0f, -1.0f);
	}
	else if (moveDir == 4) {
		m_vPos += Vector2(-1.0f, 0.0f && m_vPos.x < 0.0f);
	}
	moveCount++;
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