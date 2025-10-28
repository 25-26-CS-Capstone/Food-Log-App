#include "Attack.h"

Attack::Attack(eSprite t, const Vector2& p, CObject* owner):CObject(t,p) {
	width = 100.0f;
	height = 100.0f;
	mOwner = owner;
	type = 'a';
}

void Attack::onCollision(CObject* x) {
	
	
}