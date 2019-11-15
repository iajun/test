import React from "react";
import { Button, Input } from "antd";
import "./style.css";
import classnames from "classnames";

const AgentHeader = ({
  setAddVisible,
  info = {},
  curStatus,
  filterCustomerType,
  filterCustomerName
}) => {
  let { role } = info;
  // 只有运营和超级管理员能添加代理
  let flag = false;
  if (role === "op" || role === "manager") {
    flag = true;
  }
  let cs = status =>
    classnames({
      "status-link": true,
      "status-active": curStatus === status
    });
  let typeMap = {
    test: "测试",
    experience: "体验",
    delay: "商务中",
    sign: "签约",
    all: "全部"
  };
  return (
    <div className="flex" style={{ margin: "10px 0" }}>
      <div>
        <span style={{ marginRight: 20 }}>ATD 客户代理 /</span>
        <span>
          {Object.keys(typeMap).map(k => (
            <a
              onClick={filterCustomerType.bind(null, k)}
              key={k}
              className={cs(k)}
            >
              {typeMap[k]}
            </a>
          ))}
        </span>
        <Input
          onInput={e => filterCustomerName(e.target.value)}
          placeholder="客户名"
          style={{ width: 160, marginLeft: 60 }}
        />
      </div>
      {flag && (
        <Button type="primary" onClick={() => setAddVisible(true)}>
          添加代理
        </Button>
      )}
    </div>
  );
};

export default AgentHeader;
