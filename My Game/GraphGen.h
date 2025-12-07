#ifndef __L4RC_GAME_GRAPHGEN_H__
#define __L4RC_GAME_GRAPHGEN_H__

#include <iostream>
#include <vector>
#include <random>

#include "Sprite.h"
#include "SpriteRenderer.h"
#include "GameDefines.h"

using namespace std;

extern int MAP_LEN;
extern int BRANCH_NUM;
extern int BRANCH_MAX_LEN;
extern int LOOP_NUM;
extern int ROOM_TYPES;


enum Direction { NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3 };

extern int idsNum;

class Node;


struct Edge {
    Node* to;
    int direction; // 0–3 = N, E, S, W
};

class Node {
private:
    int id;
    int type;
    int edges = 0;
public:
    vector<Edge> adj;
	Vector2 position;

    Node(int id, int type);

    int getNumEdges();
    int getId();
    int getType();
};

class Graph {
private:
    int oppositeDir(int dir);
    bool isConnected(Node* a, Node* b);
    bool hasDirection(Node* node, int dir);
    int pickFreeDirection(Vector2 pos);
    Vector2 moveInDirection(Vector2 pos, int dir);
    void addLoops(Node* startNode, int loopNum);

public:
    vector<Node*> nodes;

    Node* addVertex(int id, int type, Vector2 pos);
    void addEdge(Node* from, Node* to);
    void graphGen(Node* first, int length, int branchNum, int loopNum, bool branch, bool loop, int& idCounter);
    void printGraph();
    void newGraph();
	void DrawGraph(LSpriteRenderer* m_pRenderer, Node* playerNode);
    void assignScreenPositions(const Vector2& origin, float spacing);


};

#endif