#pragma once
#include "GameDefines.h"
#include <unordered_map>
#include <string>
#include <vector>

/// \brief Simple sprite resource with pixel data
struct SpriteResource {
    int width = 0;
    int height = 0;
    int channels = 0;
    unsigned char* pixels = nullptr;

    ~SpriteResource() {
        if (pixels) {
            free(pixels);
            pixels = nullptr;
        }
    }

    SpriteResource() = default;
    SpriteResource(const SpriteResource&) = delete;
    SpriteResource& operator=(const SpriteResource&) = delete;
};

/// \brief Sprite resource manager: loads PNG files and stores them
class LSpriteResourceManager {
private:
    std::unordered_map<int, SpriteResource> m_sprites;
    std::string m_mediaPath;

public:
    LSpriteResourceManager(const std::string& mediaPath = "Media/Images/")
        : m_mediaPath(mediaPath) {}

    ~LSpriteResourceManager() = default;

    /// Load a PNG sprite from disk
    bool LoadSprite(eSprite spriteId, const std::string& filename);

    /// Get sprite resource (returns nullptr if not loaded)
    const SpriteResource* GetSprite(eSprite spriteId) const;

    /// Clear all loaded sprites
    void ClearAll();
};
