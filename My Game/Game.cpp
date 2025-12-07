/// \file Game.cpp
/// \brief Code for the game class CGame.

#include "Game.h"
#include <fstream>
#include <random>

#include "GameDefines.h"
#include "SpriteRenderer.h"
#include "Component.h"
#include "Timer.h"
#include "Keyboard.h"
#include "Audio.h"
#include "IceBat.h"
#include "shellapi.h"


/// Delete the sprite descriptor. The renderer needs to be deleted before this
/// destructor runs so it will be done elsewhere.

CGame::~CGame(){
    delete m_pObjectManager;
} //destructor

/// Create the renderer and the sprite descriptor load images and sounds, and
/// begin the game.

void CGame::Initialize(){
    std::ofstream log("startup.log", std::ios::out | std::ios::app);
    if (log) log << "Renderer allocation" << std::endl;
    m_pRenderer = new LSpriteRenderer(eSpriteMode::Batched2D); 
    if (log) log << "Renderer initialize begin" << std::endl;
    m_pRenderer->Initialize(eSprite::Size); 
    if (log) log << "Renderer initialize end" << std::endl;
    if (log) log << "LoadImages begin" << std::endl;
    LoadImages(); //load images from xml file list
    if (log) log << "LoadImages end" << std::endl;

    if (log) log << "ObjectManager create" << std::endl;
    m_pObjectManager = new CObjectManager;
    
    // Timer, Keyboard, and Audio are managed by the LARC engine
    // They will be provided through the game loop
    // m_pTimer is set by the window via Common::m_pTimer
    // m_pKeyboard and m_pAudio would be similarly provided
    
    if (log) log << "LoadSounds begin" << std::endl;
    LoadSounds(); //load the sounds for this game
    if (log) log << "LoadSounds end" << std::endl;
  
    if (log) log << "BeginGame" << std::endl;
    BeginGame();
    if (log) log << "Initialize complete" << std::endl;
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

    // IceBat sprites
    m_pRenderer->Load(eSprite::IceBatFlap64Sheet, "IceBatFlap64Sheet");
    m_pRenderer->Load(eSprite::IceBatFlap, "IceBatFlap");
    m_pRenderer->Load(eSprite::IceBatAttackFlap, "IceBatAttackFlap");
    // Projectiles
    m_pRenderer->Load(eSprite::IceBatProjectile, "IceBatProjectile");

  m_pRenderer->EndResourceUpload();
} //LoadImages

/// Initialize the audio player and load game sounds.

void CGame::LoadSounds(){
  // Audio system not yet integrated - stub removed
  // m_pAudio->Initialize(eSound::Size);
  // m_pAudio->Load(eSound::Grunt, "grunt");
  // m_pAudio->Load(eSound::Clang, "clang");
  // m_pAudio->Load(eSound::OINK, "oink");
} //LoadSounds

/// Release all of the DirectX12 objects by deleting the renderer.

void CGame::Release(){
  delete m_pRenderer;
  m_pRenderer = nullptr; //for safety
} //Release

/// Call this function to start a new game. This should be re-entrant so that
/// you can restart a new game without having to shut down and restart the
/// program.

void CGame::BeginGame(){  
    m_pObjectManager->clear();  //clear old objects

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

    // Spawn enemies based on room spawn markers
    SpawnEnemies();
}

