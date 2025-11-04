#pragma once

#ifndef __L4RC_GAME_ENEMY_H__
#define __L4RC_GAME_ENEMY_H__

#include "Object.h"

class CEnemy : public CObject {
protected:

    float currentHealth = 3.0;

public:
    CEnemy(eSprite t, const Vector2& p); ///< Constructor.
    virtual ~CEnemy(); ///< Destructor.
    void move();
    void onCollision(CObject*);
    void update(float);

    
}; //CEnemy

#endif //__L4RC_GAME_ENEMY_H__

