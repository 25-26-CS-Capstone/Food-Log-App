#pragma once

#ifndef __L4RC_GAME_ENEMY_H__
#define __L4RC_GAME_ENEMY_H__

#include "Object.h"
#include "Player.h"
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>

class CEnemy : public CObject {
protected:

    float currentHealth = 2.0;
    float invulnTime = 0.3f;
    bool damaged = false;
    int moveDir = 1;
    int moveCount = 0;
public:
    CEnemy(eSprite t, const Vector2& p); ///< Constructor.
    virtual ~CEnemy(); ///< Destructor.
    void move();
    void onCollision(CObject*);
    void update(float);

    
}; //CEnemy

#endif //__L4RC_GAME_ENEMY_H__

