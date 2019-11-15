import React, { useState, useEffect } from "react";
import { Icon } from "antd";
import styles from "./indes.module.scss";

const BackTop = () => {
  const el = document.getElementById("scroll-content");
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const func = () => {
      setScrollTop(el.scrollTop);
    };
    el.addEventListener("scroll", func);

    return () => {
      el.removeEventListener("scroll", func);
    };
  }, []);

  return scrollTop > 300 ? (
    <div className={styles["back-top"]} onClick={() => el.scrollTo(0, 0)}>
      <Icon type="arrow-up" />
    </div>
  ) : null;
};

export default BackTop;
