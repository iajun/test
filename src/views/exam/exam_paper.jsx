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
  InputNumber,
  Steps,
  DatePicker,
  Popconfirm,
  Popover
} from "igroot";
import { Link } from "react-router-dom";
import { request } from "@/apis/request";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const FormItem = Form.Item;
const { MonthPicker, RangePicker } = DatePicker;
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
const Step = Steps.Step;
class ExamPaper extends React.Component {
  state = {
    paperList: [],
    addModalVisible: false,
    delModalVisible: false,
    addLoading: false,
    delLoading: false,
    current: 0,
    info: {},
    selectQues: [],
    questionList: {},
    otherQues: [],
    otherSelectQues: [],
    selectedRowKeys: [],
    pointSum: 0,
    copy: "点击复制试卷地址",
    allScore: 0
  };
  componentDidMount() {
    this.getPaperList();
    this.getQuestionList();
  }
  getQuestionList = () => {
    request("/dashboard/question/info", "get").then(res => {
      this.setState({ questionList: res.data });
    });
  };
  next() {
    const current = this.state.current + 1;
    if (current === 2) {
      if (!this.state.selectQues.length) {
        Modal.warning({ title: "试题不能为空" });
        return;
      }
    }
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  getPaperList = () => {
    this.setState({ loading: true });
    request("/dashboard/exam/info", "get").then(res => {
      if (res !== undefined && !res.code) {
        this.setState({ paperList: res.data, loading: false });
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
      }
    });
  };
  editExam = type => {
    this.props.form.resetFields();
    const editStatus = type !== "add" ? type.id : null;
    let info = {};
    if (editStatus) {
      const time = type.time_limit.split(",");
      info = {
        title: type.title,
        pass_score: type.pass_score,
        notice: type.notice,
        time_limit: [moment(time[0] * 1000), moment(time[1] * 1000)],
        question_setting: type.question_setting,
        times: type.times
      };
    } else {
      info = {
        title: "",
        pass_score: "60",
        notice:
          "请注意测试时间，超过测试的规定时间将会自动提交，开始作答后期间请勿长时间关闭浏览器",
        time_limit: [moment(), moment().add(7, "days")],
        question_setting: [],
        times: 1
      };
    }
    const selectList = [];
    const { questionList } = this.state;
    info.question_setting.map(elem => {
      selectList.push(
        type.question_setting.filter(key => key.id === elem.id)[0]
      );
    });
    this.props.form.resetFields();
    this.setState({
      editStatus,
      addModalVisible: true,
      info,
      selectQues: selectList,
      pointSum: this.getPointSum(selectList)
    });
  };

  handleCancel = () => {
    this.setState({
      addModalVisible: false,
      delModalVisible: false,
      addLoading: false,
      delLoading: false,
      current: 0
    });
  };
  handleCheck = () => {
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState(
          preState => ({
            info: {
              ...preState.info,
              title: formData.title,
              time_limit: formData.time_limit,
              notice: formData.notice,
              times: formData.times
              // pass_score: formData.pass_score
            }
          }),
          this.next()
        );
      }
    });
  };
  handleComplete = type => {
    if (this.state.info.pass_score == undefined) {
      Modal.warning({
        title: "通过分数不能为空"
      });
      return;
    } else {
      if (this.state.info.pass_score > this.state.pointSum) {
        Modal.warning({
          title: "通过分数大于总分，怕是没有人能够通过~щ(ﾟДﾟщ)",
          width: 450
        });
        return;
      }
    }
    this.setState({ addLoading: true });
    const { selectQues } = this.state;
    const time_limit = this.state.info.time_limit;
    let data = Object.assign({}, this.state.info);

    data.status = type;
    data.question_setting = selectQues.map(ques => {
      ques.score += "";
      return ques;
    });

    data.times = this.state.info.times + "";
    data.time_limit = `${time_limit[0].unix()},${time_limit[1].unix()}`;
    const url = this.state.editStatus
      ? `/dashboard/exam/${this.state.editStatus}/info`
      : "/dashboard/exam/info";
    const method = this.state.editStatus ? "put" : "post";
    if (this.state.editStatus) {
      data.id = this.state.editStatus;
    }
    request(url, method, {}, data).then(res => {
      if (res !== undefined && !res.code) {
        Modal.success({
          title: `${this.state.editStatus ? "修改" : "添加"}试卷成功`
        });
        this.getPaperList();
        this.setState({
          addLoading: false,
          addModalVisible: false,
          current: 0
        });
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
        this.setState({ addLoading: false });
      }
    });
  };
  delSelectQues = id => {
    const { selectQues } = this.state;
    this.setState({
      selectQues: selectQues.filter(key => key.id !== id)
    });
  };
  handleSelect = () => {
    const { selectQues } = this.state;
    let otherQues = this.state.questionList.slice();
    selectQues.map(elem => {
      otherQues = otherQues.filter(key => key.id !== elem.id);
    });

    this.setState({
      selectModalVisible: true,
      otherQues
    });
  };
  addOtherToSelect = () => {
    const newList = this.state.selectQues.concat(this.state.otherSelectQues);
    this.setState({
      selectQues: newList,
      selectModalVisible: false,
      selectedRowKeys: [],
      pointSum: this.getPointSum(newList)
    });
  };
  delExam = id => {
    request(`/dashboard/exam/${id}/info`, "delete").then(res => {
      if (res !== undefined && !res.code) {
        Modal.success({
          title: "删除成功"
        });
        this.getPaperList();
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
      }
    });
  };
  editExamStatus = (record, type) => {
    const url = `/dashboard/exam/${record.id}/info`;
    const action = type === "public" ? "发布" : "撤回";
    const data = Object.assign({}, data);
    data.status = type;
    request(url, "put", {}, data).then(res => {
      if (res !== undefined && !res.code) {
        Modal.success({
          title: `${action}成功`
        });
        this.getPaperList();
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
      }
    });
  };
  getPointSum(list = []) {
    const selectList = !list.length ? this.state.selectQues : list;
    let sum = 0;
    selectList.map(elem => {
      sum += +elem.score;
    });
    if (!list.length) {
      this.setState({ pointSum: sum });
    } else {
      return sum;
    }
  }
  handleVisibleChange = scoreVisible => {
    this.setState({ scoreVisible });
  };
  setAllScore() {
    const { selectQues, allScore } = this.state;
    if (allScore) {
      let newSelect = selectQues.map(ques => {
        ques.score = allScore;
        return ques;
      });
      this.setState({ selectQues: newSelect, scoreVisible: false }, () => {
        this.getPointSum();
      });
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { current } = this.state;
    const address = "http://juhe.baishancloud.com";
    // const address = 'http://127.0.0.1:8085'
    const columns = [
      {
        title: "试卷名称",
        dataIndex: "title",
        key: "title",
        render: (text, record) => {
          let time = record.time_limit.split(",");
          let now = moment().unix();
          const isValid =
            +time[0] < now && +time[1] > now && record.status === "public";
          return (
            <div>
              {isValid && (
                <div>
                  <a href={`${address}/exam/${record.lid}`} target="_blank">
                    {text}
                  </a>
                  <CopyToClipboard
                    text={`${address}/exam/${record.lid}`}
                    onCopy={() => {
                      this.setState({ copy: "复制成功！" });
                    }}
                    onMouseLeave={() => {
                      this.setState({ copy: "点击复制试卷地址" });
                    }}
                  >
                    <Tooltip title={this.state.copy}>
                      <a>
                        <Icon
                          type="copy"
                          theme="outlined"
                          style={{ marginLeft: 5 }}
                        />
                      </a>
                    </Tooltip>
                  </CopyToClipboard>
                </div>
              )}
              {!isValid && <span>{text}</span>}
            </div>
          );
        }
      },
      {
        title: "测试时间",
        dataIndex: "time_limit",
        key: "time_limit",
        render: (text, record, index) => {
          const time = text.split(",");
          return `${moment(time[0] * 1000).format(
            "YYYY-MM-DD HH:mm"
          )} 至 ${moment(time[1] * 1000).format("YYYY-MM-DD HH:mm")}`;
        }
      },
      {
        title: "及格分数",
        dataIndex: "pass_score",
        key: "pass_score"
      },
      {
        title: "题目数量",
        key: "ques_num",
        render: record => {
          return record && record.question_setting
            ? `${record.question_setting.length} 个`
            : "-";
        }
      },
      {
        title: "创建时间",
        dataIndex: "ctime",
        key: "ctime"
      },
      {
        title: "状态",
        key: "status",
        dataIndex: "status",
        render: (text, record, index) => {
          switch (text) {
            case "public":
              return <span style={{ color: "#00a854" }}>发布</span>;
            case "revoke":
              return <span style={{ color: "#bfbfbf" }}>撤回</span>;
            case "unpublic":
              return <span style={{ color: "#faaf76" }}>未发布</span>;
            default:
              return <span style={{ color: "#108ee9" }}>未知</span>;
          }
        }
      },
      {
        title: "操作",
        key: "setting",
        width: 120,
        render: (text, record, index) => {
          return (
            <span>
              <Tooltip title="查看记录" placement="topRight">
                <Link to={`/index/exam/paper/${record.id}`}>
                  <Icon
                    type="database"
                    theme="outlined"
                    style={{
                      marginRight: 13
                    }}
                  />
                </Link>
              </Tooltip>
              {record.status === "unpublic" && (
                <Tooltip title="发布试卷" placement="topRight">
                  <Popconfirm
                    title="要发布试卷吗？"
                    okText="确定"
                    cancelText="点错了"
                    onConfirm={this.editExamStatus.bind(this, record, "public")}
                  >
                    <a>
                      <Icon
                        type="cloud-upload"
                        theme="outlined"
                        style={{
                          marginRight: 13
                        }}
                      />
                    </a>
                  </Popconfirm>
                </Tooltip>
              )}
              {record.status === "public" && (
                <Tooltip title="撤回试卷" placement="topRight">
                  <Popconfirm
                    title="要撤回试卷吗？"
                    okText="确定"
                    cancelText="点错了"
                    onConfirm={this.editExamStatus.bind(this, record, "revoke")}
                  >
                    <a>
                      <Icon
                        type="rollback"
                        theme="outlined"
                        style={{
                          fontSize: 13,
                          marginRight: 13
                        }}
                      />
                    </a>
                  </Popconfirm>
                </Tooltip>
              )}
              <Tooltip title="修改试卷" placement="topRight">
                <a onClick={this.editExam.bind(this, record)}>
                  <Icon
                    type="edit"
                    style={{
                      fontSize: 13,
                      marginRight: 13
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip title="删除试卷" placement="topRight">
                <Popconfirm
                  title="要删除试卷吗？"
                  okText="确定"
                  cancelText="点错了"
                  onConfirm={this.delExam.bind(this, record.id)}
                  placement="left"
                >
                  <a>
                    <Icon
                      type="delete"
                      style={{
                        fontSize: 13
                      }}
                    />
                  </a>
                </Popconfirm>
              </Tooltip>
            </span>
          );
        }
      }
    ];

    const steps = [
      {
        title: "试卷设置"
      },
      {
        title: "题目设置"
      },
      {
        title: "完成"
      }
    ];
    const setScore = (
      <div>
        <span>分值</span>
        {this.state.selectQues.length > 0 && (
          <Popover
            content={
              <div>
                <InputNumber
                  size="small"
                  min={0.1}
                  defaultValue={0}
                  onChange={value => {
                    this.setState({ allScore: value });
                  }}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={this.setAllScore.bind(this)}
                  style={{ marginLeft: 10 }}
                >
                  设置
                </Button>
              </div>
            }
            title="全部设置"
            trigger="click"
            visible={this.state.scoreVisible}
            onVisibleChange={this.handleVisibleChange}
          >
            <a style={{ marginLeft: 10 }}>
              <Icon type="edit" theme="outlined" />
            </a>
          </Popover>
        )}
      </div>
    );
    const selectQues = [
      {
        title: "序号",
        key: "index",
        render: (text, record, index) => {
          return index + 1;
        }
      },
      {
        title: "题目内容",
        key: "title",
        dataIndex: "title"
      },
      {
        title: "答案",
        key: "answer",
        dataIndex: "answer"
      },
      {
        title: setScore,
        key: "score",
        render: (record, index) => (
          <InputNumber
            defaultValue={record.score}
            value={record.score}
            max={100}
            min={0}
            onChange={value => {
              record.score = value;
              this.getPointSum();
            }}
          />
        )
      },
      {
        title: "操作",
        key: "set",
        render: (record, index) => {
          return (
            <span>
              <Tooltip title="删除该题" placement="topRight">
                <Popconfirm
                  title="确定删除该题吗？"
                  okText="确定"
                  onConfirm={this.delSelectQues.bind(this, record.id)}
                  cancelText="点错了"
                  icon={<Icon type="question-circle-o" />}
                >
                  <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                  />
                </Popconfirm>
              </Tooltip>
            </span>
          );
        }
      }
    ];
    const otherColumns = [
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: text => {
          return text === "1" ? "单选题" : "多选题";
        }
      },
      {
        title: "题目",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "答案",
        dataIndex: "answer",
        key: "answer"
      },
      {
        title: "分值",
        dataIndex: "score",
        key: "score"
      }
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          otherSelectQues: selectedRows,
          selectedRowKeys
        });
      },
      getCheckboxProps: record => ({
        name: record.id
      })
    };

    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>试卷管理</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}
        >
          <Button
            onClick={this.editExam.bind(this, "add")}
            type="primary"
            style={{
              margin: "0px 0px 12px 0px"
            }}
          >
            添加试卷
          </Button>
          <Table
            rowKey="id"
            dataSource={this.state.paperList}
            columns={columns}
            bordered
            pagination={false}
            loading={this.state.loading}
            style={{ minWidth: "990px" }}
          />
        </div>
        <Modal
          title={`${this.state.editStatus ? "修改" : "添加"}试卷`}
          visible={this.state.addModalVisible}
          onCancel={this.handleCancel}
          footer={null}
          width={1200}
          keyboard={false}
        >
          <Steps current={current} style={{ width: "80%", margin: "0 auto" }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div className="steps-content" style={{ padding: "20px 0px" }}>
            {current == 0 && (
              <Form>
                <FormItem label="试卷标题" {...formItemLayout}>
                  {getFieldDecorator("title", {
                    rules: [
                      {
                        required: true,
                        message: "请输入试卷标题"
                      }
                    ],
                    initialValue: this.state.info.title
                  })(<Input style={{ width: 120 }} />)}
                </FormItem>
                {/* <FormItem label="通过分数" {...formItemLayout}>
                  {getFieldDecorator('pass_score', {
                    rules: [
                      {
                        required: true,
                        message: '请输入通过分数'
                      }
                    ],
                    initialValue: this.state.info.pass_score
                  })(
                    <InputNumber style={{ width: 120 }} min={0} />
                  )}
                </FormItem> */}
                <FormItem
                  label={
                    <span>
                      <span style={{ display: "inline-block", marginRight: 3 }}>
                        有效时间
                      </span>
                      <Tooltip title="允许考试的时间范围">
                        <Icon type="question-circle" theme="outlined" />
                      </Tooltip>
                    </span>
                  }
                  {...formItemLayout}
                >
                  {getFieldDecorator("time_limit", {
                    rules: [
                      {
                        required: true,
                        message: "请选择时间范围"
                      }
                    ],
                    initialValue: this.state.info.time_limit
                  })(
                    <RangePicker
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder={["开始时间", "结束时间"]}
                    />
                  )}
                </FormItem>
                <FormItem label="考试次数" {...formItemLayout}>
                  {getFieldDecorator("times", {
                    rules: [
                      {
                        required: true,
                        message: "请输入试卷考试次数"
                      }
                    ],
                    initialValue: this.state.info.times
                  })(<Input style={{ width: 120 }} />)}
                </FormItem>
                <FormItem label="试卷说明" {...formItemLayout}>
                  {getFieldDecorator("notice", {
                    initialValue: this.state.info.notice
                  })(<TextArea style={{ width: "80%" }} />)}
                </FormItem>
              </Form>
            )}
            {current == 1 && (
              <div style={{ width: "80%", margin: "0 auto" }}>
                <p>
                  试卷题目如下：
                  <span style={{ float: "right" }}>
                    共 <strong>{this.state.selectQues.length}</strong>{" "}
                    题，总分值 <strong>{this.state.pointSum}</strong> 分
                  </span>
                </p>
                <Table
                  rowKey="id"
                  dataSource={this.state.selectQues}
                  columns={selectQues}
                  bordered
                  pagination={false}
                />
                <Button
                  type="primary"
                  onClick={this.handleSelect}
                  style={{ marginTop: 10 }}
                >
                  从试题库中选择
                </Button>
              </div>
            )}
            {current == 2 && (
              <Row
                type="flex"
                justify="center"
                align="center"
                style={{ margin: "0 auto", width: "80%", padding: "30px 0" }}
              >
                <Col style={{ textAlign: "center", position: "relative" }}>
                  <Icon
                    type="check-circle"
                    theme="outlined"
                    style={{ fontSize: 55, color: "rgb(0, 168, 84)" }}
                  />
                  <h3 style={{ marginTop: 50 }}>
                    试卷{this.state.editStatus ? "修改" : "设计"}完成，共
                    <strong className="success">
                      {" "}
                      {this.state.selectQues.length}{" "}
                    </strong>
                    题，总分
                    <strong className="success"> {this.state.pointSum} </strong>
                    分，请设置考试的通过分数：
                  </h3>
                  <InputNumber
                    defaultValue={this.state.info.pass_score}
                    min={0}
                    max={this.state.pointSum}
                    formatter={value => `${value}分`}
                    style={{ marginTop: 30 }}
                    onChange={value => {
                      this.setState(pre => ({
                        info: {
                          ...pre.info,
                          pass_score: value
                        }
                      }));
                    }}
                  />
                  {+this.state.info.pass_score === this.state.pointSum && (
                    <p
                      style={{
                        marginTop: 20,
                        position: "absolute",
                        width: "100%",
                        textAlign: "center"
                      }}
                    >
                      真的是很严格~
                    </p>
                  )}
                </Col>
              </Row>
            )}
          </div>
          <div
            className="steps-action"
            style={{ display: "flex", justifyContent: "center" }}
          >
            {current > 0 && current < steps.length - 1 && (
              <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                上一步
              </Button>
            )}
            {current === 0 && (
              <Button type="primary" onClick={this.handleCheck}>
                下一步
              </Button>
            )}
            {current < steps.length - 1 && current > 0 && (
              <Button type="primary" onClick={() => this.next()}>
                下一步
              </Button>
            )}
            {current === steps.length - 1 && (
              <div>
                <Button
                  type="primary"
                  onClick={this.handleComplete.bind(this, "unpublic")}
                  loading={this.state.addLoading}
                >
                  完成
                </Button>
                <Button
                  type="default"
                  onClick={this.handleComplete.bind(this, "public")}
                  loading={this.state.addLoading}
                  style={{ marginLeft: 8 }}
                >
                  完成并发布
                </Button>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="添加试题"
          visible={this.state.selectModalVisible}
          onCancel={() => {
            this.setState({ selectModalVisible: false, selectedRowKeys: [] });
          }}
          footer={null}
          width={1000}
          keyboard={false}
          style={{ top: 30 }}
        >
          <div style={{ width: "95%", margin: "0 auto" }}>
            <Table
              rowKey="id"
              rowSelection={rowSelection}
              dataSource={this.state.otherQues}
              columns={otherColumns}
              bordered
              pagination={false}
              width={1000}
            />
            <Button
              type="primary"
              onClick={this.addOtherToSelect}
              style={{ marginTop: 10 }}
            >
              添加
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}
export default (ExamPaper = Form.create({})(ExamPaper));
