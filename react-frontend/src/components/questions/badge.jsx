import React from "react";
import styles from "./badge.module.scss";

const PADDING = 2.5;
const CENTER = 50 / 2;
const RADIUS = CENTER - PADDING;

const Badge = props => {
    const { percentage } = props;

    const startX = CENTER;
    const startY = PADDING;

    const angle = Math.min(percentage, 99.99) * 3.6;
    const angleRadians = (angle - 90) * (Math.PI / 180);

    const endX = CENTER + Math.cos(angleRadians) * RADIUS;
    const endY = CENTER + Math.sin(angleRadians) * RADIUS;

    const largeFlag = angle > 180 ? "1" : "0";

    const path = `
        M ${startX} ${startY}
        A ${RADIUS} ${RADIUS} 0 ${largeFlag} 1 ${endX} ${endY}
    `;

    return (
        <div className={styles.container}>
            <svg className={styles.svg}>
                <circle className={styles.pathEmpty} r={RADIUS} cx={CENTER} cy={CENTER} />
                <path className={styles.pathFill} d={path} />
            </svg>
            <div className={styles.textOverlay}>
                <span className={styles.valueText}>
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    );
};

export default Badge;