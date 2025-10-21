/// \file Player.h
/// \brief Interface for the player object class CPlayer.

#ifndef __L4RC_GAME_PLAYER_H__
#define __L4RC_GAME_PLAYER_H__

#include "Object.h"
#include "EventTimer.h"

/// \brief The player object. 
///
/// The abstract representation of the player object. The player differs from
/// the other objects in the game in that it moves in respond to device inputs.

class CPlayer: public CObject{
  protected:  
    LEventTimer* m_pFrameEvent = nullptr; ///< Frame event timer.
    
    void UpdateFramenumber(); ///< Update frame number.

    float currentHealth = 3.0;
    float maxHealth = 3.0;

  public:
    CPlayer(eSprite t, const Vector2& p); ///< Constructor.
    virtual ~CPlayer(); ///< Destructor.

    virtual void move(); ///< Move player object.
    
    void IdleLeft(); ///< idle sprite facing left
    void IdleRight(); ///< idle sprite facing right
    void RunLeft(); ///<run sprite facing left
    void RunRight(); ///<run sprite facing right

    //void Stop(); ///< Stop walking.
    void changeHealth(float);
    float getCurrentHealth();
    float getMaxHealth();
    void onCollision(CObject*);
}; //CPlayer

#endif //__L4RC_GAME_PLAYER_H__

