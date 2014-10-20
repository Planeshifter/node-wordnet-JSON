var _topicDomains = ["adj.all","adj.pert","adj.ppl","adv.all",
  "noun.act","noun.animal","noun.artifact","noun.attribute","noun.body",
  "noun.cognition","noun.communication","noun.event","noun.feeling",
  "noun.food","noun.group","noun.linkdef","noun.location",
  "noun.motive","noun.object","noun.person","noun.phenomenon",
  "noun.plant","noun.possession","noun.process","noun.quantity",
  "noun.shape","noun.state","noun.substance","noun.time","noun.tops",
  "verb.body","verb.change","verb.cognition","verb.communication",
  "verb.competition","verb.consumption","verb.contact","verb.creation",
  "verb.emotion","verb.motion","verb.perception","verb.possession",
  "verb.social","verb.stative","verb.weather"];

var _topicColors = d3.scale.category20b().range()
.concat(d3.scale.category20c().range())
.concat(["#2f81c4","#ef3838","#33d035","#9b9392","#17a8a3"]);

var _topicColorScale = d3.scale.ordinal()
  .domain(_topicDomains)
  .range(_topicColors);


function tree() {
    var _chart = {};
    var _width = 1600, _height = 900,
            _margins = {top: 30, left: 120, right: 30, bottom: 30},
            _svg,
            _nodes,
            _i = 0,
            _tree,
            _diagonal,
            _bodyG;

   function zoom() {
	    _svg.select(".body").attr("transform", "translate(" +
                                       d3.event.translate +
                          ")scale(" + d3.event.scale + ")");
   }

    _chart.render = function () {
    	tree.iterator += 1;
        if (!_svg) {
            _svg = d3.select("#svg_holder").append("svg")
                    .attr("id", "graph")
                    .call( // <-A
                      d3.behavior.zoom() // <-B
                      .scaleExtent([1, 8]) // <-C
                      .on("zoom", zoom) // <-D
                    );

            //add css stylesheet
        var svg_style = _svg.append("defs")
          .append('style')
          .attr('type','text/css');

        //text of the CSS stylesheet below -- note the multi-line JS requires
        //escape characters "\" at the end of each line
        var css_text = "<![CDATA[ \
             .node circle { \
                cursor: pointer; \
                stroke: grey; \
                stroke-width: 1.5px; \
            } \
          ]]> ";

        svg_style.text(css_text);
        }

        renderBody(_svg);
    };

    function renderBody(svg) {
        if (!_bodyG) {
          _bodyG = svg.append("g")
    				.attr("class", "body")
    				.attr("transform", function (d) {
    					return "translate(" + _margins.left + "," + _margins.top + ")";
    				});
        }

        _tree = d3.layout.tree()
                .size([
					(_height - _margins.top - _margins.bottom),
					(_width - _margins.left - _margins.right)
				]);

        _diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

        _nodes.x0 = (_height - _margins.top - _margins.bottom) / 2;
        _nodes.y0 = 0;

        render(_nodes);
    }

    function render(source) {
        var nodes = _tree.nodes(_nodes).reverse();

        renderNodes(nodes, source);

        renderLinks(nodes, source);
    }

    function renderNodes(nodes, source) {
        nodes.forEach(function (d) {
            d.y = d.depth * 90;
        });

        var node = _bodyG.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++_i);
                });

        var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0	  + "," + source.x0 + ")";
                })
                .on("click", function (d) {
                    toggle(d);
                    render(d);
                });

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

        nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .attr("class","synsetNode")
                .style("fill", function(d){
                  return _topicColorScale(d.data.lexdomain);
                })
                .attr("data-topic",function(d){
                  return d.data.lexdomain.replace(/[.]/g,"-");
                })
                .attr("fill-opacity", function(d){
                  var topic = d.data.lexdomain.replace(/[.]/g,"-");
                  var status = $("#" + topic).data("status");
                  if(status === "on"){
                    return 1;
                  } else {
                    return 0.3;
                  }
                })
                .on("mouseover", function(d) {
                  var str = "";
                  if (d.words){
                    var sortable = [];
                    for (var lemma in d.words){
                      $("span.word:contains('" + lemma + "')")
                      .css("background-color", _topicColorScale(d.data.lexdomain));
                      sortable.push([lemma, d.words[lemma]]);
                    }
                    var wordStrings = sortable.sort(function(a,b){
                      return b[1] - a[1];
                    });
                    wordStrings = wordStrings.map(function(s){
                      return s[0] + "(" + s[1] + ")";
                    });
                    str += "<strong>Words:</strong> " + wordStrings.splice(0,12).join(" , ");
                    str += "<br>";
                    str += "<strong>Definition:</strong> " + d.data.definition + "<br>";
                    str += "<strong>POS</strong>: " + d.data.pos;
                    str += "<br>";
                    str += "<strong>Lexical Domain:</strong> " + d.data.lexdomain;
                    str += "<br>";
                    str += "<strong>Document Count:</strong> " + d.docCount;
                    str += "<br>";
                    str += "<strong>Word Count:</strong> " + d.wordCount;
                  }
                  else {
                    str += "<strong>Definition:</strong> " + d.data.definition + "<br>";
                    str += "<strong>POS</strong>: " + d.data.pos;
                    str += "<br>";
                    str += "<strong>Lexical Domain:</strong> " + d.data.lexdomain;
                    str += "<br>";
                    str += "<strong>Document Count:</strong> " + d.docCount;
                    str += "<br>";
                    str += "<strong>Word Count:</strong> " + d.wordCount;
                  }
                    div.transition()
                       .duration(200)
                       .style("opacity", 0.9);

                    div.html(str)
                       .style("left", (d3.event.pageX) + "px")
                       .style("top", (d3.event.pageY - 100) + "px");
                  })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    $("span.word").css("background-color","transparent");
                });



        var nodeUpdate = node.transition()
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d){
                  var label = d.data.lexdomain.replace(/[.]/g,"-");
                  $('#'+label).css("display","block");
                  return _topicColorScale(d.data.lexdomain);
                });

        var nodeExit = node.exit().transition()
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

        nodeExit.select("circle")
                .attr("r", 1e-6);

        renderLabels(nodeEnter, nodeUpdate, nodeExit);

        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function renderLabels(nodeEnter, nodeUpdate, nodeExit) {
        nodeEnter.append("svg:text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("class","synsetLabels")
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    var words =  d.data.words.map(function(d){
                      return d.lemma;
                    });
                    return words.slice(0, 3).join(", ");
                })
                .attr("data-topic", function(d){
                  return d.data.lexdomain.replace(/[.]/g,"-");
                })
                .style("fill-opacity", 1e-6);

        nodeUpdate.select("text")
                .style("fill-opacity", function(d){
                  var topic = d.data.lexdomain.replace(/[.]/g,"-");
                  var status = $("#" + topic).data("status");
                  if(status === "on"){
                    $('text[data-topic="' + topic + '"]').show();
                  } else {
                    $('text[data-topic="' + topic + '"]').hide();
                  }
                  return 1;
                });

        nodeExit.select("text")
                .style("fill-opacity", 1e-6);

    }

    function renderLinks(nodes, source) {
        var link = _bodyG.selectAll("path.link")
                .data(_tree.links(nodes), function (d) {
                    return d.target.id;
                });

        link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {x: source.x0, y: source.y0};
                    return _diagonal({source: o, target: o});
                })
                .style("stroke", function(d){
                  var colorSource = _topicColorScale(d.source.data.lexdomain);
                  var colorTarget = _topicColorScale(d.target.data.lexdomain);
                  return colorSource;
                })
                .attr("data-topic",function(d){
                  return d.source.data.lexdomain.replace(/[.]/g,"-");
                })
                .attr("opacity", function(d){
                  var topic = d.source.data.lexdomain.replace(/[.]/g,"-");
                  var status = $("#" + topic).data("status");
                  if(status === "on"){
                    return 1;
                  } else {
                    return 0.3;
                  }
                });

        link.transition()
                .attr("d", _diagonal);

        link.exit().transition()
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return _diagonal({source: o, target: o});
                })
                .remove();

        $("#spinnerContainer").hide();
    }

    function toggle(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            toggle(d);
        }
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.nodes = function (n) {
        if (!arguments.length) return _nodes;
        _nodes = n;
        return _chart;
    };

    return _chart;
}

