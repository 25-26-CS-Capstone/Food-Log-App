#ifndef ENGINE_STUB_TIMER_H
#define ENGINE_STUB_TIMER_H
#include <chrono>
class LTimer {
    using clock = std::chrono::high_resolution_clock;
    clock::time_point m_last = clock::now();
    float m_fps = 0.0f;
    int m_frames = 0;
    double m_accum = 0.0;
public:
    float GetFrameTime() const { return m_frameTime; }
    float GetFPS() const { return m_fps; }
    template<class F> void Tick(F f){
        auto now = clock::now();
        std::chrono::duration<double> d = now - m_last;
        m_last = now;
        m_frameTime = (float)d.count();
        m_accum += d.count();
        m_frames++;
        if(m_accum >= 1.0){ m_fps = (float)m_frames / (float)m_accum; m_accum = 0.0; m_frames = 0; }
        f();
    }
private:
    float m_frameTime = 0.0f;
};
#endif
