#include "Defines.h"

class CObjectManager;
class LSpriteRenderer;
class CPlayer;

class CCommon {
protected:
	static LSpriteRenderer* m_pRenderer;
	static CObjectManager* m_pObjectManager;
	static CPlayer* m_pPlayer;
};