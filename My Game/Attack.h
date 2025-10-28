#pragma once

#ifndef __L4RC_GAME_ATTACK_H__
#define __L4RC_GAME_ATTACK_H__

#include "Object.h"
#include "EventTimer.h"


class Attack : public CObject {
private:
	float mLifetime = 0.2f;
	CObject* mOwner = nullptr;

public:
	Attack(eSprite t, const Vector2& p, CObject* owner);
	void onCollision(CObject*);
		
};



#endif //__L4RC_GAME_ATTACK_H__