import React from "react";
import { Tooltip } from "antd";

import active_buy from "@img/modules/active_buy.svg";
import asset_buy from "@img/modules/asset_buy.svg";
import data_screen_buy from "@img/modules/data_screen_buy.svg";
import deep_engine_buy from "@img/modules/deep_engine_buy.svg";
import event_buy from "@img/modules/event_buy.svg";
import learning_engine_buy from "@img/modules/learning_engine_buy.svg";
import logo_white from "@img/modules/index.ico";
import rt_engine_buy from "@img/modules/rt_engine_buy.svg";
import threatinfo_buy from "@img/modules/threatinfo_buy.svg";

import styles from "./license.module.scss";

const license = {
  实时引擎: rt_engine_buy,
  数据大屏: data_screen_buy,
  内网安全: active_buy,
  学习引擎: learning_engine_buy,
  深度引擎: deep_engine_buy,
  事件中心: event_buy,
  资产发现: asset_buy,
  威胁情报中心: threatinfo_buy
};

const CustomerLicense = ({ modules }) => {
  return (
    <span>
      <Tooltip title="实时引擎">
        <img
          src={rt_engine_buy}
          alt="module"
          className={styles["module-img"]}
        />
      </Tooltip>
      {modules.map(module => {
        let svg = license[module] || logo_white;
        if (module === "实时引擎") return null;
        return (
          <Tooltip title={module} key={module}>
            <img src={svg} alt="module" className={styles["module-img"]} />
          </Tooltip>
        );
      })}
    </span>
  );
};

export default CustomerLicense;
