//SETUP
const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.right - margin.left;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", graphWidth + margin.left + margin.right)
  .attr("height", graphHeight + margin.top + margin.bottom);

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//SCALES
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

//AXES GROUPS
const xAxisGroup = graph
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append("g").attr("class", "y-axis");

//line generator
const line = d3
  .line()

  .x(function(d) {
    return x(new Date(d.date));
  })
  .y(function(d) {
    return y(d.distance);
  });

const path = graph.append("path");

//UPDATE function
const update = data => {
  data = data.filter(d => d.activity === activity);

  data.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  console.log("data: ", data);

  //UPDATE DOMAIN FOR AXIS
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d => d.distance)]);

  //UPDATE PATH DATA
  path
    .data([data])
    .attr("fill", "none")
    .attr("stroke", "#00bfa5")
    .attr("stroke-width", 2)
    .attr("d", line);

  //CREATE CIRCLES
  const circles = graph.selectAll("circle").data(data);

  //REMOVE CIRCLES
  circles.exit().remove();

  //UPDATE CIRCLES
  circles.attr("cx", d => x(new Date(d.date))).attr("cy", d => y(d.distance));

  //ADD CIRCLES
  circles
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("cx", d => x(new Date(d.date)))
    .attr("cy", d => y(d.distance))
    .attr("fill", "#ccc");

  //AXIS FORMAT
  const xAxis = d3
    .axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat("%b %d"));
  const yAxis = d3
    .axisLeft(y)
    .ticks(4)
    .tickFormat(d => `${d}km`);

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");
};

// data array and firestore
let data = [];

db.collection("activities").onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  // call the update function
  update(data);
});
