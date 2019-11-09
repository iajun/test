import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Upload
} from "antd";
import React from "react";
import request from "@api/tools/request"
const FormItem = Form.Item;

const statusMap = new Map([
  ["confirming", {text: "确认中", color: "#303F9F"}],
  ["developing", {text: "开发中", color: "#FF5722"}],
  ["UIDesigning", {text: "UI设计中", color: "#009688"}],
  ["online", {text: "已上线"}]
]);

class prototypeATD extends React.Component {
  state = {
    proto_type: "",
    proto_name: "",
    ATDList: [],
    visible: false,
    loading: true,
    pagination: false,
    add_loading: false,
    upload_loading: false,
    upload_info: "",
    fileList: []
  };
  showModal = () => {
    this.setState({ visible: true, fileList: [] });
    this.props.form.setFieldsValue({
      name: ""
    });
  };
  handleCancel = () => {
    this.setState({ visible: false, upload_visible: false });
  };
  handleSubmit(e) {
    // 页面开始向API提交
    const { fileList, ATDList } = this.state;
    e.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields(["name"], (err, values) => {
      if (!err) {
        const add_proto = new FormData();
        if (fileList[0]) {
          add_proto.append("file", fileList[0]);
        }  else {
          return Modal.error({
            title: '请先上传文件'
          })
        }
        add_proto.append("name", formData.name);
        add_proto.append("status", formData.status);
        formData.plan && add_proto.append("plan", formData.plan);
        add_proto.append("version", `v${ATDList.length}`);
        add_proto.append("type", this.state.proto_type);
        this.setState({ add_loading: true });
        request(
          "/dashboard/prototype/info",
          "post",
          {},
          add_proto,
          {},
          "file"
        ).then(res => {
          if (res && !res.code) {
            this.setState({ add_loading: false, visible: false });
            Modal.success({
              title: "新建成功"
            });
            this.get_ATDList();
          } else {
            this.setState({ add_loading: false });
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
        this.setState({ add_loading: false });
      }
    });
  }
  uploadModal = upload_info => {
    this.setState({
      upload_visible: true,
      upload_info,
      fileList: []
    });
  };
  handleOk = e => {
    e.preventDefault();
    const { fileList, upload_info } = this.state;
    const formData = this.props.form.getFieldsValue();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ upload_loading: true });
        const upload_proto = new FormData();
        upload_proto.append("name", formData.name);
        upload_proto.append("version", upload_info.version);
        upload_proto.append("type", this.state.proto_type);
        formData.plan && upload_proto.append("plan", formData.plan);
        upload_proto.append("status", formData.status);
        if (fileList[0]) {
          upload_proto.append("file", fileList[0]);
        }
        request(
          "/dashboard/prototype/info",
          "post",
          {},
          upload_proto,
          {},
          "file"
        ).then(res => {
          if (res && !res.code) {
            this.setState(
              { upload_loading: false, upload_visible: false },
              () => {
                Modal.success({
                  title: "更新成功"
                });
                this.get_ATDList();
              }
            );
          } else {
            this.setState({ upload_loading: false });
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
        this.setState({ upload_loading: false });
      }
    });
  };

  componentWillMount() {
    const proto_type = location.hash
      .replace(/#/g, "")
      .split("/")
      .pop();
    let proto_name = "";
    switch (proto_type) {
      case "atd_private_cloud":
        proto_name = "ATD - 私有云";
        break;
      case "atd_public_cloud":
        proto_name = "ATD - 公有云";
        break;
      case "threat_intelligence_center":
        proto_name = "威胁情报中心";
        break;
      case "tender":
        proto_name = "招标项目";
        break;
      case "other":
        proto_name = "其他项目";
        break;
    }
    this.setState({ proto_type, proto_name }, () => this.get_ATDList());
  }
  get_ATDList = () => {
    request(
      `/dashboard/prototype/list?type=${this.state.proto_type}`,
      "get"
    ).then(res => {
      if (res && !res.code) {
        this.setState({ ATDList: res.data, loading: false });
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
        this.setState({ loading: false });
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
    const upload_title = (
      <span>
        上传文件
        <Tooltip title="只支持zip、rar格式，且每次只能上传一个文件">
          <Icon
            style={{ marginLeft: "5px", fontSize: 12 }}
            type="question-circle"
          />
        </Tooltip>
      </span>
    );
    const props = {
      action: "/dashboard/prototype/info",
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file]
        }));
        return false;
      },
      fileList: this.state.fileList
    };
    const columns = [
      {
        title: "版本号",
        key: "version",
        dataIndex: "version",
        width: "80px",
        render: (text, record) =>
          record.status !== 'online' ? (
            <span style={{ color: "#1890ff" }}>{text}</span>
          ) : (
            <span>{text}</span>
          )
      },
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <a
            style={{ color: "#1890ff" }}
            href={`http://pm.juhe.baishancloud.com/${this.state.proto_type}/${record.version}`}
            target="_blank"
          >
            {text}
          </a>
        )
      },
      {
        title: "最近更新时间",
        dataIndex: "time",
        key: "time",
        width: "180px"
      },
      {
        title: "最新状态",
        dataIndex: "status",
        key: "status",
        width: "100px",
        render(val) {
          let mapValue = statusMap.get(val);
          if (!mapValue) return ''
          const {text='', color=''} = mapValue;
          return <span style={{color}}>{text}</span>
        }
      },
      {
        title: "计划上线",
        dataIndex: "plan",
        key: "plan",
        width: "80px",
        render: (text, record) => {
          if (!text) {
            return "-";
          }
          return record.status !== 'online' ? (
            <span style={{ color: "#795548" }}>{text}</span>
          ) : (
            <span>{text}</span>
          );
        }
      },
      {
        title: "操作",
        key: "action",
        width: "80px",
        render: (text, record) => {
          const action = (
            <Tooltip title="更新原型" placement="top">
              <a onClick={this.uploadModal.bind(this, record)}>
                <Icon
                  type="form"
                  style={{
                    fontSize: 14
                  }}
                />
              </a>
            </Tooltip>
          );
          return action;
        }
      }
    ];
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

    return (
      <div>
        <Breadcrumb
          style={{
            margin: "12px 0"
          }}
        >
          <Breadcrumb.Item>{this.state.proto_name}原型</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            background: "#fff",
            minHeight: 360
          }}
        >
          <Button
            onClick={this.showModal}
            type="primary"
            icon="upload"
            style={{
              margin: "0px 0px 12px 0px"
            }}
          >
            新建原型
          </Button>
          <div className="overflow_auto">
            <Table
              rowKey="version"
              dataSource={this.state.ATDList}
              columns={columns}
              bordered
              pagination={false}
              loading={this.state.loading}
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        {this.state.visible && (
          <Modal
            title="上传原型"
            visible={this.state.visible}
            onCancel={this.handleCancel}
            footer={null}
          >
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <FormItem label="版本号" {...formItemLayout}>
                <span>{`v${this.state.ATDList.length}`}</span>
              </FormItem>
              <FormItem label="名称" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: "请输入原型名称"
                    }
                  ],
                  initialValue: ""
                })(
                  <Input
                    prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                    placeholder="请输入原型名称"
                  />
                )}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator("status", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: "confirming"
                })(
                  <Select>
                    {[...statusMap.entries()].map(([value, {text}]) => (
                      <Select.Option value={value} key={value}>{text}</Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label="计划上线" {...formItemLayout}>
                {getFieldDecorator("plan")(<Input />)}
              </FormItem>
              <FormItem label={upload_title} {...formItemLayout}>
                {getFieldDecorator("upload", {
                  rules: [
                    {
                      required: true,
                      message: ""
                    }
                  ],
                  initialValue: ""
                })(
                  <Upload {...props}>
                    <Button>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                )}
              </FormItem>
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
                  loading={this.state.add_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        )}
        {this.state.upload_visible && (
          <Modal
            title={"更新原型"}
            visible={this.state.upload_visible}
            confirmLoading={this.state.upload_loading}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            okText="确认"
            cancelText="取消"
          >
            <Form onSubmit={this.handleOk.bind(this)}>
              <FormItem label="版本号" {...formItemLayout}>
                <span>{this.state.upload_info.version}</span>
              </FormItem>
              <FormItem label="名称" {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: "请输入原型名称"
                    }
                  ],
                  initialValue: this.state.upload_info.name
                })(
                  <Input
                    prefix={<Icon type="book" style={{ fontSize: 13 }} />}
                    placeholder="请输入原型名称"
                  />
                )}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {getFieldDecorator("status", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.state.upload_info.status
                })(
                  <Select>
                    {[...statusMap.entries()].map(([value, {text}]) => (
                      <Select.Option value={value} key={value}>{text}</Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label="计划上线" {...formItemLayout}>
                {getFieldDecorator("plan", {
                  initialValue: this.state.upload_info.plan
                })(<Input />)}
              </FormItem>
              <FormItem label={upload_title} {...formItemLayout}>
                {getFieldDecorator("upload", {
                  rules: [
                    {
                      required: false,
                      message: ""
                    }
                  ]
                })(
                  <Upload {...props}>
                    <Button>
                      <Icon type="upload" /> 选择文件
                    </Button>
                  </Upload>
                )}
              </FormItem>
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
                  loading={this.state.upload_loading}
                >
                  确认
                </Button>
              </div>
            </Form>
          </Modal>
        )}
      </div>
    );
  }
}

export default prototypeATD = Form.create({})(prototypeATD);
