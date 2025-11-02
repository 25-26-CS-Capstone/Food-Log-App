
#include "GraphGen.h"
#include <ctime>

using namespace std;

extern int MAP_LEN = 10;
extern int BRANCH_NUM = 2;
extern int BRANCH_MAX_LEN = 3;
extern int LOOP_NUM = 0;
extern int LOOP_MAX_LEN = 0;
extern int ROOM_TYPES = 6;



Node::Node(int id, int type) : id(id), type(type) {}
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


Node* Graph::addVertex(int id, int type){
    Node* n = new Node(id, type);
    nodes.push_back(n);
    return n;
}
void Graph::addEdge(Node* from, Node* to){
    if(!from || !to) 
        return;

    if (from->adj.size() >= 4 || to->adj.size() >= 4)
		return; //max 4 edges. Needs a real fix later as this can result in unconnected Nodes.

    int dir = rand()%4;
    int tried = 0;

    while (hasDirection(from, dir) && tried < 4) {
        dir = (dir + 1) % 4;
        tried++;
    }


    /*if(hasDirection(to, oppositeDir(dir)))
        return;
    */

    from->adj.push_back({to, dir});
    to->adj.push_back({from, oppositeDir(dir)});
}

void Graph::graphGen(Node* first, int length, int branchNum, int loopNum, bool branch, bool loop, int& idCounter){
    //straight path to boss
    Node* prev = first;
    Node* current;
    Node* branchNode = nullptr;
    int branchesChecked = 0;
    //nodes.push_back(first);
    for(int i = 1; i < length; ++i){
        current = this->addVertex(++idCounter, (int)rand()%10);
        this->addEdge(prev, current);
        prev = current;
    }
    if(!branch){
        this->addVertex(999, 999); //boss room
        this->addEdge(nodes.at(length-1), nodes.at(length));
    }

    //branch
    for(int i = 0; i < branchNum; ++i){
		branchesChecked = 0;
        while( branchesChecked < nodes.size()) {
            branchNode = nodes.at(rand()%nodes.size());
            if (branchNode->getNumEdges() >= 4) {
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

    //loop
    for(int i = 0; i < loopNum; ++i){
        if (nodes.size() < 2) break; //need at least two nodes

        Node* a = nodes.at(rand() % nodes.size());
        Node* b = nodes.at(rand() % nodes.size()); 


        //check if nodes are already connected
        int safety = 0;
        while ((a == b || isConnected(a, b) || a->getNumEdges() >= 4 || b->getNumEdges() >= 4) && safety < 50) {
            a = nodes.at(rand() % nodes.size());
            b = nodes.at(rand() % nodes.size());
            safety++;
        }

        if (a != b && !isConnected(a, b)) {
            int dir = rand() % 4;
            addEdge(a, b);
        }
        }
    }

void Graph::newGraph(){
    idsNum = 0;
    addVertex(idsNum++, 0);
    graphGen(nodes.at(0), MAP_LEN, BRANCH_NUM, LOOP_NUM, false, false, idsNum);
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



/*//test main
int main(){
    srand(time(NULL));
    Graph mainGraph;
    mainGraph.addVertex(idsNum++, 0);
    mainGraph.graphGen(mainGraph.nodes.at(0), 9, 2, 2, false, false, idsNum);
    mainGraph.printGraph();

    cout << "end";


}*/