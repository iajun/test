import { ConfigProvider } from "antd";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import SiteRoute from "./route/index";

const App = () => {
  return (
    <ConfigProvider locale={zh_CN}>
      <Router>
        <Route path="/" component={SiteRoute} isLogin={true} />
      </Router>
    </ConfigProvider>
  );
};

export default App;
