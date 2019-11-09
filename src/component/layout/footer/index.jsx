import React from "react";
import moment from "moment";
import "./index.scss";

const BaseFooter = () => {
  return (
    <footer className="footer">
      Admin ©{moment().format("YYYY")} Created by BaishanCloud
    </footer>
  );
};

export default BaseFooter;
