/// \file Game.cpp
/// \brief Code for the game class CGame.

#include "Game.h"

#include "GameDefines.h"
#include "SpriteRenderer.h"
#include "ComponentIncludes.h"
#include "shellapi.h"


/// Delete the sprite descriptor. The renderer needs to be deleted before this
/// destructor runs so it will be done elsewhere.

CGame::~CGame(){
    delete m_pObjectManager;
} //destructor

/// Create the renderer and the sprite descriptor load images and sounds, and
/// begin the game.

void CGame::Initialize(){
  m_pRenderer = new LSpriteRenderer(eSpriteMode::Batched2D); 
  m_pRenderer->Initialize(eSprite::Size); 
  LoadImages(); //load images from xml file list

  m_pObjectManager = new CObjectManager;
  LoadSounds(); //load the sounds for this game

  StartMenu();
} //Initialize

/// Load the specific images needed for this game. This is where `eSprite`
/// values from `GameDefines.h` get tied to the names of sprite tags in
/// `gamesettings.xml`. Those sprite tags contain the name of the corresponding
/// image file. If the image tag or the image file are missing, then the game
/// should abort from deeper in the Engine code leaving you with an error
/// message in a dialog box.

void CGame::LoadImages(){  
  m_pRenderer->BeginResourceUpload();

  m_pRenderer->Load(eSprite::Background, "background"); 
  m_pRenderer->Load(eSprite::TextWheel,  "textwheel"); 
  m_pRenderer->Load(eSprite::PIGSPRITE, "pig");
  m_pRenderer->Load(eSprite::healthBar, "healthBar");
  m_pRenderer->Load(eSprite::healthBarBackground, "healthBarBackground");
  m_pRenderer->Load(eSprite::testEnemy, "testEnemy");
  m_pRenderer->Load(eSprite::healthPickup, "healthPickup");
  m_pRenderer->Load(eSprite::maxHealthPickup, "maxHealthPickup");
  m_pRenderer->Load(eSprite::PlayerAttackSheet, "PlayerAttackSheet");
  m_pRenderer->Load(eSprite::PlayerAttack, "PlayerAttack");
  m_pRenderer->Load(eSprite::gold, "gold");
  m_pRenderer->Load(eSprite::explosion, "explosion");
  m_pRenderer->Load(eSprite::attackUp, "attackUp");
  m_pRenderer->Load(eSprite::attackSpeedUp, "attackSpeedUp");
  m_pRenderer->Load(eSprite::thornRoll, "thornRoll");
  m_pRenderer->Load(eSprite::lifeDrop, "lifeDrop");
  m_pRenderer->Load(eSprite::goldDrop, "goldDrop");
  m_pRenderer->Load(eSprite::backAttack, "backAttack");
  m_pRenderer->Load(eSprite::deathExplosion, "deathExplosion");
  m_pRenderer->Load(eSprite::damageShield, "damageShield");
  m_pRenderer->Load(eSprite::digit0, "digit0");
  m_pRenderer->Load(eSprite::digit1, "digit1");
  m_pRenderer->Load(eSprite::digit2, "digit2");
  m_pRenderer->Load(eSprite::digit3, "digit3");
  m_pRenderer->Load(eSprite::digit4, "digit4");
  m_pRenderer->Load(eSprite::digit5, "digit5");
  m_pRenderer->Load(eSprite::digit6, "digit6");
  m_pRenderer->Load(eSprite::digit7, "digit7");
  m_pRenderer->Load(eSprite::digit8, "digit8");
  m_pRenderer->Load(eSprite::digit9, "digit9");
  m_pRenderer->Load(eSprite::InuitIdleLeftSheet, "InuitIdleLeftSheet");
  m_pRenderer->Load(eSprite::InuitIdleLeft, "InuitIdleLeft");
  m_pRenderer->Load(eSprite::InuitIdleRightSheet, "InuitIdleRightSheet");
  m_pRenderer->Load(eSprite::InuitIdleRight, "InuitIdleRight");
  m_pRenderer->Load(eSprite::InuitIdleUpSheet, "InuitIdleUpSheet");
  m_pRenderer->Load(eSprite::InuitIdleUp, "InuitIdleUp");
  m_pRenderer->Load(eSprite::InuitIdleDownSheet, "InuitIdleDownSheet");
  m_pRenderer->Load(eSprite::InuitIdleDown, "InuitIdleDown");
  m_pRenderer->Load(eSprite::InuitRunLeftSheet, "InuitRunLeftSheet");
  m_pRenderer->Load(eSprite::InuitRunLeft, "InuitRunLeft");
  m_pRenderer->Load(eSprite::InuitRunRightSheet, "InuitRunRightSheet");
  m_pRenderer->Load(eSprite::InuitRunRight, "InuitRunRight");
  m_pRenderer->Load(eSprite::InuitRunUpSheet, "InuitRunUpSheet");
  m_pRenderer->Load(eSprite::InuitRunUp, "InuitRunUp");
  m_pRenderer->Load(eSprite::InuitRunDownSheet, "InuitRunDownSheet");
  m_pRenderer->Load(eSprite::InuitRunDown, "InuitRunDown");
  m_pRenderer->Load(eSprite::InuitRollSheet, "InuitRollSheet");
  m_pRenderer->Load(eSprite::InuitRoll, "InuitRoll");
  m_pRenderer->Load(eSprite::TileSheet, "TileSheet");
  m_pRenderer->Load(eSprite::Tiles, "Tiles");
  m_pRenderer->Load(eSprite::MapSheet, "MapSheet");
  m_pRenderer->Load(eSprite::MapRoom, "MapRoom");
  m_pRenderer->Load(eSprite::Connection, "Connection");
  m_pRenderer->Load(eSprite::StartButton0, "StartButton0");
  m_pRenderer->Load(eSprite::StartButton1, "StartButton1");
  m_pRenderer->Load(eSprite::ExitButton0, "ExitButton0");
  m_pRenderer->Load(eSprite::ExitButton1, "ExitButton1");


  m_pRenderer->EndResourceUpload();
} //LoadImages

