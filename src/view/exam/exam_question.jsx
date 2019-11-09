import React from "react";
import {
  Modal,
  Breadcrumb,
  Button,
  Form,
  Select,
  Input,
  Icon,
  Table,
  Tooltip,
  Col,
  Radio,
  Row,
  InputNumber
} from "antd";
import request from "@api/tools/request";
import moment from "moment";
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const FormItem = Form.Item;

const selectItem = null;
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 3
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 18
    }
  }
};
class ExamQuestion extends React.Component {
  state = {
    showAddModal: false,
    questionList: [],
    loading: true,
    info: {
      keys: [""]
    },
    selectRadio: 0,
    delInfo: ""
  };
  showModal = type => {
    let selectRadio = 0;
    const info =
      type === "add"
        ? {
            type: "1",
            title: "",
            keys: [""],
            score: 0
          }
        : {
            type: type.type,
            title: type.title,
            keys: type.content,
            score: type.score
          };
    if (type !== "add") {
      info.keys.map((elem, index) => {
        if (type.answer.indexOf(elem) >= 0) selectRadio = index;
      });
    }
    this.props.form.resetFields();
    // this.props.form.setFieldsValue({
    //   type: info.type,
    //   title: info.title,
    //   score: info.score,
    //   // keys0: ''
    // })
    this.setState({
      editId: type === "add" ? null : type.id,
      showAddModal: true,
      info,
      selectRadio
    });
  };
  handleCancel = () => {
    this.setState({
      showAddModal: false,
      delVisible: false,
      delLoading: false,
      addLoading: false
    });
  };
  remove = index => {
    const { form } = this.props;
    const formData = this.props.form.getFieldsValue();
    const data = this.state.info.keys;
    data.map((elem, index) => {
      data[index] = formData[`keys${index}`];
    });
    data.splice(index, 1);
    this.setState(
      pre => ({
        info: {
          ...pre.info,
          keys: data
        }
      }),
      () => {
        this.state.info.keys.map((elem, index) => {
          form.setFieldsValue({
            [`keys${index}`]: elem
          });
        });
      }
    );
  };

