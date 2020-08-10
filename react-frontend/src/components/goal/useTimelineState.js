import { flatten } from "lodash";
import React from "react";
import { extent } from "d3";
import { startOfYear } from "date-fns";
import { isDateValid } from "../../modules/utils";

export const TIMELINE_SCALE = {
    Yearly: 1,
    Monthly: 2,
    Daily: 3,
};

function useTimelinePlaying(setCurrentTime) {
    const [playing, setPlaying] = React.useState(false);
    const frameRef = React.useRef(null);
    const lastFrameTime = React.useRef(null);

    React.useEffect(() => {
        if (!playing) return;

        const frameCallback = now => {
            const dt = lastFrameTime.current ? (now - lastFrameTime.current) / 1000 : 1 / 60;

            lastFrameTime.current = now;
            frameRef.current = requestAnimationFrame(frameCallback);
        };

        frameRef.current = requestAnimationFrame(frameCallback);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
                lastFrameTime.current = null;
            }
        };
    }, [playing]);

    return [playing, setPlaying];
}

export default function useTimelineState(selectedIndicatorData) {
    const [currentTime, setCurrentTime] = React.useState(null);

    const timelineScale = React.useMemo(() => {
        // TODO: pick an appropriate scale based on indicators.
        return TIMELINE_SCALE.Yearly;
    }, [selectedIndicatorData]);

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

    const [playing, setPlaying] = useTimelinePlaying(timespan, setCurrentTime);

    React.useEffect(() => {
        if (!currentTime && isDateValid(timespan[1])) {
            setCurrentTime(timespan[1]);
        } else if (currentTime > timespan[1]) {
            setCurrentTime(timespan[1]);
        } else if (currentTime < timespan[0]) {
            setCurrentTime(timespan[0]);
        }
    }, [timespan]);

    return {
        currentTime,
        setCurrentTime,
        timespan,
        timelineScale,
        playing,
        setPlaying,
    };
}
