#pragma once
#include "SpriteRenderer.h"
#include "Sprite.h"
#include "GameDefines.h"

class HUD {
public:
	HUD(LSpriteRenderer* renderer);
	void Render();
private:
	LSpriteRenderer* mRenderer;
	eSprite mHealthBarFill;
};