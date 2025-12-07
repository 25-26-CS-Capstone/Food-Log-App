#include "Item.h"
#include "Component.h"

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
			if (m_pPlayer->getGoldCount() >= price) {
				pickup();
				pickedUp = true;
				m_pPlayer->changeGoldCount(-price);
			}
		}
	}
}

void Item::move() {

}

void Item::update(float deltaTime) {
	if (pickedUp == true) {
		m_bDead = true;
	}
	if (shopItem == true) {
		if (price < 10) {
			mHud->renderGoldNums(price, 0, this->m_vPos - Vector2(15.0f, 60.0f));
		}
		else {
			mHud->renderGoldNums(price - (10 * (price / 10)), price / 10, this->m_vPos - Vector2(15.0f, 60.0f));
		}
	}
}

void Item::pickup() {

}