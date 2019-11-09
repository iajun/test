import React from "react";
import { Table } from "antd";
import License from "../License";

const CustomerTable = ({ data }) => {
  const columns = [
    {
      title: "客户名",
      dataIndex: "name",
      key: "name",
      width: "120px"
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: "90px"
    },
    {
      title: "创建情况",
      dataIndex: "ctime",
      key: "ctime",
      width: "115px"
    },
    {
      title: "到期时间",
      dataIndex: "license_etime",
      key: "license_etime",
      width: "95px"
    },
    {
      title: "license",
      dataIndex: "license_status",
      key: "license_status",
      width: 250,
      filters: [{ text: "试用", value: "1" }, { text: "企业", value: "2" }],
      render: (txt, row) => <License modules={row.module} />
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: "63px",
      filters: [
        { text: "测试", value: "test" },
        { text: "签约", value: "sign" },
        { text: "关闭", value: "close" },
        { text: "商务中", value: "delay" },
        { text: "体验", value: "experience" }
      ]
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: "63px"
    },
    {
      title: "负责人",
      dataIndex: "support",
      key: "support",
      width: "75px"
    },
    {
      title: "备注",
      dataIndex: "mark",
      key: "mark",
      width: "75px"
    },
    {
      title: "操作",
      key: "action",
      width: "90px"
    }
  ];

  return (
    <Table dataSource={data} columns={columns} rowKey="customer_id" bordered />
  );
};

export default CustomerTable;
