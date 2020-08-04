import { flatten } from "lodash";
import React from "react";
import { extent } from "d3";
import { startOfYear } from "date-fns";

export const TIMELINE_SCALE = {
    Yearly: 1,
    Monthly: 2,
    Daily: 3,
};

const isDateValid = d => Boolean(d && !isNaN(d.getTime()));

export default function useTimelineState(selectedIndicatorData) {
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

    const [currentTime, setCurrentTime] = React.useState(null);

    React.useEffect(() => {
        if (!currentTime && isDateValid(timespan[1])) {
            setCurrentTime(timespan[1]);
        }
    }, [timespan]);

    return {
        currentTime,
        setCurrentTime,
        timespan,
        timelineScale,
    };
}