/// Spawn enemies at the current room's spawn positions.
void CGame::SpawnEnemies() {
    if (m_pRoom) {
        const std::vector<Vector2>& spawns = m_pRoom->GetEnemySpawns();
        const int roomType = m_pRoom->GetCurrentRoomType();

        // Boss room: spawn zero bats (empty), normal rooms: 2–4 bats
        const bool isBoss = (roomType == 999);
        int minBats = isBoss ? 0 : 2;
        int maxBats = isBoss ? 0 : 4;

        // Clamp to available spawn markers
        if (maxBats > (int)spawns.size()) maxBats = (int)spawns.size();
        if (minBats > maxBats) minBats = maxBats;

        // Randomly choose number of bats within range
        // Deterministic option: seed RNG by room type for reproducible spawns
        std::mt19937 rng;
        if (m_bDeterministicSpawns) {
            rng.seed(static_cast<unsigned int>(roomType));
        } else {
            std::random_device rd; rng.seed(rd());
        }
        std::uniform_int_distribution<int> countDist(minBats, maxBats);
        const int batCount = countDist(rng);
        
        // Track enemy count for room cleared detection
        m_nEnemyCount = batCount;
        m_bRoomCleared = false;
        m_bItemsSpawned = false;

        // Randomly select spawn indices without repetition
        std::vector<int> indices(spawns.size());
        for (int i = 0; i < (int)spawns.size(); ++i) indices[i] = i;
        std::shuffle(indices.begin(), indices.end(), rng);

        // Spawn selected bats with varied patrol directions and randomized patrol length/speed
        for (int i = 0; i < batCount; ++i) {
            const Vector2& spawnPos = spawns[indices[i]];
            Vector2 patrolStart = spawnPos;
            Vector2 patrolEnd;

            // Random patrol length between 100 and 220 units
            std::uniform_real_distribution<float> lengthDist(100.0f, 220.0f);
            const float patrolLen = lengthDist(rng);

            switch (i % 4) {
                case 0: patrolEnd = spawnPos + Vector2(patrolLen, 0.0f); break;      // Right
                case 1: patrolEnd = spawnPos + Vector2(0.0f, patrolLen); break;      // Down
                case 2: patrolEnd = spawnPos + Vector2(-patrolLen, 0.0f); break;     // Left
                default: patrolEnd = spawnPos + Vector2(0.0f, -patrolLen); break;    // Up
            }

            // Create bat
            CIceBat* bat = m_pObjectManager->spawnIceBat(spawnPos, patrolStart, patrolEnd);

            // Randomize patrol and chase speeds (patrol 80-160, chase 140-220)
            std::uniform_real_distribution<float> patrolSpeedDist(80.0f, 160.0f);
            std::uniform_real_distribution<float> chaseSpeedDist(140.0f, 220.0f);
            const float patrolSpeed = patrolSpeedDist(rng);
            const float chaseSpeed = chaseSpeedDist(rng);
            
            // Randomize detection and shooting parameters
            std::uniform_real_distribution<float> detectDist(300.0f, 500.0f);   // detection range
            std::uniform_real_distribution<float> shootRangeDist(160.0f, 260.0f); // shoot range
            std::uniform_real_distribution<float> cooldownDist(0.6f, 1.4f);     // seconds between shots
            const float detectRange = detectDist(rng);
            const float shootRange = shootRangeDist(rng);
            const float shootCooldown = cooldownDist(rng);

            // Configure bat speeds if available
            if (bat) {
                bat->SetPatrolSpeed(patrolSpeed);
                bat->SetChaseSpeed(chaseSpeed);
                bat->SetDetectionRange(detectRange);
                bat->SetShootRange(shootRange);
                bat->SetShootCooldown(shootCooldown);
            }
        }
    }
}

/// Check if all enemies in the room are defeated and spawn reward items.
void CGame::CheckRoomCleared() {
    // Skip if already cleared and items spawned
    if (m_bRoomCleared && m_bItemsSpawned) return;
    
    // Count current enemies
    const int currentEnemies = m_pObjectManager->countEnemies();
    
    // Room is cleared when no enemies remain (and we had spawned some initially)
    if (currentEnemies == 0 && m_nEnemyCount > 0) {
        if (!m_bRoomCleared) {
            m_bRoomCleared = true;
            // Spawn reward items
            SpawnRandomItems();
            m_bItemsSpawned = true;
        }
    }
}

