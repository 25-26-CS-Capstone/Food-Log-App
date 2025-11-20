#include "Item.h"
#include "ComponentIncludes.h"

Item::Item(eSprite t, const Vector2& p, bool s, int x) : CObject(t, p) {
	width = 50.0f;
	height = 50.0f;
	type = 'i';
	shopItem = s;
	price = x;
} //constructor


void Item::onCollision(CObject* obj) {
	if (pickedUp == false) {
		if (obj->type == 'p') {
			pickup();
			pickedUp = true;
		}
	}
}

void Item::move() {

}

void Item::update(float deltaTime) {
	if (pickedUp == true) {
		m_bDead = true;
	}
}

void Item::pickup() {

}