import React, { Component } from "react";
import { Form, Input, Button, Modal, Radio, message, Select } from "antd";
import request from "@api/tools/request"

class add_customer_agent extends Component {
  state = {
    loading: false
  };

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        loading: true
      });
      request("/dashboard/customer/agent", "post", {}, values)
        .then(res => {
          this.setState({
            loading: false
          });
          if (res && res.code && res.message) {
            return message.error(res.message);
          }
          if (res) {
            this.props.setVisible(false);
          }
        })
        .catch(err => {
          message.error(err);
        });
    });
  };

  render() {
    const {
      visible,
      setVisible,
      customerList,
      form: { getFieldDecorator }
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 5
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 16
        }
      }
    };

    const formCheckBoxLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 11
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 13
        }
      }
    };
    return (
      <Modal
        visible={visible}
        onCancel={setVisible.bind(null, false)}
        title="添加代理"
        footer={null}
        className="add-agent-modal">
        <main>
          <Form layout="horizontal" onSubmit={this.onSubmit}>
            <Form.Item label="客户名" {...formItemLayout}>
              {getFieldDecorator("display", {
                rules: [{ required: true, message: "客户名必填" }]
              })(
                <Select>
                  {customerList.map(({ name = "" }) => (
                    <Option value={name}>{name}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="拼音名" {...formItemLayout}>
              {getFieldDecorator("name", {
                rules: [{ required: true, message: "拼音必填" }]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="内网IP地址" {...formItemLayout}>
              {getFieldDecorator("ip", {
                rules: [
                  { required: true, message: "ip必填" },
                  {
                    pattern: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
                    message: "ip地址格式不正确"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="ssh端口" {...formItemLayout}>
              {getFieldDecorator("port", {
                rules: [
                  { required: true, message: "ssh端口必填" },
                  { pattern: /^\d{2,5}$/, message: "端口号格式不正确" }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="ssh私钥" {...formItemLayout}>
              {getFieldDecorator("cert", {
                rules: [{ required: true, message: "ssh私钥必填" }]
              })(<Input.TextArea style={{ height: "100px" }} />)}
            </Form.Item>
            <Form.Item label="白代理" {...formItemLayout}>
              {getFieldDecorator("hasVpn", {
                rules: [{ required: true, message: "必选" }]
              })(
                <Radio.Group>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </main>
        <footer
          style={{
            textAlign: "center",
            margin: "30px 10px 0 10px"
          }}>
          <Button onClick={setVisible.bind(null, false)}>取消</Button>
          <Button
            type="primary"
            onClick={this.onSubmit}
            style={{
              marginLeft: "40px"
            }}
            loading={this.state.loading}>
            确认
          </Button>
        </footer>
      </Modal>
    );
  }
}

export default Form.create({ name: "add_customer_agent" })(add_customer_agent);
