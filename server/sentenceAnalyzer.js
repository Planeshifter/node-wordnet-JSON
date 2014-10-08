var Promise = require("bluebird");
var util = require("util");
var _ = require("underscore");

function collapseTree(node){

}

function formD3Tree(tree){
// initialize child arrays
  for (var key in tree){
  	tree[key].children = [];
  }
  tree["root"] = {};
  tree["root"].children = [];

  for (var key in tree){
    var currentNode = tree[key];
    if (currentNode.parentId && tree[currentNode.parentId]){
    	tree[currentNode.parentId].children.push(currentNode);
	}
  }
  collapseTree(tree["root"]);
  return tree["root"];
}

module.exports = function getD3Tree(data){
    var ret = formD3Tree(data);
    console.log(ret)
    return ret;
}
