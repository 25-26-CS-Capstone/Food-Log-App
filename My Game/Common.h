#ifndef __L4RC_GAME_COMMON_H__
#define __L4RC_GAME_COMMON_H__


#include "Defines.h"

class CObjectManager;
class LSpriteRenderer;
class CPlayer;
class CEnemy;

class CCommon {
protected:
	static LSpriteRenderer* m_pRenderer;
	static CObjectManager* m_pObjectManager;
	static CPlayer* m_pPlayer; // Pointer to player character
	
};

#endif