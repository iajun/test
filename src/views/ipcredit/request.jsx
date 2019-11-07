import {
  Icon, Table, Button, Tooltip, DatePicker, Breadcrumb, Modal
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { request } from '../../../../apis/request'
import moment from 'moment'
import { Link } from 'react-router-dom'

class IpCreditRequest extends React.Component {
  state = {
    requestList: [],
    loading: true,
    date: moment(moment().subtract(1, 'day').format('YYYY-MM-DD'), 'YYYY-MM-DD')
  }
  componentDidMount() {
    this.get_requestList(moment().subtract(1, 'day').format('YYYY-MM-DD'))
  }
  onChange = (date, dateString) => {
    this.get_requestList(dateString)
  }
  disabledDate = (current) => {
    return current && current.valueOf() > moment().subtract(1, 'day').format('x')
  }
  get_requestList = (date) => {
    request(`/dashboard/threatcenter/ipcredit_request?date=${date}`, 'get')
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
            title: text,
          })
        }
      })
  }
  render() {
    const title_count = this.state.count != 'count' ? `客户名（${  this.state.count  }个）` : `客户名（${  this.state.customerlist.length  }个）`
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
      title: '公司名称',
      dataIndex: 'company',
      key: 'company',
      width: '140px',
      render: (text) => {
        return <Link to={`/index/ipcredit/request/${text}`}><span style={{ color: '#20a0ff' }}>{text}</span></Link>
      }
    }, {
      title: '请求数',
      dataIndex: 'request',
      key: 'request',
      width: '150px',
      sorter: (a, b) => a.request - b.request,
    }, {
      title: '请求IP数',
      dataIndex: 'ip',
      key: 'ip',
      width: '150px',
      sorter: (a, b) => a.ip - b.ip,
    }, {
      title: 'License到期时间',
      dataIndex: 'expire_time',
      key: 'expire_time',
      width: '150px',
    }, {
      title: 'License类型',
      dataIndex: 'type',
      key: 'type',
      width: '100',
      render: (text, record, index) => {
        return text == 1 ? <span>测试用户</span> : <span>签约用户</span>
      }
    }]
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>接口调用统计信息</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <DatePicker onChange={this.onChange} disabledDate={this.disabledDate} style={{ marginBottom: 10 }} defaultValue={this.state.date} />
          <div className="overflow_auto">
            <Table rowKey="company" dataSource={this.state.requestList} columns={columns} bordered pagination={false} loading={this.state.loading}
              style={{ minWidth: '900px' }} />
          </div>
        </div>
      </div>
    )
  }
}

export default IpCreditRequest = IpCreditRequest
