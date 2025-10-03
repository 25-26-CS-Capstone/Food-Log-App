#include "BaseObjectManager.h"
#include "Object.h"

class CObjectManager :
	public LBaseObjectManager<CObject>
{
private:

public:
	CObject* create(eSprite, const Vector2&);
};