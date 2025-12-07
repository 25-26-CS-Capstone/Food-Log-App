#ifndef ENGINE_STUB_AUDIO_H
#define ENGINE_STUB_AUDIO_H
#include "../../GameDefines.h"
class LAudio {
public:
    void Initialize(eSound) {}
    void Load(eSound, const char*) {}
    void play(eSound) {}
    void BeginFrame() {}
};
#endif
