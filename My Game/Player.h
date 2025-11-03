/// \file Player.h
/// \brief Interface for the player object class CPlayer.

#ifndef __L4RC_GAME_PLAYER_H__
#define __L4RC_GAME_PLAYER_H__

#include "Object.h"
#include "EventTimer.h"
#include "Common.h"
/// \brief The player object. 
///
/// The abstract representation of the player object. The player differs from
/// the other objects in the game in that it moves in respond to device inputs.

class CPlayer: public CObject{
  protected:  
    LEventTimer* m_pFrameEvent = nullptr; ///< Frame event timer.
    LSpriteDesc2D currentSprite;

    void UpdateFramenumber(); ///< Update frame number.

    int playerState = 0;    //states: 0 = normal, 1 = roll, 2 = damaged

    bool isAttacking = false;
    float currentHealth = 3.0;
    float xspeed = 0.0;
    float yspeed = 0.0;
    float MAXSPEED = 2.25f;
    float SPEEDINC = 0.5f;  //must be at least more than the 2x the decrement value
    float SPEEDDEC = 0.2f; //must be at least less than half the increment value
    float ROLLSPEED = 6.0f;
    int direction = 0;
    int counter = 0;
    char recentInput = 'D';
    unsigned int lastSprite;
    float maxHealth = 3.0;

  public:
    CPlayer(eSprite t, const Vector2& p); ///< Constructor.
    virtual ~CPlayer(); ///< Destructor.

    void move(); ///< Move player object.
    
    void IdleLeft(); ///< idle sprite facing left
    void IdleRight(); ///< idle sprite facing right
    void IdleUp();
    void IdleDown();
    void RunLeft(); ///<run sprite facing left
    void RunRight(); ///<run sprite facing right
    void RunUp();
    void RunDown();
    void Roll();

    //void Stop(); ///< Stop walking.
    void changeHealth(float);
    float getCurrentHealth();
    float getMaxHealth();

    void onCollision(CObject*);
    void draw();    //draw player each frame
    int getDirection();
    void changeAttackState(bool);
    bool getAttackState();
}; //CPlayer

#endif //__L4RC_GAME_PLAYER_H__

