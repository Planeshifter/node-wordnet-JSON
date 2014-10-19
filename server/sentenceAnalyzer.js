var BPromise = require("bluebird");
var util = require("util");
var _ = require("underscore");
var arr = require("./array.js");

function walkTree(current, parent){
    if(current.children.length === 1 && parent !== null){
      var child = current.children[0];
      walkTree(child, current);
      if (current.words !== null){
         var current_word_lemmas = Object.keys(current.words);
         var current_child_lemmas = current.children.filter(function(c){
           return c.words !== null;
         }).map(function(c){
           return Object.keys(c.words);
         }).reduce(function(a,b){
           return a.concat(b);
         },[]);
         if (current_word_lemmas.compare(current_child_lemmas)){
           current.flagged = true;
         }
      }
      return;
    }
    if(current.children.length === 0){
      return;
    }
    if(current.children.length > 1 || parent === null){
      current.children.forEach(function(child){
        walkTree(child, current);
      });
      return;
    }
}

function getNonFlaggedChild(node){
  if (node.children[0].flagged === true){
    return getNonFlaggedChild(node.children[0]);
  } else {
    return node.children[0];
  }
}

function removeFlaggedNodes(current){
  //console.log(current.children)
  current.children.forEach(function(child){
    if(child.flagged === true && child.parentId !== "root"){
      var insertNode = getNonFlaggedChild(child);
      current.children = current.children.filter(function(e){
        return e.data.synsetid !== child.data.synsetid;
      });
      current.children.push(insertNode);
      removeFlaggedNodes(insertNode);
    } else {
      removeFlaggedNodes(child);
    }
  });
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
      //  var childIds = 	tree[currentNode.parentId].children.map(function(e){ return e.p})
    	tree[currentNode.parentId].children.push(currentNode);
	}
  }
  walkTree(tree["root"], null);
  removeFlaggedNodes(tree["root"]);
  for (var key in tree){
  //  console.log(util.inspect(tree[key], null, 12))
  }

  return tree["root"];
}

module.exports = function getD3Tree(data){
    var ret = formD3Tree(data);
    console.log(ret)
    return ret;
}
