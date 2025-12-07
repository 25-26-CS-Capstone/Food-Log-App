#ifndef ENGINE_STUB_DEFINES_H
#define ENGINE_STUB_DEFINES_H
#include <windows.h>
#include <cstdint>
#include <cmath>
struct Vector2 {
	float x; float y;
	Vector2():x(0),y(0){}
	Vector2(float _x,float _y):x(_x),y(_y){}
	Vector2 operator+(const Vector2& o) const { return {x+o.x,y+o.y}; }
	Vector2 operator-(const Vector2& o) const { return {x-o.x,y-o.y}; }
	Vector2 operator*(float s) const { return {x*s,y*s}; }
	Vector2& operator+=(const Vector2& o){ x+=o.x; y+=o.y; return *this; }
	float Length() const { return std::sqrt(x*x + y*y); }
};
#endif
