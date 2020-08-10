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

const IconPlay = () => (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12.5885 8.31958C12.8705 8.14433 12.8705 7.85567 12.5885 7.68042L0.509362 0.0723391C0.227394 -0.102915 0 0.0517206 0 0.412537V15.5875C0 15.9483 0.227394 16.1029 0.509362 15.9277L12.5885 8.31958Z"
            fill="#110848"
        />
    </svg>
);

const IconPause = () => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="4" height="16" rx="1" fill="#110848" />
        <rect x="8" width="4" height="16" rx="1" fill="#110848" />
    </svg>
);

function TimelineControls(props) {
    const { timelineState } = props;
    const { playing } = timelineState;
    return (
        <div className={styles.controls}>
            <div className={styles.playButtonContainer}>
                <button
                    className={styles.playButton}
                    onClick={() => timelineState.setPlaying(d => !d)}
                    data-playing={playing}
                >
                    {playing ? <IconPause /> : <IconPlay />}
                </button>
                <label>Select or play through historical data</label>
            </div>
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
                key={tick.getTime()}
                data-selected={selected}
                style={{ left: x }}
                onClick={onClick}
            >
                {1900 + tick.getYear()}
            </div>
        );
    });

    const tickAmt = 1 / (timelineState.ticks.length - 1);
    const fillStart = scale(timelineState.currentTime);
    const fillWidth = fillStart * 100 + "%";
    const stepEnd = fillStart + timelineState.stepProgress * tickAmt;
    const stepWidth = stepEnd * 100 + "%";

    return (
        <div className={styles.vis}>
            <div className={styles.visBarOuter}>
                <div
                    className={styles.visBarStepFill}
                    style={{
                        width: stepWidth,
                    }}
                />
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
