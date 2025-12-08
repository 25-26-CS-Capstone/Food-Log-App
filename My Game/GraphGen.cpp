/// \file GraphGen.h
/// \brief Interface for the graph generator.

#include "GraphGen.h"
#include <ctime>

#include <unordered_map>
#include <queue>
#include "ComponentIncludes.h"

using namespace std;

extern int MAP_LEN = 10;
extern int BRANCH_NUM = 2;
extern int BRANCH_MAX_LEN = 3;
extern int LOOP_NUM = 0;
extern int ROOM_TYPES = 6;
extern int SHOP_NUM = 1;
extern int ITEM_NUM = 2;

extern int idsNum = 0;

Node::Node(int id, int type)
    : id(id), type(type)
{
    if (type == 997 || type == 998)
        cleared = true;
}
/*void Node::addEdge(Node* to){
    adj.push_back(to);
    edges++;
}*/
int Node::getNumEdges(){
    return adj.size();
}
int Node::getId(){
    return id;
}
int Node::getType(){
    return type;
}
bool Node::GetCleared() {
	return cleared;
}
void Node::SetCleared(bool isCleared) {
    cleared = isCleared;
}


Node* Graph::addVertex(int id, int type, Vector2 pos){
    Node* n = new Node(id, type);
    n->position = pos;
    nodes.push_back(n);
    return n;
}
void Graph::addEdge(Node* from, Node* to){
    if(!from || !to) 
        return;

    if (from->adj.size() >= 4 || to->adj.size() >= 4)
		return; //max 4 edges. Needs a real fix later as this can result in unconnected Nodes.

    Vector2 a = from->position;
    Vector2 b = to->position;
    int dir = -1;

    if (b.x == a.x && b.y == a.y - 1) dir = 0; 
    else if (b.x == a.x + 1 && b.y == a.y) dir = 1;
    else if (b.x == a.x && b.y == a.y + 1) dir = 2;
    else if (b.x == a.x - 1 && b.y == a.y) dir = 3;
    else {
        //not adjacent
        return;
    }

    if (hasDirection(from, dir)) return;
    if (hasDirection(to, oppositeDir(dir))) return;
    if (isConnected(from, to)) return;

    from->adj.push_back({to, dir});
    to->adj.push_back({from, oppositeDir(dir)});
}

void Graph::graphGen(Node* first, int length, int branchNum, int loopNum, bool branch, bool loop, int& idCounter){
    //straight path to boss
    Node* prev = first;
    Node* current;
    Node* branchNode = nullptr;
    int branchesChecked = 0;
    int direction;
    Vector2 pos = first->position;
    Vector2 tryPos;

    //nodes.push_back(first);
    for(int i = 1; i < length; ++i){
        direction = pickFreeDirection(pos);
        //loop to move back one if no free direction?
        pos = moveInDirection(pos, direction);
        current = this->addVertex(++idCounter, ((int)rand()% ROOM_TYPES-1)+1, pos);
        this->addEdge(prev, current);
        prev = current;
    }
    if(!branch){
        direction = pickFreeDirection(pos);
        //loop to move back one if no free direction?
        pos = moveInDirection(pos, direction);
        this->addVertex(999, 999, pos); //boss room
        this->addEdge(nodes.at(length-1), nodes.at(length));
    }

    //branch, heavily flawed
    for(int i = 0; i < branchNum; ++i){
		branchesChecked = 0;

        while( branchesChecked < nodes.size()) {
            branchNode = nodes.at(rand()%nodes.size());
			direction = pickFreeDirection(branchNode->position);
            if (direction == -1) {
                branchesChecked++;
            }
            else {
                break;
            }
        }

		if (branchesChecked == nodes.size()) 
            break; //no available nodes for branching

        graphGen(branchNode, BRANCH_MAX_LEN, 0, 0, true, false, idCounter);
    }
}