var chart = tree();

function paintSentenceGraph(type) {
  var reader = new FileReader();
  var fileInput = document.getElementById('fileInput');
  var file = fileInput.files[0];
  reader.onload = function(){
    var wordnetifyJSON = reader.result;
    var postData = wordnetifyJSON;
    corpus = JSON.parse(wordnetifyJSON).corpus;
    paintDoc(currentDocId);
    query = encodeURIComponent($("#input_text").val());

      if(query !== ""){
        if(true){
        url = "http://localhost:12000/analyze_corpus";

          $.ajax({
              type : "POST",
              url : url,
              data: postData
          }).done(function(msg) {
              var root = msg;
              root.data = {};
              root.wordCount = "NA";
              root.docCount = "NA";
              root.parentId = "NA";
              root.words = null;
              root.data.words = [{lemma: "root"}];
              root.data.lexdomain = "NA";
              root.data.definition = "NA";
              root.data.pos = "NA";
              root.data.children = msg;

              paintSentenceGraph.data = root;

              switch(type){
                case "text":
                  renderText(paintSentenceGraph.data);
                break;
                case "graph":
                  chart.nodes(root).render();
                  //get svg element.
                  var svg = document.getElementById("graph");

                  //get svg source.
                  var serializer = new XMLSerializer();
                  var source = serializer.serializeToString(svg);

                  //add name spaces.
                  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
                      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                  }
                  if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
                      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
                  }
                  //add xml declaration
                  source = '<?xml version="1.0" standalone="no"?><?xml-stylesheet href="styles.css" type="text/css"?> \r\n' + source;
                  //convert svg source to URI data scheme.
                  var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
                  document.getElementById("save_svg_button").href = url;

                break;
              }
          });
        } else {
             switch(type){
                case "text":
                  renderText(paintSentenceGraph.data);
                break;
                case "graph":
                  chart.nodes(paintSentenceGraph.data).render();
                break;
              }

        }
      }
  };
  reader.readAsText(file);
}

