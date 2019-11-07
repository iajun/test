import React, { Component } from "react";
import { Modal, Button, Form, Input } from "igroot";

class TextLogin extends Component {
  constructor(props) {
    super(props);
  }

  hasErrors = fieldsError => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  };

  onSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, { code }) => {
      if (err) return;
      this.props.onSubmit(code);
    });
  };

  onGetCode = e => {
    e.preventDefault();
    this.props.getCode();
  };

  render() {
    const {
      form: { getFieldDecorator },
      loginLoading,
      getCodeLoading,
      skModalVisible,
      tick,
      phone
    } = this.props;
    return (
      <Modal
        visible={skModalVisible}
        footer={null}
        title="短信验证"
        closable={false}>
        <h3 style={{ marginBottom: 10 }}>已向 {phone} 发送验证码</h3>
        <Form onSubmit={this.onSubmit}>
          <Form.Item>
            {getFieldDecorator("code", {
              rules: [
                {
                  required: true,
                  message: "短信验证码必填"
                }
              ]
            })(<Input placeholder="请输入6位验证码" style={{ width: 140 }} />)}
            <Button
              type="primary"
              style={{
                marginLeft: 20
              }}
              onClick={this.onGetCode}
              loading={getCodeLoading}
              disabled={tick > 0}>
              {tick > 0 ? `还剩 ${tick} 秒` : "重新发送"}
            </Button>
          </Form.Item>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <Button type="primary" htmlType="submit" loading={loginLoading}>
              确认
            </Button>
          </div>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({})(TextLogin);
