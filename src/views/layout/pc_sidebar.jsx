import { Layout, Menu, Icon } from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { request } from '../../../../apis/request'
const { SubMenu } = Menu
const MenuItemGroup = Menu.ItemGroup
const { Sider } = Layout

export default class PCSidebar extends React.Component {
  state = {
    collapsed: false,
    mode: 'inline',
    defaultOpenKeys: '',
    defaultSelectedKeys: '',
    openKey: '',
    selectedKey: '',
    firstHide: false,        // 点击收缩菜单，第一次隐藏展开子菜单，openMenu时恢复
    kind: ''
  }
  menuClick = e => {
    this.setState({
      selectedKey: location.hash.replace(/#/g, ''),
      openKey: location.hash.replace(/#/g, '').split('/')[2]
    })
  };
  openMenu = v => {
    this.setState({
      openKey: v[v.length - 1],
      firstHide: false,
    })
  };
  componentDidMount() {
    let select_key = ''
    if ((location.hash.replace(/#/g, '').split('/')).length > 4) {
      select_key = (location.hash.replace(/#/g, '').split('/')).slice(0, 4).join('/')
    } else {
      select_key = location.hash.replace(/#/g, '')
    }
    if (select_key == '/index') {
      this.setState({
        selectedKey: '/index/customer/list',
        openKey: 'customer'
      })
    } else {
      this.setState({
        selectedKey: select_key,
        openKey: location.hash.replace(/#/g, '').split('/')[2]
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    let select_key = ''
    if ((location.hash.replace(/#/g, '').split('/')).length > 4) {
      select_key = (location.hash.replace(/#/g, '').split('/')).slice(0, 4).join('/')
    } else {
      select_key = location.hash.replace(/#/g, '')
    }
    if (select_key == '/index') {
      this.setState({
        selectedKey: '/index/customer/list',
        openKey: 'customer'
      })
    } else {
      this.setState({
        selectedKey: select_key,
        openKey: location.hash.replace(/#/g, '').split('/')[2]
      })
    }
    if (nextProps.collapsed) {
      this.setState({
        firstHide: true
      })
    } else {
      this.setState({
        firstHide: false
      })
    }
  }
  render() {
    const logo_content = this.state.collapsed ? null : <span> CLN平台管理 </span>
    return (
      <Sider
        trigger={null}
        breakpoint="lg"
        collapsed={this.props.collapsed}
      >
        <div className="logo">
          <img style={{ width: '80px', height: '65px' }} src="static/logo_white.svg" />
        </div>
        <Menu
          onClick={this.menuClick}
          theme="dark"
          mode="inline"
          defaultOpenKeys={[this.state.defaultOpenKeys]}
          defaultSelectedKeys={[this.state.defaultSelectedKeys]}
          selectedKeys={[this.state.selectedKey]}
          openKeys={this.state.firstHide ? null : [this.state.openKey]}
          onOpenChange={this.openMenu}
        >
          <SubMenu
            key="admin"
            title={<span><Icon type="user" /><span className="nav-text">用户管理</span></span>}
          >
            <Menu.Item key="/index/admin/list"><Link to={'/index/admin/list'}>用户列表</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="customer"
            title={<span><Icon type="contacts" /><span className="nav-text">ATD客户管理</span></span>}
          >
            <Menu.Item key="/index/customer/list"><Link to={'/index/customer/list'}>客户信息</Link></Menu.Item>
            <Menu.Item key="/index/customer/agent"><Link to={'/index/customer/agent'}>客户代理</Link></Menu.Item>
            <Menu.Item key="/index/customer/version"><Link to={'/index/customer/version'}>版本信息</Link></Menu.Item>
            <Menu.Item key="/index/customer/data"><Link to={'/index/customer/data'}>运营情况</Link></Menu.Item>
            <Menu.Item key="/index/customer/assembly"><Link to={'/index/customer/assembly'}>组件状态</Link></Menu.Item>
            <Menu.Item key="/index/customer/demo"><Link to={'/index/customer/demo'}>演示账号</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="ipcredit"
            title={<span><Icon type="api" /><span className="nav-text">威胁情报中心</span></span>}
          >
            <Menu.Item key="/index/ipcredit/customer"><Link to={'/index/ipcredit/customer'}>客户情况</Link></Menu.Item>
            <Menu.Item key="/index/ipcredit/request"><Link to={'/index/ipcredit/request'}>接口调用情况</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="monitor"
            title={<span><Icon type="bell" /><span className="nav-text">报警管理</span></span>}
          >
            <Menu.Item key="/index/monitor/staff"><Link to={'/index/monitor/staff'}>报警接收</Link></Menu.Item>
            <Menu.Item key="/index/monitor/config"><Link to={'/index/monitor/config'}>报警开关</Link></Menu.Item>
            <Menu.Item key="/index/monitor/analysis"><Link to={'/index/monitor/analysis'}>报警统计</Link></Menu.Item>
            <Menu.Item key="/index/monitor/detail"><Link to={'/index/monitor/detail'}>报警详情</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="trace"
            title={<span><Icon type="dot-chart" /><span className="nav-text">数据分析</span></span>}
          >
            <Menu.Item key="/index/trace/path"><Link to={'/index/trace/path'}>客户访问情况</Link></Menu.Item>
            <Menu.Item key="/index/trace/page"><Link to={'/index/trace/page'}>页面访问情况</Link></Menu.Item>
            <Menu.Item key="/index/trace/click"><Link to={'/index/trace/click'}>页面点击情况</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="product"
            title={<span><Icon type="bars" /><span className="nav-text">更新记录</span></span>}
          >
            <Menu.Item key="/index/product/atd"><Link to={'/index/product/atd'}>ATD</Link></Menu.Item>
            <Menu.Item key="/index/product/cache"><Link to={'/index/product/cache'}>API加速</Link></Menu.Item>
            <Menu.Item key="/index/product/gateway"><Link to={'/index/product/gateway'}>API网关</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="prototype"
            title={<span><Icon type="credit-card" /><span className="nav-text">产品原型</span></span>}
          >
            <Menu.Item key="/index/prototype/atd_private_cloud"><Link to={'/index/prototype/atd_private_cloud'}>ATD - 私有云</Link></Menu.Item>
            <Menu.Item key="/index/prototype/atd_public_cloud"><Link to={'/index/prototype/atd_public_cloud'}>ATD - 公有云</Link></Menu.Item>
            <Menu.Item key="/index/prototype/threat_intelligence_center"><Link to={'/index/prototype/threat_intelligence_center'}>威胁情报中心</Link></Menu.Item>
            <Menu.Item key="/index/prototype/tender"><Link to={'/index/prototype/tender'}>招标项目</Link></Menu.Item>
            <Menu.Item key="/index/prototype/other"><Link to={'/index/prototype/other'}>其他项目</Link></Menu.Item>
          </SubMenu>
          <SubMenu
            key="exam"
            title={<span><Icon type="calculator" /><span className="nav-text">考试管理</span></span>}
          >
            <Menu.Item key="/index/exam/question"><Link to={'/index/exam/question'}>试题管理</Link></Menu.Item>
            <Menu.Item key="/index/exam/paper"><Link to={'/index/exam/paper'}>试卷管理</Link></Menu.Item>
          </SubMenu>
        </Menu>
        <style>
          {`
            #nprogress .spinner{
              left: ${this.state.collapsed ? '70px' : '206px'};
              right: 0 !important;
            }
            .logo {
              display: flex;
              height: 65px;
              line-height: 65px;
              border-radius: 6px;
              font-size: 18px;
              color: white;
              img {
                  width: 60px;
                  height: 60px;
              }
            }
          `}
        </style>
      </Sider>
    )
  }
}
