import React from "react";
import { extent } from "d3";
import { startOfYear, eachYearOfInterval } from "date-fns";
import { isDateValid } from "../../modules/utils";
import { last } from "lodash";

export const TIMELINE_SCALE = {
    Yearly: 1,
    Monthly: 2,
    Daily: 3,
};

function useTimelinePlaying(ticks, setCurrentTime) {
    const [playing, setPlaying] = React.useState(false);
    const frameRef = React.useRef(null);
    const lastFrameTime = React.useRef(null);
    const [stepProgress, setStepProgress] = React.useState(0);

    React.useEffect(() => {
        if (!playing) return;

        setCurrentTime(current => {
            // If we start playing and we're at the end, go back to the start
            if (current.getTime() === last(ticks).getTime()) {
                return ticks[0];
            }
            return current;
        });

        const frameCallback = now => {
            const dt = lastFrameTime.current ? (now - lastFrameTime.current) / 1000 : 1 / 60;

            const addProgress = (1 / 2.0) * dt; // 2 seconds per step

            setStepProgress(current => {
                const newProg = Math.min(1, current + addProgress);

                if (newProg >= 1) {
                    // Go to next step.
                    setCurrentTime(currentTime => {
                        const currentIndex = ticks.findIndex(
                            t => t.getTime() === currentTime.getTime()
                        );
                        const nextIndex = currentIndex + 1;
                        const nextTime = ticks[nextIndex];
                        if (nextIndex === ticks.length - 1) {
                            // Stop playing if we're moving to the last time
                            setPlaying(false);
                        }
                        return nextTime;
                    });
                    return 0;
                } else {
                    return newProg;
                }
            });

            lastFrameTime.current = now;
            frameRef.current = requestAnimationFrame(frameCallback);
        };

        frameRef.current = requestAnimationFrame(frameCallback);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
                lastFrameTime.current = null;
                setStepProgress(0);
            }
        };
    }, [playing, ticks, setCurrentTime]);

    return { playing, setPlaying, stepProgress };
}

export default function useTimelineState(selectedIndicatorData) {
    const [currentTime, setCurrentTime] = React.useState(null);

    const timelineScale = React.useMemo(() => {
        // TODO: pick an appropriate scale based on indicators.
        return TIMELINE_SCALE.Yearly;
    }, []);

    const timespan = React.useMemo(() => {
        const rawExtent = extent(selectedIndicatorData, d => d.Year);

        // TODO: process differently here based on scale
        switch (timelineScale) {
            case TIMELINE_SCALE.Yearly:
            default: {
                return rawExtent.map(d => startOfYear(new Date(d)));
            }
        }
    }, [timelineScale, selectedIndicatorData]);

    // TODO: different scales, not just yearly.
    const ticks = React.useMemo(() => {
        if (timespan.some(d => !isDateValid(d))) return null;
        return eachYearOfInterval({
            start: timespan[0],
            end: timespan[1],
        });
    }, [timespan]);

    const { playing, setPlaying, stepProgress } = useTimelinePlaying(ticks, setCurrentTime);

    React.useEffect(() => {
        if (!currentTime && isDateValid(timespan[1])) {
            setCurrentTime(timespan[1]);
        } else if (currentTime > timespan[1]) {
            setCurrentTime(timespan[1]);
        } else if (currentTime < timespan[0]) {
            setCurrentTime(timespan[0]);
        }
    }, [timespan, currentTime]);

    React.useEffect(() => {
        // If timespan changes, set to the most recent
        if (isDateValid(timespan[1])) {
            setCurrentTime(timespan[1]);
        }
    }, [timespan]);

    return {
        currentTime,
        setCurrentTime,
        timespan,
        timelineScale,
        playing,
        setPlaying,
        ticks,
        stepProgress,
    };
}
