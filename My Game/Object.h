
#include "BaseObject.h"
#include "Common.h"
#include "GameDefines.h"

class CObject :
	public LBaseObject
{
	friend class CObjectManager;
protected:

public:
	CObject(eSprite, const Vector2&);
	virtual ~CObject();

};