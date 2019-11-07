import { Layout, } from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
const { Footer } = Layout

export default class PCLayout extends React.Component {

  componentWillMount() {

  }

  render() {
    return (
      <Footer style={{ textAlign: 'center' }}>
            Admin ©{moment().format('YYYY')} Created by BaishanCloud
      </Footer>
    )
  }
}
