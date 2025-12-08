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

// Simple animation helpers - set sprite and frame timer
void CPlayer::IdleLeft()  { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleLeft;  
    m_nMaxFrames = 20;
    if (m_fAnimTimer > 0.12f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::IdleRight() { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleRight; 
    m_nMaxFrames = 20;
    if (m_fAnimTimer > 0.12f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::IdleUp()    { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleUp;    
    m_nMaxFrames = 15;
    if (m_fAnimTimer > 0.12f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::IdleDown()  { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitIdleDown;  
    m_nMaxFrames = 15;
    if (m_fAnimTimer > 0.12f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}

void CPlayer::RunLeft()   { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunLeft;  
    m_nMaxFrames = 8;
    if (m_fAnimTimer > 0.07f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::RunRight()  { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunRight; 
    m_nMaxFrames = 8;
    if (m_fAnimTimer > 0.07f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::RunUp()     { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunUp;    
    m_nMaxFrames = 8;
    if (m_fAnimTimer > 0.07f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}
void CPlayer::RunDown()   { 
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRunDown;  
    m_nMaxFrames = 8;
    if (m_fAnimTimer > 0.07f) { m_fAnimTimer = 0.0f; m_nCurrentFrame = (m_nCurrentFrame + 1) % m_nMaxFrames; }
}

// Advance frame counter with wrap based on current animation
void CPlayer::UpdateFramenumber() {
    // Increment timer - this is called once per frame regardless of input
    m_fAnimTimer += 0.016f; // ~60fps
}

/// Move in response to device input. The amount of motion is proportional to
/// the frame time.

void CPlayer::onCollision(CObject* obj) {
    if (obj->type == 'e') {
        if (playerState == 0 && activeShield == false) {
            changeHealth(-1.0f);
            playerState = 2;//damaged state
            counter = 6;//number of frames in red
        }
        else if (activeShield == true) {
            activeShield = false;
            playerState = 2;//damaged state
            counter = 6;//number of frames in red
        }
    }
    if (obj->type == 'i') {
        
    }
}
void CPlayer::move(){
    // Lightweight movement using raw keyboard polling (no engine keyboard object available)
    const float step = 4.0f; // pixels per frame; increase if too slow

    bool any = false;
    if (GetAsyncKeyState('A') & 0x8000) { m_vPos.x -= step; RunLeft();  direction = 3; recentInput = 'A'; any = true; }
    if (GetAsyncKeyState('D') & 0x8000) { m_vPos.x += step; RunRight(); direction = 1; recentInput = 'D'; any = true; }
    if (GetAsyncKeyState('W') & 0x8000) { m_vPos.y += step; RunUp();    direction = 0; recentInput = 'W'; any = true; }
    if (GetAsyncKeyState('S') & 0x8000) { m_vPos.y -= step; RunDown();  direction = 2; recentInput = 'S'; any = true; }

    if (!any) {
        switch (recentInput) {
        case 'A': IdleLeft();  direction = 3; break;
        case 'D': IdleRight(); direction = 1; break;
        case 'W': IdleUp();    direction = 0; break;
        case 'S': IdleDown();  direction = 2; break;
        default:  IdleRight(); direction = 1; break;
        }
<<<<<<< HEAD
=======
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
    else if (playerState == 3) {//if player takes damage, tint red and apply knockback

        //knockback
        /////////[IMPLEMENT KNOCKBACK]///////////
        //the following is temporary inverted movement
        const float delta = 200.0f * m_pTimer->GetFrameTime(); //change in position
        m_vPos += delta * Vector2::UnitX * -xspeed * 10;    //change x position
        m_vPos += delta * Vector2::UnitY * -yspeed * 10;    //chang y position

        if (counter > 0) {
            counter -= 1;
        }
        else {
            playerState = 0;
            //currentSprite.m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f);
        }

    }//player state 3 - 'wall collision'
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
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
    }

    UpdateBasedOnTile();
    UpdateFramenumber();  // Increment animation timer every frame
} //move


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
    
    // Apply red tint only when in damaged state
    if (playerState == 2) {
        currentSprite.m_f4Tint = XMFLOAT4(1.0f, 0.2f, 0.2f, 1.0f);  // Red tint
    } else {
        currentSprite.m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f);  // Normal white
    }
    
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
    const char tile = GetCurrentTileType();


    /*char buffer[64];
    snprintf(buffer, sizeof(buffer),
        "Player on tile '%c' at (%.1f, %.1f)\n",
        newTileType, m_vPos.x, m_vPos.y);
    OutputDebugString(buffer);
    */

    if (currentTileType != tile) {
        switch (tile) {
        case 'F': break; //floor
        case 'W': break; //wall
        case 'I': break; //ice
        case 'H': break; //hazard
        default: break;
		}//switch
	}//if

    currentTileType = tile;
}//UpdateBasedOnTile
Node* CPlayer::GetCurrentNode() {
	return currentNode;
}
void CPlayer::SetCurrentNode(Node* node) {
	currentNode = node;
}
void CPlayer::changeGoldCount(int x) {
    goldCount += x;
    mHud->updateGoldDigits(x);
}

void CPlayer::update(float deltaTime) {
    if (m_vPos.y > screenHeight - 20.0f) {
        playerState = 3;
    }
    else if (m_vPos.y < 20.0f) {
        playerState = 3;
    }
    else if (m_vPos.x > screenWidth + 10.0f) {
        playerState = 3;
    }
    else if (m_vPos.x < -10.0f) {
        playerState = 3;
    }

    attackCooldown -= deltaTime;
    
    // Handle damage state - decrement counter and return to normal when done
    if (playerState == 2) {
        counter--;
        if (counter <= 0) {
            playerState = 0;  // Return to normal state
            counter = 0;
        }
    }
    
    if (activeShield == false && damageShield == true) {
        shieldCooldown -= deltaTime;
        if (shieldCooldown <= 0.0f) {
            activeShield = true;
            shieldCooldown = 10.0f;
        }
    }
}