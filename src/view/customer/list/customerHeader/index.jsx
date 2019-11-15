import React from "react";
import { Button, Tag, Icon } from "antd";
import styles from "./index.module.scss";

const CustomerHeader = ({ onAddCus, filters, onCloseFilter }) => {
  console.log("header render");
  return (
    <div className={styles["header"]}>
      <section>
        <Button type="primary" onClick={onAddCus}>
          添加客户
        </Button>
      </section>
      <section>
        {filters.size > 0 && (
          <span>
            <Icon type="filter" theme="filled" /> 过滤条件：
          </span>
        )}
        {[...filters].map(v => {
          return (
            <Tag
              key={v[0]}
              closable={true}
              onClose={onCloseFilter.bind(null, v[0])}
              color="cyan"
            >
              {v[1][1]}
            </Tag>
          );
        })}
        {filters.size > 0 && (
          <a onClick={onCloseFilter.bind(null, "all")}>清除</a>
        )}
      </section>
    </div>
  );
};

export default CustomerHeader;
