import React from "react";
import { Layout } from "antd";
import moment from "moment";
import styles from "./index.module.scss";

const BaseFooter = () => {
  return (
    <footer className={styles["footer"]}>
      Admin ©{moment().format("YYYY")} Created by BaishanCloud
    </footer>
  );
};

export default BaseFooter;