/// Spawn random reward items in the center of the room after enemies defeated.
void CGame::SpawnRandomItems() {
    if (!m_pRoom) return;
    
    // Calculate center of room
    const float centerX = (m_pRoom->GetWidth() / 2.0f) * m_pRoom->GetTileSize();
    const float centerY = (m_pRoom->GetHeight() / 2.0f) * m_pRoom->GetTileSize();
    const Vector2 roomCenter(centerX, centerY);
    
    // Use deterministic RNG if enabled
    std::mt19937 rng;
    if (m_bDeterministicSpawns) {
        const int roomType = m_pRoom->GetCurrentRoomType();
        rng.seed(static_cast<unsigned int>(roomType + 1000)); // +1000 to differentiate from enemy spawns
    } else {
        std::random_device rd;
        rng.seed(rd());
    }
    
    // Decide how many items to spawn (1-3)
    std::uniform_int_distribution<int> countDist(1, 3);
    const int itemCount = countDist(rng);
    
    // Item types pool (weighted selection)
    std::vector<eSprite> itemPool = {
        eSprite::healthPickup,      // Common
        eSprite::healthPickup,      // Common (duplicate for higher weight)
        eSprite::gold,              // Common
        eSprite::gold,              // Common
        eSprite::maxHealthPickup,   // Uncommon
        eSprite::attackUp,          // Uncommon
        eSprite::attackSpeedUp,     // Uncommon
        eSprite::thornRoll,         // Rare
        eSprite::lifeDrop,          // Rare
        eSprite::goldDrop,          // Rare
        eSprite::backAttack,        // Rare
        eSprite::deathExplosion,    // Rare
        eSprite::damageShield       // Rare
    };
    
    // Spawn items in a small spread around center
    for (int i = 0; i < itemCount; ++i) {
        // Random item from pool
        std::uniform_int_distribution<int> itemDist(0, (int)itemPool.size() - 1);
        const eSprite itemType = itemPool[itemDist(rng)];
        
        // Offset from center for visual spread
        std::uniform_real_distribution<float> offsetDist(-80.0f, 80.0f);
        const Vector2 offset(offsetDist(rng), offsetDist(rng));
        const Vector2 spawnPos = roomCenter + offset;
        
        // Spawn the item
        m_pObjectManager->create(itemType, spawnPos);
    }
}

/// Poll the keyboard state and respond to the key presses that happened since
/// the last frame.

void CGame::KeyboardHandler() {
    // Keyboard input not yet integrated - stub removed
    // m_pKeyboard->GetState(); //get current keyboard state 

    // if (m_pKeyboard->TriggerDown('L') && m_pPlayer->getAttackCooldown() <= 0.0f) {
    //     ... attack logic ...
    // }
    // ... other input handling ...

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
  m_pRenderer->Draw(eSprite::Background, m_vWinCenter); //draw start level background [current: stone level]
  m_pRoom->Draw(eSprite::Tiles, m_pPlayer); //draw the room tiles
  if (m_bDrawGraph)
    m_Graph.DrawGraph(m_pRenderer, m_pPlayer->GetCurrentNode());
  m_pObjectManager->draw(); //draw objects
  mHud->Render();
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
  KeyboardHandler(); //handle keyboard input
  // m_pAudio->BeginFrame(); //notify audio player that frame has begun - stub removed

  m_pTimer->Tick([&](){ //all time-dependent function calls should go here
//    const float t = m_pTimer->GetFrameTime(); //frame interval in seconds
      m_pObjectManager->move(); //move all objects
  });

  CheckRoomCleared(); //check if all enemies defeated and spawn rewards
  ChangeRoom();

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
            
            // Clear enemies from previous room
            m_pObjectManager->clearEnemies();
            
            m_pRoom->LoadRoom(edge.to);
            
            // Spawn enemies in new room
            SpawnEnemies();
            
            const float tileSize = static_cast<float>(m_pRoom->GetTileSize());
            const float roomWidth = static_cast<float>(m_pRoom->GetWidth());
            const float roomHeight = static_cast<float>(m_pRoom->GetHeight());

            switch (edge.direction) {
            case NORTH: m_pPlayer->m_vPos = Vector2(pos.x, (roomHeight - 2.0f) * tileSize); break;
            case SOUTH: m_pPlayer->m_vPos = Vector2(pos.x, tileSize); break;
            case WEST:  m_pPlayer->m_vPos = Vector2((roomWidth - 2.0f) * tileSize, pos.y); break;
            case EAST:  m_pPlayer->m_vPos = Vector2(tileSize, pos.y); break;
            }
            return;
        }
    }
}//ChangeRoom