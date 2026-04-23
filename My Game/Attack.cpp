#include "Attack.h"


Attack::Attack(eSprite t, const Vector2& p):CObject(t,p) {
	m_pFrameEvent = new LEventTimer(0.12f);
	currentSprite.m_nSpriteIndex = (UINT)eSprite::PlayerAttack;
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

	UpdateFramenumber();
}

void Attack::update(float deltaTime) {
	mLifetime -= deltaTime;
	if (mLifetime <= 0.0f) {
		m_bDead = true;
	}
}

void Attack::UpdateFramenumber() {
	const UINT n = (UINT)m_pRenderer->GetNumFrames(currentSprite.m_nSpriteIndex); //number of frames

	if (n > 1 && m_pFrameEvent && m_pFrameEvent->Triggered())
		m_nCurrentFrame = (m_nCurrentFrame + 1) % n;
} //UpdateFramenumber

void Attack::draw() {
	currentSprite.m_vPos = m_vPos;
	currentSprite.m_nCurrentFrame = m_nCurrentFrame;
	m_pRenderer->Draw(&currentSprite);
}