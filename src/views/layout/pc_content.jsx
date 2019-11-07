import { Layout, Menu, Breadcrumb, Icon } from "igroot";
import React from "react";
import ReactDOM from "react-dom";
import { Link, Route, Switch, Redirect } from "react-router-dom";
const { SubMenu } = Menu;
const { Content } = Layout;
import UserList from "../user/user_list";
import Record from "../user/record";
import UserInfo from "../user/user_info";
import CustomerList from "../customer/customer_list";
import CustomerData from "../customer/customer_data";
import CustomerAgent from "../customer/agent";
import SingleCustomerData from "../customer/single_customer_data";
import DomainData from "../customer/domain_data";
import CustomerAssembly from "../customer/customer_assembly";
import SingleCustomerAssembly from "../customer/single_customer_assembly";
import ATDDemo from "../customer/atd_demo";
import IpCreditRequest from "../ipcredit/request";
import IpCreditSingleRequest from "../ipcredit/single_request";
import ThreatInfoCustomer from "../ipcredit/customer";
import MonitorStaff from "../monitor/monitor_staff";
import MonitorConfig from "../monitor/monitor_config";
import MonitorAnalysis from "../monitor/monitor_analysis";
import MonitorDetail from "../monitor/monitor_detail";
import ProductUpdateRecord from "../product/update_record";
import CustomerVersion from "../customer/customer_version";
import SingleCustomerVersion from "../customer/single_customer_version";
import prototypeATD from "../prototype/prototype_atd";
import tracePath from "../traces/trace_path";
import tracePage from "../traces/trace_page";
import traceClick from "../traces/track_click";
import ExamQuestion from "../exam/exam_question";
import ExamPaper from "../exam/exam_paper";
import ExamResult from "../exam/exam_result";

export default class PCContent extends React.Component {
  render() {
    return (
      <Content style={{ padding: "0 20px" }}>
        <Route
          path="/index/"
          exact
          render={() => <Redirect to="/index/customer/list" />}
        />
        <Route path="/index/admin/list" component={UserList} />
        <Route path="/index/record" component={Record} />
        <Route path="/index/userinfo" component={UserInfo} />
        <Route path="/index/customer/list" component={CustomerList} />
        <Route
          path="/index/customer/version"
          exact
          component={CustomerVersion}
        />
        <Route
          path="/index/customer/version/:name"
          component={SingleCustomerVersion}
        />
        <Route path="/index/customer/data" exact component={CustomerData} />
        <Route
          path="/index/customer/data/:name"
          exact
          component={SingleCustomerData}
        />
        <Route
          path="/index/customer/data/:name/:domain"
          component={DomainData}
        />
        <Route
          path="/index/customer/assembly"
          exact
          component={CustomerAssembly}
        />
        <Route
          path="/index/customer/assembly/:name"
          component={SingleCustomerAssembly}
        />
        <Route path="/index/customer/demo" component={ATDDemo} />
        <Route path="/index/customer/agent" component={CustomerAgent} />
        <Route
          path="/index/ipcredit/request"
          exact
          component={IpCreditRequest}
        />
        <Route
          path="/index/ipcredit/request/:name"
          component={IpCreditSingleRequest}
        />
        <Route path="/index/ipcredit/customer" component={ThreatInfoCustomer} />
        <Route path="/index/monitor/staff" component={MonitorStaff} />
        <Route path="/index/monitor/config" component={MonitorConfig} />
        <Route path="/index/monitor/analysis" component={MonitorAnalysis} />
        <Route path="/index/monitor/detail" exact component={MonitorDetail} />
        <Route path="/index/monitor/detail/:select" component={MonitorDetail} />
        <Route path="/index/product/atd" component={ProductUpdateRecord} />
        <Route path="/index/product/gateway" component={ProductUpdateRecord} />
        <Route path="/index/product/cache" component={ProductUpdateRecord} />

        <Route
          path="/index/prototype/atd_private_cloud"
          component={prototypeATD}
        />
        <Route
          path="/index/prototype/atd_public_cloud"
          component={prototypeATD}
        />
        <Route
          path="/index/prototype/threat_intelligence_center"
          component={prototypeATD}
        />
        <Route path="/index/prototype/tender" component={prototypeATD} />
        <Route path="/index/prototype/other" component={prototypeATD} />

        <Route path="/index/trace/path" component={tracePath} />
        <Route path="/index/trace/page" component={tracePage} />
        <Route path="/index/trace/click" component={traceClick} />
        <Route path="/index/exam/question" component={ExamQuestion} />
        <Route path="/index/exam/paper" exact component={ExamPaper} />
        <Route path="/index/exam/paper/:id" component={ExamResult} />
      </Content>
    );
  }
}
