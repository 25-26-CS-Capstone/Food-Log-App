/// \file Room.cpp
/// \brief Code for the tile manager CRoom.

#include "Room.h"
#include "SpriteRenderer.h"
#include "Abort.h"

CRoom::CRoom(size_t tilesize, LSpriteRenderer* pRenderer) :
    m_fTileSize((float)tilesize),
    m_vTileRadius(Vector2(m_fTileSize, m_fTileSize) / 2),
    m_pRenderer(pRenderer)
{
} //constructor

/// Delete the memory used for storing the map.
CRoom::~CRoom() {
	for (int i = 0; i < m_nHeight; i++)
		delete[] m_chMap[i];

	delete[] m_chMap;
} //destructor

///< Load a room.
void CRoom::LoadRoom(Node* node) {
    m_nCurrentType = node ? node->getType() : -1;
    std::string mapPath = "Media\\Maps\\Room" + std::to_string(m_nCurrentType) + ".txt";
	LoadMap(mapPath.data());

} //LoadRoom

void CRoom::LoadMap(const char* filename) {
    //m_vecTurrets.clear(); //clear turrets from previous level
    m_vecEnemySpawns.clear(); // Clear previous spawn points

    if (m_chMap != nullptr) { //unload any previous maps
        for (int i = 0; i < m_nHeight; i++)
            delete[] m_chMap[i];

        delete[] m_chMap;
    } //if

    FILE* input; //input file handle

    fopen_s(&input, filename, "rb"); //open the map file
    if (input == nullptr) //abort if it's missing
        ABORT("Map %s not found.", filename);

    //read map file into a character buffer 

    fseek(input, 0, SEEK_END); //seek to end of map file
    const int n = ftell(input); //get file size in bytes
    rewind(input); //seek to start of file

    char* buffer = new char[n + 1]; //temporary character buffer
    fread(buffer, n, 1, input); //read the whole thing in a chunk
    fclose(input); //close the map file, we're done with it

    //get map width and height into m_nWidth and m_nHeight

    m_nWidth = -1;
    m_nHeight = 0;
    int w = 0; //width of current row

    for (int i = 0; i < n; i++) {

        if (buffer[i] == '\r') continue;
        if (buffer[i] != '\n')
            w++; //skip characters until the end of line
        else {
            if (w == 0)ABORT("Panic!");
            if (w != m_nWidth && m_nWidth >= 0 && w != 0) { //not the same length as the previous one
                std::string msg = "Line " + std::to_string(m_nHeight) + " of map is not the same length as the previous one.";
                ABORT(msg.c_str());
            }
            m_nWidth = w; w = 0; m_nHeight++; //next line
        } //else
    } //for

    if (w > 0) {
        if (m_nWidth != -1 && w != m_nWidth)
            ABORT("Last line of map is not the same length as previous ones.");
        m_nWidth = w;
        m_nHeight++;
    }//add last line

    //m_nWidth--;
    //m_nHeight++; 

    //allocate space for the map 

    m_chMap = new char* [m_nHeight];

    for (int i = 0; i < m_nHeight; i++)
        m_chMap[i] = new char[m_nWidth];

    //load the map information from the buffer to the map

    int index = 0; //index into character buffer

    float offsetX = (m_nWinWidth - m_nWidth * m_fTileSize) / 2.0f;
    float offsetY = (m_nWinHeight - m_nHeight * m_fTileSize) / 2.0f;

    for (int i = 0; i < m_nHeight; i++) {
        for (int j = 0; j < m_nWidth; j++) {
            m_chMap[i][j] = buffer[index]; //load character into map
            
            // Check for enemy spawn marker 'E' and convert to world position
            if (buffer[index] == 'E') {
                float worldX = offsetX + (j + 0.5f) * m_fTileSize;
                float worldY = offsetY + (m_nHeight - 1 - i + 0.5f) * m_fTileSize;
                m_vecEnemySpawns.push_back(Vector2(worldX, worldY));
                // Replace 'E' with 'F' (floor) so it renders as floor
                m_chMap[i][j] = 'F';
            }
            
            index++; //next index
        } //for
        while (buffer[index] == '\r' || buffer[index] == '\n')
            index++; //skip all end-of-line chars
    } //for

    //m_vWorldSize = Vector2((float)m_nWidth, (float)m_nHeight) * m_fTileSize;
    //MakeBoundingBoxes();

    delete[] buffer; //clean up



} //LoadMap

