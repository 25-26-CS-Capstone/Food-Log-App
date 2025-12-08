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
<<<<<<< HEAD
    // Ice bat sprites
    m_pRenderer->Load(eSprite::IceBatFlap64Sheet, "IceBatFlap64Sheet");
    m_pRenderer->Load(eSprite::IceBatFlap, "IceBatFlap");
    m_pRenderer->Load(eSprite::IceBatAttackFlap, "IceBatAttackFlap");
    m_pRenderer->Load(eSprite::IceBatProjectile, "IceBatProjectile");
    // Ice bear sprites (boss) - all 9 frames for animation
    m_pRenderer->Load(eSprite::IceBear0, "IceBear0");
    m_pRenderer->Load(eSprite::IceBear1, "IceBear1");
    m_pRenderer->Load(eSprite::IceBear2, "IceBear2");
    m_pRenderer->Load(eSprite::IceBear3, "IceBear3");
    m_pRenderer->Load(eSprite::IceBear4, "IceBear4");
    m_pRenderer->Load(eSprite::IceBear5, "IceBear5");
    m_pRenderer->Load(eSprite::IceBear6, "IceBear6");
    m_pRenderer->Load(eSprite::IceBear7, "IceBear7");
    m_pRenderer->Load(eSprite::IceBear8, "IceBear8");
    m_pRenderer->Load(eSprite::IceBearInactive128, "IceBearInactive128");
    m_pRenderer->Load(eSprite::IceBearActive128, "IceBearActive128");
=======
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
  m_pRenderer->Load(eSprite::StartButton0, "StartButton0");
  m_pRenderer->Load(eSprite::StartButton1, "StartButton1");
  m_pRenderer->Load(eSprite::ExitButton0, "ExitButton0");
  m_pRenderer->Load(eSprite::ExitButton1, "ExitButton1");


  m_pRenderer->EndResourceUpload();
} //LoadImages

/// Initialize the audio player and load game sounds.

void CGame::LoadSounds(){
  // Audio disabled for now
  //m_pAudio->Initialize(eSound::Size);
  //m_pAudio->Load(eSound::Grunt, "grunt");
  //m_pAudio->Load(eSound::Clang, "clang");
  //m_pAudio->Load(eSound::OINK, "oink");
} //LoadSounds

/// Release all of the DirectX12 objects by deleting the renderer.

void CGame::Release(){
  delete m_pRenderer;
  m_pRenderer = nullptr; //for safety
} //Release

//create the main menu
void CGame::StartMenu() {
<<<<<<< HEAD
    // Menu disabled - start game directly
    BeginGame();
=======
    m_pObjectManager->clear();

    gameState = 0;
    currentButton = 0;

    m_pObjectManager->create(eSprite::Background, m_vWinCenter);
    m_pObjectManager->create(eSprite::StartButton0, Vector2(700, 500.0f));
    m_pObjectManager->create(eSprite::ExitButton0, Vector2(700, 200.0f));

>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
}

//handle keyboard input in the main menu
void CGame::MenuUpdate() {
<<<<<<< HEAD
    // Menu disabled
=======
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

    
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
}
/// Call this function to start a new game. This should be re-entrant so that
/// you can restart a new game without having to shut down and restart the
/// program.

void CGame::BeginGame(){  
    m_pObjectManager->clear();  //clear old objects
    createItemList();

    gameState = 1;
    m_pRoom = new CRoom(64, m_pRenderer);

    m_Graph.newGraph();
	m_Graph.assignScreenPositions(Vector2(m_nWinWidth/2.0f, m_nWinHeight/2.0f), 96.f);
	m_pRoom->LoadRoom(m_Graph.nodes.at(0));
    m_Graph.nodes.at(0)->setVisited(true); // Mark starting room as visited
    m_Graph.nodes.at(0)->SetCleared(true); // Mark starting room as cleared
    
    // Mark shop and item rooms as cleared (no enemies spawn there)
    // Note: Boss room (999) is NOT marked cleared so the boss spawns
    for (Node* node : m_Graph.nodes) {
        int roomType = node->getType();
        if (roomType == 997 || roomType == 998) {
            node->SetCleared(true);
        }
    }

    CreateObjects(); //create new objects
    mHud = new HUD(m_pRenderer, m_pPlayer);
} //BeginGame


