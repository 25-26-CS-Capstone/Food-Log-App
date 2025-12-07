#pragma once
#include <Windows.h>
#include <functional>

// Minimal window wrapper sufficient to run the game loop in a Win32 window.
class Window {
private:
    HWND m_hWnd = nullptr;
    bool m_bRunning = false;

public:
    int GetWidth() const { return 1024; }
    int GetHeight() const { return 768; }

    template<typename InitFunc, typename ProcessFunc, typename ReleaseFunc>
    int WinMain(HINSTANCE hInstance, bool /*console*/, InitFunc init, ProcessFunc process, ReleaseFunc release) {
        WNDCLASSEXA wc = {};
        wc.cbSize = sizeof(WNDCLASSEXA);
        wc.style = CS_HREDRAW | CS_VREDRAW;
        wc.lpfnWndProc = DefWindowProcA;
        wc.hInstance = hInstance;
        wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)COLOR_WINDOW;
        wc.lpszClassName = "FrozenPursuitWindow";
        RegisterClassExA(&wc);

        m_hWnd = CreateWindowExA(
            0, "FrozenPursuitWindow", "Frozen Pursuit",
            WS_OVERLAPPEDWINDOW,
            CW_USEDEFAULT, CW_USEDEFAULT, 1024, 768,
            nullptr, nullptr, hInstance, nullptr
        );

        if (!m_hWnd) return -1;

        ShowWindow(m_hWnd, SW_SHOW);
        UpdateWindow(m_hWnd);

        init();
        m_bRunning = true;

        MSG msg = {};
        while (m_bRunning) {
            while (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
                if (msg.message == WM_QUIT) { m_bRunning = false; break; }
                TranslateMessage(&msg);
                DispatchMessage(&msg);
            }
            if (m_bRunning) {
                process();
                if (!IsWindow(m_hWnd)) m_bRunning = false;
            }
        }

        release();
        return static_cast<int>(msg.wParam);
    }
};

using LWindow = Window;
