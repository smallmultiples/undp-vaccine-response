import { HorizontalArrow, VerticalArrow } from './icons';
import React from 'react';
import styled from 'styled-components';

const TooltipEl = styled.div`
  display: block;
  position: fixed;
  z-index: 10;
  border-radius: 10px;
  font-size: 14px;
  background-color: #fff;
  z-index: 1000;
  box-shadow: 0 0 10px rgb(0 0 0 / 15%);
  word-wrap: break-word;
  top: ${(props) => props.y - 40}px;
  left: ${(props) => props.x + 20}px;
  max-width: 240px;
`;

const TooltipTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #110848;  
  background: #f3d516;
  width: 100%;
  box-sizing: border-box;
  padding: 16px 40px 16px 20px;
  position: relative;
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
`;

const TooltipBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
`;

const RowEl = styled.div`
  font-size: 13px;
  color:#383838;
  margin-bottom: 15px;
  display: flex;
`;

const RowTitleEl = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
  margin-bottom: 6px;
  color: #110848;
`;

const RowMetaData = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
  margin-bottom: 6px;
  color: #110848;
  opacity: 0.5;
`;

const RowValue = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  color: #110848;
`;

const TooltipHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;


const SizeIcon = styled.div`
  width: 14px;
  height: 14px;
  margin: 0 2px;
  border-radius: 14px;
  border: 2px solid #110848;
`;

const IconDiv = styled.div`
  margin-right: 5px;
  margin-top: 5px;
`;

const SubNote = styled.div`
    font-size: 12px;
    color: #383838;
    font-style: italic;
`;

export const HoverTooltip = (props) => {
  const {
    data,
  } = props;
  return (
    <TooltipEl x={data.xPosition} y={data.yPosition}>
      <TooltipHead>
        <TooltipTitle>
          {data.country}
        </TooltipTitle>
      </TooltipHead>
      <TooltipBody>
        {
        data.rows.map((d, i) => (
          <RowEl key={i}>
            <IconDiv>
              {
                d.type === 'x-axis' ? <HorizontalArrow size={20} />
                  : d.type === 'y-axis' ? <VerticalArrow size={20} />
                      : d.type === 'size' ? <SizeIcon />
                        : null
              }
            </IconDiv>
            <div>
              <RowMetaData>{d.metaData}</RowMetaData>
              <RowTitleEl>{d.title}</RowTitleEl>
              <RowValue>{typeof d.value === "number" ? d.value.toFixed(2) : d.value}</RowValue>
            </div>
          </RowEl>
        ))
      }
      {
          data.regional ? 
          <SubNote>Click to see the country data</SubNote> : null
      }
      </TooltipBody>
    </TooltipEl>
  );
};
