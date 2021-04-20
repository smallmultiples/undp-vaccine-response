// Modified and fixed version of @rehooks/component-size
// handles non-HTML elements properly (i.e. SVG)
import React from "react";

const ResizeObserver = window.ResizeObserver;

function getSize(el) {
    if (!el) {
        return undefined;
    }

    const boundingRect = el.getBoundingClientRect();

    return {
        width: boundingRect.width,
        height: boundingRect.height,
        left: boundingRect.left,
        top: boundingRect.top,
    };
}

function useDimensions() {
    const ref = React.useRef(null);
    const [componentSize, setComponentSize] = React.useState(getSize(ref.current));

    const handleResize = React.useCallback(() => {
        if (ref.current) {
            setComponentSize(getSize(ref.current));
        }
    }, [ref]);

    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }

        handleResize();

        if (typeof ResizeObserver === "function") {
            const observeEl = ref.current;
            let resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(observeEl);

            return () => {
                resizeObserver.disconnect(observeEl);
                resizeObserver = null;
            };
        } else {
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [ref, handleResize]);

    return [ref, componentSize];
}

export default useDimensions;
