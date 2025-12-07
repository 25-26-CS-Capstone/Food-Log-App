#pragma once
#include <cstdlib>
#include <cstdio>
#include <string>
#ifdef _WIN32
#include <windows.h>
#endif

inline void ABORT(const char* fmt, const char* arg = "") {
#ifdef _WIN32
    char buf[512];
    std::snprintf(buf, sizeof(buf), fmt, arg);
    OutputDebugStringA(buf);
#endif
    std::abort();
}
