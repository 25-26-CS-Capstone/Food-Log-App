/// \file EventTimer.h
/// \brief Minimal event timer for frame-based animations.

#pragma once

class LEventTimer {
private:
    float m_fTimer = 0.0f;
    float m_fInterval = 0.1f;
    
public:
    LEventTimer(float interval = 0.1f) : m_fInterval(interval) {}
    
    void Tick(float dt) { m_fTimer += dt; }
    
    bool Triggered() {
        if (m_fTimer >= m_fInterval) {
            m_fTimer = 0.0f;
            return true;
        }
        return false;
    }
    
    void Reset() { m_fTimer = 0.0f; }
};
