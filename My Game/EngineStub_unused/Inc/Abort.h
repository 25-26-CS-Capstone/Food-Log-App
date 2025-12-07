#ifndef ENGINE_STUB_ABORT_H
#define ENGINE_STUB_ABORT_H
#include <windows.h>
#include <cstdio>
#include <cstdlib>
#define ABORT(fmt, ...) do { char _buf[512]; _snprintf_s(_buf, sizeof(_buf), _TRUNCATE, fmt, __VA_ARGS__); MessageBoxA(nullptr, _buf, "Game Abort", MB_OK|MB_ICONERROR); ExitProcess(1); } while(0)
#endif
