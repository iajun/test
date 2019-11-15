import React from "react";
import { useSelector } from "react-redux";

const withSuper = ({ su: Su, op: Op }) => {
  const user = useSelector(state => state.user);
  const isSuper = user.kind === "super";
  const isOp = user.role === "op";

  if ((Su && !isSuper) || (Op && !isSuper && !isOp)) {
    return null;
  } else {
    return Su ? <Su /> : <Op />;
  }
};

export default withSuper;
