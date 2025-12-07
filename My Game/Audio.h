#pragma once
#include "GameDefines.h"

// Minimal audio stub used when the engine audio system is unavailable.
class Audio {
public:
    void Initialize(eSound) {}
    void Load(eSound, const char*) {}
    void play(eSound) {}
    void play(int) {}
    void stop(int) {}
    void load(const char*) {}
    void BeginFrame() {}
};