//create objects
void CGame::CreateObjects() {
    const float h = m_pRenderer->GetHeight(eSprite::InuitIdleRight);
    m_pPlayer = (CPlayer*)m_pObjectManager->create(eSprite::InuitIdleRight,
        Vector2(300.0f, 300.0f));
    m_pPlayer->SetRoom(m_pRoom);
	m_pPlayer->SetCurrentNode(m_Graph.nodes.at(0));
    m_pObjectManager->SetPlayer(m_pPlayer);  // Set player on ObjectManager for projectile tracking
    //m_pObjectManager->create(eSprite::testEnemy, Vector2(1000.0f, 300.0f));
    //m_pObjectManager->create(eSprite::maxHealthPickup, Vector2(200.0f, 300.0f));
    //m_pObjectManager->create(eSprite::lifeDrop, Vector2(400.0f, 300.0f));
    //m_pObjectManager->create(eSprite::goldDrop, Vector2(600.0f, 300.0f));
    
    SpawnEnemies(); // Spawn enemies for the starting room
}

/// Spawn enemies for the current room. For now, drop a single ice bat in the room center
/// with a simple left-right patrol so we always have at least one enemy when entering.
void CGame::SpawnEnemies() {
    if (!m_pRoom || !m_pObjectManager || !m_pPlayer) return;

    Node* node = m_pPlayer->GetCurrentNode();
    if (!node) return;
    
    // Don't spawn enemies if room has been cleared already
    if (node->GetCleared()) {
        m_nEnemyCount = 0;
        m_bRoomCleared = true;
        m_bItemsSpawned = true;
        return;
    }

    const float tile = static_cast<float>(m_pRoom->GetTileSize());
    const float w = static_cast<float>(m_pRoom->GetWidth());
    const float h = static_cast<float>(m_pRoom->GetHeight());

    const int roomType = node->getType();

    // Boss room (type 999): spawn one Ice Bear only
    if (roomType == 999) {
        Vector2 center(w * 0.5f * tile, h * 0.5f * tile);
        m_pObjectManager->spawnIceBear(center);
        m_nEnemyCount = 1;
        m_bRoomCleared = false;
        m_bItemsSpawned = false;
        return;
    }

    // Regular rooms: spawn 3–4 bats
    int batCount = 3 + (rand() % 2);  // 3 or 4
    for (int i = 0; i < batCount; i++) {
        float xOffset = (i % 2 == 0) ? -200.0f : 200.0f;
        float yOffset = ((i / 2) % 2 == 0) ? -80.0f : 80.0f;

        Vector2 center(w * 0.5f * tile + xOffset, h * 0.5f * tile + yOffset);
        Vector2 patrolOffset(120.0f, 0.0f);
        Vector2 patrolStart = center + patrolOffset;
        Vector2 patrolEnd = center - patrolOffset;

        m_pObjectManager->spawnIceBat(center, patrolStart, patrolEnd);
    }

    m_nEnemyCount = batCount;
    m_bRoomCleared = false;
    m_bItemsSpawned = false;
} // SpawnEnemies

/// Check if all enemies have been defeated and spawn items.
void CGame::CheckRoomCleared() {
    if (m_bRoomCleared || m_bItemsSpawned) return;
    
    const int currentEnemies = m_pObjectManager->countEnemies();
    if (currentEnemies == 0 && m_nEnemyCount > 0) {
        m_bRoomCleared = true;
        m_pPlayer->GetCurrentNode()->SetCleared(true); // Mark node as cleared
        SpawnRandomItems();
        m_bItemsSpawned = true;
    }
}

/// Spawn 1-3 random reward items near room center.
void CGame::SpawnRandomItems() {
    // Don't spawn items in boss, shop, or loot rooms
    int roomType = m_pPlayer->GetCurrentNode()->getType();
    if (roomType == 999 || roomType == 997 || roomType == 998) {
        return;
    }
    
    std::random_device rd;
    std::mt19937 rng(rd());
    std::uniform_int_distribution<int> countDist(1, 3);
    const int itemCount = countDist(rng);
    
    // Weighted item pool (common items duplicated for higher chance)
    std::vector<eSprite> itemPool = {
        eSprite::healthPickup, eSprite::healthPickup, eSprite::healthPickup,
        eSprite::gold, eSprite::gold, eSprite::gold,
        eSprite::maxHealthPickup,
        eSprite::attackUp,
        eSprite::attackSpeedUp,
        eSprite::thornRoll,
        eSprite::lifeDrop,
        eSprite::goldDrop,
        eSprite::backAttack,
        eSprite::deathExplosion,
        eSprite::damageShield
    };
    
    std::uniform_int_distribution<size_t> itemDist(0, itemPool.size() - 1);
    std::uniform_real_distribution<float> offsetDist(-80.0f, 80.0f);
    
    Vector2 centerPos = m_vWinCenter;
    
    for (int i = 0; i < itemCount; i++) {
        eSprite item = itemPool[itemDist(rng)];
        Vector2 spawnPos = centerPos + Vector2(offsetDist(rng), offsetDist(rng));
        m_pObjectManager->create(item, spawnPos);
    }
}

