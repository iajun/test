import { Breadcrumb, Icon, Table, Input, Modal } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import request from "@api/tools/request"
const Search = Input.Search

export default class Record extends React.Component {
  state = {
    recordlist: [],
    pagination: false,
    visible: false,
    loading: true,
  }
  searchRecord = (value) => {
    const params = {}
    params.limit = 200
    params.offset = 0
    params.content = value
    request('/dashboard/record/list', 'get', params)
      .then(res => {
        // console.log(res);
        if (res && !res.code) {
          this.setState({
            recordlist: res.data,
            loading: false
          })
          if (res && res.data && res.data.length > 50) {
            this.setState({
              pagination: { pageSize: 50 },
            })
          } else {
            this.setState({
              pagination: false,
            })
          }
        } else {
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
  componentWillMount() {
    const params = {}
    params.limit = 200
    params.offset = 0
    request('/dashboard/record/list', 'get', params)
      .then(res => {
        // console.log(res);
        if (res && !res.code) {
          this.setState({
            recordlist: res.data,
            loading: false
          })
          if (res && res.data && res.data.length > 50) {
            this.setState({
              pagination: { pageSize: 50 },
            })
          } else {
            this.setState({
              pagination: false,
            })
          }
        } else {
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
    const columns = [{
      title: 'id',
      dataIndex: 'id',
      width: '50px'
    }, {
      title: 'IP',
      dataIndex: 'ip',
      width: '130px'
    }, {
      title: '时间',
      dataIndex: 'ctime',
      width: '16%'
    }, {
      title: '内容',
      dataIndex: 'content',
      render: (text, record) => {
        let record_info = ''
        if (record.mark) {
          record_info = `${text  }。${  record.mark}`
        } else {
          record_info = text
        }
        function createMarkup() {
          return { __html: record_info }
        }
        return <span dangerouslySetInnerHTML={createMarkup()} />
      }
    }]
    return (
      <div>
        <Breadcrumb style={{ margin: '12px 0' }}>
          <Breadcrumb.Item>操作记录</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
          <div>
            <Search
              placeholder="请输入需要查询的内容"
              style={{ width: 230, marginBottom: '20px' }}
              onSearch={this.searchRecord.bind(this)}
            />
          </div>
          <p>显示最近200条操作记录</p>
          <div className="overflow_auto">
            <Table rowKey="id" style={{ minWidth: '600px' }} dataSource={this.state.recordlist} columns={columns} bordered pagination={this.state.pagination} loading={this.state.loading} />
          </div>
        </div>
      </div>
    )
  }
}