char CRoom::GetTileAt(const Vector2& position) const {
    int col = static_cast<int>(position.x / m_fTileSize);
    int row = m_nHeight - 1 - static_cast<int>(position.y / m_fTileSize); // y-flip if needed

    if (row >= 0 && row < m_nHeight && col >= 0 && col < m_nWidth) {
        //OutputDebugStringA("m_chMap[row][col];");
        return m_chMap[row][col];
    }
    else
        return '\0'; // out of bounds
}

///Draw doors based on the node's edges.
void CRoom::DrawDoors(eSprite t, Node* node) {
    if (!node || !m_pRenderer) return;


    // Draw doors using simple renderer API
    float offsetX = (m_nWinWidth - m_nWidth * m_fTileSize) / 2.0f;
    float offsetY = (m_nWinHeight - m_nHeight * m_fTileSize) / 2.0f;

    const float centerCol = m_nWidth / 2.0f;
    const float centerRow = m_nHeight / 2.0f;

    // Convert tile index to screen position
    auto TileToWorld = [&](float col, float row) {
        float x = offsetX + (col + 0.5f) * m_fTileSize;
        float y = offsetY + (m_nHeight - 1 - row + 0.5f) * m_fTileSize;
        return Vector2(x, y);
        };

    for (const Edge& edge : node->adj) {
        Vector2 pos;
        switch (edge.direction) {
        case NORTH:
            pos = TileToWorld(centerCol, static_cast<float>(m_nHeight - 1));
            break;
        case EAST:
            pos = TileToWorld(static_cast<float>(m_nWidth - 1), centerRow);
            break;
        case SOUTH:
            pos = TileToWorld(centerCol, 0.0f);
            break;
        case WEST:
            pos = TileToWorld(0.0f, centerRow);
            break;
        default:
            continue;
        }
        m_pRenderer->Draw(t, pos);
    }
}//DrawDoors


void CRoom::Draw(eSprite t, CPlayer* m_pPlayer) {
    if (!m_chMap || m_nWidth <= 0 || m_nHeight <= 0 || !m_pRenderer)
        return;


    float offsetX = (m_nWinWidth - m_nWidth * m_fTileSize) / 2.0f;
    float offsetY = (m_nWinHeight - m_nHeight * m_fTileSize) / 2.0f;


    //diagnostic
    std::string firstRow;
    if (m_chMap && m_nHeight > 0 && m_chMap[0]) {
        for (int j = 0; j < m_nWidth; j++)
            firstRow.push_back(m_chMap[0][j]);
    }
    /*OutputDebugStringA(("Draw test -> Width: " + std::to_string(m_nWidth) +
        " Height: " + std::to_string(m_nHeight) + " First row: [" + firstRow + "]\n").c_str());
*/

    // draw tiles using renderer

    /*const int w = (int)ceil(m_nWinWidth / m_fTileSize) + 2; //width of window in tiles, with 2 extra
    const int h = (int)ceil(m_nWinHeight / m_fTileSize) + 2; //height of window in tiles, with 2 extra

    const Vector2 campos = m_pRenderer->GetCameraPos(); //camera position
    const Vector2 origin = campos + 0.5f * m_nWinWidth * Vector2(-1.0f, 1.0f); //position of top left corner of window

    const int top = max(0, m_nHeight - (int)round(origin.y / m_fTileSize) + 1); //index of top tile
    const int bottom = min(top + h + 1, m_nHeight - 1); //index of bottom tile

    const int left = max(0, (int)round(origin.x / m_fTileSize) - 1); //index of left tile
    const int right = min(left + w, m_nWidth - 1); //index of right tile
    */

    char tile;
    for (int i = 0; i < m_nHeight; i++) { //for each column
        if (m_chMap[i] == nullptr) continue;
        for (int j = 0; j < m_nWidth; j++) { //for each row
    
			tile = m_chMap[i][j];
            if (tile == '\0' || tile == ' ') continue;

            //diagnostic
            if (i < 0 || i >= m_nHeight || j < 0 || j >= m_nWidth) {
                OutputDebugStringA("Out-of-bounds index prevented.\n");
                continue;
            }
            // Compute position and draw tile sprite
            Vector2 pos;
            pos.x = offsetX + (j + 0.5f) * m_fTileSize;
            pos.y = offsetY + (m_nHeight - 1 - i + 0.5f) * m_fTileSize;
            m_pRenderer->Draw(t, pos);
        } //for
    } //for
    //OutputDebugStringA("About to call DrawDoors\n");
    DrawDoors(t, m_pPlayer->GetCurrentNode());
} //Draw