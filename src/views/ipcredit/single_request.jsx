import {
  Icon, Table, Button, Tooltip, DatePicker, Breadcrumb
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { request } from '../../../../apis/request'
import moment from 'moment'
import { Link } from 'react-router-dom'

class IpCreditSingleRequest extends React.Component {
  state = {
    requestList: [],
    loading: true,
  }
  componentDidMount() {
    this.get_requestList(this.props.match.params.name)
  }
  get_requestList = (name) => {
    request(`/dashboard/threatcenter/ipcredit_request?name=${name}`, 'get')
      .then(res => {
        this.setState({ loading: false })
        if (res && !res.code) {
          this.setState({ requestList: res.data })
        } else {
          this.setState({ requestList: [], })
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          Modal.warning({
            title: text
          })
        }
      })
  }
  render() {
    const columns = [{
      title: '序号',
      key: 'index',
      width: '50px',
      render: (text, record, index) => {
        if (moment(record.expire_time).unix() < moment(record.date).unix()) {
          return <span>{index + 1}<Tooltip title="该客户license已经到期"><Icon style={{ fontSize: 12, marginLeft: 5, color: 'red' }} type="question-circle" /></Tooltip></span>
        }
        return index + 1
      }
    }, {
      title: '调用日期',
      dataIndex: 'date',
      key: 'date',
      width: '140px'
    }, {
      title: '请求数',
      dataIndex: 'request',
      key: 'request',
      width: '150px',
    }, {
      title: '请求IP数',
      dataIndex: 'ip',
      key: 'ip',
      width: '150px',
    }, {
      title: 'License到期时间',
      dataIndex: 'expire_time',
      key: 'expire_time',
      width: '150px',
    }, {
      title: 'License类型',
      dataIndex: 'type',
      key: 'type',
      width: '100px',
      render: (text, record, index) => {
        return text == 1 ? <span>测试用户</span> : <span>签约用户</span>
      }
    }]
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item><Link to="/index/ipcredit/request"><span style={{ color: '#20a0ff' }}>接口调用统计信息</span></Link></Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.match.params.name}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="overflow_auto">
            <Table rowKey="date" dataSource={this.state.requestList} columns={columns} bordered pagination={false} loading={this.state.loading}
              style={{ minWidth: '900px' }} />
          </div>
        </div>
      </div>
    )
  }
}

export default IpCreditSingleRequest = IpCreditSingleRequest
