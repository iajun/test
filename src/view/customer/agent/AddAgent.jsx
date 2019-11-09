import React, { Component } from "react";
import { Form, Input, Button, Modal, Radio, Select, message } from "antd";
import request from "@api/tools/request"

const Option = Select.Option;

class AddAgent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [], // 所有客户列表
      loading: false // 添加代理loding
    };
  }

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.onAddAgent(values);
    });
  };

  onSearch = chars => {
    let list = this.allCus.filter(({ name }) => name.includes(chars));
    this.setState({
      list
    });
  };

  // 添加代理
  onAddAgent = values => {
    this.setState({
      loading: true
    });
    request("/dashboard/proxy", "post", {}, values)
      .then(res => {
        this.setState({
          loading: false
        });
        if (res && res.code && res.message) {
          return message.error(res.message);
        }
        if (res) {
          this.props.setAddVisible(false);
          Modal.success({
            title: res
          });
          this.props.getAgentList();
        }
      })
      .catch(err => {
        message.error(err);
      });
  };

  // 获取客户列表，格式化，索引化
  getCusList = () => {
    request("/dashboard/customer/list", "get").then(res => {
      this.allCus = res.data;
      this.setState({
        list: this.allCus
      });
    });
  };

  componentDidMount() {
    this.getCusList();
  }

  render() {
    const { visible, setAddVisible, form } = this.props;
    const { loading, list } = this.state;
    const { getFieldDecorator } = form;

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

    const options = list.map(({ name, customer_id }) => {
      return (
        <Option value={name} key={customer_id}>
          {name}
        </Option>
      );
    });

    return (
      <Modal
        visible={visible}
        onCancel={() => setAddVisible(false)}
        title="添加代理"
        footer={null}
        className="add-agent-modal">
        <main>
          <Form layout="horizontal">
            <Form.Item label="客户名" {...formItemLayout}>
              {getFieldDecorator("display", {
                rules: [{ required: true, message: "客户名必填" }]
              })(
                <Select
                  showSearch
                  filterOption={false}
                  placeholder="输入客户名搜索"
                  onSearch={this.onSearch}>
                  {options}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="代理名" {...formItemLayout}>
              {getFieldDecorator("name", {
                rules: [
                  { required: true, message: "代理名必填" },
                  {
                    pattern: /^[\w\d]+$/,
                    message: "代理名只能为英文和数字"
                  }
                ]
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
          <Button onClick={setAddVisible.bind(null, false)}>取消</Button>
          <Button
            type="primary"
            onClick={this.onSubmit}
            style={{
              marginLeft: "40px"
            }}
            loading={loading}>
            确认
          </Button>
        </footer>
      </Modal>
    );
  }
}

export default Form.create({ name: "AddAgent" })(AddAgent);