/// Poll the keyboard state and respond to the key presses that happened since
/// the last frame.

void CGame::KeyboardHandler() {
    // Keyboard disabled for now - player movement handled in Player.cpp
    /*
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

    if (m_pKeyboard->TriggerDown('K'))
		m_pPlayer->GetCurrentNode()->SetCleared(!m_pPlayer->GetCurrentNode()->GetCleared()); //Invert Cleared

    if (m_pKeyboard->TriggerDown(VK_F1)) //help
        ShellExecute(0, 0, "https://larc.unt.edu/code/physics/blank/", 0, 0, SW_SHOW);

    if (m_pKeyboard->TriggerDown(VK_F2)) //toggle frame rate 
        m_bDrawFrameRate = !m_bDrawFrameRate;

    // Audio/keyboard temporarily disabled
    /*
    if (m_pKeyboard->TriggerDown(VK_SPACE)) //play sound
        m_pAudio->play(eSound::Clang);

    if (m_pKeyboard->TriggerUp(VK_SPACE)) //play sound
        m_pAudio->play(eSound::Grunt);

    if (m_pKeyboard->TriggerDown(VK_BACK)) //restart game
        StartMenu(); //restart game
<<<<<<< HEAD
    */
=======
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272

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
<<<<<<< HEAD
    // m_pAudio->BeginFrame(); //notify audio player that frame has begun (disabled)
=======
    m_pAudio->BeginFrame(); //notify audio player that frame has begun
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
    m_pTimer->Tick([&]() { //all time-dependent function calls should go here
        //    const float t = m_pTimer->GetFrameTime(); //frame interval in seconds
        m_pObjectManager->move(); //move all objects
        });
<<<<<<< HEAD
    
    CheckRoomCleared(); //check if enemies defeated and spawn items
=======
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272

  RenderFrame(); //render a frame of animation
} //ProcessFrame

void CGame::ChangeRoom() {
    if (!m_pPlayer || !m_pRoom) return;

    Node* currentNode = m_pPlayer->GetCurrentNode();
    if (!currentNode) return;

    if (!m_pPlayer->GetCurrentNode()->GetCleared()) return;

    Vector2 pos = m_pPlayer->m_vPos;
    int col = static_cast<int>(pos.x / m_pRoom->GetTileSize());
    int row = static_cast<int>(pos.y / m_pRoom->GetTileSize());

    int centerCol = m_pRoom->GetWidth() / 2;
    int centerRow = m_pRoom->GetHeight() / 2;
    int doorCol = -1, doorRow = -1;

    for (Edge& edge : currentNode->adj) {
        int doorCol = col, doorRow = row;
        switch (edge.direction) {
        case NORTH: doorCol = centerCol; doorRow = 0; break;
        case SOUTH: doorCol = centerCol; doorRow = m_pRoom->GetHeight() - 1; break;
        case WEST:  doorCol = 0; doorRow = centerRow; break;
        case EAST:  doorCol = m_pRoom->GetWidth() - 1; doorRow = centerRow; break;
        }

        if (col == doorCol && row == doorRow) {
            // Change room
<<<<<<< HEAD
            m_pObjectManager->clearEnemies(); // Clear enemies from previous room
=======
            m_pObjectManager->deleteShopItems();
>>>>>>> 1d0061ddd5bea79aeaf7bc01908a98d800e2a272
            m_pPlayer->SetCurrentNode(edge.to);
            m_pRoom->LoadRoom(edge.to);
            if (m_pPlayer->GetCurrentNode()->getVisited() == false) {
                if (m_pPlayer->GetCurrentNode()->getType() == 998) {
                    default_random_engine rng(chrono::system_clock::now().time_since_epoch().count());
                    mt19937 generator(rng);
                    uniform_int_distribution<> distribution(1, 5);
                    int randNum = distribution(generator);
                    spawnCommonItem(Vector2(400.0f, 380.0f), true, randNum);
                    randNum = distribution(generator);
                    spawnCommonItem(Vector2(700.0f, 380.0f), true, randNum);
                    uniform_int_distribution<> distribution2(5, 10);
                    randNum = distribution2(generator);
                    spawnRareItem(Vector2(1000.0f, 380.0f), true, randNum);
                }
                else if (m_pPlayer->GetCurrentNode()->getType() == 997) {
                    spawnRareItem(Vector2(700.0f, 380.0f), false, 0);
                }
            }
            m_pPlayer->GetCurrentNode()->changeVisited(true);
            switch (edge.direction) {
            case NORTH: m_pPlayer->m_vPos = (Vector2(pos.x, (m_pRoom->GetHeight() - 2) * m_pRoom->GetTileSize())); break;
            case SOUTH: m_pPlayer->m_vPos = (Vector2(pos.x, m_pRoom->GetTileSize())); break;
            case WEST:  m_pPlayer->m_vPos = (Vector2((m_pRoom->GetWidth() - 2) * m_pRoom->GetTileSize() + 50.0f, pos.y)); break;
            case EAST:  m_pPlayer->m_vPos = (Vector2(2*m_pRoom->GetTileSize() + 50.0f, pos.y)); break;
            }
            SpawnEnemies(); // Spawn enemies for new room
            
            // Spawn items in the room on first visit
            if (!edge.to->isVisited()) {
                edge.to->setVisited(true);
                SpawnRandomItems();
            }
            return;
        }
    }
}//ChangeRoom

