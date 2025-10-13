#include "HUD.h"

HUD::HUD(LSpriteRenderer* renderer)
	: mRenderer(renderer) {
	mHealthBarFill = eSprite::healthBar;
}

void HUD::Render() {
	float ratio = 5.0 / 5.0;
	float fullWidth = 200.0f;
	float height = 20.0f;
	Vector2 pos(120.0f,screenHeight - 30.0f);

	mRenderer->Draw(mHealthBarFill, pos);

	
	
}