void Graph::addLoops(Node* startNode, int loopNum) {
    for (int i = 0; i < loopNum; ++i) {
        Node* a = nodes.at(rand() % nodes.size());

        vector<Node*> candidates;
        for (int d = 0; d < 4; d++) {
            Vector2 newPos = moveInDirection(a->position, d);
            // find node at this position
            for (Node* n : nodes) {
                if (n->position == newPos && !isConnected(a, n)) {
                    candidates.push_back(n);
                }
            }
        }

        if (candidates.empty())
            continue;

        // pick a random valid neighbor
        Node* b = candidates.at(rand() % candidates.size());

        // connect them using correct direction
        int d = -1;
        for (int k = 0; k < 4; k++) {
            if (moveInDirection(a->position, k) == b->position) {
                d = k;
                break;
            }
        }
        if (d == -1) continue;

        addEdge(a, b);
    }
}

//Loop through nodes and add item and shop rooms randomly
void Graph::addItemRooms(Node* startNode, int shopNum, int itemNum) {
    int checkNum = 0;
    Node* branchNode = nullptr;
	Node* current = nullptr;
    int direction;
    for (int x = 0; x < shopNum; ++x) {
            while (checkNum < nodes.size()) {
                branchNode = nodes.at(rand() % nodes.size());
                direction = pickFreeDirection(branchNode->position);
                if (direction == -1) {
                    checkNum++;
                }
                else {
                    break;
                }
            }
            if (checkNum == nodes.size())
                break; //no available nodes to add to
            //add shop room
			current = this->addVertex(idsNum++, 997, moveInDirection(branchNode->position, direction));
            addEdge(branchNode, current);
    }

    for (int x = 0; x < shopNum; ++x) {
        checkNum = 0;

            while (checkNum < nodes.size()) {
                branchNode = nodes.at(rand() % nodes.size());
                direction = pickFreeDirection(branchNode->position);
                if (direction == -1) {
                    checkNum++;
                }
                else {
                    break;
                }
            }
            if (checkNum == nodes.size())
                break; //no available nodes to add to
            //add item room
            current = this->addVertex(idsNum++, 998, moveInDirection(branchNode->position, direction));
            addEdge(branchNode, current);
        }
}

void Graph::newGraph(){
    for (Node* n : nodes) {
        delete n;
    }
    nodes.clear();

    idsNum = 0;
    Vector2 pos(0, 0);
    addVertex(idsNum++, 0, pos);
    graphGen(nodes.at(0), MAP_LEN, BRANCH_NUM, LOOP_NUM, false, false, idsNum);
    addLoops(nodes.at(0), LOOP_NUM);
    addItemRooms(nodes.at(0), SHOP_NUM, ITEM_NUM);
}

void Graph::printGraph(){
    cout << "Graph Visualization (Adjacency List):\n";
    for (int i = 0; i < nodes.size(); ++i) {
        cout << "Node: " << nodes.at(i)->getId() << " Type: " << nodes.at(i)->getNumEdges() << " edges: ";
        for (int adjIt = 0; adjIt < nodes.at(i)->adj.size(); ++adjIt) {
            cout << nodes.at(i)->adj.at(adjIt).to->getId();
            switch (nodes.at(i)->adj.at(adjIt).direction) {
                case 0: cout << "N "; break;
                case 1: cout << "E "; break;
                case 2: cout << "S "; break;
                case 3: cout << "W "; break;
            }
        }
        cout << "\n";
    }
}

int Graph::oppositeDir(int dir) {
    return (dir + 2) % 4; //N to S, E to W
}

bool Graph::isConnected(Node* a, Node* b) {
    for (auto& edge : a->adj) {
        if (edge.to == b) return true;
    }
    return false;
}
bool Graph::hasDirection(Node* node, int dir) {
    for (int i = 0; i< node->adj.size(); i++) {
        if (node->adj.at(i).direction == dir) return true;
    }
    return false;
}
int Graph::pickFreeDirection(Vector2 pos) {
    std::vector<int> dirs = { 0, 1, 2, 3 };
    std::shuffle(dirs.begin(), dirs.end(), default_random_engine(rand()));

    for (int d : dirs) {
        Vector2 newPos = moveInDirection(pos, d);

        bool occupied = false;
        for (Node* n : nodes) {
            if (n->position == newPos) {
                occupied = true;
                break;
            }
        }

        if (!occupied)
            return d;
    }
    return -1;//no free directions available
}
Vector2 Graph::moveInDirection(Vector2 pos, int dir) {
    switch (dir) {
    case 0: return Vector2(pos.x, pos.y - 1);//up
    case 1: return Vector2(pos.x + 1, pos.y);//right
    case 2: return Vector2(pos.x, pos.y + 1);//down
    case 3: return Vector2(pos.x - 1, pos.y);//left
    default: return pos;
    }
}