void CGame::createItemList() {
    default_random_engine rng(chrono::system_clock::now().time_since_epoch().count());
    shuffle(rareItemList.begin(), rareItemList.end(), rng);
}

void CGame::spawnRareItem(Vector2 pos, bool shop, int price) {
    
    
    switch (rareItemList[itemListPos]) {
    case 1:
        m_pObjectManager->create(eSprite::thornRoll, pos, shop, price);
        break;
    case 2:
        m_pObjectManager->create(eSprite::lifeDrop, pos, shop, price);
        break;
    case 3:
        m_pObjectManager->create(eSprite::goldDrop, pos, shop, price);
        break;
    case 4:
        m_pObjectManager->create(eSprite::backAttack, pos, shop, price);
        break;
    case 5:
        m_pObjectManager->create(eSprite::deathExplosion, pos, shop, price);
        break;
    case 6:
        m_pObjectManager->create(eSprite::damageShield, pos, shop, price);
        break;
    default:
        break;
    }
    itemListPos++;
}

void CGame::spawnCommonItem(Vector2 pos, bool shop, int price) {
    default_random_engine rng(chrono::system_clock::now().time_since_epoch().count());
    mt19937 generator(rng);
    uniform_int_distribution<> distribution(1, 100);
    int randNum = distribution(generator);
    if (randNum <= 10) {
        m_pObjectManager->create(eSprite::maxHealthPickup, pos, shop, price);
    }
    else if (randNum <= 40) {
        m_pObjectManager->create(eSprite::healthPickup, pos, shop, price);
    }
    else if (randNum <= 90) {
        m_pObjectManager->create(eSprite::gold, pos, shop, price);
    }
    else if (randNum <= 95) {
        m_pObjectManager->create(eSprite::attackUp, pos, shop, price);
    }
    else if (randNum <= 100) {
        m_pObjectManager->create(eSprite::attackSpeedUp, pos, shop, price);
    }
}

/*
Example of how to spawn items when room is cleared, can change depending on how we decide items should spawn:
    if(enemyCount == 0){
        spawnRareItem(Vector2(x, y), false, 0);
        spawnCommonItem(Vector2(x, y), false, 0);
    }

Example of how to spawn items for a shop:
    if(room == shop){
        default_random_engine rng(chrono::system_clock::now().time_since_epoch().count());
        mt19937 generator(rng);
        uniform_int_distribution<> distribution(1, 5);
        int randNum = distribution(generator);
        spawnCommonItem(Vector2(x, y), true, randNum);
        randNum = distribution(generator);
        spawnCommonItem(Vector2(x, y), true, randNum);
        uniform_int_distribution<> distribution2(5, 10);
        randNum = distribution2(generator);
        spawnRareItem(Vector2(x, y), true, randNum);
*/