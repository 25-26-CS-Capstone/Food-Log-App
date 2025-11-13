#pragma once

#ifndef __L4RC_GAME_ATTACK_H__
#define __L4RC_GAME_ATTACK_H__

#include "Object.h"
#include "EventTimer.h"
#include "Player.h"

class Attack : public CObject {
private:
	float mLifetime = 0.3f;

public:
	Attack(eSprite t, const Vector2& p);
	virtual ~Attack();
	void onCollision(CObject*);
	void move();
	void update(float);
};



#endif //__L4RC_GAME_ATTACK_H__