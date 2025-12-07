#pragma once

// Lightweight timer used for simple frame-based events.
class EventTimer {
public:
    explicit EventTimer(float interval = 0.0f) : m_interval(interval), m_elapsed(0.0f) {}

    void Reset() { m_elapsed = 0.0f; }

    bool EventTimerTriggered(float dt) {
        m_elapsed += dt;
        if (m_interval <= 0.0f) return true;
        if (m_elapsed >= m_interval) { m_elapsed = 0.0f; return true; }
        return false;
    }

    bool EventTimerTriggered() { return EventTimerTriggered(0.016f); }

private:
    float m_interval;
    float m_elapsed;
};
