import React, { Component } from "react";
import {
  Breadcrumb,
  Table,
  Modal,
  Button,
  Icon,
  Tooltip,
  Popconfirm
} from "igroot";
import { Link } from "react-router-dom";
import { request } from "../../../../apis/request";
import moment from "moment";

class ExamResult extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    list: [],
    getLoading: true,
    questionMap: [],
    userAnswer: [],
    anwserModalVisible: false
  };
  componentDidMount() {
    this.getUserList();
    this.getQuestionMap();
  }
  getUserList() {
    request(
      `/dashboard/exam/${this.props.match.params.id}/examinee`,
      "get"
    ).then(res => {
      if (res != undefined && !res.code) {
        this.setState({ list: res.data, getLoading: false });
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
        this.setState({ getLoading: false });
      }
    });
  }
  getQuestionMap = () => {
    request("/dashboard/question/info", "get").then(res => {
      let list = res.data,
        map = {};
      list.map(elem => {
        map[elem.id] = elem;
      });
      this.setState({ questionMap: map });
    });
  };
  delRecord(id) {
    request(`/dashboard/exam/examinee/${id}/info`, "delete").then(res => {
      if (res !== undefined && !res.code) {
        Modal.success({
          title: "删除成功"
        });
        this.getUserList();
      } else {
        Modal.warning({
          title: res && res.message ? res.message : "网络错误，请稍后再试"
        });
      }
    });
  }
  showResult() {}
  showRecord(data) {
    // let questionId = data.map(elem => elem.lid)
    // let filter = this.state.questionMap.filter(key => questionId.indexOf(key.lid) >= 0)
    const { questionMap } = this.state;
    data = data.map(elem => {
      elem.title = questionMap[elem.id].title;
      elem.content = questionMap[elem.id].content;
      elem.correct = questionMap[elem.id].answer;
      return elem;
    });
    this.setState({ userAnswer: data, anwserModalVisible: true });
  }
  render() {
    const { list, getLoading, userAnswer } = this.state;
    const success = list
      .map(elem => {
        return +elem.score >= +elem.pass_score;
      })
      .filter(key => key).length;
    const userSuccess = userAnswer.filter(
      key => key.answer.join("") === key.correct.join("")
    ).length;
    const columns = [
      {
        title: `序号(共 ${list.length} 条)`,
        index: "index",
        key: "index",
        width: 100,
        render: (text, record, index) => index + 1
      },
      {
        title: `姓名`,
        dataIndex: "name",
        key: "name"
      },
      {
        title: "测试用时",
        dataIndex: "exam_using_time",
        key: "exam_using_time",
        sorter: (a, b) => a.exam_using_time - b.exam_using_time,
        render: (text, record, index) => {
          return `${text} 秒`;
        }
      },
      {
        title: "通过分数",
        key: "pass_score",
        dataIndex: "pass_score"
      },
      {
        title: "考试得分",
        key: "score",
        dataIndex: "score",
        sorter: (a, b) => a.score - b.score,
        render: (text, record) => {
          if (+record.score >= +record.pass_score) {
            return (
              <span>
                <Icon
                  type="smile"
                  theme="twoTone"
                  style={{ marginRight: 10 }}
                />
                {text}分
              </span>
            );
          } else {
            return (
              <span>
                <Icon
                  type="frown"
                  theme="twoTone"
                  twoToneColor="#eb2f96"
                  style={{ marginRight: 10 }}
                />
                {text}分
              </span>
            );
          }
        }
      },
      {
        title: "考试时间",
        key: "ctime",
        dataIndex: "ctime",
        sorter: (a, b) => moment(a.ctime).unix() - moment(b.ctime).unix()
      },
      {
        title: "操作",
        key: "setting",
        width: 80,
        render: (text, record, index) => {
          return (
            <span>
              <Tooltip title="查看详情" placement="topRight">
                <a onClick={this.showRecord.bind(this, record.answer)}>
                  <Icon
                    type="database"
                    theme="outlined"
                    style={{
                      marginRight: 13
                    }}
                  />
                </a>
              </Tooltip>
              <Tooltip title="删除记录" placement="topRight">
                <Popconfirm
                  title="要删除记录吗？"
                  okText="确定"
                  cancelText="点错了"
                  onConfirm={this.delRecord.bind(this, record.id)}
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
    const answerColumns = [
      {
        title: "题目",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "选项",
        dataIndex: "content",
        key: "content",
        render: text => text.join("、")
      },
      {
        title: "正确答案",
        dataIndex: "correct",
        key: "correct",
        render: (text, record) => (
          <span
            className={
              record.answer.join("、") == text.join("、") ? "success" : ""
            }
          >
            {text.join("、")}
          </span>
        )
      },
      {
        title: "回答",
        dataIndex: "answer",
        key: "answer",
        render: (text, record) => (
          <span
            className={
              record.correct.join("、") == text.join("、") ? "success" : ""
            }
          >
            {text.join("、") || "无"}
          </span>
        )
      },
      {
        title: "得分",
        dataIndex: "get_score",
        key: "get_score"
      }
    ];
    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>
            <Link to="/index/exam/paper" style={{ color: "#20a0ff" }}>
              试卷管理
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>查看记录</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}
        >
          {list.length > 0 && (
            <p>
              在 <strong> {list.length} </strong>次测试中，有{" "}
              <strong> {success} </strong>次通过测试，通过率{" "}
              <strong> {((success * 100) / list.length).toFixed(2)}% </strong>
            </p>
          )}
          <Table
            rowKey="id"
            dataSource={list}
            columns={columns}
            loading={getLoading}
            bordered
            pagination={list.length > 10}
          />
        </div>
        <Modal
          title="查看详情"
          visible={this.state.anwserModalVisible}
          onCancel={() => {
            this.setState({ anwserModalVisible: false });
          }}
          footer={null}
          width={1000}
          style={{ top: 30 }}
        >
          <p>
            在 <strong> {userAnswer.length} </strong>道题目中，答对
            <strong> {userSuccess} </strong>道，正确率
            <strong>
              {" "}
              {((userSuccess * 100) / userAnswer.length).toFixed(2)}%{" "}
            </strong>
          </p>
          <Table
            rowKey="title"
            dataSource={userAnswer}
            columns={answerColumns}
            bordered
            pagination={false}
          />
        </Modal>
      </div>
    );
  }
}

export default ExamResult;
