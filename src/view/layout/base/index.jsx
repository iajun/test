import React from "react";
import { Layout } from "antd";
import { connect } from "react-redux";
import { setCustomerList, setUser } from "@redux/async-actions";

import BaseFooter from "@cpt/layout/footer";
import BaseHeader from "@cpt/layout/header";
import BaseSideBar from "@cpt/layout/sidebar";
import styles from "./index.module.scss";

const BaseLayout = props => {
  props.setCustomerList();
  props.setUser();

  return (
    <div>
      <BaseHeader />
      <Layout className={styles["main"]}>
        <BaseSideBar collapsed={false} />
        <Layout.Content className={styles["content-wrapper"]}>
          <div className={styles["content"]}>{props.children}</div>
          <BaseFooter />
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default connect(
  null,
  dispatch => ({
    setCustomerList: () => dispatch(setCustomerList()),
    setUser: () => dispatch(setUser())
  })
)(BaseLayout);
