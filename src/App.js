/*
 * @Author: your name
 * @Date: 2019-11-06 19:11:26
 * @LastEditTime: 2019-11-06 19:15:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /test/src/App.js
 */
import { LocaleProvider } from 'igroot'
import React from 'react'
import { HashRouter as Router, Link, Route, Switch, Redirect } from 'react-router-dom'
import { store } from './redux/store'
import './index.scss'
import '@'
import PCLogin from './views/login/pc_login'
import PCLayout from './views/layout/pc_layout'
import Cookies from 'universal-cookie'
import zh_CN from 'igroot/lib/locale-provider/zh_CN'

const cookies = new Cookies()

class App extends React.Component {
  state = {
    isLogin: ''
  }

  //组件挂载前判断是否登录
  componentWillMount() {
    this.setState({ isLogin: !!cookies.get('access_token') })
  }

  render() {
    store.subscribe(() => {
      const state = store.getState()
      if (state.isLogin == 'login') {
        this.setState({ 'isLogin': true })
      } else if (state.isLogin == 'logout') {
        this.setState({ 'isLogin': false })
      }
    })
    const PrivateRoute = ({ component: Component, ...rest }) => (
      <Route {...rest} render={props => (
        this.state.isLogin ? (
          <Component {...props} />
        ) : (
          <Redirect to={{
            pathname: '/login',
            state: { from: props.location }
          }} />
        )
      )} />
    )
    return (
      <LocaleProvider locale={zh_CN}><Router>
      <div>
        <Route exact path="/" render={() => (
          <Redirect to="/index" />
        )} />
        <Route path="/login" component={PCLogin} />
        <PrivateRoute path="/index" component={PCLayout} />
      </div>
    </Router></LocaleProvider>

    )
  }
}

export default App