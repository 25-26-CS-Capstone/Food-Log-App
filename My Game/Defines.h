#pragma once
#include <cmath>
#include <cstdint>
#include <windows.h>

using UINT = unsigned int;

struct Vector2 {
    float x;
    float y;

    Vector2() : x(0.0f), y(0.0f) {}
    Vector2(float xx, float yy) : x(xx), y(yy) {}

    static const Vector2 Zero;
    static const Vector2 UnitX;
    static const Vector2 UnitY;

    Vector2 operator+(const Vector2& o) const { return { x + o.x, y + o.y }; }
    Vector2 operator-(const Vector2& o) const { return { x - o.x, y - o.y }; }
    Vector2 operator*(float s) const { return { x * s, y * s }; }
    Vector2 operator/(float s) const { return { x / s, y / s }; }
    Vector2& operator+=(const Vector2& o) { x += o.x; y += o.y; return *this; }
    Vector2& operator-=(const Vector2& o) { x -= o.x; y -= o.y; return *this; }
    Vector2& operator*=(float s) { x *= s; y *= s; return *this; }
    Vector2& operator/=(float s) { x /= s; y /= s; return *this; }

    float Length() const { return std::sqrt(x * x + y * y); }
    void Normalize() {
        float len = Length();
        if (len > 1e-6f) { x /= len; y /= len; }
    }
};

inline const Vector2 Vector2::Zero{ 0.0f, 0.0f };
inline const Vector2 Vector2::UnitX{ 1.0f, 0.0f };
inline const Vector2 Vector2::UnitY{ 0.0f, 1.0f };
inline Vector2 operator*(float s, const Vector2& v) { return { v.x * s, v.y * s }; }

struct XMFLOAT4 {
    float x, y, z, w;
    XMFLOAT4() : x(0.0f), y(0.0f), z(0.0f), w(0.0f) {}
    XMFLOAT4(float _x, float _y, float _z, float _w) : x(_x), y(_y), z(_z), w(_w) {}
};

enum class eSpriteMode { Batched2D, Immediate2D };
