import React, { Component } from "react";
import { Form, Input, Button, Modal, Radio, message } from "antd";
import request from "@api/tools/request"

class EditAgent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }
  onSubmit = values => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      let { mark, type, name } = this.props.agent;
      let reqData = {};
      if (mark !== values.mark) {
        reqData.mark = values.mark;
      }
      if (type !== values.type) {
        reqData.type = values.type;
      }
      if (JSON.stringify(reqData) === "{}") {
        return message.error("请先修改后提交");
      }
      reqData.name = name;
      this.setState({
        loading: true
      });
      request("/dashboard/proxy", "put", {}, reqData)
        .then(res => {
          this.setState({
            loading: false
          });
          if (res && res.code && res.message) {
            return message.error(res.message);
          }
          if (res) {
            this.props.setVisible(false);
            message.info("修改代理成功");
            this.props.getAgentList();
          }
        })
        .catch(err => {
          message.error(err);
        });
    });
  };

  render() {
    const { visible, setVisible, agent, form, info } = this.props;
    const { getFieldDecorator } = form;
    // 只有运维\超级管理员\售前能编辑代理类型
    let { role } = info;
    let flag = false;
    if (role === "op" || role === "manager" || role === "support") {
      flag = true;
    }
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
    return (
      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        title="修改代理信息"
        footer={null}
        className="add-agent-modal"
      >
        <main>
          <Form layout="horizontal">
            <Form.Item label="备注" {...formItemLayout}>
              {getFieldDecorator("mark", {
                initialValue: agent.mark
              })(<Input />)}
            </Form.Item>
            {flag && (
              <Form.Item label="代理类型" {...formItemLayout}>
                {getFieldDecorator("type", {
                  initialValue: agent.type
                })(
                  <Radio.Group>
                    <Radio value="white">白</Radio>
                    <Radio value="black">黑</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            )}
          </Form>
        </main>
        <footer
          style={{
            textAlign: "center",
            margin: "30px 10px 0 10px"
          }}
        >
          <Button onClick={() => setVisible(false)}>取消</Button>
          <Button
            type="primary"
            onClick={this.onSubmit}
            style={{
              marginLeft: "40px"
            }}
            loading={this.state.loading}
          >
            确认
          </Button>
        </footer>
      </Modal>
    );
  }
}

export default Form.create({ name: "EditAgent" })(EditAgent);
