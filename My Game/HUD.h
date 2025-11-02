#pragma once
#include "SpriteRenderer.h"
#include "Sprite.h"
#include "GameDefines.h"
#include "Player.h"

class HUD {
public:
	HUD(LSpriteRenderer* renderer, CPlayer* player);
	void Render();
private:
	LSpriteRenderer* mRenderer;
	CPlayer* mPlayer;
	eSprite mHealthBarFill;
	eSprite mHealthBarBackground;
};