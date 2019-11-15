import React, { useEffect, memo } from "react";
import { Layout } from "antd";
import { connect } from "react-redux";
import { setCustomerList, setUser, setProxyList } from "@redux/async-actions";

import BaseFooter from "@cpt/layout/footer";
import BaseHeader from "@cpt/layout/header";
import BaseSideBar from "@cpt/layout/sidebar";
import styles from "./index.module.scss";

const BaseLayout = props => {
  useEffect(() => {
    props.setCustomerList();
    props.setUser();
    props.setProxyList();
  }, []);

  console.log("layout");

  return (
    <>
      <Layout>
        <BaseSideBar
          style={{
            overflow: "hidden",
            height: "100vh",
            position: "fixed",
            left: 0
          }}
        />

        <Layout className={styles["content-wrapper"]} id="scroll-content">
          <BaseHeader />
          <Layout.Content className={styles["content"]}>
            {props.children}
            <BaseFooter />
          </Layout.Content>
        </Layout>
      </Layout>
    </>
  );
};

export default memo(
  connect(null, dispatch => ({
    setCustomerList: () => dispatch(setCustomerList()),
    setProxyList: () => dispatch(setProxyList()),
    setUser: () => dispatch(setUser())
  }))(BaseLayout),
  () => true
);
