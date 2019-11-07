import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  DatePicker,
  Tooltip,
  Row,
  Col,
  message,
  Modal,
  Select,
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { request } from '../../../../apis/request'
import moment from 'moment'
import { monitorType, monitorName, atd_monitor, deep_monitor, op_monitor, interface_monitior, web_monitor, type_content } from '../../../../components/monitor_type'
import { store } from '@/pages/index/redux/store'
import { connect } from 'react-redux'
import { int_thousand } from '../../../../components/format'
import echarts from 'echarts'
const { RangePicker } = DatePicker
const Option = Select.Option

message.config({
  top: 100,
  duration: 1.6,
})
class tracePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pagination: false,
      loading: true,
      companyList: [],
      startTime: moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      selectTime: [moment(moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00')), moment()],
      company: ['全部'],
      selectCompany: '全部',
      pageList: [],
      pageName: '',
      fromVisible: false,
      toVisible: false,
      detailVisible: false,
      fromInfo: [],
      toInfo: [],
      detailInfo: [],
      selectRole: 'customer'
    }
  }
  componentWillMount() {
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    if (this.state.selectRole) {
        params.role = this.state.selectRole;
    }
    this.get_tracePath(params)
  }
  componentDidMount() {
  }
  onChange = (value, dateString) => {
    this.setState({ selectTime: value })
  }
  onOk = (value) => {
    const params = {}
    params.start = moment(value[0]).format('YYYY-MM-DD HH:mm:ss')
    params.end = moment(value[1]).format('YYYY-MM-DD HH:mm:ss')
    if (this.state.selectCompany != '全部') {
      params.company = this.state.selectCompany
    }
    if (this.state.selectRole) {
        params.role = this.state.selectRole;
    }
    this.get_tracePath(params)
    this.setState({ startTime: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(value[1]).format('YYYY-MM-DD HH:mm:ss') }, function () {
      this.setState({ selectTime: value })
    })

  }
  openChange = (status) => {
    if (!status) {
      if (moment(this.state.selectTime[0]).format('YYYY-MM-DD HH:mm:ss') != this.state.startTime || moment(this.state.selectTime[1]).format('YYYY-MM-DD HH:mm:ss') != this.state.endTime) {
        this.setState({ selectTime: [moment(this.state.startTime), moment(this.state.endTime)] })
      }
    }
  }
  companyChange = (value) => {
    this.setState({ selectCompany: value })
    const params = {}
    if (value && value != '全部') {
      params.company = value
    }
    if (this.state.selectRole) {
        params.role = this.state.selectRole;
    }
    params.start = this.state.startTime
    params.end = this.state.endTime
    this.get_tracePath(params)
  }
  roleChange = (value) => {
    this.setState({ selectRole: value })
    const params = {}
    if (value) {
        params.role = value;
    }
    if (this.state.selectCompany != '全部') {
      params.company = this.state.selectCompany
    }
    params.start = this.state.startTime
    params.end = this.state.endTime
    this.get_tracePath(params)
  }
  // 页面来源情况
  clickFrom = (from, name) => {
    this.setState({
      fromVisible: true,
      fromInfo: from,
      pageName: name
    })
  }
  // 页面去哪儿情况
  clickTo = (to, name) => {
    this.setState({
      toVisible: true,
      toInfo: to,
      pageName: name
    })
  }
  // 访问详情
  clickDetail = (detail, name) => {
    this.setState({ loading: true })
    this.setState({
      detailVisible: true,
      detailInfo: detail,
      pageName: name
    })
  }
  hideModal = () => {
    this.setState({
      loading: false,
      fromVisible: false,
      toVisible: false,
      detailVisible: false,
    })
  }
  get_tracePath = (params) => {
    this.setState({ loading: true })
    request('/dashboard/customer/track_path', 'get', params)
      .then(res => {
        this.setState({ loading: false, })
        if (res && !res.code) {
          const company = this.state.company
          if (res.company) {
            for (const key of res.company) {
              if (company.indexOf(key.company) == -1) {
                company.push(key.company)
              }
            }
            this.setState({ company })
          }
          if (res.name) {
            if (res.name.length > 30) {
              this.setState({
                pagination: {
                  total: res.name.length,
                  showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 条记录，共 ${total} 条`,
                  pageSize: 30
                }
              })
            } else {
              this.setState({ pagination: false })
            }
            this.setState({ pathList: res.name })
        }else {
            this.setState({ pathList: [] })
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
    const { isMobile } = this.props
    const { customerlist, selectedTags } = this.state
    const switchWidth = isMobile ? 12 : 8
    const columns = [
      {
        title: '序号',
        width: '50px',
        key: 'index',
        render: (text, record, index) => (index + 1)
      }, {
        title: '页面名',
        width: '18%',
        dataIndex: 'name',
      }, {
        title: '总访问次数',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (text) => (int_thousand(text))
      }, {
        title: '总访问时间(秒)',
        dataIndex: 'time',
        sorter: (a, b) => a.time - b.time,
        render: (text) => (int_thousand(text))
      }, {
        title: '平均访问时间(秒)',
        dataIndex: 'avg',
        sorter: (a, b) => a.avg - b.avg
      }, {
        title: 'From',
        key: 'from',
        render: (text, record) => {
          return (
            <Tooltip title="来源情况" placement="top">
              <a onClick={this.clickFrom.bind(this, record.from, record.name)}><Icon type="login" style={{
                fontSize: 15,
              }} /></a>
            </Tooltip>
          )
        }
      }, {
        title: 'To',
        key: 'end',
        render: (text, record) => {
          return (
            <Tooltip title="去往情况" placement="top">
              <a onClick={this.clickTo.bind(this, record.to, record.name)}><Icon type="logout" style={{
                fontSize: 15,
              }} /></a>
            </Tooltip>
          )
        }
      }, {
        title: '访问详情',
        key: 'detail',
        width: '100px',
        render: (text, record) => {
          return (
            <Tooltip title="查看访问详情" placement="top">
              <a onClick={this.clickDetail.bind(this, record.list, record.name)}><Icon type="exception" style={{
                fontSize: 15,
              }} /></a>
            </Tooltip>
          )
        }
      },
    ]
    const fromColumns = [
      {
        title: '序号',
        width: '50px',
        key: 'index',
        render: (text, record, index) => (index + 1)
      }, {
        title: '来源页面',
        key: 'name',
        render: (text, record) => record.name
      }, {
        title: '次数',
        key: 'count',
        render: (text, record) => (int_thousand(record.count))
      }
    ]
    const toColumns = [
      {
        title: '序号',
        width: '50px',
        key: 'index',
        render: (text, record, index) => (index + 1)
      }, {
        title: '去往页面',
        key: 'name',
        render: (text, record) => record.name
      }, {
        title: '次数',
        key: 'count',
        render: (text, record) => (int_thousand(record.count))
      }
    ]
    const detailColumns = [
      {
        title: '序号',
        width: '50px',
        key: 'index',
        render: (text, record, index) => (index + 1)
      }, {
        title: '日期',
        width: '150px',
        key: 'date',
        dataIndex: 'date'
      }, {
        title: '客户名',
        width: '10%',
        dataIndex: 'company',
        key: 'company',
      }, {
        title: '用户',
        key: 'user',
        dataIndex: 'user'
      }, {
        title: '停留时间（秒）',
        key: 'time',
        dataIndex: 'time'
      }, {
        title: 'start',
        key: 'start_name',
        dataIndex: 'start_name'
      }, {
        title: 'end',
        key: 'end_name',
        dataIndex: 'end_name'
      }, {
        title: '用户UA',
        width: '25%',
        key: 'user_agent',
        dataIndex: 'user_agent'
      },
    ]
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>页面访问情况</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="mb25" style={{ marginTop: '10px', display: 'inline-block', marginRight: '30px' }}>
            <RangePicker
              defaultValue={[moment(this.state.startTime), moment(this.state.endTime)]}
              value={this.state.selectTime}
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD"
              placeholder={['开始时间', '结束时间']}
              onChange={this.onChange}
              onOk={this.onOk}
              onOpenChange={this.openChange}
              style={{ width: '230px' }}
            />
          </div>
          <div className="mb25" style={{ display: 'inline-block' }}>
            <h4 style={{ display: 'inline-block', marginRight: '10px', }}>客户名称（{this.state.company.length - 1}个）:</h4>
            <Select
              showSearch
              defaultValue={this.state.company[0]}
              value={this.state.selectCompany}
              placeholder="请选择客户名称"
              showArrow={true}
              onChange={this.companyChange}
              style={{ width: 180 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              {this.state.company.map((company, index) => {
                return <Option key={company}>{company}</Option>
              })}
            </Select>
          </div>
          <div className="mb25" style={{ display: 'inline-block' }}>
            <h4 style={{ display: 'inline-block', margin: '0px 16px', }}>访问人员:</h4>
            <Select
              showSearch
              defaultValue='customer'
              value={this.state.selectRole}
              placeholder="请选择访问人员"
              showArrow={true}
              onChange={this.roleChange}
              style={{ width: 100 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
                <Option value="">全部</Option>
                <Option value="customer">客户访问</Option>
                <Option value="bsc">白山访问</Option>
            </Select>
          </div>
          <div className="overflow_auto">
            <Table dataSource={this.state.pathList} columns={columns} bordered pagination={false} loading={this.state.loading} rowKey="name" />
          </div>
          <Modal
            title={`${this.state.pageName  }来源情况`}
            visible={this.state.fromVisible}
            footer={null}
            onCancel={this.hideModal}
            width={550}
          >
            <div className="overflow_auto">
              <Table dataSource={this.state.fromInfo} columns={fromColumns} bordered pagination={false} rowKey="name" />
            </div>
          </Modal>
          <Modal
            title={`${this.state.pageName  }去往情况`}
            visible={this.state.toVisible}
            footer={null}
            onCancel={this.hideModal}
            width={550}
          >
            <div className="overflow_auto">
              <Table dataSource={this.state.toInfo} columns={toColumns} bordered pagination={false} rowKey="name" />
            </div>
          </Modal>
          <Modal
            title={`${this.state.pageName  }访问情况`}
            visible={this.state.detailVisible}
            footer={null}
            onCancel={this.hideModal}
            width={1150}
          >
            <div className="overflow_auto">
              <Table dataSource={this.state.detailInfo} columns={detailColumns} bordered pagination={false} rowKey="id" />
            </div>
          </Modal>
        </div>
        <style>
          {`
                    .BleftBorder {
                        border-left: 5px solid #1890ff;
                        padding-left: 10px;
                        margin-bottom: 10px;
                    }
                    `}
        </style>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isMobile: state.isMobile
  }
}

export default tracePage = connect(mapStateToProps)(tracePage)
