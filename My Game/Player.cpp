/// \file Player.cpp
/// \brief Code for the player object class CPlayer.

#include "Player.h"
#include "ComponentIncludes.h"

#include "Room.h"

/// Create and initialize an player object given its initial position.
/// \param t Sprite type.
/// \param p Initial position of player.

CPlayer::CPlayer(eSprite t, const Vector2& p): CObject(t, p){ 
  m_pFrameEvent = new LEventTimer(0.12f);
  currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleRight;
  objectmanager = m_pObjectManager;
  m_nCurrentFrame = 0;
  width = 150.0f;
  height = 132.0f;
  type = 'p';
} //constructor

/// Destructor.

CPlayer::~CPlayer(){
  delete m_pFrameEvent;
} //destructor

/// Move in response to device input. The amount of motion is proportional to
/// the frame time.

void CPlayer::onCollision(CObject* obj) {
    if (obj->type == 'e') {
        if (playerState == 0) {
            changeHealth(-1.0f);
            playerState = 2;//damaged state
            counter = 6;//number of frames
            currentSprite.m_f4Tint = XMFLOAT4(1.0f, 0.2f, 0.2f, 1.0f);//tint the player red
        }
    }
}


void CPlayer::move(){
  //keyboard handler block
    
    //split into states for controlling the player
    if (playerState == 0) { //if player state = 'normal movement'
        if (m_pKeyboard->TriggerUp('W')) {
            OutputDebugString("W - up\n");
            m_pPlayer->IdleUp();
        }
        if (m_pKeyboard->TriggerUp('A')) {
            OutputDebugString("A - up\n");
            m_pPlayer->IdleLeft();
        }
        if (m_pKeyboard->TriggerUp('S')) {
            OutputDebugString("S - up\n");
            m_pPlayer->IdleDown();
        }
        if (m_pKeyboard->TriggerUp('D')) {
            OutputDebugString("D - up\n");
            m_pPlayer->IdleRight();
        }

        if (m_pKeyboard->Down('A')) {
            OutputDebugString("A\n");
            recentInput = 'A';
            direction = 3;
            OutputDebugString("3");
            m_pPlayer->RunLeft();
        }
        if (m_pKeyboard->Down('D')) {
            OutputDebugString("D\n");
            recentInput = 'D';
            direction = 1;
            OutputDebugString("1");
            m_pPlayer->RunRight();
        }
        if (m_pKeyboard->Down('W')) {
            OutputDebugString("W\n");
            recentInput = 'W';
            direction = 0;
            OutputDebugString("0");
            m_pPlayer->RunUp();
        }
        if (m_pKeyboard->Down('S')) {
            OutputDebugString("S\n");
            recentInput = 'S';
            direction = 2;
            OutputDebugString("2");
            m_pPlayer->RunDown();
        }

        //roll function scanned last because it can change the state
        if (m_pKeyboard->TriggerDown('J')) {
            OutputDebugString("J\n");
            m_pPlayer->Roll();
        }

        //keyboard handler block
        if (playerState == 0) {
            //max speed check
            if (xspeed > MAXSPEED) xspeed = MAXSPEED;
            if (xspeed < -MAXSPEED) xspeed = -MAXSPEED;
            if (yspeed > MAXSPEED) yspeed = MAXSPEED;
            if (yspeed < -MAXSPEED) yspeed = -MAXSPEED;
            //max speed check

            //movement block
            const float delta = 200.0f * m_pTimer->GetFrameTime(); //change in position

            m_vPos += delta * Vector2::UnitX * xspeed;    //change x position
            m_vPos += delta * Vector2::UnitY * yspeed;    //chang y position

            //movement block

            //decrement speed
            if (xspeed > 0)xspeed -= SPEEDDEC;    //always count down speed to slow down
            if (xspeed < 0)xspeed += SPEEDDEC;
            if (yspeed > 0)yspeed -= SPEEDDEC;
            if (yspeed < 0)yspeed += SPEEDDEC;

            if (xspeed > -(SPEEDDEC * 1.5) && xspeed < (SPEEDDEC * 1.5))xspeed = 0;   //to prevent rubber banding at small speeds
            if (yspeed > -(SPEEDDEC * 1.5) && yspeed < (SPEEDDEC * 1.5))yspeed = 0;
            //decrement speed
        }
    } //playerstate 0 - 'normal'
    else if (playerState == 1) {    //if the player rolls, block input, decrement the counter to return to normal state
        //movement block
        const float delta = 200.0f * m_pTimer->GetFrameTime(); //change in position

        m_vPos += delta * Vector2::UnitX * xspeed;    //change x position
        m_vPos += delta * Vector2::UnitY * yspeed;    //chang y position

        //movement block


        if (counter > 0) {
            counter -= 1;
        }
        else {
            currentSprite.m_nSpriteIndex = lastSprite;
            playerState = 0;
        }
    } //player state 1 - 'roll'
    else if (playerState == 2) {//if player takes damage, tint red and apply knockback

        //knockback
        /////////[IMPLEMENT KNOCKBACK]///////////
        //the following is temporary inverted movement
        const float delta = 200.0f * m_pTimer->GetFrameTime(); //change in position
        m_vPos += delta * Vector2::UnitX * -xspeed * 2;    //change x position
        m_vPos += delta * Vector2::UnitY * -yspeed * 2;    //chang y position

        if (counter > 0) {
            counter -= 1;
        }
        else {
            playerState = 0;
            currentSprite.m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f);
        }
        
    }//player state 2 - 'damaged'
	//Room stuff. Remove if it should go somewhere else.
	UpdateBasedOnTile();

  UpdateFramenumber(); //choose current frame
} //move

