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
  TreeSelect
} from "antd";
import React from "react";
import ReactDOM from "react-dom";
import request from "@api/tools/request"
import moment from "moment";
import {
  monitorType,
  monitorName,
  atd_monitor,
  deep_monitor,
  op_monitor,
  interface_monitior,
  web_monitor,
  type_content
} from "@cpt/monitor_type";
import { connect } from "react-redux";
import {  int_thousand  } from "@cpt/format"
import echarts from "echarts";
const { RangePicker } = DatePicker;
const CheckableTag = Tag.CheckableTag;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const ButtonGroup = Button.Group;

message.config({
  top: 100,
  duration: 1.6
});

class MonitorDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pagination: false,
      loading: true,
      monitorList: [],
      customerlist: [],
      selectedCustomer: ["all"],
      startTime: moment().format("YYYY-MM-DD 00:00:00"),
      endTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      selectedType: ["all"],
      selectTime: [moment(moment().format("YYYY-MM-DD 00:00:00")), moment()],
      internal: [],
      enterprise: [],
      user: "user",
      username: "user",
      treeData: []
    };
  }
  componentWillMount() {
    this.get_customerlist();
    this.get_monitorconfig();
  }
  componentDidMount() {
    const params = {};
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
        this.init_page(params);
      } else {
        this.setState({ user: "" });
        this.init_page(params);
      }
    } else {
      localStorage.setItem("monitorUser", temp_user);
      params.user = temp_user;
      this.init_page(params);
    }
  }
  updateData = () => {
    let {
      selectTime: [start, end],
      selectedCustomer: company,
      selectedType: type,
      user
    } = this.state;
    start = start.format("YYYY-MM-DD 00:00:00");
    end = end.format("YYYY-MM-DD HH:mm:ss");

    let reqBody = { start, end };
    user && (reqBody["user"] = user);
    company[0] !== "all" && (reqBody["company"] = company);
    type[0] !== "all" && (reqBody["type"] = type);
    this.get_monitorlist(reqBody);
  };
  init_page = params => {
    if (this.props.match.params && this.props.match.params.select) {
      const select = JSON.parse(this.props.match.params.select);
      params.company = `"${select.name}"`;
      params.start = select.startTime;
      params.end = select.endTime;
      if (select.type && select.type != "all") {
        params.type = select.type;
        const selectedType = [];
        selectedType.push(`${select.type}`);
        this.setState({ selectedType });
      }
      if (select.ctype && select.ctype != "all") {
        params.ctype = select.ctype;
        const selectedType = [];
        selectedType.push(`${select.ctype}`);
        this.setState({ selectedType });
      }
      const selectedCustomer = [];
      selectedCustomer.push(`"${select.name}"`);
      this.setState({ selectedCustomer });
    } else {
      params.start = moment().format("YYYY-MM-DD 00:00:00");
      params.end = moment().format("YYYY-MM-DD HH:mm:ss");
    }
    this.setState({ startTime: params.start, endTime: params.end });
    this.setState({ selectTime: [moment(params.start), moment(params.end)] });
    this.get_monitorlist(params);
    this.get_detail(params);
  };
  // 切换按钮
  changeUser = type => {
    this.setState({ user: type });
    const params = {};
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    if (type) {
      params.user = type;
      localStorage.setItem("monitorUser", params.user);
    } else {
      localStorage.setItem("monitorUser", "全部");
    }
    this.get_monitorlist(params);
    this.get_detail(params);
  };
  onChange = (value, dateString) => {
    // console.log('Selected Time: ', value);
    // console.log('Formatted Selected Time: ', dateString);
    this.setState({ selectTime: value });
  };
  onOk = value => {
    this.setState({ selectedType: ["all"], selectedCustomer: ["all"] });
    const params = {};
    params.start = moment(value[0]).format("YYYY-MM-DD HH:mm:ss");
    params.end = moment(value[1]).format("YYYY-MM-DD HH:mm:ss");
    if (this.state.user) {
      params.user = this.state.user;
    }
    this.get_monitorlist(params);
    this.setState(
      {
        startTime: moment(value[0]).format("YYYY-MM-DD HH:mm:ss"),
        endTime: moment(value[1]).format("YYYY-MM-DD HH:mm:ss")
      },
      function() {
        this.setState({ selectTime: value });
      }
    );
    this.get_detail(params);
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
    this.get_monitorlist(params);
    this.get_detail(params);
  };
  selectCustomer = (value, label, extra) => {
    this.setState({ selectedCustomer: value, selectedType: ["all"] });
    const params = {};
    const temp_select = [];
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
    if (this.state.user) {
      params.user = this.state.user;
    }
    params.start = this.state.startTime;
    params.end = this.state.endTime;
    this.get_monitorlist(params);
    this.get_detail(params);
  };
  get_monitorlist = params => {
    this.setState({ loading: true });
    request("/dashboard/monitor/list", "get", params).then(res => {
      this.setState({ loading: false });
      if (res && !res.code) {
        this.setState({ monitorList: res.data }, function() {});
        if (res.data.length > 50) {
          this.setState({ pagination: { pageSize: 50 } });
        } else {
          this.setState({ pagination: false });
        }
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        Modal.warning({
          title: text
        });
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
  get_detail = params => {
    request("/dashboard/monitor/analysis", "get", params).then(res => {
      if (res && !res.code) {
        const time = [];
        const count = {};
        count.sum = [];
        count.systemSum = [];
        count.webSum = [];
        for (const item of res) {
          time.push(moment(item.unix * 1000).format("MM-DD HH:mm"));
          count.sum.push(item.sum);
          count.systemSum.push(item["systemSum"]);
          count.webSum.push(item["webSum"]);
        }
        this.detail_chart(time, count);
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };
  detail_chart = (time, count) => {
    const detailChart = echarts.init(document.getElementById("detail_chart"));
    const lineOption = this.setLineOption(time, count);
    detailChart.setOption(lineOption);
  };
  setLineOption = (time, count) => {
    return {
      tooltip: {
        trigger: "axis"
      },
      legend: {
        data: ["全部", "系统报警监控", "web报警监控"]
      },
      grid: {
        top: 30,
        bottom: 20,
        right: 50
      },
      xAxis: {
        name: "时间",
        type: "category",
        boundaryGap: false,
        data: time
      },
      yAxis: {
        name: "次数",
        type: "value",
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: "全部",
          type: "line",
          data: count.sum
        },
        {
          name: "系统报警监控",
          type: "line",
          data: count.systemSum
        },
        {
          name: "web报警监控",
          type: "line",
          data: count.webSum
        }
      ]
    };
  };
  render() {
    const { isMobile } = this.props;
    const { customerlist, selectedTags } = this.state;
    const switchWidth = isMobile ? 12 : 8;
    const columns = [
      {
        title: `时间（${int_thousand(this.state.monitorList.length)}条）`,
        width: "100px",
        dataIndex: "ctime",
        render: text => {
          return (
            <span>
              {text.split(" ")[0]} <br /> {text.split(" ")[1]}
            </span>
          );
        }
      },
      {
        title: "客户名",
        width: "100px",
        dataIndex: "company",
        key: "company"
      },
      {
        title: "报警名称",
        width: "110px",
        dataIndex: "name"
      },
      {
        title: "接收情况",
        key: "receive",
        width: "130px",
        render: (text, record) => {
          const send =
            record.send && record.send.length > 0
              ? record.send.join(",")
              : "无";
          const userlist =
            record.userlist && record.userlist.length > 0
              ? record.userlist.join(",")
              : "无";
          return (
            <span>
              接收方式: {send} <br /> 接收人: {userlist} <br />
            </span>
          );
        }
      },
      {
        title: "版本信息",
        key: "version",
        width: "130px",
        render: (text, record) => {
          const jar = record.jar ? record.jar : "无";
          const mlad = record.mlad ? record.mlad : "无";
          const dashboard = record.dashboard ? record.dashboard : "无";
          return (
            <span>
              jar: {jar} <br /> mlad: {mlad} <br /> dashboard: {dashboard}{" "}
            </span>
          );
        }
      },
      {
        title: "内容",
        dataIndex: "data",
        render: (text, record) => {
          function createMarkup() {
            return { __html: text };
          }
          return <span dangerouslySetInnerHTML={createMarkup()} />;
        }
      }
    ];
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}>
          <Breadcrumb.Item>报警统计详情</Breadcrumb.Item>
        </Breadcrumb>
        <div className="monitor-user">
          <Button style={{ marginRight: 20 }} onClick={this.updateData}>
            刷新
          </Button>
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
          <Row>
            <Col span={8}>
              <div className="mb25" style={{ marginTop: "10px" }}>
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
                  onOpenChange={this.openChange}
                  style={{ width: "330px" }}
                />
              </div>
              <div className="mb25">
                <h4 style={{ display: "inline-block", width: "70px" }}>
                  客户名称:
                </h4>
                <TreeSelect
                  style={{ minWidth: 250, maxWidth: 400 }}
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
              <div>
                <h4 style={{ display: "inline-block", width: "70px" }}>
                  报警原因:
                </h4>
                <TreeSelect
                  style={{ minWidth: 250, maxWidth: 400 }}
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
            </Col>
            <Col span={16} style={{ height: "170px" }} id="detail_chart" />
          </Row>
          <div className="overflow_auto" style={{ marginTop: "20px" }}>
            <Table
              dataSource={this.state.monitorList}
              columns={columns}
              bordered
              pagination={this.state.pagination}
              loading={this.state.loading}
              onChange={this.handleChange}
              rowKey="id"
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        <style>
          {`
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

export default MonitorDetail = connect(mapStateToProps)(MonitorDetail);
