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
    }

    //Room stuff. Remove if it should go somewhere else.
    UpdateBasedOnTile();

    UpdateFramenumber(); //choose current frame
} //move

//roll - sets sprite and direction; simplified for direct-move input
void CPlayer::Roll() {
    lastSprite = currentSprite.m_nSpriteIndex;
    currentSprite.m_nSpriteIndex = (UINT)eSprite::InuitRoll;
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