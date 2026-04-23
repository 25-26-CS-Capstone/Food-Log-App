#pragma once

#ifndef __L4RC_GAME_ITEM_H__
#define __L4RC_GAME_ITEM_H__

#include "Object.h"
#include "Player.h"
#include "Hud.h"


//Base class for items. Each individual item will be its own subclass which will have its own
//version of the virtual "pickup" function, which will activate its particular item's effects
class Item : public CObject {
protected:
	bool pickedUp = false;
	bool shopItem; //says whether the item is in a shop or not
	int price; //price of item if in a shop
public:
	Item(eSprite t, const Vector2& p, bool s, int x);
	void onCollision(CObject*);
	void move();
	void update(float);
	virtual void pickup();


};
#endif

//simple health pickup that restores 1 life
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

//item that increases max health by 1
class maxHealthPickup : public Item {
public:
	maxHealthPickup(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		if(m_pPlayer->getMaxHealth() != 10.0f)
		m_pPlayer->changeMaxHealth(1.0f);
	}
};

//simple gold item used to by other items in shops
class gold : public Item {
public:
	gold(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeGoldCount(1);
	}
};

//item that increases damage of player's attack
class attackUp : public Item {
public:
	attackUp(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}
	void pickup() {
		m_pPlayer->changeAttackDamage(0.5);
	}
};

//item that decreases time between swings of player's weapon
class attackSpeedUp : public Item {
public:
	attackSpeedUp(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}
	void pickup() {
		m_pPlayer->changeAttackCooldownValue(-0.2f);
	}
};

//item that causes player's roll to cause damage
class thornRoll : public Item {
public:
	thornRoll(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeRollAttack(true);
	}
};

//item that causes enemies to drop a health pickup on death
class lifeDrop : public Item {
public:
	lifeDrop(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeLifeDrop(true);
	}
};

//item that causes enemies to drop a gold on death
class goldDrop : public Item {
public:
	goldDrop(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeGoldDrop(true);
	}
};

//item that causes player attack to also hit behind them
class backAttack : public Item {
public:
	backAttack(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeBackAttack(true);
	}
};

//item that causes enemies to explode on death, damaging other enemeies
class deathExplosion : public Item {
public:
	deathExplosion(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->changeDeathExplosion(true);
	}
};

//item that causes player to gain a recharging shield that blocks one hit
class damageShield : public Item {
public:
	damageShield(eSprite t, const Vector2& p, bool s, int x) : Item(t, p, s, x) {
	}

	void pickup() {
		m_pPlayer->setDamageShield(true);
		m_pPlayer->setActiveShield(true);
	}
};

