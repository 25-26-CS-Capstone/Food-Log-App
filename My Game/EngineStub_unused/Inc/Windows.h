#ifndef ENGINE_STUB_WINDOWS_WRAPPER_H
#define ENGINE_STUB_WINDOWS_WRAPPER_H
#include <windows.h>
#include <functional>

class LWindow {
public:
    int WinMain(HINSTANCE hInst, bool console,
                const std::function<void()>& init,
                const std::function<void()>& process,
                const std::function<void()>& release);
};

#endif
