/// \file Player.h
/// \brief Interface for the player object class CPlayer.

#ifndef __L4RC_GAME_PLAYER_H__
#define __L4RC_GAME_PLAYER_H__

#include "Object.h"
#include "EventTimer.h"
#include "Common.h"
#include "GraphGen.h"
#include "HUD.h"

/// \brief The player object. 
///
/// The abstract representation of the player object. The player differs from
/// the other objects in the game in that it moves in respond to device inputs.

class CRoom;

class CPlayer: public CObject{
  protected:  
    LEventTimer* m_pFrameEvent = nullptr; ///< Frame event timer.
    LSpriteDesc2D currentSprite;
    CObjectManager* objectmanager;

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


	//Room Stuff
    CRoom* m_pRoom = nullptr;
	char currentTileType = ' ';
	Node* currentNode = nullptr;

    int goldCount = 0;
    float attackDamage = 1.0;
    float attackCooldown = 0.0; //used to track player attack cooldown
    float attackCooldownValue = 1.0f; //how long attack cooldown is
    bool rollAttack = false; //check for rollattack item
    bool lifeDrop = false; //check for lifedrop item
    bool goldDrop = false; //check for golddrop item
    bool backAttack = false; //check for backattack item
    bool deathExplosion = false; //check for deathexplosion item
    bool damageShield = false; //check for damageshield item
    bool activeShield = false; //tracks whether player has an active shield
    float shieldCooldown = 10.0f; //used to track cooldown of damage shield item
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

    void changeHealth(float);
    float getCurrentHealth();
    float getMaxHealth();
    void changeGoldCount(int);
    int getDirection();
    void onCollision(CObject*);
    void changeAttackState(bool);
    bool getAttackState();
    void draw(); //draw player each frame

    //Room Stuff
    void SetRoom(CRoom* room);
	Node* GetCurrentNode();
	void SetCurrentNode(Node* node);
    char GetCurrentTileType();
    void UpdateBasedOnTile();
    void update(float);
    //Below are access/modify functions for player stats and items
    void changeAttackDamage(float x) { attackDamage += x; }
    void setAttackCooldown(float x) { attackCooldown = x; }
    float getAttackCooldown() { return attackCooldown; }
    void changeMaxHealth(float x) { maxHealth += x; }
    void changeRollAttack(bool x) { rollAttack = x; }
    bool getRollAttack() { return rollAttack; }
    int getPlayerState() { return playerState; }
    int getGoldCount() { return goldCount; }
    bool getLifeDrop() { return lifeDrop; }
    void changeLifeDrop(bool x) { lifeDrop = x; }
    bool getGoldDrop() { return goldDrop; }
    void changeGoldDrop(bool x) { goldDrop = x; }
    float getAttackDamage() { return attackDamage; }
    void changeAttackCooldownValue(float x) { attackCooldownValue += x; }
    float getAttackCooldownValue() { return attackCooldownValue; }
    void changeBackAttack(bool x) { backAttack = x; }
    bool getBackAttack() { return backAttack; }
    void changeDeathExplosion(bool x) { deathExplosion = x; }
    bool getDeathExplosion() { return deathExplosion; }
    void setDamageShield(bool x) { damageShield = x; }
    bool getDamageShield() { return damageShield; }
    void setActiveShield(bool x) { activeShield = x; }
    bool getActiveShield() { return activeShield; }
}; //CPlayer

#endif //__L4RC_GAME_PLAYER_H__

