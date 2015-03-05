var TAGAlg = TAGAlg || {};

/** 
 * An implementation of the Kruskal algorithm to find the minimum spanning tree of a graph.
 * Example usage:
 * // vertices hold data that will be used in the distance metric function
 * var verticies = [ 
 *  [0.38503426988609135,0.5090362404007465],
 *  [0.19520984776318073,0.786977760726586],
 *  ...
 *]
 *
 * // edges are vertex position pairs
 * var edges = [ 
 *  [8,6], [8,12], [6,12], ...
 *];
 *
 * function metric_dist( a, b )
 *{
 *  var dx = a[0] - b[0];
 *  var dy = a[1] - b[1];
 *   return dx*dx + dy*dy;
 *}
 *  
 * var edgeMST = TAGAlg.Kruskal( vertices, edges, metric_dist );
 *
 * // Print minimum spanning tree
 *for (var ind in edgeMST)
 *{
 *  var u = edgeMST[ind][0];
 *  var v = edgeMST[ind][1];
 *
 *  console.log( verts[u][0] + " " + verts[u][1] );
 *  console.log( verts[v][0] + " " + verts[v][1] );
 *  console.log("");
 *}
 */

/**
 * Vertices holds data that will be used in the distance metric.
 * Edges holds positions in the vertices list.
 * Metric is a function to calulate the distance between vertices.
 */
TAGAlg.Kruskal = function(vertices, edges, metric) {
    var set = {};
	var finalEdge = [];
	
	var forest = new TAGDs.UnionFind(vertices.length);
	
	var edgeDist = [];
	for(var ind in edges) {
	    var u = edges[ind][0];
		var v = edges[ind][1];
		var e = { edge: edges[ind], weight: metric(vertices[u], vertices[v]) };
		edgeDist.push(e);
	}
	
	edgeDist.sort( function(a,b) { return a.weight - b.weight; } );
	
	for(var i = 0; i < edgeDist.length; ++i) {
	    var u = edgeDist[i].edge[0];
		var v = edgeDist[i].edge[1];
		
		if(forest.find(u) != forest.find(v)) {
		    finalEdge.push([u,v]);
			forest.link(u, v);
		}
	}
	
	return finalEdge;
};