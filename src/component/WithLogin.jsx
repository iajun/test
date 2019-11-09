import React from "react";
import { Redirect } from "react-router-dom";
import { setCustomerList, setUser } from "@redux/actions";
import { useDispatch } from "react-redux";
import Cookie from "universal-cookie";

const cookie = new Cookie();

const WithLogin = Component => () => {
  const isLogin = !!cookie.get("access_token");
  if (isLogin) {
    const dispatch = useDispatch();
    dispatch(setCustomerList());
    dispatch(setUser());
  }
  return isLogin ? <Component /> : <Redirect path="login" />;
};

export default WithLogin;
