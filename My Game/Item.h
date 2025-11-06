#pragma once

#ifndef __L4RC_GAME_ITEM_H__
#define __L4RC_GAME_ITEM_H__

#include "Object.h"


class Item : public CObject {
protected:
	bool pickedUp = false;
public:
	Item(eSprite t, const Vector2& p);
	void onCollision(CObject*);
	void move();
	void update(float);


};
#endif