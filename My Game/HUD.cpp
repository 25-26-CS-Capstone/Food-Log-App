#include "HUD.h"

HUD::HUD(LSpriteRenderer* renderer, CPlayer* Player)
	: mRenderer(renderer), mPlayer(Player) {
	mHealthBarFill = eSprite::healthBar;
	mHealthBarBackground = eSprite::healthBarBackground;
}

void HUD::Render() {
	float ratio = mPlayer->getCurrentHealth() / mPlayer->getMaxHealth();
	
	float fullWidth = 200.0f;
	float height = 20.0f;
	Vector2 pos(120.0f,screenHeight - 30.0f);

	Vector2 centeredPos = pos - Vector2((fullWidth * ((1.0-ratio)/2)), 0.0f);

	LSpriteDesc2D fillDesc = {};
	fillDesc.m_nSpriteIndex = (UINT)mHealthBarFill;
	fillDesc.m_vPos = centeredPos;               // position on screen
	fillDesc.m_fXScale = ratio; // shrink horizontally with health
	fillDesc.m_fYScale = 1.0f;
	   // top-left corner anchor
	fillDesc.m_fRoll = 0.0f;              // no rotation
	fillDesc.m_fAlpha = 1.0f;              // full opacity

	mRenderer->Draw(mHealthBarBackground, pos);
	mRenderer->Draw(&fillDesc);
	
	
	
}