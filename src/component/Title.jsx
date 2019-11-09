import React from "react";
import { Breadcrumb } from "antd";

const Title = ({ title }) => {
  return (
    <div>
      <Breadcrumb
        style={{
          margin: "12px 0"
        }}
      >
        <Breadcrumb.Item>{title}</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  );
};

export default Title;
