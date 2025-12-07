#pragma once
#include <Windows.h>
#include <functional>

// Forward declaration
class Window;
static Window* g_pWindowInstance = nullptr;

// Minimal window wrapper with GDI rendering support
class Window {
private:
    HWND m_hWnd = nullptr;
    HDC m_hBackDC = nullptr;
    HBITMAP m_hBackBitmap = nullptr;
    HBITMAP m_hOldBitmap = nullptr;
    bool m_bRunning = false;
    int m_nWidth = 1024;
    int m_nHeight = 768;

    static LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
        switch (msg) {
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);
            if (g_pWindowInstance && g_pWindowInstance->m_hBackDC) {
                BitBlt(hdc, 0, 0, g_pWindowInstance->m_nWidth, g_pWindowInstance->m_nHeight,
                       g_pWindowInstance->m_hBackDC, 0, 0, SRCCOPY);
            }
            EndPaint(hwnd, &ps);
            return 0;
        }
        default:
            return DefWindowProcA(hwnd, msg, wParam, lParam);
        }
    }

public:
    int GetWidth() const { return m_nWidth; }
    int GetHeight() const { return m_nHeight; }
    HDC GetBackDC() const { return m_hBackDC; }
    HWND GetHWND() const { return m_hWnd; }

    template<typename InitFunc, typename ProcessFunc, typename ReleaseFunc>
    int WinMain(HINSTANCE hInstance, bool /*console*/, InitFunc init, ProcessFunc process, ReleaseFunc release) {
        g_pWindowInstance = this;

        WNDCLASSEXA wc = {};
        wc.cbSize = sizeof(WNDCLASSEXA);
        wc.style = CS_HREDRAW | CS_VREDRAW;
        wc.lpfnWndProc = WindowProc;
        wc.hInstance = hInstance;
        wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
        wc.lpszClassName = "FrozenPursuitWindow";
        RegisterClassExA(&wc);

        RECT rect = { 0, 0, m_nWidth, m_nHeight };
        AdjustWindowRect(&rect, WS_OVERLAPPEDWINDOW, FALSE);

        m_hWnd = CreateWindowExA(
            0, "FrozenPursuitWindow", "Frozen Pursuit",
            WS_OVERLAPPEDWINDOW,
            CW_USEDEFAULT, CW_USEDEFAULT, rect.right - rect.left, rect.bottom - rect.top,
            nullptr, nullptr, hInstance, nullptr
        );

        if (!m_hWnd) return -1;

        // Create back buffer for double buffering
        HDC hdc = GetDC(m_hWnd);
        m_hBackDC = CreateCompatibleDC(hdc);
        m_hBackBitmap = CreateCompatibleBitmap(hdc, m_nWidth, m_nHeight);
        m_hOldBitmap = (HBITMAP)SelectObject(m_hBackDC, m_hBackBitmap);
        ReleaseDC(m_hWnd, hdc);

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
                InvalidateRect(m_hWnd, nullptr, FALSE);
                if (!IsWindow(m_hWnd)) m_bRunning = false;
            }
        }

        // Cleanup
        if (m_hBackDC) {
            SelectObject(m_hBackDC, m_hOldBitmap);
            DeleteObject(m_hBackBitmap);
            DeleteDC(m_hBackDC);
        }

        release();
        g_pWindowInstance = nullptr;
        return static_cast<int>(msg.wParam);
    }
};

using LWindow = Window;
