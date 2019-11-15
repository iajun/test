import { Icon } from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./index.scss";
import classnames from "classnames";

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuStyle = classnames({
    "is-visible": menuVisible,
    "menu-backdrop": true
  });
  const user = useSelector(state => state.user);
  return (
    <header className="app-header">
      {/* <div
        className="menu-icon-wrapper"
        onMouseOver={() => setMenuVisible(true)}
      >
        <Icon type="menu" className="menu-icon" />
      </div> */}
      {/* <div className={menuStyle}>
        <div className="menu" onMouseOut={() => setMenuVisible(false)}>
          fjsdkfjalsdfjlasjldf
        </div>
      </div> */}
      <span className="title">CLN管理平台</span>
      <div className="header-user">{user.name}</div>
    </header>
  );
};

export default Header;
