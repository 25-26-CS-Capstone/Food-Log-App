#pragma once
#include "SpriteRenderer.h"
#include "Sprite.h"
#include "GameDefines.h"
#include "Player.h"

class HUD {
public:
	HUD(LSpriteRenderer* renderer, CPlayer* player);
	void Render();
	void updateGoldDigits(int);
protected:
	LSpriteRenderer* mRenderer;
	CPlayer* mPlayer;
	eSprite mHealthBarFill;
	eSprite mHealthBarBackground;
	int goldOnesDigit = 0;
	int goldTensDigit = 0;
};