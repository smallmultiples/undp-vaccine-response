
import React from "react";
import { scaleLinear } from "d3-scale";
import { HoverTooltip } from '../tooltip/tooltip'
import regionAbbreviations from '../data/regionAbbreviations.json';
import styles from "./graph.module.scss";
import _ from "lodash";

const getDomain = (data, metric) => {
    const values = data.map((d) => d.data[d.data.findIndex((el) => el.dataKey === metric)]?.value);
    const minTemp = _.min(values);
    const maxTemp = _.max(values);
    const max = maxTemp || 0;
    const min = minTemp ? minTemp > 0 ? 0 : minTemp : 0;
    return [min, max];
};
const getDomainForCountry = (data, metric) => {
    const values = data.countryData.map((d) => d[metric]);
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
      top: 10,
      bottom: 20,
      left: 30,
      right: 10,
    };
    const [selectedRegion, setSelectedRegion] = React.useState(null);
    const [hoverInfo, setHoverInfo] = React.useState(null);
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    const yScale = !selectedRegion ? 
        scaleLinear().domain(getDomain(props.data,props.currentIndicators.regionalY.dataKey)).range([graphHeight, 0]).nice() :
        scaleLinear().domain(getDomainForCountry(props.data[props.data.findIndex(d => d.region === selectedRegion)],props.currentIndicators.regionalY.dataKey)).range([graphHeight, 0]).nice();
    const xScale = !selectedRegion ? 
        scaleLinear().domain(getDomain(props.data,props.currentIndicators.regionalX.dataKey)).range([0, graphWidth]).nice() : 
        scaleLinear().domain(getDomainForCountry(props.data[props.data.findIndex(d => d.region === selectedRegion)],props.currentIndicators.regionalX.dataKey)).range([0, graphWidth]).nice();
    const radiusScale = !selectedRegion ? 
        scaleLinear().domain(getDomain(props.data,props.currentIndicators.mapVisualisation.dataKey)).range([0, 20]).nice() : 
        scaleLinear().domain(getDomainForCountry(props.data[props.data.findIndex(d => d.region === selectedRegion)],props.currentIndicators.mapVisualisation.dataKey)).range([0, 20]).nice();
    const xTick = xScale.ticks(5);
    const yTick = yScale.ticks(5);
    console.log(props.data)
    return <>
    
    {
        props.data ? 
            <> 
                <div style={{width:"100%"}}>
                    <div className={styles.breadcrumbEl}>
                        <span className={selectedRegion ? styles.breadcrumb : styles.breadcrumbSelected} onClick={() => {setSelectedRegion(null)}}>All Regions</span>
                        {
                            selectedRegion ? <span className={styles.breadcrumbSelected}> | {selectedRegion}</span> : null
                        }
                    </div>
                    <svg width='100%' viewBox={`0 0 ${width} ${height}`} style={{border:"1px solid #f2f7ff", padding:"10px"}}>
                        <g transform={`translate(${margin.left},${margin.top})`}>
                            {
                                xTick.map((d,i) => (
                                    <line 
                                        x1={xScale(d)}
                                        x2={xScale(d)}
                                        y1={0 - margin.top}
                                        y2={graphHeight}
                                        stroke={"#ccc"}
                                        strokeWidth={1}
                                        strokeDasharray={"5 5"}
                                        key={i}
                                    />
                                ))
                            }
                            <line 
                                x1={0}
                                x2={0}
                                y1={0 - margin.top}
                                y2={graphHeight}
                                stroke={"#222"}
                                strokeWidth={1}
                            />
                            {
                                xTick.map((d,i) => (
                                    <text 
                                        x={xScale(d)}
                                        y={graphHeight}
                                        fill={"#aaa"}
                                        textAnchor="middle"
                                        fontSize="12px"
                                        dy={12}
                                        key={i}
                                    >
                                        {d}
                                    </text>
                                ))
                            }
                            {
                                yTick.map((d,i) => (
                                    <line 
                                        y1={yScale(d)}
                                        y2={yScale(d)}
                                        x1={0}
                                        key={i}
                                        x2={graphWidth + margin.right}
                                        stroke={"#ccc"}
                                        strokeWidth={1}
                                        strokeDasharray={"5 5"}
                                    />
                                ))
                            }
                            <line 
                                y1={graphHeight}
                                y2={graphHeight}
                                x1={0}
                                x2={graphWidth + margin.right}
                                stroke={"#222"}
                                strokeWidth={1}
                            />
                            {
                                yTick.map((d,i) => (
                                    <text 
                                        x={0}
                                        y={yScale(d)}
                                        fill={"#aaa"}
                                        textAnchor="end"
                                        fontSize="12px"
                                        dy={6}
                                        dx={-2}
                                        key={i}
                                    >
                                        {d}
                                    </text>
                                ))
                            }
                            {
                                selectedRegion ? 
                                    props.data[props.data.findIndex(d => d.region === selectedRegion)].countryData.filter(d => d[props.currentIndicators.regionalX.dataKey] !== "" && d[props.currentIndicators.regionalY.dataKey] !== "").map((d,i) => {
                                        
                                        const rowData = [
                                            {
                                            title: props.currentIndicators.regionalX.label,
                                            indicator: props.currentIndicators.regionalX,
                                            value: d[props.currentIndicators.regionalX.dataKey],
                                            type: 'x-axis',
                                            metaData: '2021',
                                            },
                                            {
                                            title: props.currentIndicators.regionalY.label,
                                            indicator: props.currentIndicators.regionalY,
                                            value: d[props.currentIndicators.regionalY.dataKey],
                                            type: 'y-axis',
                                            metaData: '2021',
                                            },
                                        ];
                                        if (props.currentIndicators.mapVisualisationEnabled) {
                                            rowData.push({
                                            title: props.currentIndicators.mapVisualisation.label,
                                            indicator: props.currentIndicators.mapVisualisation,
                                            value: d[props.currentIndicators.mapVisualisation.dataKey],
                                            type: 'size',
                                            metaData: '2021',
                                            });
                                        }
                                        return (
                                            <g
                                                key={i}
                                                transform={`translate(${xScale(d[props.currentIndicators.regionalX.dataKey])},${yScale(d[props.currentIndicators.regionalY.dataKey])})`}
                                                onMouseEnter={(event) => {
                                                    setHoverInfo({
                                                    country: d.countryname,
                                                    rows: rowData,
                                                    xPosition: event.clientX,
                                                    yPosition: event.clientY,
                                                    });
                                                }}
                                                onMouseMove={(event) => {
                                                    setHoverInfo({
                                                    country: d.countryname,
                                                    rows: rowData,
                                                    xPosition: event.clientX,
                                                    yPosition: event.clientY,
                                                    });
                                                }}
                                                onMouseLeave={() => {
                                                    setHoverInfo(null);
                                                }}
                                                style={{cursor: "pointer"}}
                                            >
                                                <circle 
                                                    cx={0}
                                                    cy={0}
                                                    r={props.currentIndicators.mapVisualisationEnabled ? d[props.currentIndicators.mapVisualisation.dataKey] !== "" ? radiusScale(d[props.currentIndicators.mapVisualisation.dataKey]) : 0 : 5}
                                                    fill="#0bc6ff"
                                                    fillOpacity={0.6}
                                                    stroke="#0bc6ff"
                                                    strokeWidth={1}
                                                />
                                                <text
                                                    x={0}
                                                    y={0}
                                                    fontSize="8px"
                                                    textAnchor="middle"
                                                    dy={props.currentIndicators.mapVisualisationEnabled ? radiusScale(d[props.currentIndicators.mapVisualisation.dataKey]) + 10 : 15}
                                                >
                                                    {d[props.currentIndicators.mapVisualisation.dataKey] !== "" ? d.iso3 : ""}    
                                                </text>
                                            </g>
                                        )
                                    }) :
                                    props.data.filter(d => d.region !== null && d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalX.dataKey)].value !== "" && d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalY.dataKey)].value !== "").map((d,i) => {
                                        const rowData = [
                                            {
                                            title: props.currentIndicators.regionalX.label,
                                            indicator: props.currentIndicators.regionalX,
                                            value: d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalX.dataKey)].value,
                                            type: 'x-axis',
                                            metaData: '2021',
                                            },
                                            {
                                            title: props.currentIndicators.regionalY.label,
                                            indicator: props.currentIndicators.regionalY,
                                            value: d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalY.dataKey)].value,
                                            type: 'y-axis',
                                            metaData: '2021',
                                            },
                                        ];
                                        if (props.currentIndicators.mapVisualisationEnabled) {
                                            rowData.push({
                                            title: props.currentIndicators.mapVisualisation.label,
                                            indicator: props.currentIndicators.mapVisualisation,
                                            value: d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.mapVisualisation.dataKey)].value,
                                            type: 'size',
                                            metaData: '2021',
                                            });
                                        }
                                        return (
                                            <g
                                                onClick={() => {setSelectedRegion(d.region); setHoverInfo(null)}}
                                                key={i}
                                                transform={`translate(${xScale(d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalX.dataKey)].value)},${yScale(d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.regionalY.dataKey)].value)})`}
                                                onMouseEnter={(event) => {
                                                    setHoverInfo({
                                                    country: d.region,
                                                    rows: rowData,
                                                    xPosition: event.clientX,
                                                    yPosition: event.clientY,
                                                    regional: true
                                                    });
                                                }}
                                                onMouseMove={(event) => {
                                                    setHoverInfo({
                                                    country: d.region,
                                                    rows: rowData,
                                                    xPosition: event.clientX,
                                                    yPosition: event.clientY,
                                                    regional: true
                                                    });
                                                }}
                                                onMouseLeave={() => {
                                                    setHoverInfo(null);
                                                }}
                                                style={{cursor: "pointer"}}
                                            >
                                                <circle 
                                                    cx={0}
                                                    cy={0}
                                                    r={props.currentIndicators.mapVisualisationEnabled ? d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.mapVisualisation.dataKey)].value !== "" ? radiusScale(d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.mapVisualisation.dataKey)].value) : 0 : 5}
                                                    fill="#0bc6ff"
                                                    fillOpacity={0.6}
                                                    stroke="#0bc6ff"
                                                    strokeWidth={1}
                                                />
                                                <text
                                                    x={0}
                                                    y={0}
                                                    fontSize="8px"
                                                    textAnchor="middle"
                                                    dy={props.currentIndicators.mapVisualisationEnabled ? radiusScale(d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.mapVisualisation.dataKey)].value) + 10 : 15}
                                                >
                                                    {props.currentIndicators.mapVisualisationEnabled ? d.data[d.data.findIndex(el => el.dataKey === props.currentIndicators.mapVisualisation.dataKey)].value !== "" ? regionAbbreviations[d.region] : "" : regionAbbreviations[d.region]}    
                                                </text>
                                            </g>
                                        )
                                    })
                            }
                        </g>
                    </svg>
                </div>
                {
                    hoverInfo 
                    ? <HoverTooltip data={hoverInfo} />
                    : null
                } 
            </> : null
    }
</>
}

export default Graph;