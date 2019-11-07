import React, { Component } from "react";
import { message, Modal } from "igroot";
import { request } from "../../../../../apis/request";
import { openURL } from "../../../../../utils/tools";
import AgentHeader from "./AgentHeader";
import AgentContent from "./AgentContent";
import AddAgent from "./AddAgent";
import AgentRecord from "./AgentRecord";
import EditAgent from "./EditAgent";

export default class CustomerAgent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true, // 获取代理列表loading
      agentCustomer: [], // 用于首页筛选
      curAgent: null, // 当前编辑代理
      addVisible: false, // 添加代理 Modal 可见
      drawerVisible: false, //操作记录 Drawer 可见
      editVisible: false, // 修改代理信息
      records: [], // 操作记录
      curStatus: "all"
    };
    this.cached = {};
    this.allCus = null;
    this.customers = null;
    this.userinfo = { role: "" };
  }

  // 控制 Modal 显示
  setVisible = (modalName, visible, curAgent) => {
    if (visible) {
      this.setState({
        curAgent
      });
    }

    if (modalName === "deleteVisible") {
      Modal.confirm({
        title: `是否删除客户 ${curAgent.cname} 的代理 ${curAgent.name} ？`,
        okText: "确认",
        cancelText: "取消",
        onOk: () => this.deleteAgent(curAgent)
      });
    }
    this.setState({
      [modalName]: visible
    });
  };

  proxyOpenAgent = (agent, type) => {
    if (agent.mobile_verify === "on" && type === "portal") {
      Modal.confirm({
        title: "确认登录控制台",
        content: "此客户需要使用手机验证码登录，是否继续登录",
        okText: "确认",
        cancelText: "取消",
        onOk: () => this.onOpenAgent(agent, type)
      });
    } else {
      this.onOpenAgent(agent, type);
    }
  };

  deleteAgent = async agent => {
    let res = await request(
      `/dashboard/proxy/${agent.name}`,
      "delete",
      {}
    );
    if (!res || res.code) {
      return message.error(res.message || "网络错误，请稍后再试");
    }
    message.success("删除成功");
    return void this.getAgentList();
  };

  // 过滤主页搜索
  onFilterCustomer = (chars = "") => {
    let res;
    if (chars === "") {
      res = this.customers;
    }
    res = this.customers.filter(({ cname }) => cname.includes(chars));
    this.setState({
      agentCustomer: res
    });
  };

  // 打开代理
  onOpenAgent = async (agent, type) => {
    let res = await request(`/dashboard/proxy/${agent.cid}/url`, "get", {
      proxy_name: agent.name,
      type
    });
    if (res && res.url) {
      const url = "http://" + res.url;
      openURL(url, "_blank");
    } else {
      let text = "网络错误，请稍后再试";
      if (res.code && res.message) {
        text = res.message;
      }
      message.error(text);
    }
  };

  filterCustomerType = curStatus => {
    let agentCustomer = [];
    if (curStatus === "all") {
      agentCustomer = this.customers;
    } else {
      agentCustomer = this.customers.filter(
        ({ cstatus }) => cstatus === curStatus
      );
    }
    this.setState({
      agentCustomer,
      curStatus
    });
  };

  filterCustomerName = name => {
    if (name === "") {
      return this.setState({
        agentCustomer: this.customers
      });
    }
    let customers = this.customers;
    let cus = customers.filter(({ cname }) => cname.includes(name));
    this.setState({
      agentCustomer: cus,
      curStatus: "all"
    });
  };

  // 获取操作记录
  onRecord = async content => {
    let res = await request("/dashboard/record/list", "get", {
      limit: 200,
      offset: 0,
      content
    });
    if (res && res.data) {
      this.records = res.data;
      this.name = content;
      this.setState({
        drawerVisible: true
      });
    }
  };

  // 获取代理列表
  getAgentList = () => {
    request("/dashboard/proxy/list", "get").then(res => {
      if (res && !res.code) {
        let customers = res || [];
        let { role } = this.userinfo;
        // 只有运营和超级管理员能看到黑代理
        if (role != "op" && role != "manager") {
          customers = customers.filter(({ type }) => type === "white");
        }
        this.customers = customers;
        this.setState({
          agentCustomer: customers,
          loading: false
        });
      } else {
        let text = "网络错误，请稍后再试";
        if (res && res.code) {
          text = res.message;
        }
        message.error(text);
      }
    });
  };

  async componentDidMount() {
    this.userinfo = await request("/dashboard/user/info", "get");
    this.getAgentList();
  }
  render() {
    return (
      <div>
        <AgentHeader
          setAddVisible={this.setVisible.bind(null, "addVisible")}
          filterCustomerType={this.filterCustomerType}
          filterCustomerName={this.filterCustomerName}
          info={this.userinfo}
          curStatus={this.state.curStatus}
        />
        <div style={{ padding: 20, background: "white" }}>
          <AgentContent
            list={this.state.agentCustomer}
            loading={this.state.loading}
            user={this.userinfo}
            setEditVisible={this.setVisible.bind(null, "editVisible")}
            setDeleteVisible={this.setVisible.bind(null, "deleteVisible")}
            onOpenAgent={this.proxyOpenAgent}
            onRecord={this.onRecord}
            onFilter={this.onFilterCustomer}
          />
        </div>
        {this.state.addVisible && (
          <AddAgent
            loading={this.state.loading}
            visible={this.state.addVisible}
            setAddVisible={this.setVisible.bind(null, "addVisible")}
            getAgentList={this.getAgentList}
          />
        )}
        {this.state.drawerVisible && (
          <AgentRecord
            drawerVisible={this.state.drawerVisible}
            setDrawerVisible={this.setVisible.bind(null, "drawerVisible")}
            records={this.records}
            name={this.name}
          />
        )}
        {this.state.editVisible && (
          <EditAgent
            visible={this.state.editVisible}
            setVisible={this.setVisible.bind(null, "editVisible")}
            agent={this.state.curAgent}
            getAgentList={this.getAgentList}
            info={this.userinfo}
          />
        )}
      </div>
    );
  }
}
