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

	 float xOffset = (fullWidth * ((1.0f - ratio) / 2));
	 Vector2 centeredPos(pos.x - xOffset, pos.y);

	 // Draw simple bar sprites at positions (no scaling in stub renderer)
	 mRenderer->Draw(mHealthBarBackground, centeredPos);
	 mRenderer->Draw(mHealthBarFill, centeredPos);

	ratio = mPlayer->getMaxHealth() / 10.0f;
	xOffset = (fullWidth * ((1.0f - ratio) / 2));
	centeredPos = Vector2(pos.x - xOffset, pos.y);
	mRenderer->Draw(mHealthBarBackground, centeredPos);
	mRenderer->Draw(mHealthBarFill, centeredPos);
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
		mRenderer->Draw(static_cast<eSprite>((UINT)eSprite::digit0 + (UINT)tensValue), pos);
	}
	Vector2 onesPos = pos + Vector2(30.0f, 0.0f);
	mRenderer->Draw(static_cast<eSprite>((UINT)eSprite::digit0 + (UINT)onesValue), onesPos);
}