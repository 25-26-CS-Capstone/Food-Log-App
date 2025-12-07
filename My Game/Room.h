/// \file Room.h
/// \brief Interface for the Tile manager CRoom.
#ifndef __L4RC_GAME_ROOM_H__
#define __L4RC_GAME_ROOM_H__


#pragma once

#include <vector>

#include "Common.h"
#include "Settings.h"
#include "Sprite.h"
#include "GameDefines.h"
#include "GraphGen.h"
#include "Player.h"

class CRoom : public CCommon, public LSettings
{
private:
    int m_nWidth = 0; ///< Number of tiles wide.
    int m_nHeight = 0; ///< Number of tiles high.
    int m_nCurrentType = -1; ///< Current room type/id (from Node::getType()).

    float m_fTileSize; ///< tile width and height.
    Vector2 m_vTileRadius; ///< til radius.

    char** m_chMap = nullptr; ///< The level map.
    std::vector<Vector2> m_vecEnemySpawns; ///< Enemy spawn positions in world space.

    LSpriteRenderer* m_pRenderer = nullptr;

    //vector<BoundingBox> m_vecWalls; ///< AABBs for the walls.
    //vector<Vector2> m_vecTurrets; ///< Positions of turrets.

    //void MakeBoundingBoxes(); ///< Make bounding boxes for walls.

public:
    CRoom(size_t tilesize, LSpriteRenderer* pRenderer); ///< Constructor.
    ~CRoom(); ///< Destructor.

    void LoadMap(const char* filename); ///< Load a map.
    char GetTileAt(const Vector2& position) const;
    void LoadRoom(Node* node); ///< Load a room.

    void Draw(eSprite t, CPlayer* m_pPlayer); ///< Draw the map with a given Tile.
    void DrawDoors(eSprite t, Node* node);

	int GetWidth() const { return m_nWidth; } ///< Get width in tiles.
	int GetHeight() const { return m_nHeight; } ///< Get height in tiles.
	int GetTileSize() const { return (int)m_fTileSize; } ///< Get tile size.
    const std::vector<Vector2>& GetEnemySpawns() const { return m_vecEnemySpawns; } ///< Get enemy spawn positions.
    int GetCurrentRoomType() const { return m_nCurrentType; }

    //void DrawBoundingBoxes(eSprite t); ///< Draw the bounding boxes.

    //bool Visible(const Vector2& v0, const Vector2& v1, float radius); ///< Check visibility.

    //template<class t> bool CollideWithWall(const t& s); ///< Check object collision with a wall.

    //void LoadMapFromImageFile(char* filename); ///< Load map.
}; //CRoom

#endif