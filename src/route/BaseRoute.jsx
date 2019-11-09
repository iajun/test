import React from "react";
import { Route, Switch } from "react-router-dom";

const UserList = React.lazy(() => import("@view/user/user_list"));
const Record = React.lazy(() => import("@view/user/record"));
const UserInfo = React.lazy(() => import("@view/user/user_info"));
const CustomerList = React.lazy(() => import("@view/customer/list"));
const CustomerData = React.lazy(() => import("@view/customer/customer_data"));
const CustomerAgent = React.lazy(() => import("@view/customer/agent"));
const SingleCustomerData = React.lazy(() =>
  import("@view/customer/single_customer_data")
);
const DomainData = React.lazy(() => import("@view/customer/domain_data"));
const CustomerAssembly = React.lazy(() =>
  import("@view/customer/customer_assembly")
);
const SingleCustomerAssembly = React.lazy(() =>
  import("@view/customer/single_customer_assembly")
);
const ATDDemo = React.lazy(() => import("@view/customer/atd_demo"));
const IpCreditRequest = React.lazy(() => import("@view/ipcredit/request"));
const IpCreditSingleRequest = React.lazy(() =>
  import("@view/ipcredit/single_request")
);
const ThreatInfoCustomer = React.lazy(() => import("@view/ipcredit/customer"));
const MonitorStaff = React.lazy(() => import("@view/monitor/monitor_staff"));
const MonitorConfig = React.lazy(() => import("@view/monitor/monitor_config"));
const MonitorAnalysis = React.lazy(() =>
  import("@view/monitor/monitor_analysis")
);
const MonitorDetail = React.lazy(() => import("@view/monitor/monitor_detail"));
const ProductUpdateRecord = React.lazy(() =>
  import("@view/product/update_record")
);
const CustomerVersion = React.lazy(() =>
  import("@view/customer/customer_version")
);
const SingleCustomerVersion = React.lazy(() =>
  import("@view/customer/single_customer_version")
);
const prototypeATD = React.lazy(() => import("@view/prototype/prototype_atd"));
const tracePath = React.lazy(() => import("@view/traces/trace_path"));
const tracePage = React.lazy(() => import("@view/traces/trace_page"));
const traceClick = React.lazy(() => import("@view/traces/track_click"));
const ExamQuestion = React.lazy(() => import("@view/exam/exam_question"));
const ExamPaper = React.lazy(() => import("@view/exam/exam_paper"));
const ExamResult = React.lazy(() => import("@view/exam/exam_result"));

const routes = [
  {
    path: "/customer",
    component: CustomerList,
    exact: true
  },
  {
    path: "/user",
    component: UserList,
    exact: true
  },
  {
    path: "/record",
    component: Record
  },
  {
    path: "/user/info",
    component: UserInfo
  },
  {
    path: "/customer/data",
    component: CustomerData
  },
  {
    path: "/customer/proxy",
    component: CustomerAgent
  },
  {
    path: "/customer/domain",
    component: DomainData
  },
  {
    path: "/customer/assembly",
    component: CustomerAssembly
  },
  {
    path: "/customer/version",
    component: CustomerVersion
  },
  {
    path: "/customer/:id",
    component: SingleCustomerData
  },
  {
    path: "/customer/assembly/:id",
    component: SingleCustomerAssembly
  },
  {
    path: "/customer/version/:id",
    component: SingleCustomerVersion
  },
  {
    path: "/demo",
    component: ATDDemo
  },
  {
    path: "/ip",
    component: IpCreditRequest,
    exact: true
  },
  {
    path: "/ip/customer",
    component: ThreatInfoCustomer
  },
  {
    path: "/ip/:id",
    component: IpCreditSingleRequest
  },

  {
    path: "/alert/type",
    component: MonitorStaff
  },
  {
    path: "/alert/config",
    component: MonitorConfig
  },
  {
    path: "/alert/data",
    component: MonitorAnalysis
  },
  {
    path: "/alert/detail",
    component: MonitorDetail
  },
  {
    path: "/product",
    component: ProductUpdateRecord
  },
  {
    path: "/prototype",
    component: prototypeATD
  },
  {
    path: "/trace/path",
    component: tracePath
  },
  {
    path: "/trace/page",
    component: tracePage
  },
  {
    path: "/trace/click",
    component: traceClick
  },
  {
    path: "/exam/question",
    component: ExamQuestion
  },
  {
    path: "/exam/paper",
    component: ExamPaper
  },
  {
    path: "/exam/result",
    component: ExamResult
  }
];

const BaseRoute = props => {
  return (
    <Switch>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          component={route.component}
          exact={route.exact}
        ></Route>
      ))}
    </Switch>
  );
};

export default BaseRoute;
