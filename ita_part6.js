var AdjacencyListGraph = function() {

    var self = this;
    self.graph = {}
    self.keys = {};
    self.weight = {}
    self.undirectedEdges = []

    self.addDirectedEdge = function(v1, v2, weight) {
        if (self.graph[v1] === undefined) {
            self.graph[v1] = [];
            self.weight[v1] = {};
        }
        self.weight[v1][v2] = weight;
        self.graph[v1].push(v2);
        self.keys[v1] = true;
        self.keys[v2] = true;
    }

    self.addEdge = function(v1, v2, weight) {
        self.addDirectedEdge(v1, v2, weight);
        self.addDirectedEdge(v2, v1, weight);
        self.undirectedEdges.push({'v1': v1, 'v2': v2, 'weight': weight});
    }

    self.getNeighbours = function(v) {
        return self.graph[v] == undefined ? [] : self.graph[v];
    }


    self.breadthFirstSearch = function(v) {
        var seen = {};
        var distances = {};
        var predecessors = {};
        $.each(self.graph, function(v) {
            seen[v] = false;
            distances[v] = -1;
            predecessors[v] = undefined;
        });

        distances[v] = 0;
        seen[v] = true;
        queue = [v];
        while (queue.length != 0) {
            var s = queue.shift();
            $.each(self.getNeighbours(s), function(i, neighbour) {
                if (!seen[neighbour]) {
                    queue.push(neighbour);
                    distances[neighbour] = distances[s] + 1;
                    predecessors[neighbour] = s;
                    seen[neighbour] = true;
                }
            });
        }
        return {distances: distances, predecessors: predecessors}
    }

    self.shortestPath = function(v1, v2) {
        var bfsResult = self.breadthFirstSearch(v1);
        var path = [];
        var v = v2;
        while (v != undefined) {
            path.splice(0, 0, v);
            v = bfsResult.predecessors[v];
        }
        return path;
    }

    self.depthFirstSearch = function(v) {
        var seen = {};
        var predecessors = {};

        $.each(self.keys, function(v) {
            seen[v] = false;
            predecessors[v] = undefined;
        });

        var stack = [v];
        while (stack.length > 0) {
            var s = stack.pop();
            if (!seen[s]) {
                seen[s] = true;
                $.each(self.getNeighbours(s), function(i, n) {
                    if (!seen[n]) { 
                        predecessors[n] = s;
                        stack.push(n); 
                    }
                });
            }
        }
        return { predecessors: predecessors };
    }

    self.topologicalSortRecursive = function() {

        var seen = {};
        var topologicalSort = [];
        var stack = [];

        $.each(self.keys, function(v) {
            stack.push(v);
        });

        while (stack.length != 0) {
            s = stack.pop();
            if (s['add-to-sort'] !== undefined) {
                topologicalSort.splice(0,0,s['add-to-sort']);
                continue;
            }
            if (!seen[s]) {
                stack.push({'add-to-sort': s});
                seen[s] = true;
                $.each(self.getNeighbours(s), function(i, m) {
                    stack.push(m);
                });
            }
        }
        return topologicalSort;
    }

    self.topologicalSort = function() {

        var seen = {};
        var topologicalSort = [];

        var visit = function(n) {
            if (!seen[n]) {
                seen[n] = true;
                $.each(self.getNeighbours(n), function(i, m) {
                    visit(m);
                });
                topologicalSort.splice(0,0,n);
            }
        }

        $.each(self.keys, function(v) {
            if (!seen[v]) { visit(v); }
        });
        return topologicalSort;
    }
    
    self.edgesInNonDecreasingWeight = function() {
        var sortOnWeight = function(a, b) {
            return a.weight < b.weight ? -1 : 1;
        }
        return self.undirectedEdges.sort(sortOnWeight);
    }

    self.minimumSpanningTreeKruskal = function() {
        var mst = {}
        var sets = {}
        $.each(self.keys, function(v) {
            sets[v] = {}
            sets[v][v] = true;
            mst[v] = {}
        });

        var union = function(v1, v2) {
            $.each(sets[v2], function(v) {
                sets[v1][v] = true;
                sets[v] = sets[v1];
            });
        }

        $.each(self.edgesInNonDecreasingWeight(), function(i, edge) {
            if (sets[edge.v1] !== sets[edge.v2]) {
                mst[edge.v1][edge.v2] = true;
                union(edge.v1, edge.v2);
            }
        });
        return mst;
    }
}

var AdjacencyMatrixGraph = function() {

    var self = this;
    self.values = {};
    self.index = {};
    self.graph = [];

    self.getIndexForValue = function(v){
        var index = self.values[v];
        return index === undefined ? -1 : index;
    }

    self.addColumnsForValue = function(v) {
        var column = self.graph.length;
        var newColumn = [];
        for (var i = 0 ; i < column ; i++) {
            self.graph[i].push(false);
            newColumn.push(false);
        }
        newColumn.push(false);
        self.graph.push(newColumn);
        self.values[v] = column;
        self.index[column] = v;
        return column;
    }

    self.getValueIndexAndAddItIfNotFound = function(v) {
        var index = self.getIndexForValue(v);
        return index == -1 ? self.addColumnsForValue(v) : index;
    }

    self.addDirectedEdge = function(v1, v2) {
        var i1 = self.getValueIndexAndAddItIfNotFound(v1);
        var i2 = self.getValueIndexAndAddItIfNotFound(v2);
        self.graph[i1][i2] = true;
    }

    self.addEdge = function(v1, v2) {
        self.addDirectedEdge(v1, v2);
        self.addDirectedEdge(v2, v1);
    }

    self.getNeighbours = function(v) {
        var column = self.values[v];
        var result = [];
        for (var i = 0 ; i < self.graph.length ; i ++) {
            if (self.graph[column][i]) {
                result.push(self.index[i]);
            }
        }
        return result;
    }
}
