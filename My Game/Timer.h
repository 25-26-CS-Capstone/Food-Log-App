#pragma once
#include <functional>

// Minimal timer stub to allow the game to run without the engine timer.
class Timer {
public:
    float GetFrameTime() const { return 0.016f; }
    float GetDeltaTime() const { return 0.016f; }
    float GetFPS() const { return 60.0f; }

    void Tick() {}
    void Tick(float) {}

    template<typename Func>
    void Tick(Func f) { f(); }
};

// Alias used by legacy engine-facing code
using LTimer = Timer;
