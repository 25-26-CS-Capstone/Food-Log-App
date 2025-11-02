#ifndef GRAPHGEN_H
#define GRAPHGEN_H

#include <iostream>
#include <vector>
#include <random>

using namespace std;

extern int MAP_LEN;
extern int BRANCH_NUM;
extern int BRANCH_MAX_LEN;
extern int LOOP_NUM;
extern int LOOP_MAX_LEN;
extern int ROOM_TYPES;

enum Direction { NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3 };

int idsNum = 0;

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

public:
    vector<Node*> nodes;

    Node* addVertex(int id, int type);
    void addEdge(Node* from, Node* to);
    void graphGen(Node* first, int length, int branchNum, int loopNum, bool branch, bool loop, int& idCounter);
    void printGraph();
    void newGraph();
};

#endif