/// Initialize the audio player and load game sounds.

void CGame::LoadSounds(){
  m_pAudio->Initialize(eSound::Size);
  m_pAudio->Load(eSound::Grunt, "grunt");
  m_pAudio->Load(eSound::Clang, "clang");
  m_pAudio->Load(eSound::OINK, "oink");
} //LoadSounds

/// Release all of the DirectX12 objects by deleting the renderer.

void CGame::Release(){
  delete m_pRenderer;
  m_pRenderer = nullptr; //for safety
} //Release

//create the main menu
void CGame::StartMenu() {
    m_pObjectManager->clear();

    gameState = 0;
    currentButton = 0;

    m_pObjectManager->create(eSprite::Background, m_vWinCenter);
    m_pObjectManager->create(eSprite::StartButton0, Vector2(700, 500.0f));
    m_pObjectManager->create(eSprite::ExitButton0, Vector2(700, 200.0f));

}

//handle keyboard input in the main menu
void CGame::MenuUpdate() {
    m_pKeyboard->GetState();

    if (m_pKeyboard->TriggerDown('W')) {
        if (currentButton == 1) {
            currentButton = 0;
            m_pObjectManager->create(eSprite::StartButton1, Vector2(700, 500.0f));
            m_pObjectManager->create(eSprite::ExitButton0, Vector2(700, 200.0f));
        }
    }

    if (m_pKeyboard->TriggerDown('S')) {
        if (currentButton == 0) {
            currentButton = 1;
            m_pObjectManager->create(eSprite::ExitButton1, Vector2(700, 200.0f));
            m_pObjectManager->create(eSprite::StartButton0, Vector2(700, 500.0f));
        }
    }
    
    if (m_pKeyboard->TriggerDown('J')) {
        if (currentButton == 0) {
            BeginGame();
        }
        else if (currentButton == 1) {
            //ADD COMMAND TO CLOSE GAME
        }
    }

    
}
/// Call this function to start a new game. This should be re-entrant so that
/// you can restart a new game without having to shut down and restart the
/// program.

