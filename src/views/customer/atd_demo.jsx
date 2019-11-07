import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Tooltip,
  message,
  Checkbox
} from "igroot";
import React from "react";
import { request } from "../../../../apis/request";
import moment from "moment";
const FormItem = Form.Item;

class ATDDemo extends React.Component {
  state = {
    demoList: [],
    visible: false,
    loading: false,
    pagination: false,
    add_loading: false,
    // add_status: 'success',
    send_loading: false,
    send_info: "",
    ownRole: "",
    ownKind: "",
    expired_time_visible: false,
    curCustomer: null,
    etime: null,
    time_edit_loading: false,
    send_email: true
  };
  showModal = () => {
    this.setState({ visible: true });
    this.props.form.setFieldsValue({
      company: "",
      name: "",
      email: "",
      etime: null,
      mobile: "",
      send_visible: false,
      send_info: ""
    });
  };
  handleCancel = () => {
    this.setState({ visible: false, send_visible: false });
  };
  disabledDate = current => {
    // Can not select days
    return current && current.valueOf() < Date.now();
  };
  handleSubmit(e) {
    // 页面开始向API提交
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields(
      ["company", "name", "email", "etime", "receive_email"],
      (err, values) => {
        if (!err) {
          this.setState({ add_loading: true });
          const add_customer = {};
          add_customer.name = formData.name;
          add_customer.company = formData.company;
          add_customer.email = formData.email;
          add_customer.receive_mail = formData.receive_mail;
          if (!!formData.mobile) {
            add_customer.mobile = formData.mobile;
          }
          if (formData["etime"]) {
            add_customer.etime = formData["etime"].format(
              "YYYY-MM-DD 23:59:59"
            );
          }
          request("/dashboard/demo/register", "post", {}, add_customer).then(
            res => {
              // console.log(res)
              if (res && !res.code) {
                this.setState({ add_loading: false, visible: false });
                Modal.success({
                  title: "开通演示账号成功，账号信息已通过邮件的形式发送给客户"
                });
                this.get_demolist();
              } else {
                this.setState({ add_loading: false });
                let text = "网络错误，请稍后再试";
                if (res && res.message) {
                  if (res.code == 400201) {
                    text = "公司名和姓名已存在，请修改后添加";
                  } else {
                    text = res.message;
                  }
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
      }
    );
  }
  sendModal = send_info => {
    this.setState({ send_visible: true, send_info });
    this.props.form.setFieldsValue({
      receive_mail: send_info.receive_mail
    });
  };
  handleOk = e => {
    e.preventDefault();
    this.setState({ send_loading: true });
    const send_customer = {};
    send_customer.company = this.state.send_info.company;
    send_customer.name = this.state.send_info.name;
    send_customer.email = this.state.send_info.email;
    send_customer.etime = this.state.send_info.etime;
    send_customer.mobile = this.state.send_info.mobile;
    send_customer.password = this.state.send_info.password;
    send_customer.receive_mail = this.props.form.getFieldsValue().receive_mail;
    request("/dashboard/demo/mail", "post", {}, send_customer).then(res => {
      //   console.log(res)
      if (res && !res.code) {
        this.setState({ send_loading: false, send_visible: false }, function() {
          Modal.success({
            title: "邮件发送成功"
          });
        });
      } else {
        this.setState({ send_loading: false });
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
  checkEmailExisits = (rule, value, callback) => {
    this.state.demoList.some(({ email }) => email === value)
      ? callback("此登录邮箱已存在")
      : callback();
  };
  showExpiredTimeModal = curCustomer => {
    this.setState({
      expired_time_visible: !this.state.expired_time_visible,
      curCustomer: curCustomer
    });
  };
  updateExpiredTime = () => {
    this.setState({
      time_edit_loading: true
    })
    let {
      curCustomer: { customer_id },
      etime,
      send_email
    } = this.state;``
    request(`/dashboard/demo/${customer_id}/expire`, "put", {}, { etime, send_email })
      .then(res => {
        this.setState({ time_edit_loading: false });
        if(!res || !res.expired_date) {
          return message.error('服务端出错')
        }
        message.success("修改成功");
        this.setState({ expired_time_visible: false});
        this.get_demolist();
      })
      .catch(e => message.error(e.message));
  };
  onChangeSendEmail = () => {
    this.setState({
      send_email: !this.state.send_email
    })
  }
  componentDidMount() {
    this.get_demolist();
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    if (userinfo && userinfo.role) {
      this.setState({
        ownRole: userinfo.role,
        ownKind: userinfo.kind
      });
    } else {
      request("/dashboard/user/info", "get").then(res => {
        this.setState({
          ownRole: res.role,
          ownKind: res.kind
        });
      });
    }
  }
  get_demolist = () => {
    request("/dashboard/demo/list", "get").then(res => {
      if (res && !res.code) {
        this.setState({ demoList: res, loading: false });
        if (res && res.length > 50) {
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
  render() {
    const { getFieldDecorator } = this.props.form;
    const addButton =
      this.state.ownRole == "manager" || this.state.ownRole == "support" || this.state.ownKind == "super" ? (
        <Button
          onClick={this.showModal}
          type="primary"
          style={{
            margin: "0px 0px 12px 0px"
          }}>
          添加演示账号
        </Button>
      ) : null;
    const title_count =
      this.state.count != "count"
        ? `客户名（${this.state.count}个）`
        : `客户名（${this.state.customerlist.length}个）`;
    const columns = [
      {
        title: "序号",
        key: "index",
        width: "50px",
        render: (text, record, index) => index + 1
      },
      {
        title: "公司名",
        dataIndex: "company",
        key: "company"
        // width: '120px'
      },
      {
        title: "姓名",
        dataIndex: "name",
        key: "name"
        // width: '150px',
      },
      {
        title: "登录邮箱",
        dataIndex: "email",
        key: "email"
        // width: '150px',
      },
      {
        title: "到期时间",
        dataIndex: "etime",
        key: "etime",
        render: (text, record) => {
          if (moment(text).isValid()) {
            const leftTime = moment(text).diff(
              moment().format("YYYY-MM-DD 23:59:59"),
              "days"
            );
            if (leftTime <= 7 && leftTime > 3) {
              return (
                <Tooltip title={`还有${leftTime}天到期`} placement="top">
                  <span style={{ color: "#f79992" }}>{text}</span>
                </Tooltip>
              );
            } else if (leftTime <= 3 && leftTime > 1) {
              return (
                <Tooltip title={`还有${leftTime}天到期`} placement="top">
                  <span style={{ color: "#f46e65" }}>{text}</span>
                </Tooltip>
              );
            } else if (leftTime <= 1 && leftTime >= 0) {
              return (
                <Tooltip title={`还有${leftTime}天到期`} placement="top">
                  <span style={{ color: "#f04134" }}>{text}</span>
                </Tooltip>
              );
            } else if (leftTime < 0) {
              return (
                <Tooltip title="已到期" placement="top">
                  <span>{text}</span>
                </Tooltip>
              );
            } else {
              return (
                <Tooltip title={`还有${leftTime}天到期`} placement="top">
                  <span style={{ color: "#49a9ee" }}>{text}</span>
                </Tooltip>
              );
            }
          } else {
            return "";
          }
        }
      },
      {
        title: "手机号",
        dataIndex: "mobile",
        key: "mobile"
      },
      {
        title: "密码",
        dataIndex: "password",
        key: "password"
        // width: '110px',
      },
      {
        title: "操作",
        key: "action",
        render: (text, record) => {
          const action = (
            <div>
              <Tooltip title="给客户发送演示账号邮件" placement="top">
                <a onClick={this.sendModal.bind(this, record)}>
                  <Icon
                    type="mail"
                    style={{
                      fontSize: 13
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip title="修改客户到期时间" placement="top">
                <a>
                  <Icon
                    type="calendar"
                    onClick={this.showExpiredTimeModal.bind(this, record)}
                    style={{fontSize: 13, paddingLeft: 14}}
                  />
                </a>
              </Tooltip>
            </div>
          );
          return action;
        }
      }
    ];
    const config = {
      rules: [
        {
          type: "object",
          required: true,
          message: "请选择演示账号到期时间"
        }
      ]
    };
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

    let curCustomer = this.state.curCustomer;
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}>
          <Breadcrumb.Item>ATD演示客户列表</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}>
          {addButton}
          <div className="overflow_auto">
            <Table
              rowKey="email"
              dataSource={this.state.demoList}
              columns={columns}
              bordered
              pagination={false}
              loading={this.state.loading}
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        <Modal
          title="添加演示账号"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label="公司名" {...formItemLayout}>
              {getFieldDecorator("company", {
                rules: [
                  {
                    required: true,
                    message: "请输入公司名"
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                  placeholder="请输入公司名"
                />
              )}
            </FormItem>
            <FormItem label="姓名" {...formItemLayout}>
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "请输入姓名"
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  placeholder="请输入姓名"
                />
              )}
            </FormItem>
            <FormItem label="登录邮箱" {...formItemLayout}>
              {getFieldDecorator("email", {
                rules: [
                  {
                    required: true,
                    message: "请输入邮箱"
                  },
                  {
                    type: "email",
                    message: "请输入正确的邮箱格式"
                  },
                  {
                    validator: this.checkEmailExisits
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  placeholder="请输入邮箱"
                />
              )}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("mobile", {
                rules: [
                  {
                    required: false
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  placeholder="请输入手机号"
                />
              )}
            </FormItem>
            <FormItem label="到期时间" {...formItemLayout}>
              {getFieldDecorator("etime", config)(
                <DatePicker disabledDate={this.disabledDate} />
              )}
            </FormItem>
            <FormItem label="接受账号信息邮箱" {...formItemLayout}>
              {getFieldDecorator("receive_mail", {
                rules: [
                  {
                    required: true,
                    message: "请输入接受账号信息邮箱"
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  placeholder="多个接受邮箱以英文分号 ; 分隔"
                />
              )}
            </FormItem>
            <div
              style={{
                textAlign: "center",
                margin: "10px"
              }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  marginLeft: "40px"
                }}
                loading={this.state.add_loading}>
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        <Modal
          title={`发送${this.state.send_info.email}演示账号邮件`}
          visible={this.state.send_visible}
          confirmLoading={this.state.send_loading}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          okText="确认"
          cancelText="取消">
          <Form onSubmit={this.handleOk.bind(this)}>
            <FormItem label="接受账号信息邮箱" {...formItemLayout}>
              {getFieldDecorator("receive_mail", {
                rules: [
                  {
                    required: true,
                    message: "请输入接受账号信息邮箱"
                  }
                ],
                initialValue: ""
              })(
                <Input
                  prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                  placeholder="多个接受邮箱以英文分号 ; 分隔"
                />
              )}
              <p>(多个接受邮箱以英文分号;分隔)</p>
            </FormItem>
            <div
              style={{
                textAlign: "center",
                margin: "10px"
              }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  marginLeft: "40px"
                }}
                loading={this.state.send_loading}>
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        {this.state.curCustomer && this.state.expired_time_visible && (
          <Modal
            visible={this.state.expired_time_visible}
            onCancel={this.showExpiredTimeModal}
            title={`修改 ${curCustomer.company}-${curCustomer.name} 过期时间`}
            footer={null}
            okText="确认"
            cancelText="取消"
            className="time-modal">
            <main style={{width: '100%', textAlign: 'center'}}>
              <span style={{paddingRight: '20px'}}>设置时间：</span>
              <DatePicker
                defaultValue={moment(curCustomer.etime, "YYYY-MM-DD")}
                onChange={date =>
                  this.setState({ etime: date.format("YYYY-MM-DD 23:59:59") })
                }
              />
              <p style={{marginTop: '20px'}}>
              <Checkbox checked={this.state.send_email} onChange={this.onChangeSendEmail}>是否给该用户发送通知邮件？</Checkbox>
              </p>
            </main>
            <footer
              style={{
                textAlign: "center",
                margin: "30px 10px 0 10px"
              }}>
              <Button onClick={this.showExpiredTimeModal}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  marginLeft: "40px"
                }}
                onClick={this.updateExpiredTime}
                loading={this.state.time_edit_loading}>
                确认
              </Button>
            </footer>
          </Modal>
        )}

      </div>
    );
  }
}

export default (ATDDemo = Form.create({})(ATDDemo));
