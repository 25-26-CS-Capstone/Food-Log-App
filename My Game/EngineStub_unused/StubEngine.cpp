// System headers
#include <windows.h>
// Engine stub headers
#include "ComponentIncludes.h"
#include "SpriteRenderer.h"
#include "Window.h"

static LWindow* g_pWindowInstance = nullptr; // not used extensively, placeholder

// Minimal WndProc for stub window
static LRESULT CALLBACK StubWndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam){
	if(msg == WM_DESTROY){ PostQuitMessage(0); return 0; }
	return DefWindowProc(hWnd,msg,wParam,lParam);
}

int LWindow::WinMain(HINSTANCE hInst, bool console,
					 const std::function<void()>& init,
					 const std::function<void()>& process,
					 const std::function<void()>& release){
	if(console) AllocConsole();
	WNDCLASSEX wc{ sizeof(WNDCLASSEX) };
	wc.lpfnWndProc = StubWndProc;
	wc.hInstance = hInst;
	wc.lpszClassName = "StubWnd";
	wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
	wc.style = CS_HREDRAW | CS_VREDRAW;
	RegisterClassEx(&wc);
	HWND hWnd = CreateWindowEx(0, "StubWnd", "Frozen Pursuit (Stub)", WS_OVERLAPPEDWINDOW,
							   CW_USEDEFAULT, CW_USEDEFAULT, 1280, 720, nullptr, nullptr, hInst, nullptr);
	ShowWindow(hWnd, SW_SHOW);
	UpdateWindow(hWnd);
	init();
	MSG msg{};
	bool running = true;
	while(running){
		while(PeekMessage(&msg,nullptr,0,0,PM_REMOVE)){
			if(msg.message == WM_QUIT){ running = false; break; }
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
		process();
		Sleep(10);
	}
	release();
	if(console) FreeConsole();
	return 0;
}
