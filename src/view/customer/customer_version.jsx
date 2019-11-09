import {
  Table,
  Modal,
  Form,
  Cascader,
  notification,
  Input
} from "antd";
import React from "react";
import request from "@api/tools/request"
import { Link } from "react-router-dom";
import classnames from "classnames";
import compareVersions from "compare-versions";
import { secFormat } from "@util/tools"

function formatVersion(version) {
  if (!/(\d+-)+/.test(version)) return "0.0.0";
  let ver = version.replace("-", ".").replace(/[^0-9.]+/, "");
  if (ver.endsWith(".")) return ver.slice(0, -1);
  return ver;
}

class CustomerVersion extends React.Component {
  state = {
    versionList: [{ data: {} }],
    loading: true,
    cus_loading: true,
    curStatus: "all"
  };
  componentDidMount() {
    this.get_customerlist();
    this.get_versionlist();
  }
  get_customerlist = () => {
    request("/dashboard/customer/list", "get").then(res => {
      if (!res || res.code) {
        notification.error("网络错误，请稍后再试");
      }
      this.setState({
        cus_loading: false
      });
      this.cus = {
        test: [],
        sign: [],
        delay: [],
        experience: []
      };
      res.data.forEach(({ name, status }) => {
        status === "test" && this.cus.test.push(name);
        status === "sign" && this.cus.sign.push(name);
        status === "delay" && this.cus.delay.push(name);
        status === "experience" && this.cus.experience.push(name);
      });
    });
  };

  get_versionlist = () => {
    request("/dashboard/customer/version", "get").then(res => {
      this.setState({ loading: false });
      if (res && !res.code) {
        let versions = {};
        res.forEach(({ data }) => {
          if (!data) {
            return;
          }
          Object.keys(data).forEach(k => {
            if (!versions[k]) {
              versions[k] = [];
            }
            if (!versions[k].includes(data[k])) {
              versions[k].push(data[k]);
            }
          });
        });
        Object.keys(versions).forEach(v => {
          versions[v] = versions[v].sort((a, b) => {
            return compareVersions(formatVersion(b), formatVersion(a));
          });
        });
        this.versions = versions;
        this.versionList = res;
        this.setState({ versionList: res });
      } else {
        this.setState({ versionList: [] });
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

  searchCus = e => {
    let versionList;
    versionList =
      e.target.value === ""
        ? this.versionList
        : this.versionList.filter(({ name }) => name.includes(e.target.value));
    this.setState({
      versionList,
      curStatus: "all"
    });
  };

  changeCusStatus = status => {
    let versionList;
    if (status === "all") {
      versionList = this.versionList;
    } else {
      versionList = this.versionList.filter(({ name }) =>
        this.cus[status].includes(name)
      );
    }
    this.setState({ versionList, curStatus: status });
  };

  filterVersion = value => {
    let versionList = this.versionList.filter(({ data }) => {
      if (!data) return false;
      return data[value[0]] === value[1];
    });
    this.setState({
      versionList,
      curStatus: "all"
    });
  };

  renderCascader = () => {
    let versions = this.versions;
    if (!versions) return null;
    let options = Object.keys(versions).map(v => {
      return {
        value: v,
        label: v,
        children: versions[v].map(verNum => ({
          value: verNum,
          label: verNum
        }))
      };
    });
    return (
      <Cascader
        className="version-cascader"
        options={options}
        expandTrigger="hover"
        placeholder="过滤版本"
        onChange={this.filterVersion}
      />
    );
  };

  render() {
    let version_cols = [];
    let versionList = this.state.versionList;
    version_cols.push(
      {
        title: `客户名（${versionList.length}个）`,
        dataIndex: "name",
        key: "name",
        width: "120px",
        render: text => (
          <Link to={`/index/customer/version/${text}`}>
            <span style={{ color: "#20a0ff" }}>{text}</span>
          </Link>
        )
      },
      {
        title: "时间",
        dataIndex: "date",
        width: "95px",
        key: "date",
        sorter: (a, b) => {
          if (a.date < b.date) {
            return -1;
          } else if (a.date > b.date) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    );
    for (const value of Object.keys(versionList[0].data)) {
      version_cols.push({
        title: value,
        dataIndex: `${"data" + "."}${value}`,
        key: value,
        width: "65px",
        sorter: (a, b) => {
          let av, bv;
          !(a.data && (av = a.data[value])) && (av = "0");
          !(b.data && (bv = b.data[value])) && (bv = "0");
          return compareVersions(formatVersion(av), formatVersion(bv));
        }
      });
    }
    version_cols.push({
      title: "运行时间",
      dataIndex: "run_time",
      width: "50px",
      key: "run_time",
      render: text => secFormat(text)
    });
    let acl = status =>
      classnames({
        "status-link": true,
        "status-active": this.state.curStatus === status
      });
    let type = {
      test: "测试",
      experience: "体验",
      delay: "商务中",
      sign: "签约",
      all: "全部"
    };
    return (
      <div>
        <div
          style={{
            margin: "12px 0"
          }}>
          <span>客户版本信息 /</span>
          {!this.state.cus_loading && (
            <span>
              {Object.keys(type).map(k => (
                <a
                  className={acl(k)}
                  key={k}
                  onClick={this.changeCusStatus.bind(null, k)}>
                  {type[k]}
                </a>
              ))}
            </span>
          )}

          {!this.state.cus_loading && (
            <span style={{ marginLeft: 40 }}>
              <Input
                placeholder="输入客户名搜索"
                onChange={this.searchCus}
                style={{ width: 140 }}></Input>
              {this.renderCascader()}
            </span>
          )}
        </div>
        <div
          style={{
            padding: "14px 24px",
            background: "#fff",
            minHeight: 360
          }}>
          <div>
            <Table
              rowKey="name"
              dataSource={this.state.versionList}
              columns={version_cols}
              bordered
              pagination={false}
              scroll={{ y: 480 }}
              loading={this.state.loading}
              style={{ minWidth: "900px" }}
            />
          </div>
        </div>
        <style>
          {`
            .version-cascader {
              width: 240px;
              margin-left: 40px
            }

            .ant-cascader-menu {
              height: 480px;
            }

            a.status-link {
              margin-left: 20px;
              color: #777;
            }

            .status-active {
              color: #20a0ff !important;
            }
          `}
        </style>
      </div>
    );
  }
}

export default CustomerVersion = Form.create({})(CustomerVersion);