void Graph::assignScreenPositions(const Vector2& origin, float spacing)
{
    std::unordered_map<Node*, bool> visited;
    std::unordered_map<std::string, bool> occupied;

    // Helper to encode Vector2 positions as strings
    auto posKey = [](const Vector2& v) {
        return std::to_string(static_cast<int>(v.x)) + "," + std::to_string(static_cast<int>(v.y));
        };

    std::queue<Node*> q;

    // Start with the first node at the origin
    nodes[0]->position = origin;
    visited[nodes[0]] = true;
    occupied[posKey(origin)] = true;
    q.push(nodes[0]);

    while (!q.empty()) {
        Node* n = q.front(); q.pop();

        for (auto& edge : n->adj) {
            Node* neighbor = edge.to;
            if (visited[neighbor]) continue;

            // Calculate initial position based on edge direction
            Vector2 tryPos = n->position;
            switch (edge.direction) {
            case 0: tryPos += Vector2(0, -spacing); break; // North
            case 1: tryPos += Vector2(spacing, 0); break;  // East
            case 2: tryPos += Vector2(0, spacing); break;  // South
            case 3: tryPos += Vector2(-spacing, 0); break; // West
            }

            // If position is occupied, shift diagonally until free
            int attempts = 0;
            while (occupied[posKey(tryPos)] && attempts < 100) {
                tryPos += Vector2(spacing, spacing); // simple offset
                attempts++;
            }

            neighbor->position = tryPos;
            visited[neighbor] = true;
            occupied[posKey(tryPos)] = true;
            q.push(neighbor);
        }
    }
}



void Graph::DrawGraph(LSpriteRenderer* m_pRenderer, Node* playerNode) {
    LSpriteDesc2D desc;
    desc.m_nSpriteIndex = static_cast<int>(eSprite::MapRoom);


    // --- Draw Nodes (Rooms) ---
    for (Node* n : nodes) {
        LSpriteDesc2D desc = {};
        desc.m_nSpriteIndex = static_cast<int>(eSprite::MapRoom);
        desc.m_vPos = n->position;
        switch (n->getType()) {
            case 0: desc.m_nCurrentFrame = 4; break; // start
            case 1: desc.m_nCurrentFrame = 1; break;
            case 2: desc.m_nCurrentFrame = 1; break;
            case 3: desc.m_nCurrentFrame = 1; break;
            case 4: desc.m_nCurrentFrame = 1; break;
			case 997: desc.m_nCurrentFrame = 2; break; // shop
			case 998: desc.m_nCurrentFrame = 3; break; // item room
            case 999: desc.m_nCurrentFrame = 6; break; // boss
            default: desc.m_nCurrentFrame = 7; break; // fallback
        }
        m_pRenderer->Draw(&desc);
    }

   

    // --- Draw Edges (Halls) ---

    for (Node* n : nodes) {
        for (auto& edge : n->adj) {
            int aId = n->getId();
            int bId = edge.to->getId();

            // Skip if this edge already drawn (avoid double rendering)
            if (aId > bId) continue;

            Vector2 a = n->position;
            Vector2 b = edge.to->position;
            Vector2 mid = (a + b) * 0.5f;
            float angle = atan2f(b.y - a.y, b.x - a.x);
            float length = (b - a).Length();

            m_pRenderer->Draw(eSprite::Connection, mid, angle);
        }
    }

    if (playerNode) {
        LSpriteDesc2D marker = {};
        marker.m_nSpriteIndex = static_cast<int>(eSprite::MapRoom); // reuse MapRoom or define a new sprite
        marker.m_nCurrentFrame = 5; // choose a unique frame index for player marker
        marker.m_vPos = playerNode->position;
        m_pRenderer->Draw(&marker);
    }
}



/*//test main
int main(){
    srand(time(NULL));
    Graph mainGraph;
    mainGraph.addVertex(idsNum++, 0);
    mainGraph.graphGen(mainGraph.nodes.at(0), 9, 2, 2, false, false, idsNum);
    mainGraph.printGraph();

    cout << "end";


}*/