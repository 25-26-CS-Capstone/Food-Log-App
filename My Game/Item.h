#pragma once

#ifndef __L4RC_GAME_ITEM_H__
#define __L4RC_GAME_ITEM_H__

#include "Object.h"
#include "Player.h"
#include "Hud.h"

class Item : public CObject {
protected:
	bool pickedUp = false;
	bool shopItem;
	int price;
public:
	Item(eSprite t, const Vector2& p, bool s, int x);
	void onCollision(CObject*);
	void move();
	void update(float);
	virtual void pickup();


};
#endif


class healthPickup : public Item {
public:
	healthPickup(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		if (m_pPlayer->getCurrentHealth() != m_pPlayer->getMaxHealth()) {
			m_pPlayer->changeHealth(1.0f);
		}
	}
};

class maxHealthPickup : public Item {
public:
	maxHealthPickup(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		if(m_pPlayer->getMaxHealth() != 10.0f)
		m_pPlayer->changeMaxHealth(1.0f);
	}
};

class gold : public Item {
public:
	gold(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeGoldCount(1);
	}
};

class attackUp : public Item {
public:
	attackUp(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}
	void pickup() {
		m_pPlayer->changeAttackDamage(1.0);
	}
};

class thornRoll : public Item {
public:
	thornRoll(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeRollAttack(true);
	}
};

class lifeDrop : public Item {
public:
	lifeDrop(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeLifeDrop(true);
	}
};

class goldDrop : public Item {
public:
	goldDrop(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeGoldDrop(true);
	}
};