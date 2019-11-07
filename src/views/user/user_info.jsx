import {
  Breadcrumb,
  Icon,
  Row,
  Col,
  Card,
  Form,
  Modal,
  Input,
  Select,
  Button
} from "igroot";
import React from "react";
import ReactDOM from "react-dom";
import { request } from "../../../../apis/request";
import { store } from "@/pages/index/redux/store";
import { connect } from "react-redux";
const FormItem = Form.Item;

class UserInfo extends React.Component {
  state = {
    userinfo: {},
    edit_visible: false,
    edit_info: "",
    edit_loading: false
  };
  editModal = edit_info => {
    this.setState({
      edit_visible: true,
      edit_info
    });
  };
  handleCancel = () => {
    this.setState({
      edit_visible: false
    });
  };
  handleEdit(e) {
    this.setState({
      edit_loading: true
    });
    // 页面开始向API提交
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    // console.log(formData);
    const edit_user = {};
    edit_user.name = formData.name;
    edit_user.mobile = formData.mobile;
    edit_user.wechat = formData.wechat;

    const url = "/dashboard/user/info";
    request(url, "put", {}, edit_user).then(res => {
      // console.log(res)
      if (res && !res.code) {
        this.setState({
          edit_loading: false,
          edit_visible: false
        });
        Modal.success({
          title: "保存成功"
        });
        request("/dashboard/user/info", "get").then(res => {
          this.setState({
            userinfo: res
          });
        });
      } else {
        this.setState({
          edit_loading: false
        });
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
  componentWillMount() {
    request("/dashboard/user/info", "get").then(res => {
      if (res && !res.code) {
        if (res.kind == "super") {
          res.kind = "超级管理员";
        }
        if (res.kind == "admin") {
          res.kind = "管理员";
        }
        if (res.kind == "spectator") {
          res.kind = "普通用户";
        }
        if (res.role == "dev") {
          res.role = "开发";
        }
        if (res.role == "manager") {
          res.role = "管理";
        }
        if (res.role == "pm") {
          res.role = "产品";
        }
        if (res.role == "sale") {
          res.role = "销售";
        }
        if (res.role == "support") {
          res.role = "售前";
        }
        if (res.role == "op") {
          res.role = "运维";
        }
        this.setState({
          userinfo: res
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
    });
  }
  render() {
    const { isMobile } = this.props;
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
      <div>
        <Breadcrumb style={{ margin: "12px 0" }}>
          <Breadcrumb.Item>个人信息</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: "#fff", minHeight: "60vh" }}>
          <Row>
            <Col span={isMobile ? 0 : 6} />
            <Col span={isMobile ? 24 : 12}>
              <Card
                title="个人信息"
                extra={
                  <a onClick={this.editModal.bind(this, this.state.userinfo)}>
                    编辑
                    <Icon type="edit" style={{ fontSize: 13 }} />
                  </a>
                }
              >
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>用户名：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.name}</p>
                  </Col>
                </Row>
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>邮箱：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.staff_email}</p>
                  </Col>
                </Row>
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>手机号：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.mobile}</p>
                  </Col>
                </Row>
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>用户权限：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.kind}</p>
                  </Col>
                </Row>
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>角色：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.role}</p>
                  </Col>
                </Row>
                <Row style={{ marginBottom: "16px" }}>
                  <Col span={2} />
                  <Col span={6}>
                    <p>微信：</p>
                  </Col>
                  <Col span={16}>
                    <p>{this.state.userinfo.wechat}</p>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={isMobile ? 0 : 6} />
          </Row>
          <Modal
            title="修改个人信息"
            visible={this.state.edit_visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleEdit.bind(this)}>
              <FormItem label="用户名" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [{ required: true, message: "请输入用户名" }],
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
                  rules: [{ required: true, message: "请输入手机号" }],
                  initialValue: this.state.edit_info.mobile
                })(
                  <Input
                    prefix={<Icon type="tablet" style={{ fontSize: 13 }} />}
                    placeholder="请输入手机号"
                  />
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
                })(<Input placeholder="请输入微信号" />)}
              </FormItem>
              <div style={{ textAlign: "center", margin: "10px" }}>
                <Button onClick={this.handleCancel}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: "40px" }}
                  loading={this.state.edit_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    isMobile: state.isMobile
  };
};
export default UserInfo = connect(mapStateToProps)(Form.create({})(UserInfo));
