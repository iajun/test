import { Layout, Menu, Icon } from "antd";
import React from "react";
import { Link } from "react-router-dom";
const { SubMenu } = Menu;
const { Sider } = Layout;
import styles from "./index.module.scss";
import logo from "@img/modules/logo_white.svg";

class PCSidebar extends React.Component {
  render() {
    return (
      <Sider className={styles["sidebar"]}>
        <div className={styles["ico"]}>
          <img src={logo} alt="" />
        </div>
        <Menu theme="dark" mode="inline">
          <SubMenu
            key="admin"
            title={
              <span>
                <Icon type="user" />
                <span>用户管理</span>
              </span>
            }
          >
            <Menu.Item key="/user">
              <Link to={"/user"}>用户列表</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="customer"
            title={
              <span>
                <Icon type="contacts" />
                <span>ATD客户管理</span>
              </span>
            }
          >
            <Menu.Item key="/customer">
              <Link to={"/customer"}>客户信息</Link>
            </Menu.Item>
            <Menu.Item key="/customer/proxy">
              <Link to={"/customer/proxy"}>客户代理</Link>
            </Menu.Item>
            <Menu.Item key="/customer/version">
              <Link to={"/customer/version"}>版本信息</Link>
            </Menu.Item>
            <Menu.Item key="/customer/data">
              <Link to={"/customer/data"}>运营情况</Link>
            </Menu.Item>
            <Menu.Item key="/customer/assembly">
              <Link to={"/customer/assembly"}>组件状态</Link>
            </Menu.Item>
            <Menu.Item key="/demo">
              <Link to={"/demo"}>演示账号</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="ipcredit"
            title={
              <span>
                <Icon type="api" />
                <span>威胁情报中心</span>
              </span>
            }
          >
            <Menu.Item key="/ip">
              <Link to={"/ipcredit/customer"}>客户情况</Link>
            </Menu.Item>
            <Menu.Item key="/ip/data">
              <Link to={"/ipcredit/request"}>接口调用情况</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="alert"
            title={
              <span>
                <Icon type="bell" />
                <span>报警管理</span>
              </span>
            }
          >
            <Menu.Item key="/alert/type">
              <Link to={"/alert/type"}>报警接收</Link>
            </Menu.Item>
            <Menu.Item key="/alert/config">
              <Link to={"/alert/config"}>报警开关</Link>
            </Menu.Item>
            <Menu.Item key="/alert/data">
              <Link to={"/alert/data"}>报警统计</Link>
            </Menu.Item>
            <Menu.Item key="/alert/detail">
              <Link to={"/alert/detail"}>报警详情</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="trace"
            title={
              <span>
                <Icon type="dot-chart" />
                <span>数据分析</span>
              </span>
            }
          >
            <Menu.Item key="/trace/path">
              <Link to={"/trace/path"}>客户访问情况</Link>
            </Menu.Item>
            <Menu.Item key="/trace/page">
              <Link to={"/trace/page"}>页面访问情况</Link>
            </Menu.Item>
            <Menu.Item key="/trace/click">
              <Link to={"/trace/click"}>页面点击情况</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="product"
            title={
              <span>
                <Icon type="bars" />
                <span>更新记录</span>
              </span>
            }
          >
            <Menu.Item key="/product/atd">
              <Link to={"/product/atd"}>ATD</Link>
            </Menu.Item>
            <Menu.Item key="/product/cache">
              <Link to={"/product/cache"}>API加速</Link>
            </Menu.Item>
            <Menu.Item key="/product/gateway">
              <Link to={"/product/gateway"}>API网关</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="prototype"
            title={
              <span>
                <Icon type="credit-card" />
                <span>产品原型</span>
              </span>
            }
          >
            <Menu.Item key="/prototype/atd/private">
              <Link to={"/prototype/atd/private"}>ATD - 私有云</Link>
            </Menu.Item>
            <Menu.Item key="/prototype/atd/public">
              <Link to={"/prototype/atd/public"}>ATD - 公有云</Link>
            </Menu.Item>
            <Menu.Item key="/prototype/threat">
              <Link to={"/prototype/threat"}>威胁情报中心</Link>
            </Menu.Item>
            <Menu.Item key="/prototype/tender">
              <Link to={"/prototype/tender"}>招标项目</Link>
            </Menu.Item>
            <Menu.Item key="/prototype/other">
              <Link to={"/prototype/other"}>其他项目</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="exam"
            title={
              <span>
                <Icon type="calculator" />
                <span>考试管理</span>
              </span>
            }
          >
            <Menu.Item key="/exam/question">
              <Link to={"/exam/question"}>试题管理</Link>
            </Menu.Item>
            <Menu.Item key="/exam/paper">
              <Link to={"/exam/paper"}>试卷管理</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    );
  }
}

export default PCSidebar;
