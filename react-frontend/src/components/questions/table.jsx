import React from "react";
import styles from "./table.module.scss";

const Table = props => {
    const { headings, rows, fixedColumns, fixedColumnsWidth, withBorders, footer } = props;
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table} data-with-borders={withBorders}>
                <thead className={styles.header}>
                    {headings.map((h, i) => (
                        <th
                            className={styles.headerCell}
                            style={{
                                width:
                                    i < fixedColumns
                                        ? `${fixedColumnsWidth}%`
                                        : `calc((100% - ${fixedColumnsWidth * fixedColumns}%) / ${
                                              headings.length - fixedColumns
                                          })`,
                            }}
                        >
                            {h}
                        </th>
                    ))}
                </thead>
                <tbody>
                    {rows.map(r => {
                        return (
                            <tr className={styles.row}>
                                {r.map(cell => (
                                    <td className={styles.cell}>{cell}</td>
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

export default Table;
