/// \file TileManager.cpp
/// \brief Code for the tile manager CTileManager.

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

void CRoom::LoadMap(char* filename) {
    //m_vecTurrets.clear(); //clear turrets from previous level

    if (m_chMap != nullptr) { //unload any previous maps
        for (int i = 0; i < m_nHeight; i++)
            delete[] m_chMap[i];

        delete[] m_chMap;
    } //if

    FILE* input; //input file handle

    fopen_s(&input, filename, "rb"); //open the map file
    if (input == nullptr) //abort if it's missing
        ABORT("Map &s not found.", filename);

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
            if (w != m_nWidth && m_nWidth >= 0 && w != 0) //not the same length as the previous one
                ABORT("Line %d of map is not the same length as the previous one.", m_nHeight);
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

    for (int i = 0; i < m_nHeight; i++) {
        for (int j = 0; j < m_nWidth; j++) {
            m_chMap[i][j] = buffer[index]; //load character into map
            index++; //next index
        } //for
        while (buffer[index] == '\r' || buffer[index] == '\n')
            index++; //skip all end-of-line chars
    } //for

    //m_vWorldSize = Vector2((float)m_nWidth, (float)m_nHeight) * m_fTileSize;
    //MakeBoundingBoxes();

    delete[] buffer; //clean up

    OutputDebugStringA(("Width: " + std::to_string(m_nWidth) +
        " Height: " + std::to_string(m_nHeight) + "\n").c_str());


} //LoadMap

void CRoom::Draw(eSprite t) {
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


    LSpriteDesc2D desc; //sprite descriptor for tile
    desc.m_nSpriteIndex = static_cast<int>(t); //sprite index for tile


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
            switch (tile) { //select which frame of the tile sprite is to be drawn
            case 'F': desc.m_nCurrentFrame = 3; break; //floor
            case 'W': desc.m_nCurrentFrame = 0; break; //wall
            default:  continue; //skip empty/unknown
            } //switch

            if (desc.m_nCurrentFrame < 0 || desc.m_nCurrentFrame >= 6) continue; //guard

            desc.m_vPos.x = offsetX + (j + 0.5f) * m_fTileSize;
            desc.m_vPos.y = offsetY + (m_nHeight - 1 - i + 0.5f) * m_fTileSize;

            if (desc.m_nSpriteIndex >= static_cast<int>(eSprite::Size)) {
                OutputDebugStringA("Invalid sprite index! Tiles out of range.\n");
                return;
            }
            m_pRenderer->Draw(&desc); //finally we can draw a tile
        } //for
    } //for
} //Draw