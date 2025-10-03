
#include "BaseObject.h"
#include "GameDefines.h"

class CObject :
	public LBaseObject
{
protected:

public:
	CObject(eSprite, const Vector2&);
	virtual ~CObject();

};