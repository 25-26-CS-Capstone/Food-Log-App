#include "Enemy.h"
#include "ComponentIncludes.h"

CEnemy::CEnemy(eSprite t, const Vector2& p) : CObject(t, p) {
	width = 200.0f;
	height = 200.0f;
	type = 'e';
} //constructor

CEnemy::~CEnemy() {

}

void CEnemy::move() {

}

void CEnemy::onCollision(CObject* obj) {
	if (obj->type == 'p') {
		m_vPos = Vector2(800.0f, 500.0f);
	}
}