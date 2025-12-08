/// \file GameDefines.h
/// \brief Game specific defines.

#ifndef __L4RC_GAME_GAMEDEFINES_H__
#define __L4RC_GAME_GAMEDEFINES_H__

// Include LARC engine defines for Vector2, XMFLOAT4, DirectX types
#include "Defines.h"


const float screenWidth = 1400.0f;
const float screenHeight = 760.0f;
const float kBorderMargin = 20.0f;
// Projectile balance
const float kIceBatProjectileSpeed = 200.0f;    // default speed
const float kIceBatShootCooldown = 1.5f;        // seconds between shots
/// \brief Sprite enumerated type.
///
/// An enumerated type for the sprites, which will be cast to an unsigned
/// integer and used for the index of the corresponding texture in graphics
/// memory. `Size` must be last.

enum class eSprite : UINT {
	Background, TextWheel, PIGSPRITE, healthBar, healthBarBackground, playerAttack, healthPickup, 
	maxHealthPickup, gold, explosion, attackUp, attackSpeedUp, thornRoll, lifeDrop, goldDrop,
	backAttack, deathExplosion, damageShield, digit0, digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9, 
	InuitIdleRightSheet, InuitIdleRight, InuitIdleLeftSheet, InuitIdleLeft, InuitRunRightSheet,
  InuitRunRight, InuitRunLeftSheet, InuitRunLeft,InuitRunUpSheet,
  InuitRunUp, InuitRunDownSheet, InuitRunDown,InuitIdleUpSheet,
  InuitIdleUp, InuitIdleDownSheet, InuitIdleDown,InuitRollSheet,
  InuitRoll, PlayerAttack, PlayerAttackSheet, TileSheet, Tiles, MapSheet, MapRoom, Connection,
    // Ice Bat sprites
    IceBatFlap64Sheet, IceBatFlap, IceBatAttackFlap,
    // Projectile sprites
    IceBatProjectile, PlayerProjectile,
    // Item pickups
    Item,
    // Ice Bear sprites
    IceBear,
    IceBear0, IceBear1, IceBear2, IceBear3, IceBear4,
    IceBear5, IceBear6, IceBear7, IceBear8,
    IceBear128Sheet, IceBearInactive128, IceBearActive128,
    IceBearSheet, IceBearInactive, IceBearActive,
    StartButton0, StartButton1, ExitButton0, ExitButton1,
  Size  //MUST BE LAST
}; //eSprite

/// \brief Sound enumerated type.
///
/// An enumerated type for the sounds, which will be cast to an unsigned
/// integer and used for the index of the corresponding sample. `Size` must 
/// be last.

enum class eSound: UINT{
  Clang, Grunt, OINK, 
  Size  //MUST BE LAST
}; //eSound

#endif //__L4RC_GAME_GAMEDEFINES_H__
