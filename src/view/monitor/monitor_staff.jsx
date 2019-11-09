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
  Switch,
  message,
  Tag,
  Popconfirm
} from "antd";
import React from "react";
import request from "@api/tools/request"
import { connect } from "react-redux";
const FormItem = Form.Item;
const Option = Select.Option;

message.config({
  top: 100,
  duration: 1.6
});
const sendType = {
  email: "邮箱",
  wechat: "微信"
};
const sendTypeKey = ["email", "wechat"];
const addSendOption = [];
for (const key in sendType) {
  addSendOption.push(
    <Option key={key} value={key}>
      {sendType[key]}
    </Option>
  );
}
class MonitorConfig extends React.Component {
  state = {
    loading: true,
    tagList: [],
    addModal: false,
    add_loading: false,
    delete_monitor: false,
    del_loading: false,
    priority_loading: false,
    info: { userlist: [] },
    close: [],
    addUserModal: false,
    userlist: [],
    adduser_loading: false,
    addSendModal: false,
    addsend_loading: false,
    edit_priority_checked: false,
    curItem: null
  };

  componentDidMount() {
    this.get_userlist();
    this.get_monitorconfig();
  }
  showModal = () => {
    this.setState({ addModal: true });
    this.props.form.setFieldsValue({
      type: "",
      name: "",
      send: []
    });
  };
  handleAdd = e => {
    this.setState({ add_loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err && !err.type && !err.name) {
        const add_monitor = {};
        add_monitor.type = values.type;
        add_monitor.name = values.name;
        if (values.send) {
          add_monitor.send = values.send;
        }
        request("/dashboard/monitor/type", "post", {}, add_monitor).then(
          res => {
            if (res && !res.code) {
              this.setState({ add_loading: false, addModal: false });
              message.success("添加成功");
              this.get_monitorconfig();
            } else {
              this.setState({ add_loading: false });
              let text = "网络错误，请稍后再试";
              if (res && res.message) {
                text = res.message;
              }
              message.warning(text);
            }
          }
        );
      } else {
        this.setState({ add_loading: false });
      }
    });
  };
  DeleteModal = info => {
    this.setState({
      info,
      DeleteModal: true
    });
  };
  handleDelete = () => {
    this.setState({
      del_loading: true
    });
    const delete_monitor = {};
    delete_monitor.type = this.state.info.type;
    request("/dashboard/monitor/type", "delete", {}, delete_monitor).then(
      res => {
        if (res && !res.code) {
          this.setState({ del_loading: false, DeleteModal: false });
          message.success("删除成功");
          this.get_monitorconfig();
        } else {
          this.setState({ del_loading: false });
          let text = "网络错误，请稍后再试";
          if (res && res.message) {
            text = res.message;
          }
          message.warning(text);
        }
      }
    );
  };
  deleteUser = (type, userid, e) => {
    const delete_user = {};
    delete_user.type = type;
    delete_user.userlist = [userid];
    const close = this.state.close;
    request("/dashboard/monitor/type/user", "delete", {}, delete_user).then(
      res => {
        if (res == 1) {
          message.success("删除成功");
          // close.push(type + userid)
          // this.setState({
          //   close: close,
          // })
          this.get_monitorconfig();
        } else {
          let text = "网络错误，请稍后再试";
          if (res && res.message) {
            text = res.message;
          }
          message.warning(text);
        }
      }
    );
  };
  addUserModal = info => {
    this.setState({
      addUserModal: true,
      info
    });
    this.props.form.setFieldsValue({
      users: []
    });
  };
  // 接收方式
  deleteSend = (type, send, sends, e) => {
    const delete_send = {};
    delete_send.type = type;
    delete_send.send = sends.filter(v => ![send].includes(v));
    request("/dashboard/monitor/type", "put", {}, delete_send).then(res => {
      if (res == 1) {
        message.success("删除成功");
        this.get_monitorconfig();
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };
  addSendModal = info => {
    this.setState({
      addSendModal: true,
      info
    });
    this.props.form.setFieldsValue({
      sends: []
    });
  };
  handleAddSend = e => {
    this.setState({ addsend_loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err && !err.sends) {
        const addsend = {};
        const send = this.state.info.send;
        addsend.type = this.state.info.type;
        addsend.send = send.concat(values.sends);
        request("/dashboard/monitor/type", "put", {}, addsend).then(res => {
          if (res && !res.code) {
            this.setState({ addsend_loading: false, addSendModal: false });
            message.success("添加成功");
            this.get_monitorconfig();
          } else {
            this.setState({ addsend_loading: false });
            let text = "网络错误，请稍后再试";
            if (res && res.message) {
              text = res.message;
            }
            message.warning(text);
          }
        });
      } else {
        this.setState({ addsend_loading: false });
      }
    });
  };
  handleAddUser = e => {
    this.setState({ adduser_loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err && !err.users) {
        const adduser = {};
        const userlist = this.state.userlist;
        adduser.type = this.state.info.type;
        adduser.userlist = [];
        for (const userid of values.users) {
          let username = "";
          let useremail = "";
          for (const item of userlist) {
            if (item.wechat == userid) {
              username = item.name;
              useremail = item.staff_email;
            }
          }
          adduser.userlist.push({
            userid,
            name: username,
            email: useremail
          });
        }
        request("/dashboard/monitor/type/user", "post", {}, adduser).then(
          res => {
            if (res && !res.code) {
              this.setState({ adduser_loading: false, addUserModal: false });
              message.success("添加成功");
              this.get_monitorconfig();
            } else {
              this.setState({ adduser_loading: false });
              let text = "网络错误，请稍后再试";
              if (res && res.message) {
                text = res.message;
              }
              message.warning(text);
            }
          }
        );
      } else {
        this.setState({ adduser_loading: false });
      }
    });
  };
  handleCancel = () => {
    this.setState({
      addModal: false,
      DeleteModal: false,
      addUserModal: false,
      addSendModal: false
    });
  };
  get_monitorconfig = () => {
    request("/dashboard/monitor/type", "get").then(res => {
      this.setState({ loading: false });
      if (res && !res.code) {
        this.setState({ tagList: res.data });
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
  get_userlist = () => {
    request("/dashboard/user/list", "get").then(res => {
      if (res && !res.code) {
        this.setState({ userlist: res.data });
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.message) {
          text = res.message;
        }
        message.warning(text);
      }
    });
  };

  onPriorityModalVisible = (record, checked) => {
    const priorityModalTitle = checked ? (
      <span>
        确定提高报警<b> {record.name} </b>的优先级吗
      </span>
    ) : (
      <span>
        确定把<b> {record.name} </b>设回普通级别吗
      </span>
    );

    this.setState({
      priorityModalVisible: true,
      priorityModalTitle,
      edit_priority_checked: checked,
      curItem: record
    });
  };

  onPriority = () => {
    let { curItem, edit_priority_checked } = this.state;
    if (!curItem) return;

    let putParams = {
      type: curItem.type,
      priority: edit_priority_checked ? "high" : "normal"
    };

    this.setState({ priority_loading: true });

    request("/dashboard/monitor/type", "put", {}, putParams).then(res => {
      if (res && !res.code) {
        this.setState({ priority_loading: false, priorityModalVisible: false });
        this.get_monitorconfig();
      } else {
        message.error("网络错误，请稍后再试");
      }
    });
  };
  render() {
    const {
      info,
      priority_loading,
      priorityModalVisible,
      priorityModalTitle,
      edit_priority_checked
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const title_count = `报警名称（${this.state.tagList.length}个）`;
    const sendTitle = (
      <span>
        报警接收方式
        <Tooltip title="未添加接收方式的报警默认记录报警信息">
          <Icon
            style={{ marginLeft: "5px", fontSize: 13 }}
            type="question-circle"
          />
        </Tooltip>
      </span>
    );

    const columns = [
      {
        title: "报警编号",
        dataIndex: "type",
        key: "type",
        width: "80px"
      },
      {
        title: title_count,
        dataIndex: "name",
        key: "name",
        width: "150px"
      },
      {
        title: "报警接收人",
        dataIndex: "user",
        key: "user",
        render: (text, record) => {
          const username = record.userlist || [];
          const userlist = (
            <div key={`${record.id}user`}>
              {username.map((tag, index) => {
                const tagElem = (
                  <Popconfirm
                    key={tag.userid}
                    title="确定删除该接收人吗？"
                    okText="确定"
                    cancelText="取消"
                    onConfirm={this.deleteUser.bind(
                      this,
                      record.type,
                      tag.userid
                    )}
                  >
                    <Tag
                      closable
                      onClose={e => e.preventDefault()}
                      style={
                        this.state.close.indexOf(record.type + tag.userid) != -1
                          ? { display: "none" }
                          : ""
                      }
                    >
                      {tag.name}
                    </Tag>
                  </Popconfirm>
                );
                return tagElem;
              })}
              {
                <Tag
                  onClick={this.addUserModal.bind(this, record)}
                  style={{ background: "#fff", borderStyle: "dashed" }}
                >
                  <Icon type="plus" /> 添加
                </Tag>
              }
            </div>
          );
          return userlist;
        }
      },
      {
        title: sendTitle,
        dataIndex: "send",
        key: "send",
        width: "250px",
        render: (text, record) => {
          const send = record.send || [];
          const sendlist = (
            <div key={`${record.id}send`}>
              {send.map((tag, index) => {
                const tagElem = (
                  <Popconfirm
                    key={tag + record.id}
                    title="确定删除该接收方式吗？"
                    okText="确定"
                    cancelText="取消"
                    onConfirm={this.deleteSend.bind(
                      this,
                      record.type,
                      tag,
                      record.send
                    )}
                  >
                    <Tag closable onClose={e => e.preventDefault()}>
                      {sendType[tag]}
                    </Tag>
                  </Popconfirm>
                );
                return tagElem;
              })}
              {
                <Tag
                  onClick={this.addSendModal.bind(this, record)}
                  style={{ background: "#fff", borderStyle: "dashed" }}
                >
                  <Icon type="plus" /> 添加
                </Tag>
              }
            </div>
          );
          return sendlist;
        }
      },
      {
        title: (
          <Tooltip
            title="对于星标客户，普通级别报警将发送到企业微信的重要报警，提高优先级别后，此报警还会打电话到对应人员"
            placement="topRight"
          >
            优先
            <Icon
              type="info-circle"
              style={{
                fontSize: 13,
                marginLeft: 12
              }}
            />
          </Tooltip>
        ),
        key: "priority",
        dataIndex: "priority",
        width: "80px",
        render: (priority, record) => {
          return (
            <Switch
              checked={priority === "high"}
              onChange={this.onPriorityModalVisible.bind(null, record)}
            />
          );
        }
      },
      {
        title: "操作",
        key: "action",
        width: "80px",
        render: (text, record) => {
          const action = (
            <span>
              <Tooltip title="删除" placement="topRight">
                <a onClick={this.DeleteModal.bind(this, record)}>
                  <Icon
                    type="delete"
                    style={{
                      fontSize: 13,
                      marginRight: "15px"
                    }}
                  />
                </a>
              </Tooltip>
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
          span: 8
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 15
        }
      }
    };
    const user_option = [];
    this.state.userlist.map(function(item, index) {
      if (JSON.stringify(info.userlist).indexOf(item.wechat) == -1) {
        user_option.push(
          <Option value={item.wechat} key={item.wechat}>
            {item.name}
          </Option>
        );
      }
    });
    const addsend_option = [];
    sendTypeKey
      .filter(v => info.send && !info.send.includes(v))
      .map(function(item, index) {
        addsend_option.push(
          <Option value={item} key={item}>
            {sendType[item]}
          </Option>
        );
      });
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>报警接收情况</Breadcrumb.Item>
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
            添加报警
          </Button>
          <div className="overflow_auto">
            <Table
              dataSource={this.state.tagList}
              columns={columns}
              bordered
              pagination={false}
              loading={this.state.loading}
              onChange={this.handleChange}
              rowKey="type"
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        <Modal
          title="添加报警"
          visible={this.state.addModal}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form onSubmit={this.handleAdd.bind(this)}>
            <FormItem label="报警编号" {...formItemLayout}>
              {getFieldDecorator("type", {
                rules: [
                  {
                    required: true,
                    message: "请输入报警数字编号",
                    pattern: new RegExp("^\\d")
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="profile" style={{ fontSize: 13 }} />}
                  placeholder="请输入报警编号"
                />
              )}
            </FormItem>
            <FormItem label="报警名称" {...formItemLayout}>
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "请输入报警名称"
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="bell" style={{ fontSize: 13 }} />}
                  placeholder="请输入报警名称"
                />
              )}
            </FormItem>
            <FormItem label="报警接收方式" {...formItemLayout}>
              {getFieldDecorator("send", {
                rules: [
                  {
                    required: false,
                    type: "array"
                  }
                ]
              })(
                <Select
                  mode="multiple"
                  placeholder="请选择报警接收方式，默认记录报警信息"
                >
                  {addSendOption}
                </Select>
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
                loading={this.state.add_loading}
              >
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        <Modal
          title="删除报警"
          visible={this.state.DeleteModal}
          confirmLoading={this.state.del_loading}
          onOk={this.handleDelete}
          onCancel={this.handleCancel}
          okText="确认"
          cancelText="取消"
        >
          <p>确定删除&nbsp;{this.state.info.name}&nbsp;报警吗？</p>
        </Modal>
        <Modal
          title={`添加${this.state.info.name}接收人`}
          visible={this.state.addUserModal}
          onCancel={this.handleCancel}
          footer={null}
          confirmLoading={this.state.adduser_loading}
        >
          <Form onSubmit={this.handleAddUser.bind(this)}>
            <FormItem label="报警接收人" {...formItemLayout}>
              {getFieldDecorator("users", {
                rules: [
                  {
                    required: true,
                    message: "请选择报警接收人",
                    type: "array"
                  }
                ]
              })(
                <Select mode="multiple" placeholder="请添加报警接收人">
                  {user_option}
                </Select>
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
                loading={this.state.add_loading}
              >
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        <Modal
          title={`添加${this.state.info.name}报警接收方式`}
          visible={this.state.addSendModal}
          onCancel={this.handleCancel}
          footer={null}
          confirmLoading={this.state.addsend_loading}
        >
          <Form onSubmit={this.handleAddSend.bind(this)}>
            <FormItem label="报警接收方式" {...formItemLayout}>
              {getFieldDecorator("sends", {
                rules: [
                  {
                    required: true,
                    message: "请选择报警接收方式",
                    type: "array"
                  }
                ]
              })(
                <Select mode="multiple" placeholder="请选择报警接收方式">
                  {addsend_option}
                </Select>
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
                loading={this.state.addsend_loading}
              >
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        {priorityModalVisible && (
          <Modal
            visible={priorityModalVisible}
            title={priorityModalTitle}
            confirmLoading={priority_loading}
            onOk={this.onPriority}
            onCancel={() => this.setState({ priorityModalVisible: false })}
          >
            <span>
              {edit_priority_checked ? (
                <span>
                  对于星标客户，普通级别报警将发送到企业微信的重要报警，提高优先级别后，此报警还会打电话到对应人员
                </span>
              ) : (
                <span>改为普通优先级后，此报警会以默认报警方式进行</span>
              )}
            </span>
          </Modal>
        )}
        <style>
          {`
            .showIcon .ant-table-row-expand-icon{
                    background-color: #20a0ff;
                    color: white;
            }
            .hideIcon .ant-table-row-expand-icon{
                    display: none;
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

export default MonitorConfig = connect(mapStateToProps)(
  Form.create({})(MonitorConfig)
);
