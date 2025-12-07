#ifndef __L4RC_GAME_COMMON_H__
#define __L4RC_GAME_COMMON_H__


#include "GameDefines.h"
#include "Timer.h"

class CObjectManager;
class LSpriteRenderer;
class CPlayer;
class CEnemy;
class HUD;
class CCommon {
protected:
	static LSpriteRenderer* m_pRenderer;
	static CObjectManager* m_pObjectManager;
	static CPlayer* m_pPlayer; // Pointer to player character
	static HUD* mHud;
	static LTimer* m_pTimer;
};

#endif