void CGame::BeginGame(){  
    m_pObjectManager->clear();  //clear old objects

    gameState = 1;
    m_pRoom = new CRoom(64, m_pRenderer);

    m_Graph.newGraph();
	m_Graph.assignScreenPositions(m_vWinCenter, 96.f);
	m_pRoom->LoadRoom(m_Graph.nodes.at(0));
    

    CreateObjects(); //create new objects
    mHud = new HUD(m_pRenderer, m_pPlayer);
} //BeginGame


//create objects
void CGame::CreateObjects() {
    const float h = m_pRenderer->GetHeight(eSprite::InuitIdleRight);
    m_pPlayer = (CPlayer*)m_pObjectManager->create(eSprite::InuitIdleRight,
        Vector2(100.0f, h / 2.0f));
    m_pPlayer->SetRoom(m_pRoom);
	m_pPlayer->SetCurrentNode(m_Graph.nodes.at(0));
    //m_pObjectManager->create(eSprite::testEnemy, Vector2(1000.0f, 300.0f));
    //m_pObjectManager->create(eSprite::maxHealthPickup, Vector2(200.0f, 300.0f));
    //m_pObjectManager->create(eSprite::lifeDrop, Vector2(400.0f, 300.0f));
    //m_pObjectManager->create(eSprite::goldDrop, Vector2(600.0f, 300.0f));

}

/// Poll the keyboard state and respond to the key presses that happened since
/// the last frame.

void CGame::KeyboardHandler() {
    m_pKeyboard->GetState(); //get current keyboard state 

    if (m_pKeyboard->TriggerDown('L') && m_pPlayer->getAttackCooldown() <= 0.0f) {
        m_pPlayer->changeAttackState(true);
        if(m_pPlayer->getBackAttack() == true){
            switch (m_pPlayer->getDirection()) {
            case 0:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, 200.0f));
                break;
            case 1:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(200.0f, 0.0f));
                break;
            case 2:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, -200.0f));
                break;
            case 3:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(-200.0f, 0.0f));
                break;
            default:
                break;
            }
            switch (m_pPlayer->getDirection()) {
            case 0:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, -200.0f));
                break;
            case 1:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(-200.0f, 0.0f));
                break;
            case 2:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, 200.0f));
                break;
            case 3:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(200.0f, 0.0f));
                break;
            default:
                break;
            }
        }
        else {
            switch (m_pPlayer->getDirection()) {
            case 0:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, 200.0f));
                break;
            case 1:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(200.0f, 0.0f));
                break;
            case 2:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(0.0f, -200.0f));
                break;
            case 3:
                m_pObjectManager->create(eSprite::PlayerAttack, m_pPlayer->m_vPos + Vector2(-200.0f, 0.0f));
                break;
            default:
                break;
            }
        }

    }

    if (m_pKeyboard->TriggerDown('O'))
        m_pPlayer->changeHealth(-1.0);

    if (m_pKeyboard->TriggerDown('P'))
        m_bDrawGraph = !m_bDrawGraph;//draw the graph for debugging

    if (m_pKeyboard->TriggerDown(VK_F1)) //help
        ShellExecute(0, 0, "https://larc.unt.edu/code/physics/blank/", 0, 0, SW_SHOW);

    if (m_pKeyboard->TriggerDown(VK_F2)) //toggle frame rate 
        m_bDrawFrameRate = !m_bDrawFrameRate;

    if (m_pKeyboard->TriggerDown(VK_SPACE)) //play sound
        m_pAudio->play(eSound::Clang);

    if (m_pKeyboard->TriggerUp(VK_SPACE)) //play sound
        m_pAudio->play(eSound::Grunt);

    if (m_pKeyboard->TriggerDown(VK_BACK)) //restart game
        StartMenu(); //restart game

} //KeyboardHandler

