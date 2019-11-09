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
} from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import request from "@api/tools/request"
import moment from 'moment'
import {  monitorType, monitorName, atd_monitor, deep_monitor, op_monitor, interface_monitior, web_monitor, type_content  } from "@cpt/monitor_type"
import { connect } from 'react-redux'
import {  int_thousand  } from "@cpt/format"
import {  export_xls  } from "@cpt/exportData"
import echarts from 'echarts'
const { RangePicker } = DatePicker
const Option = Select.Option

message.config({
  top: 100,
  duration: 1.6,
})
class tracePath extends React.Component {
  constructor(props) {
    super(props)
    // companyData 客户所有访问数据， pathList一次访问的路径信息
    this.state = {
      pagination: false,
      loading: true,
      companyList: [],
      startTime: moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      selectTime: [moment(moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00')), moment()],
      company: ['全部'],
      selectCompany: '全部',
      companyData: [],
      companyLoading: true,
      companyPagnition: false,
      pathModalVisible: false,
      pathList: [],
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
  // 点击客户访问详情
  clickCompany = (companyInfo) => {
    const temp_list = []
    temp_list.push(companyInfo)
    this.setState({ selectCompany: companyInfo.company, companyData: companyInfo.data, companyList: temp_list })
    if (companyInfo.data && companyInfo.data.length > 30) {
      this.setState({
        companyPagnition: {
          total: companyInfo.data.length,
          showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 条记录，共 ${total} 条`,
          pageSize: 30
        }
      })
    } else {
      this.setState({ companyPagnition: false })
    }
  }
  // 点击访问路径详情
  clickPath = (pathInfo) => {
    this.setState({
      pathModalVisible: true,
      pathList: pathInfo.list
    })
  }

  hideModal = () => {
    this.setState({
      pathModalVisible: false
    })
  }

  onExport = () => {
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    if (this.state.selectCompany != "全部") {
      params.company = this.state.selectCompany
    }
    if (this.state.selectRole) {
        params.role = this.state.selectRole;
    }
    request('/dashboard/customer/track_path_export', 'export', params);
  }
  exportPage = () => {
      let list = this.state.companyList
      let temp_content = []
      let temp_title = ["序号", "客户名", "访问次数", "总访问时间（秒）", "平均访问时间（秒）"]
      temp_content.push(temp_title)
      list.forEach((elem, index) => {
          temp_content.push([index + 1, elem.company, elem.count, elem.time, elem.avg])
      })
      let filename = this.state.startTime.slice(0, 10) + " - " + this.state.endTime.slice(0, 10) + " ATD客户访问情况.xls"
      export_xls(temp_content, filename)
  }

  get_tracePath = (params) => {
    this.setState({ loading: true, companyLoading: true })
    request('/dashboard/customer/track_path', 'get', params)
      .then(res => {
        this.setState({ loading: false, companyLoading: false })
        if (res && !res.code) {
          const company = this.state.company
          if (res.company) {
            for (const key of res.company) {
              if (company.indexOf(key.company) == -1) {
                company.push(key.company)
              }
            }
            if (this.selectCompany != '全部') {
              if (res.company[0] && res.company[0].data) {
                this.setState({ companyData: res.company[0].data })
                if (res.company[0].data.length > 30) {
                  this.setState({
                    companyPagnition: {
                      total: res.company[0].data.length,
                      showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 条记录，共 ${total} 条`,
                      pageSize: 30
                    }
                  })
                } else {
                  this.setState({ companyPagnition: false })
                }
              }
            }
            this.setState({ company, companyList: res.company })
        }else {
            this.setState({ companyList:[], companyData: [] })
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
        title: '客户名',
        width: '18%',
        dataIndex: 'company',
      }, {
        title: '访问次数',
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
        title: '访问详情',
        key: 'detail',
        width: '100px',
        render: (text, record) => {
          return (
            <Tooltip title="查看访问详情" placement="top">
              <a onClick={this.clickCompany.bind(this, record)}><Icon type="exception" style={{
                fontSize: 15,
              }} /></a>
            </Tooltip>
          )
        }
      },
    ]
    const companyColumns = [{
      title: '账号',
      dataIndex: 'user'
    }, {
      title: `账号标识（${this.state.companyData.length}）个`,
      dataIndex: 'unqid',
      render: (text) => (text.slice(0, 8))
    }, {
      title: '访问次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => b.count - a.count,
      render: (text) => (int_thousand(text))
    }, {
      title: '总访问时间(秒)',
      dataIndex: 'time',
      sorter: (a, b) => b.time - a.time,
      render: (text) => (int_thousand(text))
    }, {
      title: '平均访问时间(秒)',
      dataIndex: 'avg',
      sorter: (a, b) => b.avg - a.avg
    }]
    const pathColumns = [
      {
        title: '',
        width: '50px',
        key: 'index',
        render: (text, record, index) => (index + 1)
      },
      {
        title: '时间',
        dataIndex: 'date',
      }, {
        title: '访问页面',
        dataIndex: 'start_name',
      }, {
        title: '停留时间（秒）',
        dataIndex: 'time',
        key: 'time',
        render: (text) => (int_thousand(text))
      },
    ]
    // 展开行表格内容
    const expandedRowRender = (record) => {
      const columns = [
        { title: '序号', key: 'index', render: (text, record, index) => (index + 1) },
        { title: '开始访问时间', dataIndex: 'start', key: 'start' },
        { title: '结束访问时间', dataIndex: 'end', key: 'end' },
        { title: '访问时长（秒）', dataIndex: 'time', render: (text) => (int_thousand(text)) },
        { title: '页面平均时间（秒）', dataIndex: 'avg', },
        { title: '行为数', dataIndex: 'count', render: (text) => (int_thousand(text)) },
        {
          title: '路径详情',
          key: 'operation',
          render: (text, record) => {
            return (
              <Tooltip title="查看路径详情" placement="top">
                <a onClick={this.clickPath.bind(this, record)}><Icon type="switcher" style={{
                  fontSize: 15,
                }} /></a>
              </Tooltip>
            )
          }
        },
      ]
      return (
        <Table
          columns={columns}
          dataSource={record.list}
          pagination={false}
          rowKey="start"
        />
      )
    }
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>客户访问情况</Breadcrumb.Item>
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
          <Button onClick={this.onExport} style={{ float: "right", marginTop: 10 }} loading={this.state.exportLoading}>导出详情</Button>
          <Button onClick={this.exportPage} style={{ float: "right", marginTop: 10, marginRight: 10 }} >导出当前</Button>
          <div className="overflow_auto">
            {
              this.state.selectCompany == '全部'
                ? <Table dataSource={this.state.companyList} columns={columns} bordered pagination={false} loading={this.state.loading} rowKey="company" />
                : <div>
                  <div className="BleftBorder">总览</div>
                  <Table dataSource={this.state.companyList} columns={columns.slice(1, 5)} bordered pagination={false} loading={this.state.loading} rowKey="company" style={{ marginBottom: '20px' }} />
                  <div className="BleftBorder">访问详情</div>
                  <Table dataSource={this.state.companyData} columns={companyColumns} bordered pagination={this.state.companyPagnition} loading={this.state.companyLoading} rowKey="unqid"
                    className="components-table-demo-nested" expandedRowRender={expandedRowRender}
                    expandRowByClick={true} />
                </div>
            }
          </div>
          <Modal
            title="访问路径详情"
            visible={this.state.pathModalVisible}
            footer={null}
            onCancel={this.hideModal}
            width={800}
          >
            <div className="overflow_auto">
              <Table dataSource={this.state.pathList} columns={pathColumns} bordered pagination={false} rowKey="date" />
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

export default tracePath = connect(mapStateToProps)(tracePath)
