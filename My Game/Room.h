/// \file Room.h
/// \brief Interface for the Tile manager CRoom.

#pragma once

#include <vector>

using namespace std;

#include "Common.h"
#include "Settings.h"
#include "Sprite.h"
#include "GameDefines.h"

class CRoom : public CCommon, public LSettings
{
private:
    int m_nWidth = 0; ///< Number of tiles wide.
    int m_nHeight = 0; ///< Number of tiles high.

    float m_fTileSize; ///< tile width and height.
    Vector2 m_vTileRadius; ///< til radius.

    char** m_chMap = nullptr; ///< The level map.

    LSpriteRenderer* m_pRenderer = nullptr;

    //vector<BoundingBox> m_vecWalls; ///< AABBs for the walls.
    //vector<Vector2> m_vecTurrets; ///< Positions of turrets.

    //void MakeBoundingBoxes(); ///< Make bounding boxes for walls.

public:
    CRoom(size_t tilesize, LSpriteRenderer* pRenderer); ///< Constructor.
    ~CRoom(); ///< Destructor.

    void LoadMap(char* filename); ///< Load a map.
    void Draw(eSprite t); ///< Draw the map with a given Tile.
    void DrawBoundingBoxes(eSprite t); ///< Draw the bounding boxes.

    bool Visible(const Vector2& v0, const Vector2& v1, float radius); ///< Check visibility.

    //template<class t> bool CollideWithWall(const t& s); ///< Check object collision with a wall.

    void LoadMapFromImageFile(char* filename); ///< Load map.
}; //CRoom