
import React from "react";
import { scaleLinear } from "d3-scale";
import _ from "lodash";

const getRange = (data, metric) => {
    const values = data.map((d) => d.data[d.data.findIndex((el) => el.dataKey === metric)]?.value);
    const minTemp = _.min(values);
    const maxTemp = _.max(values);
    const max = maxTemp || 0;
    const min = minTemp ? minTemp > 0 ? 0 : minTemp : 0;
    return [min, max];
};
  
const Graph = props => {
    const width = 1024;
    const height = 560;
    const margin = {
      top: 20,
      bottom: 20,
      left: 30,
      right: 10,
    };
    console.log(props)
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    /*
    const yScale = scaleLinear().domain(getRange(props.data,yDomain)).range([graphHeight, 0]).nice();
    const xScale = scaleLinear().domain(xDomain).range([0, graphWidth]).nice();
*/
    return <div>
        <svg width='100%' viewBox={`0 0 ${width} ${height}`}>
            <g transform={`translate(${margin.left},${margin.top})`}>
            </g>
        </svg>
    </div>

}

export default Graph;