import { Breadcrumb, Table, DatePicker, message, Modal, Select, TreeSelect, Button } from 'antd'
import React from 'react'
import request from "@api/tools/request"
import moment from 'moment'
import { connect } from 'react-redux'
const { RangePicker } = DatePicker
const Option = Select.Option

message.config({
  top: 100,
  duration: 1.6,
})

class traceClick extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      startTime: moment().subtract(10, 'days').format('YYYY-MM-DD 00:00:00'),
      endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      selectTime: [moment(moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00')), moment()],
      company: [{ company: "全部", count: 0 }],
      selectCompany: "全部",
      trackClickList: [],
      titleNameList: [],
      selectTitleName: '全部',
      companyPagnition: false,
      exportLoading: false,
      selectTitle: "全部",
      selectName: "全部"
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    this.get_traceClick(params, { company: true, titleName: true })
  }

  onTimeOpenChange = (status) => {
    if (!status) {
      if (moment(this.state.selectTime[0]).format('YYYY-MM-DD HH:mm:ss') != this.state.startTime || moment(this.state.selectTime[1]).format('YYYY-MM-DD HH:mm:ss') != this.state.endTime) {
        this.setState({ selectTime: [moment(this.state.startTime), moment(this.state.endTime)] })
      }
    }
  }

  onTimeChange = (value) => {
    this.setState({ selectTime: value })
  }

  onTimeOk = (value) => {
    const params = {}
    params.start = moment(value[0]).format('YYYY-MM-DD HH:mm:ss')
    params.end = moment(value[1]).format('YYYY-MM-DD HH:mm:ss')
    // if (this.state.selectCompany != '全部') {
    //   params.company = this.state.selectCompany
    // }
    this.get_traceClick(params, { company: true, titleName: true })
    this.setState({ startTime: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'), selectCompany: "全部", selectTitleName: "全部", selectTitle: "全部", selectName: "全部" }, () => {
      this.setState({ selectTime: value, selectCompany: '全部' })
    })

  }

  onCompanyChange = (value) => {
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    if (value != '全部') {
      params.company = value
    }
    this.get_traceClick(params, { titleName: true })
    this.setState({ selectCompany: value, selectTitleName: '全部', selectTitle: "全部", selectName: "全部" })
  }

  onTitleNameChange = (value) => {
    let arr = value.split(":");
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    if (this.state.selectCompany != '全部') {
      params.company = this.state.selectCompany
    }
    if (arr[0] != '全部') {
      params.title = arr[1]
      this.setState({ selectTitle: arr[1], selectName: "全部" })
    } else {
      this.setState({ selectTitle: "全部", selectName: "全部" })
    }
    if (arr[0] == 'name') {
      params.name = arr[2]
      this.setState({ selectName: arr[2] })
    }
    this.get_traceClick(params)
    this.setState({ selectTitleName: value })
  }

  onExport = () => {
    const params = {}
    params.start = this.state.startTime
    params.end = this.state.endTime
    if(this.state.selectCompany != "全部"){
      params.company = this.state.selectCompany
    }
    if(this.state.selectTitle != "全部"){
      params.title = this.state.selectTitle
    }
    if(this.state.selectName != "全部"){
      params.name = this.state.selectName
    }
    request('/dashboard/customer/track_click_export', 'export', params);
  }

  get_traceClick = (params, updateConfig) => {
    this.setState({ loading: true })
    request('/dashboard/customer/track_click', 'get', params)
      .then(res => {
        this.setState({ loading: false })
        if (res && !res.code) {
          if (updateConfig) {
            if (updateConfig.company) {
              res.company.unshift({ company: "全部", count: res.data.length });
              this.setState({ company: res.company })
            }
            if (updateConfig.titleName) {
              let titleNameList = [res.title_name]
              this.setState({ titleNameList: titleNameList })
            }
          }
          this.setState({ trackClickList: res.data })
          if (res.data.length > 50) {
            this.setState({
              pagnition: {
                total: res.data.length,
                showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 条记录，共 ${total} 条`,
                pageSize: 50
              }
            })
          } else {
            this.setState({ pagnition: false })
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
    const locale = {
      filterTitle: '筛选',
      filterConfirm: '确定',
      filterReset: '全部',
      emptyText: '暂无数据',
    }
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
        title: '名称',
        dataIndex: 'name',
      }, {
        title: '页面',
        dataIndex: 'title'
      }, {
        title: '用户名',
        dataIndex: 'user',
      }, {
        title: '时间',
        dataIndex: 'date',
      }, {
        title: '类别',
        dataIndex: 'role',
        width: '100px',
        filters: [
          { text: '客户使用', value: 'customer' },
          { text: '白山使用', value: 'bsc' },
        ],
        filterMultiple: false,
        onFilter: (value, record) =>
          {
            if (value == 'customer') {
              return record.role.includes(value) && record.company.indexOf('白山') < 0
            }else {
              return record.role.includes(value) || record.company.indexOf('白山') >= 0
            }
          },
        render: (text, record) => {
          if (text == "customer" && record.company.indexOf('白山') < 0) {
            return (
              <span style={{ color: "#a0d911" }}>客户使用</span>
            );
          } else {
            return (
              <span style={{ color: "#ff7a45" }}>白山使用</span>
            );
          }
        }
      },
    ]
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>客户点击情况</Breadcrumb.Item>
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
              onChange={this.onTimeChange}
              onOk={this.onTimeOk}
              onOpenChange={this.onTimeOpenChange}
              style={{ width: '230px' }}
            />
          </div>
          <div className="mb25" style={{ display: 'inline-block', marginRight: '30px' }}>
            <h4 style={{ display: 'inline-block', marginRight: '10px', }}>客户名称（{this.state.company.length - 1}个）:</h4>
            <Select
              showSearch
              defaultValue={this.state.company[0].company}
              value={this.state.selectCompany}
              placeholder="请选择客户名称"
              showArrow={true}
              onChange={this.onCompanyChange}
              style={{ width: 180 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              {
                this.state.company.map((item, index) => {
                  return <Option key={item.company}>{item.company} : {item.count}个</Option>
                })
              }
            </Select>
          </div>
          <div className="mb25" style={{ display: 'inline-block' }}>
            <h4 style={{ display: 'inline-block', marginRight: '10px', }}>页面选择</h4>
            <TreeSelect
              style={{ width: 200 }}
              value={this.state.selectTitleName}
              dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
              treeData={this.state.titleNameList}
              placeholder="请选择"
              dropdownMatchSelectWidth={false}
              onChange={this.onTitleNameChange}
            />
          </div>
          <Button onClick={this.onExport} style={{ float: "right", marginTop: 10 }} loading={this.state.exportLoading}>导出</Button>
          <Table dataSource={this.state.trackClickList} columns={columns} bordered pagination={this.state.pagnition} loading={this.state.loading} rowKey="id" locale={locale}/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isMobile: state.isMobile
  }
}

export default traceClick = connect(mapStateToProps)(traceClick)
