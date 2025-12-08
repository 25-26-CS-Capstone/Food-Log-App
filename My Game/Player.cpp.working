/// \file Player.cpp
/// \brief Code for the player object class CPlayer.

#include "Player.h"
#include "ComponentIncludes.h"

/// Create and initialize an player object given its initial position.
/// \param t Sprite type.
/// \param p Initial position of player.

CPlayer::CPlayer(eSprite t, const Vector2& p): CObject(t, p){ 
  m_pFrameEvent = new LEventTimer(0.12f);
} //constructor

/// Destructor.

CPlayer::~CPlayer(){
  delete m_pFrameEvent;
} //destructor

/// Move in response to device input. The amount of motion is proportional to
/// the frame time.

void CPlayer::move(){
  const float delta = 200.0f*m_pTimer->GetFrameTime(); //change in position

  if(m_nSpriteIndex == (UINT)eSprite::PlayerWalkRight)
    m_vPos += delta*Vector2::UnitX; 

  else if(m_nSpriteIndex == (UINT)eSprite::PlayerWalkLeft)
    m_vPos -= delta*Vector2::UnitX;
  
  UpdateFramenumber(); //choose current frame
} //move

/// Update the frame number in the animation sequence.

void CPlayer::UpdateFramenumber(){
  const UINT n = (UINT)m_pRenderer->GetNumFrames(m_nSpriteIndex); //number of frames

  if(n > 1 && m_pFrameEvent && m_pFrameEvent->Triggered())
    m_nCurrentFrame = (m_nCurrentFrame + 1)%n; 
} //UpdateFramenumber

/// Change the sprite to the walking left sprite. This function will be called
/// in response to device inputs.

void CPlayer::WalkLeft(){
  if(m_nSpriteIndex != (UINT)eSprite::PlayerWalkLeft)
    m_nSpriteIndex = (UINT)eSprite::PlayerWalkLeft;
} //WalkLeft

/// Change the sprite to the walking right sprite. This function will be called
/// in response to device inputs.

void CPlayer::WalkRight(){
  if(m_nSpriteIndex != (UINT)eSprite::PlayerWalkRight)
    m_nSpriteIndex = (UINT)eSprite::PlayerWalkRight;
} //WalkRight

/// Change the sprite to a standing sprite, depending on which direction the
/// player is walking.

void CPlayer::Stop(){
  if(m_nSpriteIndex == (UINT)eSprite::PlayerWalkRight)
    m_nSpriteIndex = (UINT)eSprite::PlayerStandRight;
  
  else if(m_nSpriteIndex == (UINT)eSprite::PlayerWalkLeft)
    m_nSpriteIndex = (UINT)eSprite::PlayerStandLeft;

  m_nCurrentFrame = 0;
} //Stop