  add = () => {
    this.setState(pre => ({
      info: {
        ...pre.info,
        keys: this.state.info.keys.concat([""])
      }
    }));
  };
  handleSubmit = e => {
    this.setState({ addLoading: true });
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    const contentData = [];
    this.state.info.keys.map((elem, index) => {
      contentData[index] = formData[`keys${index}`];
    });

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          type: formData.type,
          title: formData.title,
          content: contentData,
          answer: [contentData[this.state.selectRadio]],
          score: formData.score
        };
        let url = this.state.editId
            ? `/dashboard/question/${this.state.editId}/info`
            : "/dashboard/question/info",
          method = this.state.editId ? "put" : "post";
        request(url, method, {}, data).then(res => {
          if (res != undefined && !res.code) {
            this.setState({ addLoading: false, showAddModal: false });
            Modal.success({
              title: `${this.state.editId ? "修改" : "添加"}试题成功`
            });
            this.getQuestionList();
          } else {
            this.setState({ addLoading: false });
            let text = "网络错误，请稍后再试";
            if (res && res.message) {
              text = res.message;
            }
            Modal.warning({
              title: text
            });
          }
        });
      } else {
        this.setState({ addLoading: false });
      }
    });
  };
  getQuestionList = () => {
    request("/dashboard/question/info", "get").then(res => {
      this.setState({ questionList: res.data, loading: false });
    });
  };

  delQuestion = data => {
    this.setState({
      delVisible: true,
      delInfo: data
    });
  };
  handleDel = () => {
    request(`/dashboard/question/${this.state.delInfo.id}/info`, "delete").then(
      res => {
        if (res != undefined && !res.code) {
          this.setState({ delLoading: false, delVisible: false });
          Modal.success({
            title: "删除题目成功"
          });
          this.getQuestionList();
        } else {
          this.setState({ delLoading: false });
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
  handleChangeRadio = e => {
    this.setState({
      selectRadio: e.target.value
    });
  };
  componentDidMount() {
    this.getQuestionList();
  }
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const selectItem = this.state.info.keys.map((k, index) => {
      return (
        <div key={k + index}>
          <Col
            xs={24}
            sm={3}
            style={{ height: 28, lineHeight: "28px", textAlign: "center" }}
          >
            <Radio
              value={index}
              onChange={this.handleChangeRadio}
              checked={this.state.selectRadio === index}
            />
          </Col>
          <FormItem {...formItemLayout} required={false} key={k + index}>
            {getFieldDecorator(`keys${index}`, {
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  message: "请输入选项内容"
                }
              ],
              initialValue: k
            })(
              <Input
                placeholder="请输入选项内容"
                style={{ width: "calc(100% - 30px)", marginRight: 5 }}
                autoComplete="off"
              />
            )}
            {this.state.info.keys.length > 1 ? (
              <Icon
                className="dynamic-delete-button"
                style={{ fontSize: 16 }}
                type="minus-circle-o"
                disabled={this.state.info.keys.length === 1}
                onClick={() => this.remove(index)}
              />
            ) : null}
          </FormItem>
        </div>
      );
    });
    const columns = [
      {
        title: `序号`,
        key: "index",
        render: (text, record, index) =>
          this.state.questionList.findIndex(item => item.id == record.id) + 1,
        width: 70
      },
      {
        title: `题目内容（共 ${this.state.questionList.length} 题）`,
        dataIndex: "title",
        key: "title"
      },
      {
        title: "题型",
        dataIndex: "type",
        key: "type",
        render: (text, record, index) => {
          return text === "1" ? "单选题" : "多选题";
        }
      },
      // {
      //   title: '分类',
      //   dataIndex: 'category',
      //   key: 'category',
      // }, {
      //   title: '难度',
      //   dataIndex: 'level',
      //   key: 'level',
      // },
      {
        title: "答案",
        dataIndex: "answer",
        key: "answer",
        render: (text, record, index) => {
          if (typeof text === "string") return text;
          if (typeof text === "object") return text.join("、");
        }
      },
      {
        title: "分值",
        dataIndex: "score",
        key: "score"
      },
      {
        title: "创建人",
        dataIndex: "author_name",
        key: "author_name"
      },
      {
        title: "创建时间",
        dataIndex: "ctime",
        key: "ctime"
      },
      {
        title: "操作",
        width: 70,
        key: "set",
        render: (text, record, index) => {
          return (
            <span>
              <Tooltip title="修改题目" placement="topRight">
                <a onClick={this.showModal.bind(this, record)}>
                  <Icon
                    type="edit"
                    style={{
                      fontSize: 13,
                      marginRight: "13px"
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip title="删除题目" placement="topRight">
                <a onClick={this.delQuestion.bind(this, record)}>
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
        }
      }
    ];

    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>试题管理</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}
        >
          <Button
            onClick={this.showModal.bind(this, "add")}
            type="primary"
            style={{
              margin: "0px 0px 12px 0px"
            }}
          >
            添加试题
          </Button>
          <Table
            rowKey="id"
            dataSource={this.state.questionList}
            columns={columns}
            bordered
            pagination={this.state.questionList.length > 10}
            loading={this.state.loading}
            style={{ minWidth: "990px" }}
          />
        </div>
        <Modal
          title={`${this.state.editId ? "修改" : "添加"}试题`}
          visible={this.state.showAddModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width={1000}
        >
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label="试题类型" {...formItemLayout}>
              {getFieldDecorator("type", {
                rules: [
                  {
                    required: true,
                    message: "请选择试题类型"
                  }
                ],
                initialValue: this.state.info.type
              })(
                <Select style={{ width: 120 }}>
                  <Select.Option value="1">单选题</Select.Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="试题题目" {...formItemLayout}>
              {getFieldDecorator("title", {
                rules: [
                  {
                    required: true,
                    message: "请输入试题题目"
                  }
                ],
                initialValue: this.state.info.title
              })(
                <TextArea
                  placeholder="请输入试题题目"
                  style={{ width: "calc(100% - 30px)" }}
                  autoComplete="off"
                />
              )}
            </FormItem>
            <FormItem label="试题分值" {...formItemLayout}>
              {getFieldDecorator("score", {
                initialValue: this.state.info.score
              })(
                <InputNumber
                  style={{ width: 120 }}
                  autoComplete="off"
                  min={0}
                  max={100}
                  formatter={value => `${value}分`}
                />
              )}
            </FormItem>
            <div style={{ border: "1px solid #f2f4f8", marginBottom: 10 }}>
              <Row
                style={{
                  background: "#eff2f5",
                  height: 32,
                  lineHeight: "32px",
                  padding: "0 10px",
                  marginBottom: 10
                }}
              >
                <Col xs={24} sm={3}>
                  {" "}
                  设置正确答案{" "}
                  <label
                    htmlFor="title"
                    className="ant-form-item-required"
                  />{" "}
                </Col>
                <Col xs={24} sm={13}>
                  选项内容{" "}
                  <label htmlFor="title" className="ant-form-item-required" />{" "}
                </Col>
              </Row>
              {selectItem}
              <Button
                onClick={this.add}
                type="primary"
                style={{ margin: 10, marginTop: 0 }}
              >
                新增选项
              </Button>
            </div>
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
                loading={this.state.addLoading}
              >
                确认
              </Button>
            </div>
          </Form>
        </Modal>
        <Modal
          title="删除题目"
          visible={this.state.delVisible}
          confirmLoading={this.state.delLoading}
          onOk={this.handleDel}
          onCancel={this.handleCancel}
          okText="确认"
          cancelText="取消"
        >
          <p>确定删除该题目吗？</p>
        </Modal>
      </div>
    );
  }
}
export default ExamQuestion = Form.create({})(ExamQuestion);
