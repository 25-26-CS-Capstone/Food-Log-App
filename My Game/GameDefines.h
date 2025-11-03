/// \file GameDefines.h
/// \brief Game specific defines.

#ifndef __L4RC_GAME_GAMEDEFINES_H__
#define __L4RC_GAME_GAMEDEFINES_H__

#include "Defines.h"
#include "Sound.h"


const float screenWidth = 1024.0f;
const float screenHeight = 768.0f;
/// \brief Sprite enumerated type.
///
/// An enumerated type for the sprites, which will be cast to an unsigned
/// integer and used for the index of the corresponding texture in graphics
/// memory. `Size` must be last.

enum class eSprite : UINT {
	Background, TextWheel, PIGSPRITE, healthBar, healthBarBackground, testEnemy, playerAttack, InuitIdleRightSheet,
  InuitIdleRight, InuitIdleLeftSheet, InuitIdleLeft, InuitRunRightSheet,
  InuitRunRight, InuitRunLeftSheet, InuitRunLeft,InuitRunUpSheet,
  InuitRunUp, InuitRunDownSheet, InuitRunDown,InuitIdleUpSheet,
  InuitIdleUp, InuitIdleDownSheet, InuitIdleDown,InuitRollSheet,
  InuitRoll, TileSheet, Tiles, MapSheet, MapRoom, Connection,
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
