import React from "react";
import styles from "./map-filters-legends.module.scss";
import { IconArrowLeft, IconArrowRight, IconArrowUp, IconArrowDown } from "../icons/icons";

const MapFiltersLegends = props => {
    return (
        <div>
            <BivariateLegend {...props} />
        </div>
    );
};

const formatNumTemp = number => (number === undefined ? "" : number.toFixed(1));
const BivariateLegend = props => {
    const { displaySettings, scales } = props;
    const { jenks } = props.domains;
    const { variateXEnable, variateYEnable } = displaySettings;
    const bivariateColourMatrixHex = scales.colorMatrix;

    // TODO: format properly

    const xOnlyDisabled = !variateXEnable && variateYEnable;
    const yOnlyDisabled = !variateYEnable && variateXEnable;
    const bothDisabled = !variateXEnable && !variateYEnable;
    const eitherDisabled = !variateXEnable || !variateYEnable;

    const x0 = formatNumTemp(jenks.x[0]);
    const x1 = formatNumTemp(jenks.x[jenks.x.length - 1]);
    const y0 = formatNumTemp(jenks.y[0]);
    const y1 = formatNumTemp(jenks.y[jenks.y.length - 1]);
    return (
        <div className={styles.bivariateLegend}>
            <div className={styles.bivariateLegendTop}>
                <div className={styles.legendColourSpan} data-y>
                    <div className={styles.legendColourSpanValue} data-y>
                        <IconArrowUp />
                        <span>{displaySettings.variateYFlip ? y1 : y0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-y>
                        <span>{displaySettings.variateYFlip ? y0 : y1}</span>
                        <IconArrowDown />
                    </div>
                </div>

                <div className={styles.legendColour}>
                    <div className={styles.legendColourRow}>
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[0][0] }}
                            data-disabled={bothDisabled || yOnlyDisabled}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[0][2] }}
                            data-disabled={eitherDisabled}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[0][4] }}
                            data-disabled={eitherDisabled}
                        />
                    </div>
                    <div className={styles.legendColourRow}>
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[2][0] }}
                            data-disabled={bothDisabled || yOnlyDisabled}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[2][2] }}
                            data-disabled={eitherDisabled}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[2][4] }}
                            data-disabled={eitherDisabled}
                        />
                    </div>
                    <div className={styles.legendColourRow}>
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[4][0] }}
                            data-disabled={false}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[4][2] }}
                            data-disabled={bothDisabled || xOnlyDisabled}
                        />
                        <div
                            className={styles.legendColourCell}
                            style={{ background: bivariateColourMatrixHex[4][4] }}
                            data-disabled={bothDisabled || xOnlyDisabled}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.bivariateLegendBottom}>
                <div className={styles.legendColourSpan} data-x={true}>
                    <div className={styles.legendColourSpanValue} data-x>
                        <IconArrowLeft />
                        <span>{displaySettings.variateXFlip ? x1 : x0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-x>
                        <span>{displaySettings.variateXFlip ? x0 : x1}</span>
                        <IconArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapFiltersLegends;
