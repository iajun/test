import { Breadcrumb, Icon, Table, Button, Modal, Form, Input, Select, DatePicker, Tooltip, Row, Col, Switch, Checkbox, message, Popconfirm, Tag } from 'antd'
import React from 'react'
import request from "@api/tools/request"
import Cookies from 'universal-cookie'
import moment from 'moment'
import {  monitorType, atd_monitor, deep_monitor, op_monitor, interface_monitior, web_monitor  } from "@cpt/monitor_type"
import { connect } from 'react-redux'
const cookies = new Cookies()
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const confirm = Modal.confirm
const Option = Select.Option
message.config({
  top: 100,
  duration: 1.6,
})

class MonitorConfig extends React.Component {
  state = {
    monitorConfig: {},
    customerlist: [],
    pagination: false,
    setting_visible: false,
    loading: true,
    edit_info: { ctype_black: '' },
    setting_loading: false,
    setting_status: false,
    addTypeModal: false,
    addtype_loading: false,
    selectType: {},
    addTypeList: [],
    userinfo: ''
  }
  // 总开关
  totalSwitch = (record, value) => {
    if (value == false) {
      this.setState({ setting_status: false, setting_visible: true, edit_info: record })
      this.props.form.resetFields()
    } else {
      this.setState({ setting_status: true, setting_visible: true, edit_info: record })
    }
  }
  // 总开关屏蔽、开启
  handleSetting = (e) => {
    e.preventDefault()
    if (this.state.setting_status) {
      this.setState({ setting_loading: true })
      const modify_monitor = {}
      const pre_monitor = this.state.edit_info.monitor
      modify_monitor.name = this.state.edit_info.name
      modify_monitor.monitor = Object.assign(pre_monitor, {})
      modify_monitor.monitor.status = true
      modify_monitor.monitor.reason = ''
      this.modifyConfig(modify_monitor)
    } else {
      this.props.form.validateFields((error, values) => {
        if (error == null || (!error.expire && !error.reason)) {
          this.setState({ setting_loading: true })
          const modify_monitor = {}
          const pre_monitor = this.state.edit_info.monitor
          modify_monitor.name = this.state.edit_info.name
          modify_monitor.monitor = Object.assign(pre_monitor, {})
          modify_monitor.monitor.status = false
          modify_monitor.monitor.expire_time = (values.expire == 'forever' ? '9999-12-31 23:59:59' : moment().add(values.expire, 'days').format('YYYY-MM-DD HH:mm:ss'))
          modify_monitor.monitor.reason = values.reason
          this.modifyConfig(modify_monitor)
        }
      })
    }
  }
  // 子类
  deleteType = (record, type, e) => {
    const modify_monitor = {}
    const pre_monitor = record.monitor
    modify_monitor.name = record.name
    modify_monitor.monitor = Object.assign(pre_monitor, {})
    const pre_type_black = record.monitor.type_black
    for (let i = 0; i < pre_type_black.length; i++) {
      if (pre_type_black[i].type == type) {
        modify_monitor.monitor.type_black.splice(i, 1)
        break
      }
    }
    this.modifyConfig(modify_monitor)
  }
  addTypeModal = (record) => {
    const selectType = {}
    const typelist = this.state.monitorConfig.typelist
    const pretype = record.monitor.type_black || []
    const addTypeList = []
    for (const item of typelist) {
      let eq = false
      for (const preitem of pretype) {
        if (item.type == preitem.type) {
          eq = true
        }
      }
      if (!eq) {
        addTypeList.push(item)
        selectType[item.type] = item.name
      }
    }
    this.setState({ addTypeList, selectType, addTypeModal: true, edit_info: record })
    this.props.form.resetFields()
  }
  handleAddType = (e) => {
    e.preventDefault()
    this.props.form.validateFields((error, values) => {
      if (error == null || (!error.expire && !error.types)) {
        this.setState({ addtype_loading: true })
        const modify_monitor = {}
        const pre_monitor = this.state.edit_info.monitor
        modify_monitor.name = this.state.edit_info.name
        modify_monitor.monitor = Object.assign(pre_monitor, {})
        const pre_type_black = modify_monitor.monitor.type_black || []
        const temp_type_black = []
        for (const item of values.types) {
          temp_type_black.push({
            type: item,
            name: this.state.selectType[item],
            expire_time: values.expire == 'forever' ? '9999-12-31 23:59:59' : moment().add(values.expire, 'days').format('YYYY-MM-DD HH:mm:ss')
          })
        }
        modify_monitor.monitor.type_black = pre_type_black.concat(temp_type_black)
        if (values.type_reason) {
          modify_monitor.monitor.reason = values.type_reason
        }
        this.modifyConfig(modify_monitor)
      }
    })
  }
  handleCancel = () => {
    this.setState({ setting_visible: false, addTypeModal: false })
  }
  componentDidMount() {
    this.get_monitorconfig()
    const userinfo = JSON.parse(localStorage.getItem('userinfo'))
    if (userinfo) {
      this.setState({ userinfo })
    } else {
      request('/dashboard/user/info', 'get')
        .then(res => {
          this.setState({
            userinfo: res
          })
          localStorage.setItem('userinfo', JSON.stringify(res))
        })
    }
  }
  get_customerlist = () => {
    request('/dashboard/customer/list', 'get')
      .then(res => {
        if (res && !res.code) {
          const temp = []
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].status != 'close') {
              temp.push(res.data[i])
            }
          }
          res.data = temp
          if (res && res.data && res.data.length > 50) {
            this.setState({
              pagination: { pageSize: 50 },
            })
          } else {
            this.setState({
              pagination: false,
            })
          }
          res.data.push({ 'name': 'BSC' })
          const monitorConfig = this.state.monitorConfig.customer
          res.data = res.data.map(function (item, index) {
            if (monitorConfig[item.name]) {
              item.monitor = monitorConfig[item.name].monitor
              if (typeof(item.monitor.status) == 'number' && item.monitor.status == 0) {
                item.monitor.status = true
              }
            } else {
              item.monitor = {}
              item.status = true
              item.type_black = []
              item.reason = ''
              item.expire_time = ''
            }
            return item
          })
          this.setState({ customerlist: res.data, loading: false })
        } else {
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })
  }
  get_monitorconfig = () => {
    request('/dashboard/monitor/config', 'get')
      .then(res => {
        if (res && !res.code) {
          this.setState({ monitorConfig: res }, function () {
            this.get_customerlist()
          })
        } else {
          this.setState({ loading: false })
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })
  }
  modifyConfig = (modify_monitor) => {
    request('/dashboard/monitor/config', 'put', {}, modify_monitor)
      .then(res => {
        if (res && !res.code) {
          this.setState({
            setting_loading: false,
            setting_visible: false,
            addTypeModal: false,
            addtype_loading: false,
          })
          message.success('修改成功')
        } else {
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })

  }
  render() {
    const { isMobile } = this.props
    const switchWidth = isMobile ? 12 : 8
    const { getFieldDecorator } = this.props.form
    const show_detail = this.state.show_detail ? (record => {
      if (record.detail) {
        return <span>屏蔽的报警有： <span style={{ color: '#f46e65' }}>{record.detail}</span></span>
      }
    }) : false
    const title_count = `客户名（${  this.state.customerlist.length  }个）`
    const type_title = (
      <span>
          屏蔽的报警子类
        <Tooltip title="屏蔽的报警子类的优先级低于报警总开关">
          <Icon style={{ marginLeft: '5px', fontSize: 13 }} type="question-circle" />
        </Tooltip>
      </span>
    )
    const columns = [
      {
        title: '序号',
        key: 'index',
        width: '50px',
        render: (text, record, index) => (index + 1)
      },
      {
        title: title_count,
        dataIndex: 'name',
        key: 'name',
        width: '150px'
      }, {
        title: '报警总开关',
        dataIndex: 'status',
        key: 'status',
        width: '140px',
        render: (text, record) => {
          const total_switch = record.monitor.status != false
            ? <Switch checkedChildren="开" unCheckedChildren="关" checked={record.monitor.status != false} onChange={this.totalSwitch.bind(this, record)} />
            :          <Tooltip title={`屏蔽到期时间${ record.monitor.expire_time}`}>
              <Switch checkedChildren="开" unCheckedChildren="关" checked={record.monitor.status != false} onChange={this.totalSwitch.bind(this, record)} />
            </Tooltip>
          return total_switch
        }
      }, {
        title: type_title,
        dataIndex: 'type_black',
        key: 'type_black',
        render: (text, record) => {
          const type_black = record.monitor.type_black || []
          const typelist = (
            <div key={`${record.name  }type`}>
              {type_black.map((tag, index) => {
                const tagElem = (
                  <Popconfirm key={tag.type} title="确定解除该报警的屏蔽吗？" okText="确定" cancelText="取消" onConfirm={this.deleteType.bind(this, record, tag.type)}>
                    <Tooltip title={`屏蔽到期时间${ tag.expire_time}`} key={`tooltip${  tag.type}`} placement="bottomLeft">
                      <Tag closable onClose={e => e.preventDefault()} key={`${tag.type  }tag`}>
                        {tag.name}
                      </Tag>
                    </Tooltip>
                  </Popconfirm>
                )
                return tagElem
              })}
              {record.name == 'BSC' ? null : (
                <Tag
                  onClick={this.addTypeModal.bind(this, record)}
                  style={{ background: '#fff', borderStyle: 'dashed' }}
                >
                  <Icon type="plus" /> 添加
                </Tag>
              )}
            </div>
          )
          return  typelist
        }
      }, {
        title: '最后修改原因',
        dataIndex: 'reason',
        key: 'reason',
        width: '180px',
        render: (text, record) => {
          return record.monitor.reason
        }
      }
    ]
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 8
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 15
        }
      }
    }
    const addTypeOption = []
    this.state.addTypeList.map((item, index) => {
      addTypeOption.push(<Option key={item.type} value={item.type}>{item.name}</Option>)
    })
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>报警状态列表</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="overflow_auto">
            <Table dataSource={this.state.customerlist} columns={columns} bordered pagination={false} loading={this.state.loading}
              onChange={this.handleChange} rowKey="index" style={{ minWidth: '900px' }} rowKey="name"/>
          </div>
        </div>
        <Modal title={`${this.state.edit_info.name  } 报警屏蔽设置`} visible={this.state.setting_visible} onCancel={this.handleCancel} footer={null}>
          <Form onSubmit={this.handleSetting.bind(this)}>
            {
              this.state.setting_status ? (<div>确定开启报警吗？</div>)
                : (
                  <div>
                    <FormItem label="过期时间" {...formItemLayout}>
                      {getFieldDecorator('expire', {
                        rules: [{ required: true, message: '请选择过期时间' }],
                        initialValue: '1'
                      })(
                        <Select>
                          <Option key="1d" value="1">1天</Option>
                          <Option key="2d" value="2">2天</Option>
                          <Option key="3d" value="3">3天</Option>
                          <Option key="4d" value="4">4天</Option>
                          {
                            this.state.userinfo.role == 'op' || this.state.userinfo.name == 'admin'
                              ? <Option key="30d" value="30">30天</Option> : null
                          }
                          {
                            this.state.edit_info.type == 'internal'
                              ? <Option key="forever" value="forever">永久</Option> : null
                          }
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="屏蔽原因" {...formItemLayout}>
                      {getFieldDecorator('reason', {
                        rules: [{ required: true, message: '请填写屏蔽原因' }],
                      })(
                        <Input placeholder="请输入屏蔽原因" />
                      )}
                    </FormItem>
                  </div>
                )
            }
            <div style={{
              textAlign: 'center',
              margin: '10px'
            }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" loading={this.state.setting_loading} style={{
                marginLeft: '40px'
              }} >确认</Button>
            </div>
          </Form>
        </Modal>
        <Modal title={`设置${this.state.edit_info.name  }报警屏蔽子类`} visible={this.state.addTypeModal} onCancel={this.handleCancel} footer={null} confirmLoading={this.state.addtype_loading}>
          <Form onSubmit={this.handleAddType.bind(this)}>
            <FormItem label="屏蔽报警子类" {...formItemLayout}>
              {getFieldDecorator('types', {
                rules: [
                  {
                    required: true,
                    message: '请选择要屏蔽的报警',
                    type: 'array'
                  }
                ],
              })(
                <Select mode="multiple" placeholder="请选择要屏蔽的报警">
                  {addTypeOption}
                </Select>
              )}
            </FormItem>
            <FormItem label="过期时间" {...formItemLayout}>
              {getFieldDecorator('expire', {
                rules: [{ required: true, message: '请选择过期时间' }],
                initialValue: '1'
              })(
                <Select>
                  <Option key="1d" value="1">1天</Option>
                  <Option key="2d" value="2">2天</Option>
                  <Option key="3d" value="3">3天</Option>
                  <Option key="5d" value="5">5天</Option>
                  <Option key="7d" value="7">7天</Option>
                  {
                    this.state.userinfo.role == 'op' || this.state.userinfo.name == 'admin'
                      ? <Option key="30d" value="30">30天</Option> : null
                  }
                  {
                    this.state.edit_info.type == 'internal'
                      ? <Option key="forever" value="forever">永久</Option> : null
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="屏蔽原因" {...formItemLayout}>
              {getFieldDecorator('type_reason', {
                rules: [{ required: false, }],
              })(
                <Input placeholder="请输入屏蔽原因" />
              )}
            </FormItem>
            <div style={{
              textAlign: 'center',
              margin: '10px'
            }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" style={{
                marginLeft: '40px'
              }} loading={this.state.addtype_loading}>确认</Button>
            </div>
          </Form>
        </Modal>
        <style>
          {`
            .showIcon .ant-table-row-expand-icon{
                    background-color: #20a0ff;
                    color: white;
            }
            .hideIcon .ant-table-row-expand-icon{
                    display: none;
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

export default MonitorConfig = connect(mapStateToProps)(Form.create({})(MonitorConfig))
