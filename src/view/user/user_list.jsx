import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tooltip
} from "antd";
import React from "react";
import request from "@api/tools/request"
import Cookies from "universal-cookie";
const cookies = new Cookies();
const FormItem = Form.Item;

class UserList extends React.Component {
  state = {
    userlist: [],
    pagination: false,
    visible: false,
    del_visible: false,
    edit_visible: false,
    loading: true,
    del_info: "",
    edit_info: "",
    del_loading: false,
    add_loading: false,
    edit_loading: false,
    ownKind: ""
  };
  showModal = () => {
    this.setState({ visible: true });
    this.props.form.setFieldsValue({
      name: "",
      staff_email: "",
      mobile: "",
      kind: "spectator",
      role: "dev",
      mark: ""
    });
  };
  delModal = del_info => {
    this.setState({ del_visible: true, del_info });
  };
  editModal = edit_info => {
    this.setState({ edit_visible: true, edit_info });
    this.props.form.setFieldsValue({
      name: edit_info.name,
      mobile: edit_info.mobile,
      kind: edit_info.kind,
      role: edit_info.role,
      mark: edit_info.mark,
      wechat: edit_info.wechat
    });
  };
  handleOk = () => {
    this.setState({ del_loading: true });
    const url = `/dashboard/user/${this.state.del_info.user_id}/info`;
    request(url, "delete", { access_token: cookies.get("access_token") }).then(
      res => {
        //   console.log(res)
        if (res && !res.code) {
          this.setState({ del_loading: false, del_visible: false });
          this.get_userlist();
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
  handleCancel = () => {
    this.setState({ visible: false, del_visible: false, edit_visible: false });
  };
  handleSubmit(e) {
    this.setState({ add_loading: true });
    // 页面开始向API提交
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const formData = values;
        // console.log(formData);
        const add_user = {};
        add_user.name = formData.name;
        add_user.staff_email = formData.staff_email;
        add_user.mobile = formData.mobile;
        add_user.kind = formData.kind;
        add_user.role = formData.role;
        if (!!formData.level) {
          add_user.level = formData.level;
        }
        if (!!formData.mark) {
          add_user.mark = formData.mark;
        }
        request("/dashboard/user/info", "post", {}, add_user).then(res => {
          // console.log(res)
          if (res && !res.code) {
            this.setState({ add_loading: false, visible: false });
            Modal.success({
              title: "添加用户成功"
            });
            this.get_userlist();
          } else {
            this.setState({ add_loading: false });
            if (res && res.code && res.code == 400204) {
              this.props.form.setFields({
                mobile: {
                  value: values.mobile,
                  errors: [new Error(res.message)]
                }
              });
            } else if (res && res.code && res.code == 400210) {
              this.props.form.setFields({
                staff_email: {
                  value: values.staff_email,
                  errors: [new Error(res.message)]
                }
              });
            } else {
              let text = "网络错误，请稍后再试";
              if (res && res.message) {
                text = res.message;
              }
              Modal.warning({
                title: text
              });
            }
          }
        });
      } else {
        this.setState({ add_loading: false });
      }
    });
  }
  handleEdit(e) {
    // 页面开始向API提交
    e.preventDefault();
    // console.log(formData);
    this.props.form.validateFieldsAndScroll((err, formData) => {
      if (err) {
        return;
      }
      this.setState({ edit_loading: true });
      const edit_user = {};
      edit_user.name = formData.name;
      edit_user.staff_email = formData.staff_email;
      edit_user.mobile = formData.mobile;
      edit_user.kind = formData.kind;
      edit_user.role = formData.role;
      edit_user.wechat = formData.wechat;
      if (!!formData.level) {
        edit_user.level = formData.level;
      }
      if (!!formData.mark) {
        edit_user.mark = formData.mark;
      }
      const url = `/dashboard/user/${this.state.edit_info.user_id}/info`;
      request(url, "put", {}, edit_user).then(res => {
        // console.log(res)
        if (res && !res.code) {
          this.setState({ edit_loading: false, edit_visible: false });
          Modal.success({
            title: "修改用户信息成功"
          });
          this.get_userlist();
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
    });
  }
  componentDidMount() {
    this.get_userlist();
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    if (userinfo && userinfo.kind) {
      this.setState({
        ownKind: userinfo.kind
      });
    } else {
      request("/dashboard/user/info", "get").then(res => {
        this.setState({
          ownKind: res.kind
        });
      });
    }
  }
  get_userlist = () => {
    request("/dashboard/user/list", "get").then(res => {
      if (res && !res.code) {
        this.setState({ userlist: res.data, loading: false });
        if (res && res.data && res.data.length > 50) {
          this.setState({
            pagination: { pageSize: 50 }
          });
        } else {
          this.setState({
            pagination: false
          });
        }
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: "用户名",
        dataIndex: "name",
        render: (text, record) => {
          if (record.wechat) {
            return record.name;
          } else {
            return (
              <span>
                {record.name}{" "}
                <Tooltip title="该用户没有绑定微信号">
                  <Icon style={{ fontSize: 12 }} type="question-circle" />
                </Tooltip>
              </span>
            );
          }
        }
      },
      {
        title: "微信号",
        dataIndex: "wechat",
        key: "wechat"
      },
      {
        title: "邮箱",
        dataIndex: "staff_email"
      },
      {
        title: "电话",
        dataIndex: "mobile"
      },
      {
        title: "用户权限",
        dataIndex: "kind",
        render: text => {
          if (text == "super") {
            return "超级管理员";
          }
          if (text == "admin") {
            return "管理员";
          }
          if (text == "spectator") {
            return "普通用户";
          }
        }
      },
      {
        title: "角色",
        dataIndex: "role",
        filters: [
          { value: "dev", text: "开发" },
          { value: "manager", text: "管理" },
          { value: "pm", text: "产品" },
          { value: "sale", text: "销售" },
          { value: "support", text: "售前" },
          { value: "op", text: "运维" }
        ],
        filterMultiple: false,
        onFilter: (value, record) => record.role.includes(value),
        render: text => {
          if (text == "dev") {
            return "开发";
          }
          if (text == "manager") {
            return "管理";
          }
          if (text == "pm") {
            return "产品";
          }
          if (text == "sale") {
            return "销售";
          }
          if (text == "support") {
            return "售前";
          }
          if (text == "op") {
            return "运维";
          }
        }
      },
      {
        title: "操作",
        key: "action",
        render: (text, record) => {
          if (record && record.kind != "super") {
            const action = (
              <span>
                <Tooltip title="编辑用户信息" placement="topRight">
                  <a onClick={this.editModal.bind(this, record)}>
                    <Icon
                      type="edit"
                      style={{
                        fontSize: 13,
                        marginRight: "15px"
                      }}
                    />
                  </a>
                </Tooltip>
                <Tooltip title="删除此用户" placement="topRight">
                  <a onClick={this.delModal.bind(this, record)}>
                    <Icon
                      type="delete"
                      style={{
                        fontSize: 13
                      }}
                    />
                  </a>
                </Tooltip>
              </span>
            );
            return action;
          } else {
            return "";
          }
        }
      }
    ];
    const userColums =
      this.state.ownKind == "super" ? columns : columns.slice(0, 5);
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
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>用户列表</Breadcrumb.Item>
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
            添加用户
          </Button>
          <div className="overflow_auto">
            <Table
              rowKey="staff_email"
              style={{ minWidth: "600px" }}
              dataSource={this.state.userlist}
              columns={userColums}
              bordered
              pagination={this.state.pagination}
              loading={this.state.loading}
            />
          </div>
        </div>
        {this.state.visible && (
          <Modal
            title="添加用户"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <FormItem label="用户名" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: "请输入用户名"
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                    placeholder="请输入用户名"
                  />
                )}
              </FormItem>
              <FormItem label="邮箱" {...formItemLayout}>
                {getFieldDecorator("staff_email", {
                  rules: [
                    {
                      required: true,
                      message: "请输入邮箱"
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
                    type="email"
                    placeholder="请输入邮箱"
                  />
                )}
              </FormItem>
              <FormItem label="手机号" {...formItemLayout}>
                {getFieldDecorator("mobile", {
                  rules: [
                    {
                      required: true,
                      message: "请输入手机号"
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="tablet" style={{ fontSize: 13 }} />}
                    placeholder="请输入手机号"
                  />
                )}
              </FormItem>
              <FormItem label="用户权限" {...formItemLayout}>
                {getFieldDecorator("kind", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: "spectator"
                })(
                  <Select>
                    <Option value="admin">管理员</Option>
                    <Option value="spectator">普通用户</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="角色" {...formItemLayout}>
                {getFieldDecorator("role", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: "dev"
                })(
                  <Select>
                    <Option value="manager">管理</Option>
                    <Option value="dev">开发</Option>
                    <Option value="pm">产品</Option>
                    <Option value="op">运维</Option>
                    <Option value="sale">销售</Option>
                    <Option value="support">售前</Option>
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
            title="修改用户信息"
            visible={this.state.edit_visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleEdit.bind(this)}>
              <FormItem label="用户名" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: "请输入用户名"
                    }
                  ],
                  initialValue: this.state.edit_info.name
                })(
                  <Input
                    prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                    placeholder="请输入用户名"
                  />
                )}
              </FormItem>
              <FormItem label="手机号" {...formItemLayout}>
                {getFieldDecorator("mobile", {
                  rules: [
                    {
                      required: true,
                      message: "请输入手机号"
                    }
                  ],
                  initialValue: this.state.edit_info.mobile
                })(
                  <Input
                    prefix={<Icon type="tablet" style={{ fontSize: 13 }} />}
                    placeholder="请输入手机号"
                  />
                )}
              </FormItem>
              <FormItem label="用户权限" {...formItemLayout}>
                {getFieldDecorator("kind", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.state.edit_info.kind
                })(
                  <Select>
                    <Option value="admin">管理员</Option>
                    <Option value="spectator">普通用户</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="角色" {...formItemLayout}>
                {getFieldDecorator("role", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.state.edit_info.role
                })(
                  <Select>
                    <Option value="manager">管理</Option>
                    <Option value="dev">开发</Option>
                    <Option value="pm">产品</Option>
                    <Option value="op">运维</Option>
                    <Option value="sale">销售</Option>
                    <Option value="support">售前</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="微信号" {...formItemLayout}>
                {getFieldDecorator("wechat", {
                  rules: [
                    {
                      required: true,
                      message: "请输入微信号"
                    }
                  ],
                  initialValue: this.state.edit_info.wechat
                })(<Input placeholder="请输入企业微信账号" />)}
              </FormItem>
              <FormItem label="备注" {...formItemLayout}>
                {getFieldDecorator("mark", {
                  rules: [
                    {
                      required: false
                    }
                  ],
                  initialValue: this.state.edit_info.mark
                })(
                  <Input
                    prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  />
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
            title="删除用户"
            visible={this.state.del_visible}
            confirmLoading={this.state.del_loading}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认"
            cancelText="取消"
          >
            <p>确定删除{this.state.del_info.name}用户吗？</p>
          </Modal>
        )}
      </div>
    );
  }
}

export default UserList = Form.create({})(UserList);
