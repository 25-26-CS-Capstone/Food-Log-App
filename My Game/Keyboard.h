#pragma once

// Minimal keyboard stub; always reports no key activity.
class Keyboard {
public:
    bool TriggerDown(char) const { return false; }
    bool TriggerDown(int) const { return false; }
    bool TriggerUp(char) const { return false; }
    bool TriggerUp(int) const { return false; }
    bool Down(char) const { return false; }
    void GetState() {}
};
