import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
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

export default class SingleCustomerData extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      pagination: false,
      visible: false,
      single_assembly: [],
      assembly_cols: [],
      more_info: '',
    }
  }
  // more info
  moreModal = (more_info) => {
    this.setState({ more_visible: true, more_info, edit_mark: false, temp_mark: '' })
  }
  handleCancel = () => {
    this.setState({ more_visible: false })
  }
  componentDidMount() {
    const params = {}
    params.name = this.props.match.params.name
    this.get_singledata(params)
  }
  get_singledata = (params) => {
    request('/dashboard/customer/assembly', 'get', params)
      .then(res => {
        // console.log(res);
        this.setState({ loading: false })
        if (res && !res.code) {
          if (res.assembly && res.data) {
            const temp_cols = []
            temp_cols.push({
              title: '日期',
              dataIndex: 'date',
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
            this.setState({ single_assembly: res.data, })
            if (res.data.length > 50) {
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
          this.setState({ single_assembly: [], })
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
          <Breadcrumb.Item>
            <Link to={'/index/customer/assembly'}><span style={{ color: '#20a0ff' }}>客户组件状态</span></Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.match.params.name}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="overflow_auto">
            <Table rowKey="date" style={{ minWidth: '850px' }} dataSource={this.state.single_assembly} columns={this.state.assembly_cols} bordered pagination={this.state.pagination} loading={this.state.loading} />
          </div>
        </div>
        <Modal title={`${this.state.more_info.date  } 更多组件状态`} visible={this.state.more_visible} onCancel={this.handleCancel} footer={null}>
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
      </div>
    )
  }
}
