import React from "react";

const QUERIES = [
    { key: "isTablet", query: "screen and (max-width: 1250px)" },
    { key: "isMobile", query: "screen and (max-width: 900px)" },
];

const mediaQueryLists = QUERIES.map(q => ({
    key: q.key,
    mediaQueryList: window.matchMedia(q.query),
}));

export default function useMediaQuery() {
    const updateMediaQueryMatch = mq => state => ({
        ...state,
        [mq.key]: mq.mediaQueryList.matches,
    });

    const [values, setValues] = React.useState(() =>
        mediaQueryLists.reduce((acc, mq) => updateMediaQueryMatch(mq)(acc), {})
    );

    React.useEffect(() => {
        const listeners = mediaQueryLists.map(mq => {
            const handler = () => setValues(updateMediaQueryMatch(mq));
            mq.mediaQueryList.addListener(handler);
            return {
                handler,
                mq,
            };
        });

        return () =>
            listeners.forEach(listener =>
                listener.mq.mediaQueryList.removeListener(listener.handler)
            );
    }, []);

    return values;
}