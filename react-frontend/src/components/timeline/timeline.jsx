import React from "react";
import { eachYearOfInterval } from "date-fns";
import styles from "./timeline.module.scss";
import { isDateValid } from "../../modules/utils";
import { scaleTime, style } from "d3";

function useTickData(timelineState) {
    // TODO: different scales, not just yearly.
    return React.useMemo(() => {
        const { timespan } = timelineState;
        if (timespan.some(d => !isDateValid(d))) return null;
        return eachYearOfInterval({
            start: timespan[0],
            end: timespan[1],
        });
    }, [timelineState.timespan, timelineState.timelineScale]);
}

function useScale(timelineState) {
    return React.useMemo(() => {
        return scaleTime().domain(timelineState.timespan).range([0, 1]);
    }, [timelineState.timespan]);
}

export default function Timeline(props) {
    const { timelineState } = props;

    const tickData = useTickData(timelineState);
    const scale = useScale(timelineState);

    if (!tickData) return null;

    return (
        <div className={styles.timeline}>
            <TimelineControls />
            <TimelineVis timelineState={timelineState} tickData={tickData} scale={scale} />
        </div>
    );
}

function TimelineControls(props) {
    return <div className={styles.controls}>Play button and date picker placeholder</div>;
}

function TimelineVis(props) {
    const { timelineState, tickData, scale } = props;

    const ticks = tickData.map(tick => {
        const x = scale(tick) * 100 + "%";
        const onClick = () => {
            timelineState.setCurrentTime(tick);
        };

        const selected =
            timelineState.currentTime && timelineState.currentTime.getTime() === tick.getTime();

        // TODO: format based on timeline scale.
        return (
            <div
                className={styles.tick}
                data-selected={selected}
                style={{ left: x }}
                onClick={onClick}
            >
                {1900 + tick.getYear()}
            </div>
        );
    });

    const fillWidth = scale(timelineState.currentTime) * 100 + "%";

    return (
        <div className={styles.vis}>
            <div className={styles.visBarOuter}>
                <div
                    className={styles.visBarFill}
                    style={{
                        width: fillWidth,
                    }}
                />
            </div>
            <div className={styles.ticks}>{ticks}</div>
        </div>
    );
}
