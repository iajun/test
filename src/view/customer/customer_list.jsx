import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Checkbox,
  Row,
  Col,
  DatePicker,
  message,
  Tag
} from "antd";
import React from "react";
import request from "@api/tools/request"
import Cookies from "universal-cookie";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
const cookies = new Cookies();
const FormItem = Form.Item;
message.config({
  top: 100,
  duration: 1.6
});

const formatSec = sec => {
  let format = "-";
  try {
    sec = +sec;
  } catch (error) {
    format = "-";
  }
  if (sec < 60 * 60) {
    format = `${Math.floor(sec / 60)} m`;
  } else if (sec < 60 * 60 * 24) {
    format = `${Math.floor(sec / 3600)} h ${Math.floor((sec % 3600) / 60)} m`;
  }
  return format;
};

class CustomerList extends React.Component {
  state = {
    customerlist: [],
    pagination: false,
    visible: false,
    del_visible: false,
    edit_visible: false,
    update_visible: false,
    new_visible: false,
    loading: true,
    del_info: "",
    edit_info: "",
    update_info: "",
    new_info: "",
    del_loading: false,
    add_loading: false,
    edit_loading: false,
    update_loading: false,
    kind: "",
    role: "",
    count: 0,
    filteredInfo: { status: ["sign", "test", "delay", "experience"] },
    module_obj: {},
    module_list: [],
    filterdCreatedTime: [],
    mobile_verify: false,
    priority: false,
    edit_mobile_verify: false,
    edit_priority: false
  };
  showModal = () => {
    this.setState({ visible: true, mobile_verify: false, priority: false });
  };
  delModal = del_info => {
    this.setState({ del_visible: true, del_info });
  };
  editModal = edit_info => {
    this.setState({
      edit_visible: true,
      edit_info,
      edit_mobile_verify: edit_info.mobile_verify === "on",
      edit_priority: edit_info.priority === "high"
    });
  };
  updateModal = update_info => {
    this.setState({ update_visible: true, update_info });
    let update_info_module = update_info.module || [];
    update_info_module.push("实时引擎");
  };
  disabledDate = current => {
    // Can not select days
    let forbid_time = "";
    forbid_time = moment(moment().format("YYYY-MM-DD 00:00:00")).format("x");
    return current && current.valueOf() < forbid_time;
  };
  handleOk = () => {
    this.setState({ del_loading: true });
    const url = `/dashboard/customer/${this.state.del_info.customer_id}/info`;
    request(url, "delete", { access_token: cookies.get("access_token") }).then(
      res => {
        if (res && !res.code) {
          this.setState({ del_loading: false, del_visible: false });
          Modal.success({
            title: "删除用户成功"
          });
          this.setState({ filteredInfo: null });
          this.get_customerlist();
        } else {
          this.setState({ del_loading: false });
          let text = "网络错误，请稍后再试";
          if (res && res.message) {
            text = res.message;
          }
          Modal.warning({
            title: text
          });
        }
      }
    );
  };
  handleUpdate = e => {
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields(["date-picker"], (err, fieldsValue) => {
      if (!err) {
        this.setState({ update_loading: true });
        const uplicense = {};
        if (formData["date-picker"]) {
          uplicense.license_etime = formData["date-picker"].format(
            "YYYY-MM-DD 23:59:59"
          );
        }
        uplicense.license_status = formData.license_status;
        let license_version = 0;
        let module_obj = this.state.module_obj;
        formData.module.forEach(function(elem) {
          if (module_obj[elem] != undefined) {
            license_version += module_obj[elem] - 0;
          }
        });
        if (license_version) {
          uplicense.license_version = license_version;
        }
        const url = `/dashboard/customer/${this.state.update_info.customer_id}/license`;
        request(url, "put", {}, uplicense).then(res => {
          if (res && !res.code) {
            this.setState({
              update_loading: false,
              update_visible: false,
              new_visible: true,
              new_info: res
            });
            this.get_customerlist();
          } else {
            this.setState({ update_loading: false });
            let text = "网络错误，请稍后再试";
            if (res && res.message) {
              text = res.message;
            }
            Modal.warning({
              title: text
            });
          }
        });
      }
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      del_visible: false,
      edit_visible: false,
      update_visible: false,
      new_visible: false
    });
  };
  handleSubmit(e) {
    this.setState({ add_loading: true });
    // 页面开始向API提交
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const add_customer = {};
        add_customer.name = formData.name;
        add_customer.email = formData.email;
        add_customer.status = formData.status;
        add_customer.type = formData.type;
        add_customer.support = formData.support;
        add_customer.mobile_verify = this.state.mobile_verify ? "on" : "off";
        add_customer.priority = this.state.priority ? "high" : "normal";
        if (!!formData.mark) {
          add_customer.mark = formData.mark;
        }
        request("/dashboard/customer/info", "post", {}, add_customer).then(
          res => {
            if (res && !res.code) {
              this.setState({ add_loading: false, visible: false });
              Modal.success({
                title: "添加客户成功"
              });
              this.setState({ filteredInfo: null });
              this.get_customerlist();
            } else {
              this.setState({ add_loading: false });
              let text = "网络错误，请稍后再试";
              if (res && res.message) {
                text = res.message;
              }
              Modal.warning({
                title: text
              });
            }
          }
        );
      } else {
        this.setState({ add_loading: false });
      }
    });
  }
  handleEdit(e) {
    this.setState({ edit_loading: true });
    let {
      status,
      type,
      mark,
      email,
      support,
      mobile_verify,
      priority
    } = this.state.edit_info;
    // 页面开始向API提交
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    const edit_customer = {};
    email !== formData.email && (edit_customer.email = formData.email);
    status != formData.status && (edit_customer.status = formData.status);
    type != formData.type && (edit_customer.type = formData.type);
    mark != formData.mark && (edit_customer.mark = formData.mark);
    support != formData.support && (edit_customer.support = formData.support);
    let edit_mobile_verify = this.state.edit_mobile_verify ? "on" : "off";
    let edit_priority = this.state.edit_priority ? "high" : "normal";
    mobile_verify != edit_mobile_verify &&
      (edit_customer.mobile_verify = edit_mobile_verify);
    priority != edit_priority && (edit_customer.priority = edit_priority);
    const url = `/dashboard/customer/${this.state.edit_info.customer_id}/info`;
    request(url, "put", {}, edit_customer).then(res => {
      if (res && !res.code) {
        if (edit_customer.status == "close") {
          const edit_status = {
            name: this.state.edit_info.name,
            monitor: {
              status: false,
              expire_time: "9999-12-31 23:59:59",
              reason: "客户关闭，系统自动关闭报警"
            },
            report: false
          };
          const url = "/dashboard/monitor/config";
          request(url, "put", {}, edit_status).then(res => {
            if (res && !res.code) {
              Modal.success({
                title: "修改客户信息成功,已自动关闭报警监控。"
              });
            } else {
              Modal.warning({
                title: "修改客户信息成功,关闭报警监控失败。"
              });
            }
          });
        } else {
          const edit_status = {
            name: this.state.edit_info.name,
            monitor: { status: true },
            report: true
          };
          const url = "/dashboard/monitor/config";
          request(url, "put", {}, edit_status).then(res => {
            if (res && !res.code) {
              Modal.success({
                title: "修改客户信息成功,已自动开启报警监控。"
              });
            } else {
              Modal.warning({
                title: "修改客户信息成功,开启报警监控失败。"
              });
            }
          });
        }
        this.setState({ edit_loading: false, edit_visible: false });
        this.get_customerlist();
      } else {
        this.setState({ edit_loading: false });
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        Modal.warning({
          title: text
        });
      }
    });
  }
  handleChange = (pagination, filters, sorter) => {
    this.setState({ filteredInfo: filters });
    const num = 0;
    let custlist = this.state.customerlist;
    for (const item in filters) {
      let temp = [];
      if (filters[item] && filters[item][0]) {
        for (const i of custlist) {
          if (i[item] == filters[item][0]) {
            temp.push(i);
          } else {
            continue;
          }
        }
      } else {
        temp = custlist;
      }
      custlist = temp;
    }
  };
  copyLicense = () => {
    message.success("复制成功");
  };
  componentDidMount() {
    this.get_customerlist();
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    if (userinfo && userinfo.kind) {
      this.setState({
        kind: userinfo.kind,
        role: userinfo.role
      });
      this.name = userinfo.name;
    } else {
      request("/dashboard/user/info", "get").then(res => {
        this.setState({
          kind: res.kind,
          role: res.role
        });
        this.name = res.name;
      });
    }
  }
  get_customerlist = () => {
    request("/dashboard/customer/list", "get").then(res => {
      if (res && !res.code) {
        let customerlist = res.data || [];
        customerlist.map(function(item, index) {
          item.rowKey = index;
          return item;
        });

        let module_list = [];
        if (res.module) {
          for (let item in res.module) {
            if (res.module.hasOwnProperty(item)) {
              module_list.push(item);
            }
          }
        }
        this.setState({
          count: res.data.length,
          customerlist: res.data,
          loading: false,
          module_obj: res.module,
          module_list
        });
        if (res && res.data && res.data.length > 50) {
          this.setState({
            pagination: { pageSize: 50 }
          });
        } else {
          this.setState({
            pagination: false
          });
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

  handleCreateTimeSearch = (selectedKeys, confirm) => {
    const startTime = selectedKeys[0].format("YYYY-MM-DD 00:00:00");
    const endTime = selectedKeys[1].format("YYYY-MM-DD 23:59:59");
    const filterdCreatedTime = [startTime, endTime];
    this.setState({
      filterdCreatedTime
    });
    confirm();
  };

  handleCreateTimeReset = clearFilters => {
    clearFilters();
    this.setState({ filterdCreatedTime: [] });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let { filteredInfo } = this.state;
    filteredInfo = filteredInfo || {};
    const [filteredStartTime, filteredEndTime] = this.state.filterdCreatedTime;
    const type_title = (
      <span>
        类型
        <Tooltip title="内部：主要是开发调试等内部使用的">
          <Icon
            style={{ marginLeft: "5px", fontSize: 12 }}
            type="question-circle"
          />
        </Tooltip>
      </span>
    );
    const title_count = `客户名（${this.state.customerlist.length}个）`;
    const columns = [
      {
        title: "序号",
        key: "index",
        width: "50px",
        render: (text, record, index) => {
          let baseNode = null;
          if (record.status == "sign" && record.license_status == 1) {
            baseNode = (
              <span>
                {index + 1}
                <Tooltip title="该客户license类型与状态不匹配">
                  <Icon style={{ fontSize: 12 }} type="question-circle" />
                </Tooltip>
              </span>
            );
          } else {
            baseNode = <span>{index + 1}</span>;
          }
          return (
            <span>
              {baseNode}
              {record.priority === "high" && (
                <Tooltip title="此客户的报警会得到重点关注">
                  <Icon type="star" theme="filled" style={{ color: "red" }} />
                </Tooltip>
              )}
            </span>
          );
        }
      },
      {
        title: "客户名",
        dataIndex: "name",
        key: "name",
        width: "120px",
        render: (text, { pname, ptype }) => {
          let TooltipNode = null;
          if (!pname) {
            TooltipNode = (
              <Tooltip title="未配置代理名称">
                <Icon
                  type="close-circle"
                  theme="filled"
                  style={{ color: "red" }}
                />
              </Tooltip>
            );
          } else {
            if (ptype == "white") {
              TooltipNode = (
                <Tooltip title="白代理">
                  <Icon type="check-circle" />
                </Tooltip>
              );
            }
            if (ptype == "black") {
              TooltipNode = (
                <Tooltip title="黑代理">
                  <Icon type="check-circle" theme="filled" />
                </Tooltip>
              );
            }
            if (ptype == "close") {
              TooltipNode = (
                <Tooltip title="代理已关闭">
                  <Icon
                    type="close-circle"
                    theme="filled"
                    style={{ color: "black" }}
                  />
                </Tooltip>
              );
            }
          }
          return (
            <span>
              {text}&nbsp;
              {TooltipNode && TooltipNode}
            </span>
          );
        }
      },
      {
        title: "邮箱",
        dataIndex: "email",
        key: "email",
        width: "90px",
        render: text => {
          return (
            <CopyToClipboard text={text} onCopy={this.copyLicense}>
              <span style={{ cursor: "pointer" }}>
                <Tooltip title="点击复制">{text}</Tooltip>
              </span>
            </CopyToClipboard>
          );
        }
      },
      {
        title: "创建情况",
        dataIndex: "ctime",
        key: "ctime",
        width: "115px",
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters
        }) => (
          <div
            style={{
              padding: "16px 10px 0",
              background: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 6px rgba(0, 0, 0, 0.15)"
            }}
          >
            <section>
              <DatePicker.RangePicker onChange={val => setSelectedKeys(val)} />
            </section>
            <section
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10
              }}
            >
              <span
                className="cursor-click color-main"
                onClick={() =>
                  this.handleCreateTimeSearch(selectedKeys, confirm)
                }
              >
                确定
              </span>
              <span
                className="cursor-click color-main"
                onClick={() => this.handleCreateTimeReset(clearFilters)}
              >
                全部
              </span>
            </section>
          </div>
        ),
        onFilter: (a, { ctime }) =>
          filteredStartTime <= ctime && ctime <= filteredEndTime,

        render: (text, record) => {
          if (moment(text).isValid()) {
            const leftTime = Math.abs(
              moment(text).diff(moment().format("YYYY-MM-DD 00:00:00"), "days")
            );
            let ctime;
            if (record.status != "close") {
              ctime = (
                <Tooltip title={`已创建${leftTime}天`} placement="top">
                  <span style={{ color: "#49a9ee" }}>
                    {moment(text).format("YYYY-MM-DD")}
                  </span>
                </Tooltip>
              );
            } else {
              ctime = (
                <Tooltip title={`已创建${leftTime}天`} placement="top">
                  <span style={{ color: "#bfbfbf" }}>
                    {moment(text).format("YYYY-MM-DD")}
                  </span>
                </Tooltip>
              );
            }
            return (
              <div>
                {ctime}
                <br />
                部署：{formatSec(record.arrange_time)}
                <br />
                下载：{formatSec(record.download_time)}
              </div>
            );
          }
        }
      },
      {
        title: "到期时间",
        dataIndex: "license_etime",
        key: "license_etime",
        width: "95px",
        render: (text, record) => {
          if (moment(text).isValid()) {
            let etime = moment(text).format("YYYY-MM-DD");
            const leftTime = moment(text).diff(
              moment().format("YYYY-MM-DD 23:59:59"),
              "days"
            );
            if (record.status != "close") {
              if (leftTime <= 7 && leftTime > 3) {
                return (
                  <Tooltip title={`还有${leftTime}天到期`} placement="top">
                    <span style={{ color: "#f79992" }}>{etime}</span>
                  </Tooltip>
                );
              } else if (leftTime <= 3 && leftTime > 1) {
                return (
                  <Tooltip title={`还有${leftTime}天到期`} placement="top">
                    <span style={{ color: "#f46e65" }}>{etime}</span>
                  </Tooltip>
                );
              } else if (leftTime <= 1 && leftTime >= 0) {
                return (
                  <Tooltip title={`还有${leftTime}天到期`} placement="top">
                    <span style={{ color: "#f04134" }}>{etime}</span>
                  </Tooltip>
                );
              } else if (leftTime < 0) {
                return (
                  <Tooltip title="已到期" placement="top">
                    <span style={{ color: "#d73435" }}>{etime}</span>
                  </Tooltip>
                );
              } else {
                return (
                  <Tooltip title={`还有${leftTime}天到期`} placement="top">
                    <span style={{ color: "#49a9ee" }}>{etime}</span>
                  </Tooltip>
                );
              }
            } else {
              if (leftTime < 0) {
                return (
                  <Tooltip title="已到期" placement="top">
                    <span style={{ color: "#bfbfbf" }}>{etime}</span>
                  </Tooltip>
                );
              } else {
                return (
                  <Tooltip title={`还有${leftTime}天到期`} placement="top">
                    <span style={{ color: "#bfbfbf" }}>{etime}</span>
                  </Tooltip>
                );
              }
            }
          } else {
            return "";
          }
        }
      },
      {
        title: "license",
        dataIndex: "license_status",
        key: "license_status",
        width: 250,
        filters: [{ text: "试用", value: "1" }, { text: "企业", value: "2" }],
        filterMultiple: false,
        filteredValue: filteredInfo.license_status || null,
        onFilter: (value, record) => record.license_status.includes(value),
        render: (text, record) => {
          let { module_obj } = this.state;
          let module = record.module || [];
          let license = (
            <Tooltip title={record.license}>
              <CopyToClipboard text={record.license} onCopy={this.copyLicense}>
                <span style={{ cursor: "pointer" }}>
                  {record.license.slice(0, 30) + "..."}
                </span>
              </CopyToClipboard>
            </Tooltip>
          );
          let status =
            text == "2" ? (
              <Tag color="cyan">企业</Tag>
            ) : (
              <Tag color="magenta">试用</Tag>
            );
          const icon = (
            <span style={{ marginBottom: "4px", marginLeft: "4px" }}>
              <Tooltip title="实时引擎" key={"icon" + "实时引擎"}>
                <img
                  style={{ width: "14px", height: "14px", marginRight: "6px" }}
                  src="static/rt_engine_buy.svg"
                />
              </Tooltip>
              {module.map(function(item) {
                switch (item) {
                  case "深度引擎":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/deep_engine_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "学习引擎":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/learning_engine_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "主动进化引擎":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/active_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "事件中心":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/event_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "资产发现":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/asset_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "数据大屏":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/data_screen_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  case "威胁情报中心":
                    return (
                      <Tooltip title={item} key={"icon" + item}>
                        <img
                          style={{
                            width: "14px",
                            height: "14px",
                            marginRight: "6px"
                          }}
                          src="static/threatinfo_buy.svg"
                        />
                      </Tooltip>
                    );
                    break;
                  default:
                    if (module_obj[item]) {
                      return (
                        <Tooltip title={item} key={"icon" + item}>
                          <img
                            style={{
                              width: "14px",
                              height: "14px",
                              marginRight: "6px"
                            }}
                            src="static/index.ico"
                          />
                        </Tooltip>
                      );
                    }
                }
              })}{" "}
            </span>
          );
          if (record.license) {
            return (
              <div>
                <div>{license}</div>
                <div style={{ marginTop: 10 }}>
                  <span>
                    {status}
                    {icon}
                  </span>
                </div>
              </div>
            );
          } else {
            return <span>{status}</span>;
          }
        }
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
        ],
        filterMultiple: true,
        filteredValue: filteredInfo.status || null,
        onFilter: (value, record) => record.status.includes(value),
        render: text => {
          if (text == "test") {
            return <span style={{ color: "#108ee9" }}>测试</span>;
          }
          if (text == "sign") {
            return <span style={{ color: "#00a854" }}>签约</span>;
          }
          if (text == "close") {
            return <span style={{ color: "#bfbfbf" }}>关闭</span>;
          }
          if (text == "delay") {
            return <span style={{ color: "#a7dfe3" }}>商务中</span>;
          }
          if (text == "experience") {
            return <span style={{ color: "#faaf76" }}>体验</span>;
          }
        }
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: "63px",
        filters: [
          { text: "内部", value: "internal" },
          { text: "客户", value: "enterprise" }
        ],
        filterMultiple: false,
        filteredValue: filteredInfo.type || null,
        onFilter: (value, record) => record.type.includes(value),
        render: text => {
          if (text == "internal") {
            return "内部";
          }
          if (text == "enterprise") {
            return "客户";
          }
        }
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
        width: this.state.kind == "super" ? "90px" : "75px",
        render: (text, record) => {
          const delete_action =
            this.state.kind == "super" ? (
              <Tooltip title="删除此客户">
                <a onClick={this.delModal.bind(this, record)}>
                  <Icon
                    type="delete"
                    style={{
                      fontSize: 13
                    }}
                  />
                </a>
              </Tooltip>
            ) : null;
          const action = (
            <span>
              <Tooltip title="编辑客户信息" placement="topRight">
                <a onClick={this.editModal.bind(this, record)}>
                  <Icon
                    type="edit"
                    style={{
                      fontSize: 13,
                      marginRight: "13px"
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip title="更新客户license" placement="topRight">
                <a onClick={this.updateModal.bind(this, record)}>
                  <Icon
                    type="barcode"
                    style={{
                      fontSize: 13,
                      marginRight: "13px"
                    }}
                  />
                </a>
              </Tooltip>
              {delete_action}
            </span>
          );
          return action;
        }
      }
    ];
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 6
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 14
        }
      }
    };
    const formUpdateLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 10
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 8
        }
      }
    };
    const config = {
      rules: [
        {
          type: "object",
          required: true,
          message: "请选择license到期时间"
        }
      ]
    };
    const locale = {
      filterTitle: "筛选",
      filterConfirm: "确定",
      filterReset: "全部",
      emptyText: "暂无数据"
    };
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>ATD客户列表</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}
        >
          <Button
            onClick={this.showModal}
            type="primary"
            style={{
              margin: "0px 0px 12px 0px"
            }}
          >
            添加客户
          </Button>
          <div></div>
          <div className="overflow_auto">
            <Table
              rowKey="rowKey"
              dataSource={this.state.customerlist}
              columns={columns}
              bordered
              pagination={false}
              loading={this.state.loading}
              rowClassName={(record, index) => {
                let rowclass = "";
                record.status == "sign" && record.license_status == 1
                  ? (rowclass += "trWarn")
                  : (rowclass += "");
                record.status == "close"
                  ? (rowclass += "trClose")
                  : (rowclass += "");
                return rowclass;
              }}
              locale={locale}
              onChange={this.handleChange}
              style={{ minWidth: "990px" }}
            />
          </div>
        </div>
        {this.state.visible && (
          <Modal
            title="添加客户"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <FormItem label="客户名" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: "请输入客户名"
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                    placeholder="请输入客户名"
                  />
                )}
              </FormItem>
              <FormItem label="客户邮箱" {...formItemLayout}>
                {getFieldDecorator("email", {
                  rules: [
                    {
                      required: true,
                      message: "请输入客户邮箱"
                    },
                    {
                      type: "email",
                      message: "请输入正确的邮箱格式"
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                    placeholder="请输入客户邮箱"
                  />
                )}
              </FormItem>
              <FormItem label="负责人" {...formItemLayout}>
                {getFieldDecorator("support", {
                  rules: [
                    {
                      required: true,
                      message: "请输入客户负责人"
                    }
                  ],
                  initialValue: this.name
                })(<Input />)}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator("status", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: "test"
                })(
                  <Select>
                    <Select.Option value="test">测试</Select.Option>
                    <Select.Option value="experience">体验</Select.Option>
                    <Select.Option value="sign">签约</Select.Option>
                    <Select.Option value="close">关闭</Select.Option>
                    <Select.Option value="delay">商务中</Select.Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label={type_title} {...formItemLayout}>
                {getFieldDecorator("type", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: "enterprise"
                })(
                  <Select>
                    <Select.Option value="enterprise">客户</Select.Option>
                    <Select.Option value="internal">内部</Select.Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="备注" {...formItemLayout}>
                {getFieldDecorator("mark", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  />
                )}
              </FormItem>
              <FormItem label="星标客户" {...formItemLayout}>
                <Checkbox
                  checked={this.state.priority}
                  onChange={e =>
                    this.setState({
                      priority: e.target.checked
                    })
                  }
                />
                <span style={{ marginLeft: 4 }}>
                  （若勾选，此客户的报警会得到重点关注）
                </span>
              </FormItem>
              <FormItem label="手机登录" {...formItemLayout}>
                <Checkbox
                  checked={this.state.mobile_verify}
                  onChange={e =>
                    this.setState({ mobile_verify: e.target.checked })
                  }
                />
                <span style={{ marginLeft: 4 }}>
                  （客户机 ATD 登录时是否需要手机验证）
                </span>
              </FormItem>
              <div
                style={{
                  textAlign: "center",
                  margin: "10px"
                }}
              >
                <Button onClick={this.handleCancel}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    marginLeft: "40px"
                  }}
                  loading={this.state.add_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        )}
        {this.state.edit_visible && (
          <Modal
            title={`修改：${this.state.edit_info.name}`}
            visible={this.state.edit_visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleEdit.bind(this)}>
              <FormItem label="客户邮箱" {...formItemLayout}>
                {getFieldDecorator("email", {
                  rules: [
                    {
                      required: false,
                      message: "请输入客户邮箱"
                    },
                    {
                      type: "email",
                      message: "请输入正确的邮箱格式"
                    }
                  ],
                  initialValue: this.state.edit_info.email
                })(
                  <Input
                    prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                    placeholder="请输入客户邮箱"
                  />
                )}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator("status", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.state.edit_info.status
                })(
                  <Select>
                    <Select.Option value="test">测试</Select.Option>
                    <Select.Option value="experience">体验</Select.Option>
                    <Select.Option value="sign">签约</Select.Option>
                    <Select.Option value="close">关闭</Select.Option>
                    <Select.Option value="delay">商务中</Select.Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label={type_title} {...formItemLayout}>
                {getFieldDecorator("type", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: this.state.edit_info.type
                })(
                  <Select>
                    <Select.Option value="enterprise">客户</Select.Option>
                    <Select.Option value="internal">内部</Select.Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="负责人" {...formItemLayout}>
                {getFieldDecorator("support", {
                  initialValue: this.state.edit_info.support
                })(
                  <Input
                    prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                  />
                )}
              </FormItem>
              <FormItem label="备注" {...formItemLayout}>
                {getFieldDecorator("mark", {
                  initialValue: this.state.edit_info.mark
                })(
                  <Input
                    prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  />
                )}
              </FormItem>
              <FormItem label="星标客户" {...formItemLayout}>
                <Checkbox
                  checked={this.state.edit_priority}
                  onChange={e =>
                    this.setState({
                      edit_priority: e.target.checked
                    })
                  }
                />
                <span style={{ marginLeft: 4 }}>
                  （若勾选，此客户的报警会得到重点关注）
                </span>
              </FormItem>
              <FormItem label="手机登录" {...formItemLayout}>
                <Checkbox
                  checked={this.state.edit_mobile_verify}
                  onChange={e =>
                    this.setState({
                      edit_mobile_verify: e.target.checked
                    })
                  }
                />
                <span style={{ marginLeft: 4 }}>
                  （客户机 ATD 登录时是否需要手机验证）
                </span>
              </FormItem>
              <div
                style={{
                  textAlign: "center",
                  margin: "10px"
                }}
              >
                <Button onClick={this.handleCancel}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    marginLeft: "40px"
                  }}
                  loading={this.state.edit_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        )}
        {this.state.del_visible && (
          <Modal
            title="删除客户"
            visible={this.state.del_visible}
            confirmLoading={this.state.del_loading}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认"
            cancelText="取消"
          >
            <p>确定删除{this.state.del_info.name}客户吗？</p>
          </Modal>
        )}
        {this.state.update_visible && (
          <Modal
            title="更新客户license"
            visible={this.state.update_visible}
            confirmLoading={this.state.update_loading}
            onOk={this.handleUpdate}
            onCancel={this.handleCancel}
            okText="确认"
            cancelText="取消"
            footer={null}
          >
            <Form onSubmit={this.handleUpdate.bind(this)}>
              <FormItem label="客户名" {...formUpdateLayout}>
                <span>{this.state.update_info.name}</span>
              </FormItem>
              <FormItem label="license到期时间" {...formUpdateLayout}>
                {getFieldDecorator("date-picker", {
                  ...config,
                  initialValue:
                    this.state.update_info.license_etime ==
                    "0000-00-00 00:00:00"
                      ? moment()
                      : moment(this.state.update_info.license_etime)
                })(<DatePicker disabledDate={this.disabledDate} />)}
              </FormItem>
              <FormItem label="license类型" {...formUpdateLayout}>
                {getFieldDecorator("license_status", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: this.state.update_info.license_status
                })(
                  <Select>
                    <Select.Option value="1">试用</Select.Option>
                    <Select.Option value="2">企业</Select.Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="选择已购模块" {...formUpdateLayout}>
                {getFieldDecorator("module", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: this.state.update_info.module
                })(
                  <Checkbox.Group style={{ width: "100%" }}>
                    <Row>
                      <Col span={24} key="rt" style={{ marginBottom: "4px" }}>
                        <Checkbox disabled checked value="实时引擎">
                          实时引擎
                        </Checkbox>
                      </Col>
                      {this.state.module_list.map(item => {
                        return (
                          <Col
                            span={24}
                            key={item}
                            style={{ marginBottom: "4px" }}
                          >
                            <Checkbox value={item}>{item}</Checkbox>
                          </Col>
                        );
                      })}
                    </Row>
                  </Checkbox.Group>
                )}
              </FormItem>
              <div
                style={{
                  textAlign: "center",
                  margin: "10px"
                }}
              >
                <Button onClick={this.handleCancel}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    marginLeft: "40px"
                  }}
                  loading={this.state.update_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        )}
        {this.state.new_visible && (
          <Modal
            title={`${this.state.update_info.name}更新后license信息`}
            visible={this.state.new_visible}
            onOk={this.handleCancel}
            onCancel={this.handleCancel}
            okText="关闭"
            footer={null}
          >
            <p style={{ wordBreak: "break-all" }}>新license :</p>
            <p style={{ wordBreak: "break-all" }}>
              <CopyToClipboard
                text={this.state.new_info.license}
                onCopy={this.copyLicense}
              >
                <span style={{ cursor: "pointer", color: "#1e9fff" }}>
                  <Tooltip title="点击复制">
                    {this.state.new_info.license}
                  </Tooltip>
                </span>
              </CopyToClipboard>
            </p>
            <br />
            <p>新license到期时间 : {this.state.new_info.license_etime}</p>
          </Modal>
        )}
        <style>
          {`
                    .trWarn {
                        background-color: #fffaeb;
                    }
                    .trClose {
                        color: #bfbfbf;
                    }
                    .cursor-click {
                      cursor: pointer;
                    }
                    .color-main {
                       color: #20a0ff;
                    }
                `}
        </style>
      </div>
    );
  }
}

export default CustomerList = Form.create({})(CustomerList);