/// Update the frame number in the animation sequence.

void CPlayer::UpdateFramenumber(){
  const UINT n = (UINT)m_pRenderer->GetNumFrames(currentSprite.m_nSpriteIndex); //number of frames

  if(n > 1 && m_pFrameEvent && m_pFrameEvent->Triggered())
    m_nCurrentFrame = (m_nCurrentFrame + 1)%n; 
} //UpdateFramenumber


// run left, change sprite and update speed
void CPlayer::RunLeft(){
  if(currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitRunLeft)
      currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunLeft;
  xspeed -= SPEEDINC;
} //RunLeft
// run right, change sprite and update speed
void CPlayer::RunRight(){
  if(currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitRunRight)
      currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunRight;
  xspeed += SPEEDINC;
} //RunRight
//   run up, change sprite and update speed
void CPlayer::RunUp() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitRunUp)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunUp;
    yspeed += SPEEDINC;
} //RunRight
// run down, change sprite and update speed
void CPlayer::RunDown() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitRunDown)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunDown;
    yspeed -= SPEEDINC;
} //RunDown

void CPlayer::IdleLeft() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitIdleLeft)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleLeft;

    m_nCurrentFrame = 0;
} //IdleLeft

void CPlayer::IdleRight() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitIdleRight)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleRight;

    m_nCurrentFrame = 0;
} //IdleRight

void CPlayer::IdleUp() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitIdleUp)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleUp;

    m_nCurrentFrame = 0;
} //IdleUp

void CPlayer::IdleDown() {
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitIdleDown)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleDown;

    m_nCurrentFrame = 0;
} //IdleDown

//roll -  sets sprite, movement direction/speed, and changes state to roll
void CPlayer::Roll() {
    lastSprite = currentSprite.m_nSpriteIndex;
    if (currentSprite.m_nSpriteIndex != (UINT)eSprite::InuitRoll)
        currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRoll;

    switch (recentInput) {
    case 'W':
        xspeed = 0.0;
        yspeed = ROLLSPEED;
        break;
    case 'A':
        xspeed = -ROLLSPEED;
        yspeed = 0.0;
        break;
    case 'S':
        xspeed = 0.0;
        yspeed = -ROLLSPEED;
        break;
    case 'D':
        xspeed = ROLLSPEED;
        yspeed = 0.0;
        break;
    default:    //dodge right
        xspeed = ROLLSPEED;
        yspeed = 0.0;
    }

    playerState = 1;
    counter = 8;
}


void CPlayer::changeHealth(float f) {
    currentHealth += f;
}


float CPlayer::getCurrentHealth() {
    return currentHealth;
}

float CPlayer::getMaxHealth() {
    return maxHealth;
}

int CPlayer::getDirection() {
    return direction;
}

void CPlayer::changeAttackState(bool t) {
    isAttacking = t;
}

bool CPlayer::getAttackState() {
    return isAttacking;
}

void CPlayer::draw() {
    currentSprite.m_vPos = m_vPos;
    currentSprite.m_nCurrentFrame = m_nCurrentFrame;
    m_pRenderer->Draw(&currentSprite);
}
//Room Stuff
void CPlayer::SetRoom(CRoom* room) {
	m_pRoom = room;
}
char CPlayer::GetCurrentTileType() {
    return m_pRoom ? m_pRoom->GetTileAt(m_vPos) : '\0';
}
void CPlayer::UpdateBasedOnTile() {
	char newTileType = GetCurrentTileType();


    /*char buffer[64];
    snprintf(buffer, sizeof(buffer),
        "Player on tile '%c' at (%.1f, %.1f)\n",
        newTileType, m_vPos.x, m_vPos.y);
    OutputDebugString(buffer);
    */

    if (currentTileType != newTileType) {
        switch (newTileType) {
        case 'F': break; //floor
        case 'W': break; //wall
        case 'I': break; //ice
        case 'H': break; //hazard
        default: break;
		}//switch
	}//if

    currentTileType = newTileType;
}//UpdateBasedOnTile
Node* CPlayer::GetCurrentNode() {
	return currentNode;
}
void CPlayer::SetCurrentNode(Node* node) {
	currentNode = node;
}