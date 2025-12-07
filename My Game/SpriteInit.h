#pragma once
#include "GameDefines.h"
#include "SpriteResource.h"

/// \brief Initialize all game sprites from Media/Images folder
void InitializeSprites(LSpriteResourceManager& mgr) {
    // Background & UI
    mgr.LoadSprite(eSprite::Background, "background.png");
    mgr.LoadSprite(eSprite::TextWheel, "textwheel.png");
    
    // Player sprites
    mgr.LoadSprite(eSprite::InuitIdleRight, "InuitIdleRight.png");
    mgr.LoadSprite(eSprite::InuitIdleLeft, "InuitIdleLeft.png");
    mgr.LoadSprite(eSprite::InuitIdleUp, "InuitIdleUp.png");
    mgr.LoadSprite(eSprite::InuitIdleDown, "InuitIdleDown.png");
    mgr.LoadSprite(eSprite::InuitRunRight, "InuitRunRight.png");
    mgr.LoadSprite(eSprite::InuitRunLeft, "InuitRunLeft.png");
    mgr.LoadSprite(eSprite::InuitRunUp, "InuitRunUp.png");
    mgr.LoadSprite(eSprite::InuitRunDown, "InuitRunDown.png");
    mgr.LoadSprite(eSprite::InuitRoll, "InuitRoll.png");
    mgr.LoadSprite(eSprite::PlayerAttack, "PlayerAttack.png");
    
    // Items & pickups
    mgr.LoadSprite(eSprite::healthPickup, "HealthPickup.png");
    mgr.LoadSprite(eSprite::maxHealthPickup, "MaxHealthPickup.png");
    mgr.LoadSprite(eSprite::gold, "Gold.png");
    mgr.LoadSprite(eSprite::goldDrop, "GoldDrop.png");
    mgr.LoadSprite(eSprite::lifeDrop, "LifeDrop.png");
    
    // Enemies
    mgr.LoadSprite(eSprite::testEnemy, "TestEnemy.png");
    mgr.LoadSprite(eSprite::PIGSPRITE, "pig.png");
    
    // Projectiles & effects
    mgr.LoadSprite(eSprite::explosion, "Explosion.png");
    mgr.LoadSprite(eSprite::deathExplosion, "DeathExplosion.png");
    mgr.LoadSprite(eSprite::playerAttack, "PlayerAttack.png");
    
    // HUD & tiles
    mgr.LoadSprite(eSprite::healthBar, "HealthBar.png");
    mgr.LoadSprite(eSprite::healthBarBackground, "HealthBarBackground.png");
    mgr.LoadSprite(eSprite::TileSheet, "TileSheet.png");
    mgr.LoadSprite(eSprite::MapSheet, "MapSheet.png");
    
    // Power-ups
    mgr.LoadSprite(eSprite::attackUp, "AttackUp.png");
    mgr.LoadSprite(eSprite::attackSpeedUp, "AttackSpeedUp.png");
    mgr.LoadSprite(eSprite::thornRoll, "ThornRoll.png");
    mgr.LoadSprite(eSprite::damageShield, "DamageShield.png");
    
    // Digits for score display
    for (int i = 0; i <= 9; i++) {
        std::string filename = "Digit" + std::to_string(i) + ".png";
        mgr.LoadSprite((eSprite)((int)eSprite::digit0 + i), filename);
    }
}
