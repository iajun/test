import React from "react";
import { Icon, Table, Tooltip } from "igroot";
import moment from "moment";
import "moment/locale/zh-cn";
import "./style.css";

const agentData = [
  {
    name: "控制台",
    agent: "portal"
  },
  {
    name: "终端",
    agent: "term"
  },
  {
    name: "es_head",
    agent: "es_head"
  },
  {
    name: "es_cerebro",
    agent: "es_cerebro"
  },
  {
    name: "storm_ui",
    agent: "storm"
  }
];

const onlineMap = {
  online: <span style={{ color: "#68B34F" }}>在线</span>,
  offline: <span style={{ color: "rgb(215, 52, 53)" }}>离线</span>
};

const AgentContent = ({
  list,
  user,
  onOpenAgent,
  onRecord,
  loading,
  setEditVisible,
  setDeleteVisible
}) => {
  const onClick = (agent, e) => {
    if (!e.target.dataset.agent) return;
    onOpenAgent(agent, e.target.dataset.agent);
  };
  const flag = user.role === "op" || user.role === "manager";
  const columns = [
    {
      title: "序号",
      key: "index",
      width: 50,
      render(text, row, index) {
        return index + 1;
      }
    },
    {
      title: "客户名",
      key: "cname",
      width: 200,
      dataIndex: "cname"
    },
    {
      title: "进入代理",
      key: "enter",
      render: (text, row) => {
        let content = (
          <div
            onClick={onClick.bind(null, row)}
            className="flex"
            style={{ justifyContent: "space-around" }}
          >
            {agentData.map(({ name, agent }) => (
              <a data-agent={agent} key={agent} style={{ padding: "0 6px" }}>
                {name}
              </a>
            ))}
          </div>
        );
        return content;
      }
    },
    {
      title: "代理状态",
      key: "status",
      dataIndex: "status",
      width: 90,
      sorter: (a, b) =>
        a["status"] < b["status"] ? -1 : a["status"] === b["status"] ? 0 : 1,
      render: (text, row, index) => onlineMap[text] || ""
    },
    {
      title: "代理备注",
      key: "mark",
      dataIndex: "mark",
      width: 100
    },
    {
      title: "最近登录",
      key: "login_time",
      dataIndex: "login_time",
      width: 100,
      sorter: (a, b) =>
        a["login_time"] === b["login_time"]
          ? 0
          : a["login_time"] < b["login_time"]
          ? 1
          : -1,
      render(text) {
        return text === "0000-00-00 00:00:00" ? "-" : moment(text).fromNow();
      }
    },
    {
      title: "操作",
      key: "operation",
      width: flag ? 100 : 80,
      render: (text, row, index) => {
        return (
          <div className="agent-operation">
            <a onClick={() => setEditVisible(true, row)}>
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
              </Tooltip>
            </a>
            {flag && (
              <span>
                <span className="agent-split" />
                <a onClick={() => setDeleteVisible(true, row)}>
                  <Tooltip placement="top" title="删除">
                    <Icon type="delete" />
                  </Tooltip>
                </a>
              </span>
            )}
            <span className="agent-split" />
            <a onClick={onRecord.bind(null, row.cname)}>
              <Tooltip placement="top" title="操作记录">
                <Icon type="container" />
              </Tooltip>
            </a>
          </div>
        );
      }
    }
  ];
  return (
    <Table
      columns={columns}
      dataSource={list}
      rowKey="pid"
      bordered
      loading={loading}
      rowClassName={record => (record.type === "black" ? "bg-black-agent" : "")}
      pagination={false}
    />
  );
};

export default AgentContent;