function clearSentence(){
	d3.select("#graph").remove();
  d3.select("#dendogram").remove();
	chart = tree();
}

function renderText(input){

var countLeafElements = (function (){
  var counter = 0;
  return function(obj){
    if (obj.children && obj.children.length > 0){
      obj.children.forEach(countLeafElements);
    } else {
      counter += 1;
    }
    return counter;
  };
}());

var numberOfLeafs = countLeafElements(input);

var width = window.innerWidth,
    height = numberOfLeafs *  15;

var cluster = d3.layout.cluster()
    .size([height, width - 160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id","dendogram")
    .append("g")
    .attr("transform", "translate(40,0)");

  var nodes = cluster.nodes(input),
      links = cluster.links(nodes);

  var link = svg.selectAll(".link")
      .data(links)
      .enter().append("path")
      .attr("id",function(d){ return d.synsetid; })
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .style("-webkit-transform","rotate(0deg)")
      .text(function(d) {
        return d.words[0].lemma;
      });

  return svg;
}

var docCount = 1;
var corpus;
var currentDocId = 0;

function paintDoc(id){
  var text = corpus[id];
  var text_html = text.replace(/(\w+)/g,"<span class='word'>$1</span>");
  $(".documents-area").html(text_html);
}

$(function() {
  $body = $("body");
  $body.append("<div id='spinnerContainer'></div>");
  $spinnerContainer = $("#spinnerContainer");
  $spinnerContainer.append("<div id='spinner'></div>");
  $("#spinner").append("<div id='loader'></div>");

  _topicDomains.forEach(function(d){
    var label = d.replace(/[.]/g,"-");
    $("#color_legend").append('<div class="legend-item" id="'+ label +'"></div>');
    $("#"+label).data("status","on");
    $('<div class="color-box"></div>')
      .css('background-color',_topicColorScale(d))
      .appendTo("#"+label);
    $('<p class="legend-label">' + label + '</p>').appendTo("#"+label);
  });

  $("#analyze_button").on("click", function(){
    $spinnerContainer.fadeIn();
    $("body").css({"overflow-y":"scroll"});
    $(".row").hide();
    $("#plot_menu").show();
    $("#color_legend").show();
    $("#bottom_bar").show();
    $("#svg_holder").show();

    d3.select("#graph").remove();
    chart = tree();
    paintSentenceGraph("graph");
  });

  $("#back_button").on("click",function(){
    clearSentence();
    $("#plot_menu").hide();
    $("#color_legend").hide();
    $("#bottom_bar").hide();
    $("#svg_holder").hide();
    $(".row").fadeIn("normal");
  });

  $(".legend-item").on("click",function(){
    var self = this;
    var clicked_div = $(this);
    var topic = clicked_div.select(".legend-label").text();

    if (clicked_div.data("status") === "off"){
      clicked_div.data("status","on");
      $('circle[data-topic="' + topic + '"]').animate({'fill-opacity': 1  },"fast");
      $('path.link[data-topic="' + topic + '"]').animate({'opacity': 1},"fast");
      $('text[data-topic="' + topic + '"]').show("fast");
      clicked_div.css("opacity", 1);
    } else {
      clicked_div.data("status","off");
      $('circle[data-topic="' + topic + '"]').animate({'fill-opacity': 0.3},"fast");
      $('path.link[data-topic="' + topic + '"]').animate({'opacity': 0.3},"fast");
      $('text[data-topic="' + topic + '"]').hide("fast");
      clicked_div.css("opacity", 0.5);
    }
  });

  $("#next-doc").on("click",function(){
    if (currentDocId + 1 < corpus.length){
      currentDocId++;
      paintDoc(currentDocId);
    }
  });

  $("#prev-doc").on("click",function(){
    if (currentDocId - 1 >= 0){
      currentDocId--;
      paintDoc(currentDocId);
    }
  });

});
