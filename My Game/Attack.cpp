#include "Attack.h"

Attack::Attack(eSprite t, const Vector2& p):CObject(t,p) {
	width = 150.0f;
	height = 100.0f;
	type = 'a';
	m_pPlayer->setAttackCooldown(m_pPlayer->getAttackCooldownValue());
}

Attack::~Attack() {

}

void Attack::onCollision(CObject* x) {
	
	
}

void Attack::move() {


}

void Attack::update(float deltaTime) {
	mLifetime -= deltaTime;
	if (mLifetime <= 0.0f) {
		m_bDead = true;
	}
}