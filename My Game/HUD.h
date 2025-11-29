#pragma once
#include "SpriteRenderer.h"
#include "Sprite.h"
#include "GameDefines.h"
#include "Player.h"

//Class used to render HUD on screen
class HUD {
public:
	HUD(LSpriteRenderer* renderer, CPlayer* player);
	void Render();
	void updateGoldDigits(int); //Updates gold count within HUD to stay same as player gold count
	void renderGoldNums(int, int, Vector2); //Renders the gold count
protected:
	LSpriteRenderer* mRenderer;
	CPlayer* mPlayer;
	eSprite mHealthBarFill; //sprite for "fill" of health bar, shows current health
	eSprite mHealthBarBackground; //sprite for "background" of health bar, shows max health
	int goldOnesDigit = 0; //used to render gold count
	int goldTensDigit = 0; //used to render gold count
};