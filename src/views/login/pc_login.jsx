import React from "react";
import { Row, Col } from "igroot";
import { Icon, message, Form, Input, Button, Carousel, Modal } from "igroot";
const FormItem = Form.Item;
import { store } from "@/pages/index/redux/store";
import Cookies from "universal-cookie";
import LoginBackground from "./background";
import { withRouter } from "react-router-dom";
import md5 from "js-md5";
import { request } from "../../../../apis/request";
import TextLogin from "./TextLogin";
const cookies = new Cookies();
class PCLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginLoading: false, // 普通登录loading
      textLoginLoading: false, // 短信验证登录 loading
      getCodeLoading: false, // 重新发送验证码 loading
      skModalVisible: false,
      sk: {},
      ck: "",
      img: "",
      tick: 60,
      code: ""
    };
  }

  hasErrors = fieldsError => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  };

  // 登录
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(
      (err, { username, password, captcha }) => {
        if (err) return;
        this.setState({ loginLoading: true });
        let reqData = {
          staff_email: username,
          password: md5(md5(password) + "你瞅啥")
        };
        if (captcha) {
          reqData["captcha"] = captcha;
          reqData["ck"] = this.state.ck;
        }
        request("/dashboard/auth/login", "post", {}, reqData)
          .then(res => {
            this.setState({ loginLoading: false });
            // 登录出错
            if (!res) {
              return message.error("网络错误，请稍后再试");
            }
            if (res.code) {
              return this.loginError(res);
            }
            // 登录成功
            if (res.token) {
              return this.loginSuccess(res);
            }
            // 手机验证
            if (res.value && res.phone) {
              return void this.onSkModalVisible(true, res);
            }
          })
          .catch(err => {
            this.getCaptcha();
            message.error(err.message || "网络错误，请稍后再试");
          });
      }
    );
  };

  // 短信验证码登录
  onTextSubmit = code => {
    this.setState({
      textLoginLoading: true
    });
    request(
      "/dashboard/auth/code",
      "post",
      {},
      { code, sk: this.state.sk.value }
    )
      .then(res => {
        this.setState({
          textLoginLoading: false
        });
        if (res.code) {
          return this.loginError(res);
        }
        if (res.token) {
          return this.loginSuccess(res);
        }
      })
      .catch(err => {
        this.setState({
          textLoginLoading: false
        });
        message.error(err.message || "网络错误，请稍后再试");
      });
  };

  // 打开短信验证码并设置定时
  onSkModalVisible = (skModalVisible = false, sk = {}, tick = 60) => {
    this.setState({
      skModalVisible,
      sk,
      tick
    });
    this.timer = setInterval(() => {
      this.state.tick === 0 && clearInterval(this.timer);
      this.setState({
        tick: this.state.tick - 1
      });
    }, 1000);
  };

  // 登录出错处理
  loginError = res => {
    res && res.message && message.error(res.message);
    let code = res.code;
    // 短信验证码错误
    if (code === 401404) {
      return;
    }
    // 在1分钟内重复登录
    if (code === 401402) {
      return void this.onSkModalVisible(
        true,
        { value: res.value, phone: res.phone },
        res.tick
      );
    }
    // 登录已失效
    code === 401003 && this.setState({ skModalVisible: false });
    return void this.getCaptcha();
  };

  // 登录成功处理
  loginSuccess = res => {
    this.timer && clearInterval(this.timer);
    cookies.set("access_token", res.token);
    store.dispatch({ type: "login" });
    this.props.history.push("/index");
    localStorage.setItem("userinfo", JSON.stringify(res.userinfo));
  };

  // 获取验证码
  getCode = () => {
    this.setState({
      getCodeLoading: true
    });
    let sk = this.state.sk.value;
    request("/dashboard/auth/sms", "post", {}, { sk }).then(res => {
      if (res.code) {
        return this.loginError(res);
      }
      // 登录成功
      if (res.value) {
        message.info("重发验证码成功，有效期5分钟");
        this.setState({
          getCodeLoading: false
        });
        return void this.onSkModalVisible(true, res);
      }
    });
  };

  // 获取图片验证码
  getCaptcha = () => {
    request("/dashboard/auth/captcha", "get")
      .then(res => {
        this.setState({
          ck: res.ck,
          img: res.img
        });
      })
      .catch(err => {
        message.error(err.message || "网络错误，请稍后再试");
      });
    this.props.form.setFieldsValue({ captcha: "" });
  };

  componentDidMount() {
    this.timer && clearInterval(this.timer);
    this.getCaptcha();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{ height: "100vh" }}>
        <Row style={{ display: "flex", justifyContent: "center" }}>
          <Col span={24} className="login">
            <div className="login-logo">
              <span style={{ fontWeight: 500, fontSize: "18px" }}>
                CLN管理平台
              </span>
            </div>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <FormItem label="账号">
                {getFieldDecorator("username", {
                  rules: [
                    { required: true, message: "请输入您的邮箱或邮箱前缀" }
                  ]
                })(
                  <Input
                    prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                    placeholder="请输入您的邮箱或邮箱前缀"
                  />
                )}
              </FormItem>
              <FormItem label="密码">
                {getFieldDecorator("password", {
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: "密码必填"
                    }
                  ]
                })(
                  <Input
                    prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                    type="password"
                    placeholder="请输入您的密码"
                  />
                )}
              </FormItem>
              {this.state.ck && (
                <FormItem label="验证码" className="captcha-form">
                  {getFieldDecorator("captcha", {
                    rules: [
                      {
                        required: true,
                        message: "图片验证码必填"
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="code" style={{ fontSize: 13 }} />}
                      placeholder="验证码"
                    />
                  )}
                  <img
                    src={this.state.img}
                    onClick={this.getCaptcha}
                    style={{ cursor: "pointer" }}
                  />
                </FormItem>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={this.state.loginLoading}>
                登录
              </Button>
            </Form>
          </Col>
          <style>{`
                        .login {
                            margin-top: 7%;
                            box-shadow: 0 0 100px rgba(0,0,0,.08);
                            width: 360px;
                            padding: 20px 30px 40px;
                            background-color: white;
                            border-radius: 3px;
                            z-index: 10;
                        }
                        .login-logo {
                            text-align: center;
                            height: 45px;
                            line-height: 45px;
                            width: 300px;
                        }
                        .ant-carousel .slick-slider {
                          z-index:10;
                          text-align: center;
                          height: calc(100vh - 400px);
                          line-height: calc(100vh - 400px);
                          background: transparent;
                          overflow: hidden;
                          width: 320px;
                          float: right;
                        }

                        .login-form .ant-form-item {
                          margin-bottom: 10px
                        }

                        .login-form .login-form-button {
                          margin-top: 16px;
                        }

                        .ant-carousel .slick-slide h3 {
                          color: #fff;
                        }
                        #fire {
                             z-index:100;
                             width: 60%;
                             height: calc(100vh - 400px);
                             background: transparent;
                             margin: 0 auto;
                        }
                        .captcha-form .ant-input-affix-wrapper {
                          width: 170px;
                          margin-right: 28px;
                        }
                    `}</style>
        </Row>
        {this.state.skModalVisible && (
          <TextLogin
            ref="textLoginRef"
            phone={this.state.sk.phone}
            tick={this.state.tick}
            codeLoading={this.state.getCodeLoading}
            loginLoading={this.state.textLoginLoading}
            skModalVisible={this.state.skModalVisible}
            getCode={this.getCode}
            onSubmit={this.onTextSubmit}
          />
        )}
        <LoginBackground />
      </div>
    );
  }
}

export default PCLogin = Form.create({})(withRouter(PCLogin));
