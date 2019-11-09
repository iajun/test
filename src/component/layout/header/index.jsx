import { Layout, Menu, Icon, Button, Modal, Form, Input, Popover } from "antd";
import React from "react";
import Cookies from "universal-cookie";
import { Link } from "react-router-dom";
import request from "@api/tools/request";
import styles from "./index.module.scss";

const cookies = new Cookies();
const { Header } = Layout;
const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;
const FormItem = Form.Item;

class PCHeader extends React.Component {
  state = {
    user: "",
    visible: false,
    pw_visible: false,
    pw_loading: false,
    confirmDirty: false
  };
  showModal = () => {
    this.setState({
      pw_visible: true
    });
  };

  handleCancel = () => {
    this.setState({
      pw_visible: false
    });
  };
  handleSubmit(e) {
    this.setState({
      pw_loading: true
    });
    // 页面开始向API提交
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const formData = values;
        const pw = {};
        pw.old_password = formData.old_password;
        pw.new_password = formData.new_password;
        const url = "/dashboard/user/password";
        request(url, "post", {}, pw).then(res => {
          //    console.log(res)
          if (res && !res.code) {
            this.setState({
              pw_loading: false,
              pw_visible: false
            });
            Modal.success({
              title: "密码修改成功!"
            });
          } else {
            this.setState({
              pw_loading: false
            });
            if (res.code && res.code == 400213) {
              this.props.form.setFields({
                new_password: {
                  value: values.new_password,
                  errors: [new Error(res.message)]
                }
              });
            } else if (res.code && res.code == 403001) {
              this.props.form.setFields({
                old_password: {
                  value: values.old_password,
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
      }
    });
  }
  componentDidMount() {
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    if (userinfo && userinfo.name) {
      this.setState({
        user: userinfo.name
      });
    } else {
      request("/dashboard/user/info", "get").then(res => {
        this.setState({
          user: res.name
        });
      });
    }
  }
  menuClick = e => {
    //   console.log(e);
    e.key === "logout" && this.logout();
    e.key === "changepw" && this.showModal();
  };
  logout = () => {
    localStorage.removeItem("userinfo");
    cookies.remove("access_token");
    location.hash = "/login";
  };
  // 确认密码
  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("new_password")) {
      callback("两次密码不一致");
    } else {
      callback();
    }
  };
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && (value.length < 6 || value.length > 20)) {
      callback("您的密码最短6位, 最多20位");
    } else {
      if (value && this.state.confirmDirty) {
        form.validateFields(["confirm"], { force: true });
      }
      callback();
    }
  };
  popoverHide = () => {
    this.setState({
      visible: false
    });
  };
  handleVisibleChange = visible => {
    this.setState({ visible });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    };
    return (
      <Header className={styles["header"]}>
        <div className={styles["header-user"]}>
          <Menu mode="horizontal" onClick={this.menuClick}>
            <SubMenu title={<span>{this.state.user}</span>}>
              <MenuItemGroup>
                <Menu.Item key="userinfo">
                  <Link to={"/index/userinfo"}>个人信息</Link>
                </Menu.Item>
                <Menu.Item key="record">
                  <Link to={"/index/record"}>操作记录</Link>
                </Menu.Item>
                <Menu.Item key="changepw" onClick={this.showModal}>
                  修改密码
                </Menu.Item>
                <Menu.Item key="logout">
                  <span onClick={this.logout}>退出登录</span>
                </Menu.Item>
              </MenuItemGroup>
            </SubMenu>
          </Menu>
        </div>
        <Modal
          title="修改密码"
          visible={this.state.pw_visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label="原密码" {...formItemLayout}>
              {getFieldDecorator("old_password", {
                rules: [{ required: true, message: "请输入原密码" }]
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder="请输入原来的密码"
                />
              )}
            </FormItem>
            <FormItem label="新密码" {...formItemLayout}>
              {getFieldDecorator("new_password", {
                rules: [
                  { required: true, message: "请输入新密码" },
                  { validator: this.checkConfirm }
                ]
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type=""
                  placeholder="请输入新密码"
                />
              )}
            </FormItem>
            <FormItem label="确认密码" {...formItemLayout}>
              {getFieldDecorator("confirm", {
                rules: [
                  { required: true, message: "请再次输入新密码" },
                  { validator: this.checkPassword }
                ]
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type=""
                  placeholder="请再次输入新密码"
                  onBlur={this.handleConfirmBlur}
                />
              )}
            </FormItem>
            <div>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
            </div>
          </Form>
        </Modal>
      </Header>
    );
  }
}

export default Form.create({})(PCHeader);
