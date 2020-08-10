import React from "react";
import styles from "./timeline.module.scss";
import { scaleTime } from "d3";

function useScale(timelineState) {
    return React.useMemo(() => {
        return scaleTime().domain(timelineState.timespan).range([0, 1]);
    }, [timelineState.timespan]);
}

export default function Timeline(props) {
    const { timelineState } = props;

    const scale = useScale(timelineState);

    return (
        <div className={styles.timeline}>
            <TimelineControls timelineState={timelineState} />
            <TimelineVis timelineState={timelineState} scale={scale} />
        </div>
    );
}

function TimelineControls(props) {
    const { timelineState } = props;
    return (
        <div className={styles.controls} onClick={() => timelineState.setPlaying(d => !d)}>
            Playing: {timelineState.playing ? "yes" : "no"}
        </div>
    );
}

function TimelineVis(props) {
    const { timelineState, scale } = props;

    if (!timelineState.ticks) return null;

    const ticks = timelineState.ticks.map(tick => {
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
