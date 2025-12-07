/// \file Log.h
/// \brief Simple logging utility for runtime diagnostics.

#pragma once

#include <string>
#include <fstream>
#include <mutex>

class Log {
public:
    enum class Level { Info, Warn, Error };

    // Initialize logging (call once at startup)
    static void Init(const std::string& filePath = "Game.log");

    // Write a log line
    static void Write(Level level, const std::string& msg);

    // Convenience helpers
    static void Info(const std::string& msg) { Write(Level::Info, msg); }
    static void Warn(const std::string& msg) { Write(Level::Warn, msg); }
    static void Error(const std::string& msg){ Write(Level::Error, msg); }

private:
    static std::ofstream s_stream;
    static std::mutex s_mutex;
    static bool s_initialized;
    static const char* LevelToText(Level l);
};
