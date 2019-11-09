import {
  Breadcrumb,
  Table,
  Modal,
} from 'antd'
import React from 'react'
import request from "@api/tools/request"
import { Link } from 'react-router-dom'
import { secFormat } from "@util/tools"

class SingleCustomerVersion extends React.Component {
  state = {
    versionList: [],
    version_cols: [],
    loading: true,
    pagination: false,
  }
  componentDidMount() {
    const params = {}
    params.name = this.props.match.params.name
    this.get_singleversion(params)
  }
  get_singleversion = (params) => {
    request('/dashboard/customer/version', 'get', params)
      .then(res => {
        this.setState({ loading: false })
        if (res && !res.code) {
          const temp_cols = []
          temp_cols.push({
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            width: '120px',
          })
          if (res.length > 0) {
            for (const value of Object.keys(res[0].data)) {
              temp_cols.push({
                title: value,
                dataIndex: `${'data' + '.'}${  value}`,
                width: "65px",
              })
            }
            temp_cols.push({
              title: '运行时间',
              dataIndex: 'run_time',
              key: 'run_time',
              width: '50px',
              render: text => secFormat(text)
            })
            this.setState({ version_cols: temp_cols, versionList: res })
            if (res.length > 50) {
              this.setState({
                pagination: { pageSize: 50 },
              })
            } else {
              this.setState({
                pagination: false,
              })
            }
          }
        } else {
          this.setState({ versionList: [], })
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


    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item><Link to={'/index/customer/version'}><span style={{ color: '#20a0ff' }}>客户版本信息</span></Link></Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.match.params.name}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="overflow_auto">
            <Table rowKey="date" dataSource={this.state.versionList} columns={this.state.version_cols} bordered pagination={false} loading={this.state.loading}
              style={{ minWidth: '900px' }} />
          </div>
        </div>
      </div>
    )
  }
}

export default SingleCustomerVersion
