import React, { memo } from "react";
import { Table, Icon, Tooltip, Tag, DatePicker, Input, message } from "antd";
import BackTop from "@cpt/backtop";
import License from "../licenseModule/License";
import styles from "./table.module.scss";
import { copy } from "@util";

const status = {
  test: ["测试", "#108ee9"],
  sign: ["签约", "#00a854"],
  experience: ["体验", "#faaf76"],
  delay: ["商务中", "#a7dfe3"],
  close: ["关闭", "#bfbfbf"]
};

const type = {
  enterprise: "企业",
  internal: "内部"
};

const getEtime = etime => {
  const date = new Date(etime);
  if (date.toString() === "Invalid Date") {
    return null;
  }
  let color;
  const ret = etime.slice(0, 10);
  const time = date.getTime();
  const now = Date.now();
  const diff = (now - time) / 86400000;

  if (diff < 7) {
    color = "#f79992";
  } else if (diff <= 3) {
    color = "#f46e65";
  } else if (diff <= 1) {
    color = "#f04134";
  } else if (diff < 0) {
    color = "#bfbfbf";
  }

  return (
    <Tooltip
      title={
        diff > 0
          ? `已到期${Math.floor(diff)}天`
          : `还有${Math.floor(Math.abs(diff))}天到期`
      }
    >
      <span style={{ color }}>{ret}</span>
    </Tooltip>
  );
};

const CustomerTable = ({
  data,
  loading,
  onEditCus,
  onEditLcs,
  onDelCus,
  onSetCurCus,
  onAddFilter
}) => {
  const operateStrategy = {
    edit: onEditCus,
    barcode: onEditLcs,
    delete: onDelCus
  };

  const operateCustomer = (cus, type) => {
    const func = operateStrategy[type];
    if (func) {
      func();
      onSetCurCus(cus);
    }
  };

  const onFilterLicenseType = (confirm, e) => {
    if (!e.target.dataset.value) return;
    onAddFilter({
      key: "license_status",
      value: e.target.dataset.value,
      text: `License: ${e.target.innerText}`
    });
    confirm();
  };

  const onFilterCreateTime = (confirm, v, value) => {
    onAddFilter({
      key: "ctime",
      value,
      text: `创建时间: ${value[0]} - ${value[1]}`
    });
    confirm();
  };

  const onFilterName = (confirm, value) => {
    onAddFilter({
      key: "name",
      value,
      text: `客户名: ${value}`
    });
    confirm();
  };

  const onFilterStatus = (confirm, e) => {
    if (!e.target.dataset.value) return;
    onAddFilter({
      key: "status",
      value: e.target.dataset.value,
      text: `状态: ${e.target.innerText}`
    });
    confirm();
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: "40px",
      render: (txt, row, index) => <span>{index + 1}</span>
    },
    {
      title: () => (
        <span>
          客户名 {data.length ? `  (${data.length}个)` : null}{" "}
          <Tooltip title="默认不展示已关闭的客户，请勾选筛选条件查看">
            <Icon type="info-circle" />
          </Tooltip>{" "}
        </span>
      ),
      dataIndex: "name",
      key: "name",
      width: "130px",
      filterIcon: filtered => (
        <Icon
          style={{ color: filtered ? "#1890ff" : undefined }}
          type="filter"
        />
      ),
      filterDropdown: ({ confirm }) => (
        <Input.Search
          placeholder="客户名"
          enterButton
          onSearch={onFilterName.bind(null, confirm)}
        />
      )
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
      width: "100px",
      filterIcon: filtered => (
        <Icon
          style={{ color: filtered ? "#1890ff" : undefined }}
          type="filter"
        />
      ),
      filterDropdown: ({ confirm }) => (
        <>
          <DatePicker.RangePicker
            onChange={onFilterCreateTime.bind(null, confirm)}
          />
        </>
      ),
      render: txt => <span>{txt.slice(0, 10) || ""}</span>
    },
    {
      title: "到期时间",
      dataIndex: "license_etime",
      key: "license_etime",
      width: "95px",
      render: etime => getEtime(etime)
    },
    {
      title: "license",
      dataIndex: "license",
      key: "license",
      width: 270,
      filterIcon: filtered => (
        <Icon
          style={{ color: filtered ? "#1890ff" : undefined }}
          type="filter"
        />
      ),
      filterDropdown: ({ confirm }) => (
        <div
          className={styles["filter-checkbox"]}
          onClick={onFilterLicenseType.bind(null, confirm)}
        >
          <span data-value="2">企业</span>
          <span data-value="1">试用</span>
        </div>
      ),
      render: (txt, row) => {
        return (
          <div>
            <p
              style={{ cursor: "pointer" }}
              onClick={() => copy(txt, () => message.info("复制成功"))}
            >
              {txt ? ` ${txt.slice(0, 36)}...` : ""}
            </p>
            {row.license_status == "2" ? (
              <Tag color="cyan">企业</Tag>
            ) : (
              <Tag color="magenta">试用</Tag>
            )}
            <License modules={row.module} />
          </div>
        );
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: "63px",
      filterIcon: filtered => (
        <Icon
          style={{ color: filtered ? "#1890ff" : undefined }}
          type="filter"
        />
      ),
      filterDropdown: ({ confirm }) => (
        <div
          className={styles["filter-checkbox"]}
          onClick={onFilterStatus.bind(null, confirm)}
        >
          {Object.keys(status).map(k => (
            <span key={k} data-value={k}>
              {status[k][0]}
            </span>
          ))}
        </div>
      ),
      render: txt => (
        <span style={{ color: status[txt][1] }}>{status[txt][0] || ""}</span>
      )
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: "63px",
      render: txt => <span>{type[txt] || ""}</span>
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
      width: "90px",
      render: (txt, row) => {
        return (
          <div className={styles["action"]}>
            <Tooltip title="编辑客户信息" placement="topRight">
              <Icon
                type="edit"
                onClick={operateCustomer.bind(null, row, "edit")}
              />
            </Tooltip>
            <Tooltip title="更新客户license" placement="topRight">
              <Icon
                type="barcode"
                onClick={operateCustomer.bind(null, row, "barcode")}
              />
            </Tooltip>
            <Tooltip title="删除此客户">
              <Icon
                type="delete"
                onClick={operateCustomer.bind(null, row, "delete")}
              />
            </Tooltip>
          </div>
        );
      }
    }
  ];

  console.log("table render");

  return (
    <div className={`${styles["table-wrapper"]} min-content`}>
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="customer_id"
        bordered
        pagination={{
          pageSize: 50,
          size: "small"
        }}
      />

      <BackTop />
    </div>
  );
};

export default memo(CustomerTable);
