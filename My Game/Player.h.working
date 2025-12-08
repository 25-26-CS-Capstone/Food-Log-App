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

  public:
    CPlayer(eSprite t, const Vector2& p); ///< Constructor.
    virtual ~CPlayer(); ///< Destructor.

    virtual void move(); ///< Move player object.
    
    void WalkLeft(); ///< Start walking left.
    void WalkRight(); ///< Start walking right.
    void Stop(); ///< Stop walking.
}; //CPlayer

#endif //__L4RC_GAME_PLAYER_H__

