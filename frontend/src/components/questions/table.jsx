import React from "react";
import styles from "./table.module.scss";

const Table = props => {
    const { headings, rows, fixedColumns, fixedColumnsWidth, withBorders, footer } = props;
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table} data-with-borders={withBorders}>
                <thead className={styles.header}>
                    <tr>
                        {headings.map((h, i) => (
                            <th
                                key={`heading_${i}`}
                                className={styles.headerCell}
                                style={{
                                    width:
                                        i < fixedColumns
                                            ? `${fixedColumnsWidth}%`
                                            : `calc((100% - ${
                                                  fixedColumnsWidth * fixedColumns
                                              }%) / ${headings.length - fixedColumns})`,
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => {
                        return (
                            <tr className={styles.row} key={`row_${i}`}>
                                {r.map((cell, i) => (
                                    <td key={`cell_${i}`} className={styles.cell}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {footer && <div className={styles.footer}>{footer}</div>}
        </div>
    );
};

// TODO footer should be a tfoot.

export default Table;
