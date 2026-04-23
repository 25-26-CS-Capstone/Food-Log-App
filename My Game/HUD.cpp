#include "HUD.h"

HUD::HUD(LSpriteRenderer* renderer, CPlayer* Player)
	: mRenderer(renderer), mPlayer(Player) {
	mHealthBarFill = eSprite::healthBar;
	mHealthBarBackground = eSprite::healthBarBackground;
}

void HUD::Render() {
	float ratio = mPlayer->getCurrentHealth() / 10.0f;
	
	float fullWidth = 1000.0f;
	float height = 20.0f;
	Vector2 pos(530.0f,screenHeight - 30.0f);

	Vector2 centeredPos = pos - Vector2((fullWidth * ((1.0f-ratio)/2)), 0.0f);

	LSpriteDesc2D fillDesc = {};
	fillDesc.m_nSpriteIndex = (UINT)mHealthBarFill;
	fillDesc.m_vPos = centeredPos;               // position on screen
	fillDesc.m_fXScale = ratio; // shrink horizontally with health
	fillDesc.m_fYScale = 1.0f;
	   // top-left corner anchor
	fillDesc.m_fRoll = 0.0f;              // no rotation
	fillDesc.m_fAlpha = 1.0f;              // full opacity

	ratio = mPlayer->getMaxHealth() / 10.0f;
	centeredPos = pos - Vector2((fullWidth * ((1.0f - ratio) / 2)), 0.0f);
	LSpriteDesc2D fillDesc2 = {};
	fillDesc2.m_nSpriteIndex = (UINT)mHealthBarBackground;
	fillDesc2.m_vPos = centeredPos;               // position on screen
	fillDesc2.m_fXScale = ratio; // shrink horizontally with health
	fillDesc2.m_fYScale = 1.0f;
	// top-left corner anchor
	fillDesc2.m_fRoll = 0.0f;              // no rotation
	fillDesc2.m_fAlpha = 1.0f;              // full opacity

	mRenderer->Draw(&fillDesc2);
	mRenderer->Draw(&fillDesc);
	renderGoldNums(goldOnesDigit, goldTensDigit, Vector2(100.0f, screenHeight - 100.0f));


	

}

void HUD::updateGoldDigits(int goldChange) {
	int temp = goldOnesDigit + goldChange;
	if (temp < 10) {
		goldOnesDigit += goldChange;
	}
	else {
		goldTensDigit = temp / 10;
		goldOnesDigit = temp - (10*(temp/10));
	}
}

void HUD::renderGoldNums(int onesValue, int tensValue, Vector2 pos) {
	if (tensValue > 0) {
		LSpriteDesc2D tensDigit = {};

		tensDigit.m_nSpriteIndex = (UINT)eSprite::digit0 + (UINT)tensValue;
		tensDigit.m_vPos = pos;
		tensDigit.m_fXScale = 1.0f; // shrink horizontally with health
		tensDigit.m_fYScale = 1.0f;
		tensDigit.m_fRoll = 0.0f;              // no rotation
		tensDigit.m_fAlpha = 1.0f;
		mRenderer->Draw(&tensDigit);
	}


	LSpriteDesc2D onesDigit = {};
	onesDigit.m_nSpriteIndex = (UINT)eSprite::digit0 + (UINT)onesValue;
	onesDigit.m_vPos = pos + Vector2(30.0f, 0.0f);
	onesDigit.m_fXScale = 1.0f; // shrink horizontally with health
	onesDigit.m_fYScale = 1.0f;
	onesDigit.m_fRoll = 0.0f;              // no rotation
	onesDigit.m_fAlpha = 1.0f;
	mRenderer->Draw(&onesDigit);
}