/// \file LKeyboard.cpp
/// \brief Stubbed keyboard wrapper; all functions return neutral values.

#include "LKeyboard.h"

void LKeyboard::GetState() {}
bool LKeyboard::Down(char) const { return false; }
bool LKeyboard::Down(int) const { return false; }
bool LKeyboard::TriggerDown(char) const { return false; }
bool LKeyboard::TriggerDown(int) const { return false; }
bool LKeyboard::TriggerUp(char) const { return false; }
bool LKeyboard::TriggerUp(int) const { return false; }
