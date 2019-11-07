import { Layout, Menu, Breadcrumb, Icon } from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import PCHeader from './pc_header'
import PCContent from './pc_content'
import PCFooter from './pc_footer'
import PCSidebar from './pc_sidebar'
import { store } from '@/pages/index/redux/store'
const { SubMenu } = Menu
const { Header, Content, Footer, Sider } = Layout

export default class PCLayout extends React.Component {
  state = {
    collapsed: false,
    isMobile: false,
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  };
  getClientWidth = () => {    // 获取当前浏览器宽度并设置responsive管理响应式
    const clientWidth = document.body.clientWidth
    // console.log(clientWidth);
    if (clientWidth <= 768) {
      store.dispatch({ type: 'mobile' })
      this.setState({ isMobile: true })
    } else {
      store.dispatch({ type: 'pc' })
      this.setState({ isMobile: false })
    }
  };
  componentWillMount() {
    this.getClientWidth()
    window.onresize = () => {
      // console.log('屏幕变化了');
      this.getClientWidth()
      // console.log(document.body.clientWidth);
    }
  }
  render() {
    return (
      <Layout className="ant-layout-has-sider" style={{ minHeight: '100vh' }}>
        {!this.state.isMobile && <PCSidebar collapsed={this.state.collapsed} />}
        <Layout>
          <PCHeader toggle={this.toggle} />
          <PCContent style={{ margin: '0 16px', overflow: 'initial' }} >
          </PCContent>
          <PCFooter />
        </Layout>
      </Layout>
    )
  }
}