/// Draw the current frame rate to a hard-coded position in the window.
/// The frame rate will be drawn in a hard-coded position using the font
/// specified in gamesettings.xml.

void CGame::DrawFrameRateText(){
  const std::string s = std::to_string(m_pTimer->GetFPS()) + " fps"; //frame rate
  const Vector2 pos(m_nWinWidth - 128.0f, 30.0f); //hard-coded position
  m_pRenderer->DrawScreenText(s.c_str(), pos); //draw to screen
} //DrawFrameRateText

/// Draw the game objects. The renderer is notified of the start and end of the
/// frame so that it can let Direct3D do its pipelining jiggery-pokery.

void CGame::RenderFrame(){
  m_pRenderer->BeginFrame(); //required before rendering
  if (gameState == 0) {

  } else if (gameState == 1) {
  m_pRenderer->Draw(eSprite::Background, m_vWinCenter); //draw start level background [current: stone level]
  m_pRoom->Draw(eSprite::Tiles, m_pPlayer); //draw the room tiles
  if (m_bDrawGraph)
    m_Graph.DrawGraph(m_pRenderer, m_pPlayer->GetCurrentNode());
  mHud->Render();
  }

  m_pObjectManager->draw(); //draw objects
  if(m_bDrawFrameRate)DrawFrameRateText(); //draw frame rate, if required

  float deltaTime = m_pTimer->GetFrameTime();
  m_pObjectManager->update(deltaTime);
  m_pRenderer->EndFrame(); //required after rendering
} //RenderFrame

/// This function will be called regularly to process and render a frame
/// of animation, which involves the following. Handle keyboard input.
/// Notify the  audio player at the start of each frame so that it can prevent
/// multiple copies of a sound from starting on the same frame.  
/// Move the game objects. Render a frame of animation.

void CGame::ProcessFrame(){
    
    if (gameState == 0) {
        MenuUpdate();
    }
    else if (gameState==1) {
        ChangeRoom();
        KeyboardHandler(); //handle keyboard input

    }
    m_pAudio->BeginFrame(); //notify audio player that frame has begun
    m_pTimer->Tick([&]() { //all time-dependent function calls should go here
        //    const float t = m_pTimer->GetFrameTime(); //frame interval in seconds
        m_pObjectManager->move(); //move all objects
        });

  RenderFrame(); //render a frame of animation
} //ProcessFrame

void CGame::ChangeRoom() {
    if (!m_pPlayer || !m_pRoom) return;

    Node* currentNode = m_pPlayer->GetCurrentNode();
    if (!currentNode) return;

    Vector2 pos = m_pPlayer->m_vPos;
    int col = static_cast<int>(pos.x / m_pRoom->GetTileSize());
    int row = static_cast<int>(pos.y / m_pRoom->GetTileSize());

    for (Edge& edge : currentNode->adj) {
        int doorCol = col, doorRow = row;
        switch (edge.direction) {
        case NORTH: doorRow = 0; break;
        case SOUTH: doorRow = m_pRoom->GetHeight() - 1; break;
        case WEST:  doorCol = 0; break;
        case EAST:  doorCol = m_pRoom->GetWidth() - 1; break;
        }

        if (col == doorCol && row == doorRow) {
            // Change room
            m_pPlayer->SetCurrentNode(edge.to);
            m_pRoom->LoadRoom(edge.to);
            switch (edge.direction) {
            case NORTH: m_pPlayer->m_vPos = (Vector2(pos.x, (m_pRoom->GetHeight() - 2) * m_pRoom->GetTileSize())); break;
            case SOUTH: m_pPlayer->m_vPos = (Vector2(pos.x, m_pRoom->GetTileSize())); break;
            case WEST:  m_pPlayer->m_vPos = (Vector2((m_pRoom->GetWidth() - 2) * m_pRoom->GetTileSize(), pos.y)); break;
            case EAST:  m_pPlayer->m_vPos = (Vector2(m_pRoom->GetTileSize(), pos.y)); break;
            }
            return;
        }
    }
}//ChangeRoom