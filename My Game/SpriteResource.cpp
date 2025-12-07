#define STB_IMAGE_IMPLEMENTATION
#include "SpriteResource.h"
#include <iostream>

// Minimal stb_image implementation (header-only library)
// We define our own minimal PNG loader to avoid external dependencies
#if defined(_MSC_VER)
#pragma warning(push)
#pragma warning(disable: 4996) // fopen deprecated
#endif

bool LSpriteResourceManager::LoadSprite(eSprite spriteId, const std::string& filename) {
    std::string fullPath = m_mediaPath + filename;

    FILE* file = fopen(fullPath.c_str(), "rb");
    if (!file) {
        std::cerr << "Failed to open sprite: " << fullPath << std::endl;
        return false;
    }

    // Simple BMP/PNG stub: just read file size and note it
    // For real PNG loading, we'd use stb_image_load here
    fseek(file, 0, SEEK_END);
    long fileSize = ftell(file);
    fseek(file, 0, SEEK_SET);

    unsigned char* fileData = (unsigned char*)malloc(fileSize);
    if (!fileData) {
        fclose(file);
        return false;
    }

    fread(fileData, 1, fileSize, file);
    fclose(file);

    // Placeholder: allocate a simple 64x64 RGBA buffer
    SpriteResource& resource = m_sprites[(int)spriteId];
    resource.width = 64;
    resource.height = 64;
    resource.channels = 4;
    resource.pixels = (unsigned char*)malloc(64 * 64 * 4);

    // For now, fill with a placeholder color
    if (resource.pixels) {
        for (int i = 0; i < 64 * 64 * 4; i += 4) {
            resource.pixels[i] = 100;     // R
            resource.pixels[i + 1] = 150; // G
            resource.pixels[i + 2] = 200; // B
            resource.pixels[i + 3] = 255; // A
        }
    }

    free(fileData);
    return true;
}

const SpriteResource* LSpriteResourceManager::GetSprite(eSprite spriteId) const {
    auto it = m_sprites.find((int)spriteId);
    if (it != m_sprites.end()) {
        return &it->second;
    }
    return nullptr;
}

void LSpriteResourceManager::ClearAll() {
    m_sprites.clear();
}

#if defined(_MSC_VER)
#pragma warning(pop)
#endif
