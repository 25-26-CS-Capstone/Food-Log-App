#ifndef ENGINE_STUB_EVENT_TIMER_H
#define ENGINE_STUB_EVENT_TIMER_H
class LEventTimer {
    float m_time = 0.0f;
    float m_interval = 0.0f;
public:
    void SetInterval(float f){ m_interval = f; }
    bool Trigger(float dt){ m_time += dt; if(m_time >= m_interval){ m_time = 0.0f; return true; } return false; }
};
#endif
