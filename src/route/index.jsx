import React, { Suspense } from "react";
import { Spin } from "antd";
import BaseRoute from "./BaseRoute";
import { Route, Switch, Redirect } from "react-router-dom";
import BaseLayout from "@view/layout/base";
import "@css/style.scss";

const Login = React.lazy(() => import("@view/login/pc_login"));

const SiteRoute = props => {
  const { match } = props;

  const PrivateRoute = ({ component: Component, ...rest }) => {
    return <Route {...rest} render={props => <Component {...props} />} />;
  };
  return (
    <Suspense fallback={<Spin className="mid" />}>
      <Switch>
        <Route path={`${match.url}login`} component={Login} />
        <BaseLayout>
          <Suspense fallback={<Spin className="mid" />}>
            <Switch>
              <PrivateRoute path={`${match.url}`} component={BaseRoute} />
              <Redirect to="/login" />
            </Switch>
          </Suspense>
        </BaseLayout>
      </Switch>
    </Suspense>
  );
};

export default SiteRoute;
