import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Tabs,
  Row,
  Col,
  Progress
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { request } from '../../../../apis/request'
import { int_thousand, formatM } from '../../../../components/format'
import Cookies from 'universal-cookie'
import moment from 'moment'
const cookies = new Cookies()
const FormItem = Form.Item
const TabPane = Tabs.TabPane

export default class CustomerAssembly extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mode: 'top',
      loading: true,
      pagination: false,
      visible: false,
      assembly_data: [],
      panes: [],
      activeKey: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      assembly_cols: [],
      more_info: '',
    }
  }
  changeTab = (e) => {
    this.setState({ loading: true, activeKey: e })
    const params = {}
    params.start = e
    params.end = e
    this.get_assemblydata(params)
  }
  onChange = (date, dateString) => {
    if (date) {
      let panes = this.state.panes
      panes = []
      this.setState({ panes })
      for (let i = 15; i > 0; i--) {
        const title = moment(date).subtract(i - 1, 'day').format('YYYY-MM-DD')
        panes.push({ title, key: title })
        if (i == 1) {
          const params = {}
          params.start = title
          params.end = title
          this.get_assemblydata(params)
        }
      }
      this.setState({ panes })
      this.setState({ activeKey: dateString })
    }
  }
  disabledDate = (current) => {
    // Can not select days
    return current && current.valueOf() > moment().subtract(1, 'day').format('x')
  }
  // more info
  moreModal = (more_info) => {
    this.setState({ more_visible: true, more_info, edit_mark: false, temp_mark: '' })
  }
  handleCancel = () => {
    this.setState({ more_visible: false })
  }
  componentDidMount() {
    const panes = this.state.panes
    for (let i = 15; i > 0; i--) {
      const title = moment().subtract(i, 'day').format('YYYY-MM-DD')
      panes.push({ title, key: title })
      if (i == 1) {
        const params = {}
        params.start = title
        params.end = title
        this.get_assemblydata(params)
      }
    }
    this.setState({ panes })
    this.setState({ activeKey: moment().subtract(1, 'day').format('YYYY-MM-DD') })
    const today_time = moment().subtract(2, 'day').format('YYYY-MM-DD')

  }
  get_assemblydata = (params) => {
    request('/dashboard/customer/assembly', 'get', params)
      .then(res => {
        // console.log(res);
        this.setState({ loading: false })
        if (res && !res.code) {
          if (res.assembly && res.data) {
            res.data.sort(function (a, b) {
              return a.expired_day - b.expired_day
            })
            const temp_cols = []
            temp_cols.push({
              title: `客户名（${  res.data.length  }个）`,
              dataIndex: 'name',
              width: '160px',
              render: (text, record) => {
                if (record.expired_day - 0) {
                  return <Link to={`/index/customer/assembly/${text}`}><Tooltip title={`已到期${record.expired_day  }天`}><span style={{ color: 'red' }}>{text}</span></Tooltip></Link>
                } else {
                  return <Link to={`/index/customer/assembly/${text}`}><span style={{ color: '#20a0ff' }}>{text}</span></Link>
                }
              }
            })
            for (const value of res.assembly) {
              if (value == 'es_index' || value == 'es_capacity_kb') {
                continue
              }
              temp_cols.push({
                title: value,
                dataIndex: `${'assembly' + '.'}${  value}`,
                render: (text) => {
                  if (!!text && text.value) {
                    if (text.value == 'normal') {
                      return '正常'
                    } else if (text.value == 'abnormal') {
                      return <span style={{ color: 'red' }}> 异常 </span>
                    } else {
                      return text.value
                    }
                  } else {
                    return ''
                  }
                }
              })
            }
            temp_cols.push({
              title: '更多',
              key: 'more',
              width: '45px',
              render: (text, record) => (
                <Tooltip title="查看更多信息"><a onClick={this.moreModal.bind(this, record)}><Icon type="ellipsis" /></a></Tooltip>
              )
            })
            this.setState({ assembly_cols: temp_cols })
            this.setState({ assembly_data: res.data, })
            if (res.data.length > 50) {
              this.setState({
                pagination: {
                  total: res.length,
                  showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 个客户，共 ${total} 个客户`,
                  pageSize: 50
                },
              })
            } else {
              this.setState({
                pagination: false,
              })
            }
          }

        } else {
          this.setState({ assembly_data: [], })
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
    const { mode } = this.state
    const disk_cols = [
      {
        title: 'host',
        dataIndex: 'host',
        width: '125px'
      }, {
        title: '容量',
        dataIndex: 'capacity',
        render: (text, record) => {
          const use_kb = record.total_kb - record.available_kb
          // percent = eval(usekb / disk[i].total_kb).toFixed(2);
          const percent = eval((use_kb / record.total_kb) * 100).toFixed(0) - 0
          if (percent < 80) {
            return <div style={{ display: 'flex', alignItems: 'center' }}><Progress percent={percent} style={{ width: '45%' }} /><span> {`(${  formatM(use_kb)}`}</span><span>{`/${  formatM(record.total_kb)  })`} </span></div>
          } else {
            return <div style={{ display: 'flex', alignItems: 'center' }}><Progress percent={percent} style={{ width: '30%' }} status="exception" showInfo={false} /><span>&nbsp;{`${percent  }%` + '('}<span style={{ color: 'red' }}>{formatM(use_kb)}</span>{`/${  formatM(record.total_kb)  })`}</span></div>
          }
        }

      }
    ]
    const es_capacity = this.state.more_info.assembly ? (this.state.more_info.assembly.es_capacity_kb ? <div>{formatM(this.state.more_info.assembly.es_capacity_kb.value)}</div> : null) : null
    const es_index = this.state.more_info.assembly ? (this.state.more_info.assembly.es_index ? <div>{int_thousand(this.state.more_info.assembly.es_index.value)}</div> : null) : null
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>客户组件状态</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <DatePicker onChange={this.onChange} disabledDate={this.disabledDate} />
          <Tabs
            defaultActiveKey={this.state.activeKey}
            activeKey={this.state.activeKey}
            tabPosition={mode}
            onTabClick={this.changeTab}
            style={{ marginTop: '10px' }}
          >
            {this.state.panes.map(pane =>
              <TabPane tab={pane.title} key={pane.key}>
                <div className="overflow_auto">
                  <Table rowKey="name" style={{ minWidth: '850px' }} dataSource={this.state.assembly_data} columns={this.state.assembly_cols} bordered pagination={this.state.pagination} loading={this.state.loading} />
                </div>
              </TabPane>)}
          </Tabs>
        </div>
        <Modal title={`${this.state.more_info.name  } 更多组件状态`} visible={this.state.more_visible} onCancel={this.handleCancel} footer={null}>
          <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Col span={6}>
              <div style={{ float: 'right', wordBreak: 'break-all' }}>Elasticsearch：</div>
            </Col>
            <Col span={18} style={{ border: '1px solid #e9e9e9', padding: '8px' }}>
              <Row >
                <Col span={7}>
                  <div >容量：</div>
                </Col>
                <Col span={8} style={{ marginLeft: '15px' }}>
                  {es_capacity}
                </Col>
              </Row>
              <Row>
                <Col span={7}>
                  <div >索引数：</div>
                </Col>
                <Col span={8} style={{ marginLeft: '15px' }}>
                  {es_index}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <Col span={6}>
              <div style={{ float: 'right' }}>磁盘：</div>
            </Col>
            <Col span={18} style={{ wordBreak: 'break-all' }} className="overflow_auto">
              <Table style={{ minWidth: '360px' }} dataSource={this.state.more_info.disk} columns={disk_cols} bordered pagination={false} />
            </Col>
          </Row>
        </Modal>
        <style>
          {`
                        .ant-progress-text {
                            margin-left: 0;
                            width: 2.2em;
                        }
                    `}
        </style>
      </div>
    )
  }
}
