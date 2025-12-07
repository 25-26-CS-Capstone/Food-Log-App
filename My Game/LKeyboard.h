#pragma once

// Minimal LKeyboard stub; no real input handling is performed.
class LKeyboard {
public:
    LKeyboard() = default;
    ~LKeyboard() = default;

    void GetState() {}
    bool Down(char) const { return false; }
    bool Down(int) const { return false; }
    bool TriggerDown(char) const { return false; }
    bool TriggerDown(int) const { return false; }
    bool TriggerUp(char) const { return false; }
    bool TriggerUp(int) const { return false; }
};
