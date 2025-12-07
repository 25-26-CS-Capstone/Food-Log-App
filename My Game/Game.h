/// \file Game.h
/// \brief Interface for the game class CGame.

#ifndef __L4RC_GAME_GAME_H__
#define __L4RC_GAME_GAME_H__

#include "Component.h"
#include "Common.h"
#include "ObjectManager.h"
#include "Settings.h"
#include  "Player.h"
#include "Windows.h"
#include "HUD.h"
#include "Attack.h"
#include "Room.h"
#include "GraphGen.h"

/// \brief The game class.
///
/// The game class is the object-oriented implementation of the game. This class
/// must contain the following public member functions. `Initialize()` does
/// initialization and will be run exactly once at the start of the game.
/// `ProcessFrame()` will be called once per frame to create and render the
/// next animation frame. `Release()` will be called at game exit but before
/// any destructors are run.

class CGame: 
  public LComponent, 
  public LSettings,
  public CCommon{ 

  private:
    bool m_bDrawFrameRate = false; ///< Draw the frame rate.
	bool m_bDrawGraph = false; ///< Draw the graph.
    bool m_bDeterministicSpawns = true; ///< When true, seed RNG by room type for reproducible spawns
	int m_nEnemyCount = 0; ///< Current enemy count in room
	bool m_bRoomCleared = false; ///< True when all enemies defeated
	bool m_bItemsSpawned = false; ///< Prevent spawning items multiple times
	
	// Keyboard, Audio, and Timer are managed by the LARC engine
	// These stubs have been removed
	// class Keyboard* m_pKeyboard = nullptr;
	// class Audio* m_pAudio = nullptr;
	// class Timer* m_pTimer = nullptr;
//    LSpriteDesc2D* m_pSpriteDesc = nullptr; ///< Sprite descriptor.
//    LSpriteRenderer* m_pRenderer = nullptr; ///< Pointer to renderer.
    void LoadImages(); ///< Load images.
    void LoadSounds(); ///< Load sounds.
    void BeginGame(); ///< Begin playing the game.
    void CreateObjects(); ///< Create game objects.
    void SpawnEnemies(); ///< Spawn enemies based on room spawn positions.
    void CheckRoomCleared(); ///< Check if all enemies defeated and spawn rewards.
    void SpawnRandomItems(); ///< Spawn random items when room is cleared.
    void KeyboardHandler(); ///< The keyboard handler.
    void RenderFrame(); ///< Render an animation frame.
    void DrawFrameRateText(); ///< Draw frame rate text to screen.
    

	

    Graph m_Graph;
	CRoom* m_pRoom; ///< The room.

  public:
    ~CGame(); ///< Destructor.

    void Initialize(); ///< Initialize the game.
    void ProcessFrame(); ///< Process an animation frame.
    void Release(); ///< Release the renderer.
	void ChangeRoom();
}; //CGame

#endif //__L4RC_GAME_GAME_H__
