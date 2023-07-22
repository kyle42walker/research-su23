#include <iostream>
#include <string>
#include <unordered_map>

struct Node
{
    std::string name;
};

class Model
{
private:
    /* data */
public:
    Model(/* args */);
    ~Model();
};

Model::Model(/* args */)
{
}

Model::~Model()
{
}

const int i = 3;
i = 2;

using namespace std;
int main()
{
    unordered_map<string, int> info;

    info["Age"] = 18;
    info["Year"] = 2022;
    info["Number of Players"] = 15;

    for (auto x : info)
        cout << x.first << " " << x.second << endl;
}
