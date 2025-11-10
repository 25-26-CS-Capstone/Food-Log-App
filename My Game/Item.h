#pragma once

#ifndef __L4RC_GAME_ITEM_H__
#define __L4RC_GAME_ITEM_H__

#include "Object.h"
#include "Player.h"

class Item : public CObject {
protected:
	bool pickedUp = false;
public:
	Item(eSprite t, const Vector2& p);
	void onCollision(CObject*);
	void move();
	void update(float);
	virtual void pickup();

};
#endif


class healthPickup : public Item {
public:
	healthPickup(eSprite t, const Vector2& p) : Item(t, p) {
	}

	void pickup() {
		m_pPlayer->changeHealth(1.0f);
	}
};

class gold : public Item {
public:
	gold(eSprite t, const Vector2& p) : Item(t, p) {
	}

	void pickup() {
		m_pPlayer->changeGoldCount(1);
	}
};