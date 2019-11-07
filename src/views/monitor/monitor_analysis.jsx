import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  DatePicker,
  Tooltip,
  Row,
  Col,
  message,
  Modal,
  Tag,
  TreeSelect,
  Select
} from "igroot";
import React from "react";
import { Link } from "react-router-dom";
import { request } from "../../../../apis/request";
import moment from "moment";
import { connect } from "react-redux";
import { int_thousand } from "../../../../components/format";
const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;
const Option = Select.Option;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

message.config({
  top: 100,
  duration: 1.6
});

class MonitorAnalysis extends React.Component {
  state = {
    pagination: false,
    loading: false,
    atd_type: [],
    atd_customer: [],
    atd_sum: 0,
    atd_system: 0,
    atd_web: 0,
    atd_customer: [],
    startTime: moment().format("YYYY-MM-DD 00:00:00"),
    endTime: moment().format("YYYY-MM-DD HH:mm:ss"),
    selectTime: [moment(moment().format("YYYY-MM-DD 00:00:00")), moment()],
    sortedInfo: { order: "descend", columnKey: "sum" },
    filter_name: "all",
    user: "user",
    username: "user",
    customerlist: [],
    selectedType: ["all"],
    selectedCustomer: ["all"],
    internal: [],
    enterprise: [],
    treeData: [],
    sendValue: "all"
  };
  componentWillMount() {
    this.get_customerlist();
    this.get_monitorconfig();
  }
  componentDidMount() {
    const params = {};
    params.start = moment().format("YYYY-MM-DD 00:00:00");
    params.end = moment().format("YYYY-MM-DD HH:mm:ss");
    this.setState({ startTime: params.start, endTime: params.end });
    this.setState({ selectTime: [moment(params.start), moment(params.end)] });
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    let temp_user = "";
    if (userinfo && userinfo.name) {
      this.setState({ username: userinfo.name });
      temp_user = userinfo.name;
    } else {
      request("/dashboard/user/info", "get").then(res => {
        this.setState({
          username: res.name
        });
        temp_user = res.name;
        localStorage.setItem("userinfo", JSON.stringify(res));
      });
    }
    const local_user = localStorage.getItem("monitorUser");
    if (local_user) {
      if (local_user != "全部") {
        params.user = local_user;
        this.setState({ user: local_user });
        this.get_monitor_statistics(params);
      } else {
        this.setState({ user: "" });
        this.get_monitor_statistics(params);
      }
    } else {
      localStorage.setItem("monitorUser", temp_user);
      params.user = temp_user;
      this.get_monitor_statistics(params);
    }
  }
  // 切换按钮
  changeUser = type => {
    this.setState({
      user: type,
      selectedType: ["all"],
      selectedCustomer: ["all"],
      sendValue: "all"
    });
    const params = {};
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    if (type) {
      params.user = type;
      localStorage.setItem("monitorUser", params.user);
    } else {
      localStorage.setItem("monitorUser", "全部");
    }
    this.get_monitor_statistics(params, "change");
  };
  sortChange = (pagination, filters, sorter) => {
    this.setState({
      sortedInfo: sorter
    });
  };
  onChange = (value, dateString) => {
    this.setState({ selectTime: value });
  };
  onOk = value => {
    this.setState(
      {
        startTime: moment(value[0]).format("YYYY-MM-DD HH:mm:ss"),
        endTime: moment(value[1]).format("YYYY-MM-DD HH:mm:ss")
      },
      function() {
        this.setState({
          selectTime: value,
          selectedType: ["all"],
          selectedCustomer: ["all"],
          sendValue: "all"
        });
      }
    );
    const params = {};
    params.start = moment(value[0]).format("YYYY-MM-DD HH:mm:ss");
    params.end = moment(value[1]).format("YYYY-MM-DD HH:mm:ss");
    if (this.state.user && this.state.user != "user") {
      params.user = this.state.user;
    }
    this.get_monitor_statistics(params);
  };
  openChange = status => {
    if (!status) {
      if (
        moment(this.state.selectTime[0]).format("YYYY-MM-DD HH:mm:ss") !=
          this.state.startTime ||
        moment(this.state.selectTime[1]).format("YYYY-MM-DD HH:mm:ss") !=
          this.state.endTime
      ) {
        this.setState({
          selectTime: [moment(this.state.startTime), moment(this.state.endTime)]
        });
      }
    }
  };
  get_monitor_statistics = (params, change) => {
    this.setState({ loading: true });
    request("/dashboard/monitor/statistics", "get", params).then(res => {
      this.setState({ loading: false });
      if (res && !res.code) {
        if (res.atd && res.atd.type) {
          this.setState({
            atd_type: res.atd.type,
            atd_sum: res.atd.sum,
            atd_system: res.atd.systemSum,
            atd_web: res.atd.webSum
          });
        } else {
          this.setState({
            atd_type: [],
            atd_sum: 0,
            atd_web: 0,
            atd_system: 0,
            atd_customer: []
          });
        }
        if (res.atd && res.atd.customer) {
          this.setState({ atd_customer: res.atd.customer });
        }
      } else {
        if (change == "change") {
          if (this.state.user) {
            this.setState({ user: "" });
            localStorage.setItem("monitorUser", "全部");
          } else {
            this.setState({ user: this.state.username });
            localStorage.setItem("monitorUser", this.state.username);
          }
        }
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };
  get_customerlist = () => {
    request("/dashboard/customer/list", "get").then(res => {
      if (res && !res.code) {
        const customer_type = [
          { name: "客户", label: "enterprise" },
          { name: "内部", label: "internal" }
        ];
        const open_customer = [];
        const customerlist = [];
        const internal = [];
        const enterprise = [];
        for (const key of customer_type) {
          const children = [];
          for (const item of res.data) {
            if (item && item.status != "close" && item.type == key.label) {
              children.push({
                label: item.name,
                value: `"${item.name}"`,
                key: item.name
              });
            }
            if (item.type == "internal") {
              internal.push(`"${item.name}"`);
            }
            if (item.type == "enterprise") {
              enterprise.push(`"${item.name}"`);
            }
          }
          open_customer.push({
            label: key.name,
            value: key.name,
            key: key.name,
            children
          });
        }
        customerlist.push({
          label: "全部",
          value: "all",
          key: "all",
          children: open_customer
        });
        this.setState({ customerlist, internal, enterprise });
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };
  get_monitorconfig = () => {
    request("/dashboard/monitor/type", "get").then(res => {
      if (res && !res.code) {
        const treeData = [];
        const children = [];
        for (const item of res.data) {
          children.push({
            label: item.name,
            value: item.type,
            key: item.type
          });
        }
        treeData.push({
          label: "全部",
          value: "all",
          key: "all",
          children
        });
        this.setState({ treeData });
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };
  selectCustomer = (value, label, extra) => {
    this.setState({ selectedCustomer: value, selectedType: ["all"] });
    const params = {};
    const temp_select = [];
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    if (value && value.length > 0 && value[0] != "all") {
      for (const key of value) {
        if (key == "客户") {
          temp_select.push(this.state.enterprise);
        } else if (key == "内部") {
          temp_select.push(this.state.internal);
        } else {
          temp_select.push(key);
        }
      }
      params.company = temp_select.join(",");
    }
    if (
      this.state.selectedType.length > 0 &&
      this.state.selectedType[0] != "all"
    ) {
      params.type = this.state.selectedType.join(",");
    }
    if (this.state.user) {
      params.user = this.state.user;
    }
    if (this.state.sendValue != "all") {
      params.send = this.state.sendValue;
    }

    this.get_monitor_statistics(params);
  };
  onTypeChange = (value, label, extra) => {
    this.setState({ selectedType: value });
    const params = {};
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    const type = [];
    if (value.length > 0 && value[0] != "all") {
      for (const reason of value) {
        type.push(reason);
      }
    }
    if (type.length > 0) {
      params.type = type.join(",");
    }
    if (
      this.state.selectedCustomer.length > 0 &&
      this.state.selectedCustomer[0] != "all"
    ) {
      const temp_select = [];
      for (const key of this.state.selectedCustomer) {
        if (key == "客户") {
          temp_select.push(this.state.enterprise);
        } else if (key == "内部") {
          temp_select.push(this.state.internal);
        } else {
          temp_select.push(key);
        }
      }
      params.company = temp_select.join(",");
    }
    if (this.state.user) {
      params.user = this.state.user;
    }
    if (this.state.sendValue != "all") {
      params.send = this.state.sendValue;
    }
    this.get_monitor_statistics(params);
  };
  onSendChange = (value, label, extra) => {
    this.setState({ sendValue: value });
    const params = {};
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    if (
      this.state.selectedCustomer.length > 0 &&
      this.state.selectedCustomer[0] != "all"
    ) {
      const temp_select = [];
      for (const key of this.state.selectedCustomer) {
        if (key == "客户") {
          temp_select.push(this.state.enterprise);
        } else if (key == "内部") {
          temp_select.push(this.state.internal);
        } else {
          temp_select.push(key);
        }
      }
      params.company = temp_select.join(",");
    }
    if (
      this.state.selectedType.length > 0 &&
      this.state.selectedType[0] != "all"
    ) {
      params.type = this.state.selectedType.join(",");
    }
    if (this.state.user) {
      params.user = this.state.user;
    }
    if (value != "all") {
      params.send = value;
    }
    this.get_monitor_statistics(params);
  };
  render() {
    let { sortedInfo } = this.state;
    sortedInfo = sortedInfo || {};
    const columns = [
      {
        title: "序号",
        key: "index",
        width: "50px",
        render: (text, record, index) => index + 1
      },
      {
        title: "客户名",
        dataIndex: "name",
        key: "name",
        width: "150px",
        filters: [
          { text: "客户", value: "enterprise" },
          { text: "内部", value: "internal" }
        ],
        filterMultiple: false,
        onFilter: (value, record) =>
          record.status && record.status.includes(value),
        render: (text, record) => {
          let data = {
            name: record.name,
            startTime: this.state.startTime,
            endTime: this.state.endTime
          };
          data = JSON.stringify(data);
          return (
            <Link to={`/index/monitor/detail/${data}`} target="_blank">
              {text}
            </Link>
          );
        }
      },
      {
        title: "报警统计详情",
        key: "type",
        render: (text, record) => {
          const typelist = record.type.map((item, index) => {
            return (
              <Tag key={item.type} color={index < 3 ? "volcano" : "blue"}>
                {item.name}&nbsp;({int_thousand(item.sum)})
              </Tag>
            );
          });
          return typelist;
        }
      },
      {
        title: "系统报警统计",
        key: "systemSum",
        dataIndex: "systemSum",
        width: "120px",
        sorter: (a, b) => a.systemSum - b.systemSum,
        sortOrder: sortedInfo.columnKey === "systemSum" && sortedInfo.order,
        render: text => int_thousand(text)
      },
      {
        title: "web报警总计",
        key: "webSum",
        dataIndex: "webSum",
        width: "120px",
        sorter: (a, b) => a.webSum - b.webSum,
        sortOrder: sortedInfo.columnKey === "webSum" && sortedInfo.order,
        render: text => int_thousand(text)
      },
      {
        title: "总计",
        dataIndex: "sum",
        sorter: (a, b) => a.sum - b.sum,
        sortOrder: sortedInfo.columnKey === "sum" && sortedInfo.order,
        width: "90px",
        render: (text, record) => {
          let data = {
            name: record.name,
            startTime: this.state.startTime,
            endTime: this.state.endTime
          };
          data = JSON.stringify(data);
          return (
            <Link to={`/index/monitor/detail/${data}`} target="_blank">
              {int_thousand(text)}
            </Link>
          );
        }
      }
    ];
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}>
          <Breadcrumb.Item>报警统计列表</Breadcrumb.Item>
        </Breadcrumb>
        <div className="monitor-user">
          <ButtonGroup>
            <Button
              type={!this.state.user ? "primary" : "default"}
              onClick={this.changeUser.bind(this, "")}>
              全部报警
            </Button>
            <Button
              type={this.state.user ? "primary" : "default"}
              onClick={this.changeUser.bind(this, this.state.username)}>
              我的报警
            </Button>
          </ButtonGroup>
        </div>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}>
          <div
            style={{
              float: "left",
              marginBottom: "16px",
              marginRight: "16px"
            }}>
            <h4 style={{ display: "inline-block", width: "70px" }}>
              选择时间:
            </h4>
            <RangePicker
              defaultValue={[
                moment(this.state.startTime),
                moment(this.state.endTime)
              ]}
              value={this.state.selectTime}
              showTime={{ format: "HH:mm:ss" }}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={["开始时间", "结束时间"]}
              onChange={this.onChange}
              onOk={this.onOk}
              style={{ width: "350px" }}
              onOpenChange={this.openChange}
            />
          </div>
          <div
            style={{
              float: "left",
              marginBottom: "16px",
              marginRight: "16px"
            }}>
            <h4 style={{ display: "inline-block", width: "70px" }}>
              客户名称:
            </h4>
            <TreeSelect
              style={{ minWidth: 200 }}
              value={this.state.selectedCustomer}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeDefaultExpandAll
              treeData={this.state.customerlist}
              placeholder="请选择客户名称"
              onChange={this.selectCustomer}
              treeCheckable={true}
              showCheckedStrategy={SHOW_PARENT}
            />
          </div>
          <div
            style={{
              float: "left",
              marginBottom: "16px",
              marginRight: "16px"
            }}>
            <h4 style={{ display: "inline-block", width: "70px" }}>
              报警原因:
            </h4>
            <TreeSelect
              style={{ minWidth: 200 }}
              value={this.state.selectedType}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeDefaultExpandAll
              treeData={this.state.treeData}
              placeholder="请选择报警原因"
              onChange={this.onTypeChange}
              treeCheckable={true}
              showCheckedStrategy={SHOW_PARENT}
            />
          </div>
          <div style={{ float: "left", marginBottom: "16px" }}>
            <h4 style={{ display: "inline-block", width: "70px" }}>
              发送类型:
            </h4>
            <Select
              value={this.state.sendValue}
              style={{ width: 100 }}
              onChange={this.onSendChange}>
              <Option value="all">全部</Option>
              <Option value="wechat">微信</Option>
              <Option value="email">邮件</Option>
            </Select>
          </div>
          <div
            style={{
              clear: "both",
              padding: "16px",
              backgroundColor: "#d9d9d9"
            }}>
            <Row gutter={16}>
              <Col span={8}>
                <div className="panel-monitor">
                  <Row>
                    <Col span={6} className="monitor-icon">
                      <Icon type="warning" />
                    </Col>
                    <Col span={18}>
                      <div>总报警数</div>
                      <div className="monitor-num">
                        {int_thousand(this.state.atd_sum)}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col span={8}>
                <div className="panel-monitor">
                  <Row>
                    <Col span={6} className="monitor-icon">
                      <Icon type="laptop" />
                    </Col>
                    <Col span={18}>
                      <div>系统报警总数</div>
                      <div className="monitor-num">
                        {int_thousand(this.state.atd_system)}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col span={8}>
                <div className="panel-monitor">
                  <Row>
                    <Col span={6} className="monitor-icon">
                      <Icon type="dashboard" />
                    </Col>
                    <Col span={18}>
                      <div>web报警总数</div>
                      <div className="monitor-num">
                        {int_thousand(this.state.atd_web)}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
            <div className="panel-monitor mt16">
              {this.state.atd_type.map((item, index) => {
                return (
                  <Tag key={item.type} color={index < 3 ? "#f50" : "geekblue"}>
                    {item.name}&nbsp;({int_thousand(item.sum)})
                  </Tag>
                );
              })}
            </div>
          </div>
          <div
            className="overflow_auto"
            style={{ width: "100%", paddingTop: 20 }}>
            <Table
              dataSource={this.state.atd_customer}
              columns={columns}
              bordered
              pagination={this.state.pagination}
              loading={this.state.loading}
              onChange={this.sortChange}
              rowKey="name"
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        <style>
          {`
            .BleftBorder {
                border-left: 5px solid #1890ff;
                padding-left: 10px;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .panel-monitor {
              padding: 16px;
              background-color: #f1f2f3;
            }
            .monitor-num {
              font-size: 16px;
              color: #333;
            }
            .monitor-icon {
              text-align: center;
              font-size: 30px;
            }
            .monitor-user {
              float: right;
              position: relative;
              top: -35px;
            }
            `}
        </style>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isMobile: state.isMobile
  };
};

export default MonitorAnalysis = connect(mapStateToProps)(MonitorAnalysis);
