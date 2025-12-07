/// \file Player.cpp
/// \brief Code for the player object class CPlayer.

#include "Player.h"
#include "Component.h"
#include "Timer.h"

#include "Room.h"

/// Create and initialize an player object given its initial position.
/// \param t Sprite type.
/// \param p Initial position of player.

CPlayer::CPlayer(eSprite t, const Vector2& p): CObject(t, p){ 
  m_pFrameEvent = new EventTimer();
  objectmanager = m_pObjectManager;
  m_vPos = p;
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
        if (playerState == 0 && activeShield == false) {
            changeHealth(-1.0f);
            playerState = 2;//damaged state
            counter = 6;//number of frames
            m_f4Tint = XMFLOAT4(1.0f, 0.2f, 0.2f, 1.0f);//tint the player red
        }
        else if (activeShield == true) {
            activeShield = false;
            playerState = 2;//damaged state
            counter = 6;//number of frames
        }
    }
    if (obj->type == 'i') {
        
    }
}


void CPlayer::move(){
  //keyboard handler block - simplified without m_pKeyboard
    
    //split into states for controlling the player
    if (playerState == 0) { //if player state = 'normal movement'
        // Keyboard input handling would go here (currently stubbed)
        
        //keyboard handler block
        if (playerState == 0) {
            //max speed check
            if (xspeed > MAXSPEED) xspeed = MAXSPEED;
            if (xspeed < -MAXSPEED) xspeed = -MAXSPEED;
            if (yspeed > MAXSPEED) yspeed = MAXSPEED;
            if (yspeed < -MAXSPEED) yspeed = -MAXSPEED;
            //max speed check

            //movement block
            float delta = 0.016f; // ~60fps stub
            if (m_pTimer) delta = m_pTimer->GetFrameTime();

            m_vPos += Vector2::UnitX * (delta * 200.0f * xspeed);    //change x position
            m_vPos += Vector2::UnitY * (delta * 200.0f * yspeed);    //chang y position

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
        float delta = 0.016f;
        if (m_pTimer) delta = m_pTimer->GetFrameTime();

        m_vPos += Vector2::UnitX * (delta * 200.0f * xspeed);    //change x position
        m_vPos += Vector2::UnitY * (delta * 200.0f * yspeed);    //chang y position

        //movement block


        if (counter > 0) {
            counter -= 1;
        }
        else {
            currentSprite = lastSprite;
            playerState = 0;
        }
    } //player state 1 - 'roll'
    else if (playerState == 2) {//if player takes damage, tint red and apply knockback

        //knockback
        /////////[IMPLEMENT KNOCKBACK]///////////
        //the following is temporary inverted movement
        const float delta = 200.0f * m_pTimer->GetFrameTime(); //change in position
        m_vPos += Vector2::UnitX * (delta * -xspeed * 2);    //change x position
        m_vPos += Vector2::UnitY * (delta * -yspeed * 2);    //chang y position

        if (counter > 0) {
            counter -= 1;
        }
        else {
            playerState = 0;
            m_f4Tint = XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f);
        }
        
    }//player state 2 - 'damaged'
	//Room stuff. Remove if it should go somewhere else.
	UpdateBasedOnTile();

  UpdateFramenumber(); //choose current frame
} //move

/// Update the frame number in the animation sequence.

void CPlayer::UpdateFramenumber(){
  // Animation frame update - simplified
  if(m_pFrameEvent && m_pFrameEvent->EventTimerTriggered())
    m_nCurrentFrame = (m_nCurrentFrame + 1) % 4; // Assume 4 frames for simplicity
} //UpdateFramenumber


// run left, change sprite and update speed
void CPlayer::RunLeft(){
  if(currentSprite != eSprite::InuitRunLeft)
      currentSprite = eSprite::InuitRunLeft;
  xspeed -= SPEEDINC;
} //RunLeft
// run right, change sprite and update speed
void CPlayer::RunRight(){
  if(currentSprite != eSprite::InuitRunRight)
      currentSprite = eSprite::InuitRunRight;
  xspeed += SPEEDINC;
} //RunRight
//   run up, change sprite and update speed
void CPlayer::RunUp() {
    if (currentSprite != eSprite::InuitRunUp)
        currentSprite = eSprite::InuitRunUp;
    yspeed += SPEEDINC;
} //RunRight
// run down, change sprite and update speed
void CPlayer::RunDown() {
    if (currentSprite != eSprite::InuitRunDown)
        currentSprite = eSprite::InuitRunDown;
    yspeed -= SPEEDINC;
} //RunDown

void CPlayer::IdleLeft() {
    if (currentSprite != eSprite::InuitIdleLeft)
        currentSprite = eSprite::InuitIdleLeft;

    m_nCurrentFrame = 0;
} //IdleLeft

void CPlayer::IdleRight() {
    if (currentSprite != eSprite::InuitIdleRight)
        currentSprite = eSprite::InuitIdleRight;

    m_nCurrentFrame = 0;
} //IdleRight

void CPlayer::IdleUp() {
    if (currentSprite != eSprite::InuitIdleUp)
        currentSprite = eSprite::InuitIdleUp;

    m_nCurrentFrame = 0;
} //IdleUp

void CPlayer::IdleDown() {
    if (currentSprite != eSprite::InuitIdleDown)
        currentSprite = eSprite::InuitIdleDown;

    m_nCurrentFrame = 0;
} //IdleDown

//roll -  sets sprite, movement direction/speed, and changes state to roll
void CPlayer::Roll() {
    lastSprite = currentSprite;
    if (currentSprite != eSprite::InuitRoll)
        currentSprite = eSprite::InuitRoll;

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

// Apply simple knockback to the player in given direction
void CPlayer::ApplyKnockback(const Vector2& dir, float strength, float dt) {
    Vector2 kdir = dir;
    if (kdir.Length() > 0.001f) kdir.Normalize();
    const float delta = strength * dt;
    m_vPos += kdir * delta;
    // enter damaged state briefly
    playerState = 2;
    counter = 6;
    m_f4Tint = XMFLOAT4(1.0f, 0.2f, 0.2f, 1.0f);
}

// Simple invincibility check based on active shield or damaged state cooldown
bool CPlayer::GetInvincible() const {
    return activeShield || (playerState == 2 && counter > 0);
}

// Visual hit effect: tint red and set damaged state briefly
void CPlayer::applyHitEffect() {
    playerState = 2;
    counter = 6;
    m_f4Tint = XMFLOAT4(1.0f, 0.2f, 0.2f, 1.0f);
}

void CPlayer::draw() {
    if (m_pRenderer)
        m_pRenderer->Draw(currentSprite, m_vPos);
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
void CPlayer::changeGoldCount(int x) {
    goldCount += x;
    mHud->updateGoldDigits(x);
}

void CPlayer::update(float deltaTime) {
    attackCooldown -= deltaTime;
    if (activeShield == false && damageShield == true) {
        shieldCooldown -= deltaTime;
        if (shieldCooldown <= 0.0f) {
            activeShield = true;
            shieldCooldown = 10.0f;
        }
    }
}