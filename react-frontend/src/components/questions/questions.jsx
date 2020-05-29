import React from "react";
import styles from "./questions.module.scss";

const Question = props => {
    return <div className={styles.question}>
        <div className={styles.questionText}>Question text</div>
        <div className={styles.overviewTable}>Overview table</div>
        <div className={styles.countryTable}>Country table</div>
    </div>
}

const Questions = props => {
    return <Question />
}

export default Questions;