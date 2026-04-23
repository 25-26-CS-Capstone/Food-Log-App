#pragma once

#ifndef __L4RC_GAME_ATTACK_H__
#define __L4RC_GAME_ATTACK_H__

#include "Object.h"
#include "EventTimer.h"
#include "Player.h"

class Attack : public CObject {
private:
	float mLifetime = 0.3f;
	LEventTimer* m_pFrameEvent = nullptr; ///< Frame event timer.
	LSpriteDesc2D currentSprite;

public:
	Attack(eSprite t, const Vector2& p);
	virtual ~Attack();
	void onCollision(CObject*);
	void move();
	void update(float);
	void draw();
	void UpdateFramenumber();
};

class explosion : public Attack {
public:
	explosion(eSprite t, const Vector2& p) : Attack(t, p) {
		width = 400.0f;
		height = 400.0f;
	}
};



#endif //__L4RC_GAME_ATTACK_H__