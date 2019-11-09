import React from "react";
import { Drawer, Table } from "antd";

const AgentRecord = ({ name, drawerVisible, setDrawerVisible, records }) => {
  const recordColumns = [
    {
      title: "id",
      dataIndex: "id",
      width: "50px"
    },
    {
      title: "IP",
      dataIndex: "ip",
      width: "130px"
    },
    {
      title: "时间",
      dataIndex: "ctime",
      width: "16%"
    },
    {
      title: "内容",
      dataIndex: "content",
      render: (text, record) => {
        let record_info = "";
        if (record.mark) {
          record_info = `${text}。${record.mark}`;
        } else {
          record_info = text;
        }
        function createMarkup() {
          return { __html: record_info };
        }
        return <span dangerouslySetInnerHTML={createMarkup()} />;
      }
    }
  ];
  return (
    <Drawer
      title={name + " 的操作记录"}
      placement="right"
      width={640}
      onClose={() => setDrawerVisible(false)}
      visible={drawerVisible}
    >
      <Table
        rowKey="id"
        style={{ minWidth: "600px" }}
        dataSource={records}
        columns={recordColumns}
        bordered
      />
    </Drawer>
  );
};

export default AgentRecord;
