import React from "react";
import { useSelector } from "react-redux";

const WithSuper = ({ super: Super, normal: Normal = null, ...params }) => {
  const user = useSelector(state => state.user);
  return user.kind === "super" ? (
    <Super {...params} />
  ) : Normal ? (
    <Normal {...params} />
  ) : null;
};

export default WithSuper;
