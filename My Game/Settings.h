#pragma once
#include "Defines.h"

// Minimal settings stub to supply window dimensions and center point.
class LSettings {
public:
	Vector2 m_vWinCenter{ 512.0f, 384.0f };
	int m_nWinWidth = 1024;
	int m_nWinHeight = 768;
	virtual ~LSettings() = default;
};
