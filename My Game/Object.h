/// \file Object.h
/// \brief Interface for the game object class CObject.

#ifndef __L4RC_GAME_OBJECT_H__
#define __L4RC_GAME_OBJECT_H__

#include "GameDefines.h"
#include "SpriteRenderer.h"
#include "Common.h"
#include "Component.h"
#include "SpriteDesc.h"
#include "BaseObject.h"


/// \brief The game object. 
///
/// The abstract representation of an object. `CObjectManager` is a friend of
/// this class so that it can access any private members as needed to manage
/// the objects without the need for reader and set functions for each private
/// or protected member variable. This class must contain public member
/// functions `move()` and `draw()` to move and draw the object, respectively.

class CObject :
    public CCommon,
    public LBaseObject
{
    friend class CObjectManager; ///< Object manager needs access so it can manage.

public:
    ~CObject();// destructor

    CObject(eSprite, const Vector2&); ///< Constructor.
    float width;
    float height;
    char type;
    virtual void onCollision(CObject*);
    virtual void update(float);
    virtual void move(); ///< Move object.
    virtual void draw(); ///< Draw object.
    char GetCollisionType() const { return type; }
}; //CObject

#endif //__L4RC_GAME_OBJECT_H__
