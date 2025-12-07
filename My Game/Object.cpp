/// \file Object.cpp
/// \brief Code for the game object class CObject.

#include "Object.h"
#include "Component.h"
#include "Player.h"

/// Create an object, given its sprite type and initial position.
/// \param t Type of sprite.
/// \param p Initial position of object.

CObject::CObject(eSprite t, const Vector2& p) {
	width = 64.0f;
	height = 64.0f;
	type = 'o';
	m_vPos = p;
} //constructor

/// Destructor.
CObject::~CObject() {
}


void CObject::onCollision(CObject* obj) {

}

void CObject::update(float deltaTime) {

}
/// The only object in this game is the text wheel, which slowly rotates at 1/8
/// revolutions per second. This is achieved by adding a small amount to its
/// roll angle, proportional to frame time.

void CObject::move() {
	// Default object movement (can be overridden)
} //move

/// Ask the renderer to draw the sprite described in the sprite descriptor.
/// Note that `CObject` is derived from `LBaseObject` which is inherited from
/// `LSpriteDesc2D`. Therefore `LSpriteRenderer::Draw(const LSpriteDesc2D*)`
/// will accept `this` as a parameter, automatically down-casting it from
/// `CObject*` to `LSpriteDesc2D*`, effectively drawing the object from its
/// sprite descriptor.

void CObject::draw() {
	// Default draw - subclasses override
} //draw
