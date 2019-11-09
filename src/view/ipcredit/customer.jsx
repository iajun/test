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
  message
} from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import request from "@api/tools/request"
import Cookies from 'universal-cookie'
import moment from 'moment'
import {  int_thousand  } from "@cpt/format"
const cookies = new Cookies()
const FormItem = Form.Item
const Option = Select.Option
message.config({
  top: 100,
  duration: 1.6,
})

class ThreatInfoCustomer extends React.Component {
  state = {
    ThreatInfoCustomer: [],
    pagination: false,
    visible: false,
    del_visible: false,
    edit_visible: false,
    update_visible: false,
    new_visible: false,
    loading: true,
    del_info: '',
    edit_info: '',
    update_info: '',
    new_info: '',
    del_loading: false,
    add_loading: false,
    edit_loading: false,
    update_loading: false,
    role: '',
    count: 'count',
    show_custom: false
  }
  showModal = () => {
    this.setState({ visible: true ,show_custom: false})
    this.props.form.setFieldsValue({
      company: '',
      add_total: '100000000'
    })
  }
  delModal = (del_info) => {
    this.setState({ del_visible: true, del_info })
  }
  editModal = (edit_info) => {
    this.setState({ edit_visible: true, edit_info })
    this.props.form.setFieldsValue({
      edit_total: edit_info.total,
    })
  }
  updateModal = (update_info) => {
    this.setState({ update_visible: true, update_info })
    this.props.form.setFieldsValue({
      license_hour_limit: update_info.license_hour_limit,
      'date-picker': null
    })
  }
  disabledDate = (current) => {
    let forbid_time = ''
    forbid_time = moment(moment().format('YYYY-MM-DD 00:00:00')).format('x')
    return current && current.valueOf() < forbid_time
  }
  // 删除客户
  handleOk = () => {
    this.setState({ del_loading: true })
    const url = `/dashboard/threatcenter/${this.state.del_info.customer_id}/info`
    request(url, 'delete', { 'access_token': cookies.get('access_token') })
      .then(res => {
        if (res && !res.code) {
          this.setState({ del_loading: false, del_visible: false })
          message.success('删除用户成功')
          this.get_ThreatInfoCustomer()
        } else {
          this.setState({ del_loading: false })
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })
  }
  // 更新license
  handleUpdate = (e) => {
    e.preventDefault()
    const formData = this.props.form.getFieldsValue()
    this.props.form.validateFields(['date-picker'], (err, fieldsValue) => {
      if (!err) {
        this.setState({ update_loading: true })
        const uplicense = {}
        if (formData['date-picker']) {
          uplicense.license_etime = formData['date-picker'].format('YYYY-MM-DD 23:59:59')
        }
        uplicense.license_hour_limit = formData.license_hour_limit
        const url = `/dashboard/threatcenter/${this.state.update_info.customer_id}/license`
        request(url, 'put', {}, uplicense)
          .then(res => {
            if (res && !res.code) {
              this.setState({ update_loading: false, update_visible: false, new_visible: true, new_info: res })
              this.get_ThreatInfoCustomer()
            } else {
              this.setState({ update_loading: false })
              let text = '网络错误，请稍后再试'
              if (res && res.message) {
                text = res.message
              }
              message.warning(text)
            }
          })
      }
    })
  }
  handleCancel = () => {
    this.setState({ visible: false, del_visible: false, edit_visible: false, update_visible: false, new_visible: false })
  }
  //添加客户
  select_total = (value) => {
    if (value == 'custom') {
      this.setState({show_custom: true})
    }else {
      this.setState({show_custom: false})
    }
  }
  handleSubmit(e) {
    this.setState({ add_loading: true })
    e.preventDefault()
    const formData = this.props.form.getFieldsValue()
    let add_validate = this.state.show_custom ? ['company','custom_total'] : ['company']
    this.props.form.validateFields(add_validate, (err, values) => {
      if (!err) {
        const add_customer = {}
        add_customer.company = formData.company
        if (formData.add_total != 'custom') {
          add_customer.total = formData.add_total
        }else {
          add_customer.total = formData.custom_total
        }
        request('/dashboard/threatcenter/info', 'post', {}, add_customer)
          .then(res => {
            if (res && !res.code) {
              this.setState({ add_loading: false, visible: false })
              message.success('添加客户成功')
              this.get_ThreatInfoCustomer()
            } else {
              this.setState({ add_loading: false })
              let text = '网络错误，请稍后再试'
              if (res && res.message) {
                text = res.message
              }
              message.warning(text)
            }
          })
      } else {
        this.setState({ add_loading: false, })
      }
    })
  }
  //更新客户限额
  handleEdit(e) {
    this.setState({ edit_loading: true })
    e.preventDefault()
    const formData = this.props.form.getFieldsValue()
    this.props.form.validateFields(['edit_total'], (err, values) => {
      if (!err) {
        const edit_customer = {}
        edit_customer.total = parseInt(this.state.edit_info.total) + parseInt(formData.edit_total)
        const url = `/dashboard/threatcenter/${this.state.edit_info.customer_id}/info`
        request(url, 'put', {}, edit_customer)
          .then(res => {
            if (res && !res.code) {
              this.setState({ edit_loading: false, edit_visible: false })
              message.success('客户限额更新成功')
              this.get_ThreatInfoCustomer()
            } else {
              this.setState({ edit_loading: false })
              let text = '网络错误，请稍后再试'
              if (res && res.message) {
                text = res.message
              }
              message.warning(text)
            }
          })
      } else {
        this.setState({ edit_loading: false, })
      }
    })
  }
  componentDidMount() {
    this.get_ThreatInfoCustomer()
    const userinfo = JSON.parse(localStorage.getItem('userinfo'))
    if (userinfo && userinfo.role) {
      this.setState({
        role: userinfo.role
      })
    } else {
      request('/dashboard/user/info', 'get')
        .then(res => {
          this.setState({
            role: res.role
          })
        })
    }
  }
  get_ThreatInfoCustomer = () => {
    request('/dashboard/threatcenter/list', 'get')
      .then(res => {
        if (res && !res.code) {
          this.setState({ count: res.data.length })
          this.setState({ ThreatInfoCustomer: res.data, loading: false })
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
          this.setState({loading: false})
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
  extraTime = () => {
    return (
      <div style={{'textAlign':'center','color': '#20a0ff'}}>
        <a onClick={this.click_year}>一年后</a>
      </div>
    )
  }
  click_year = () => {
    this.props.form.setFieldsValue({
      'date-picker': moment().add(1, 'year')
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const title_count = this.state.count != 'count' ? `客户名（${  this.state.count  }个）` : `客户名（${  this.state.ThreatInfoCustomer.length  }个）`
    const column_normal = [
      {
        title: '序号',
        key: 'index',
        width: '50px',
        render: (text, record, index) => {
            return index + 1
        }
      }, {
        title: title_count,
        dataIndex: 'company',
        key: 'company',
        width: '120px'
      }, {
        title: '创建时间',
        dataIndex: 'ctime',
        key: 'ctime',
        width: '150px',
        render: (text, record) => {
          if (moment(text).isValid()) {
            const leftTime = Math.abs(moment(text).diff(moment().format('YYYY-MM-DD 00:00:00'), 'days'))
            return <Tooltip title={`已创建${  leftTime  }天`} placement="top"><span style={{ color: '#49a9ee' }}>{text}</span></Tooltip>
          }
        }
      }, {
        title: 'license到期时间',
        dataIndex: 'license_etime',
        key: 'license_etime',
        width: '150px',
        render: (text, record) => {
          if (moment(text).isValid()) {
            const leftTime = moment(text).diff(moment().format('YYYY-MM-DD 23:59:59'), 'days')
            if (leftTime <= 7 && leftTime > 3) {
              return <Tooltip title={`还有${  leftTime  }天到期`} placement="top"><span style={{ color: '#f79992' }}>{text}</span></Tooltip>
            } else if (leftTime <= 3 && leftTime > 1) {
              return <Tooltip title={`还有${  leftTime  }天到期`} placement="top"><span style={{ color: '#f46e65' }}>{text}</span></Tooltip>
            } else if (leftTime <= 1 && leftTime >= 0) {
              return <Tooltip title={`还有${  leftTime  }天到期`} placement="top"><span style={{ color: '#f04134' }}>{text}</span></Tooltip>
            } else if (leftTime < 0) {
              return <Tooltip title="已到期" placement="top"><span style={{ color: '#d73435' }}>{text}</span></Tooltip>
            } else {
              return <Tooltip title={`还有${  leftTime  }天到期`} placement="top"><span style={{ color: '#49a9ee' }}>{text}</span></Tooltip>
            }
          } else {
            return ''
          }
        }
      }, {
        title: 'license',
        dataIndex: 'license',
        key: 'license'
      }, {
        title: '调用频率限制/d',
        width: '105px',
        dataIndex: 'license_hour_limit',
        key: 'license_hour_limit',
        render: (text) => text && text - 0 ? text : '不限'
      },{
        title: '已调用数',
        width: '100px',
        dataIndex: 'used',
        key: 'used',
        render: (text) => (int_thousand(text))
      },{
        title: '总调用数',
        width: '100px',
        dataIndex: 'total',
        key: 'total',
        render: (text) => (int_thousand(text))
      }
    ]
    const column_support = Object.assign([],column_normal)
    column_support.push({
      title: '操作',
      key: 'action',
      width: '95px',
      render: (text, record) => {
        const action = (
          <span>
            <Tooltip title="更新客户限额" placement="topRight">
              <a onClick={this.editModal.bind(this, record)}><Icon type="edit" style={{
                fontSize: 13,
                marginRight: '16px'
              }} /></a>
            </Tooltip>
            <Tooltip title="更新客户license" placement="topRight">
              <a onClick={this.updateModal.bind(this, record)}><Icon type="barcode" style={{
                fontSize: 13,
                marginRight: '16px'
              }} /></a>
            </Tooltip>
            <Tooltip title="删除此客户">
              <a onClick={this.delModal.bind(this, record)}><Icon type="delete" style={{
                fontSize: 13
              }} /></a>
            </Tooltip>
          </span>
        )
        return action
      }
    })
    const columns = this.state.role != 'manager' && this.state.role != 'support' ? column_normal : column_support
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 6
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 14
        }
      }
    }
    const formUpdateLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 10
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 8
        }
      }
    }
    const config = {
      rules: [
        {
          type: 'object',
          required: true,
          message: '请选择license到期时间'
        }
      ]
    }
    const locale = {
      emptyText: '暂无数据',
    }
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>威胁情报中心客户列表</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <Button onClick={this.showModal} type="primary" style={{
            margin: '0px 0px 12px 0px'
          }}>添加客户</Button>
          <div className="overflow_auto">
            <Table rowKey="company" dataSource={this.state.ThreatInfoCustomer} columns={columns} bordered pagination={false} loading={this.state.loading}
            locale={locale} style={{ minWidth: '990px' }} />
          </div>
        </div>
        <Modal title="添加客户" visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel} footer={null}>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label="客户名" {...formItemLayout}>
              {getFieldDecorator('company', {
                rules: [
                  {
                    required: true,
                    message: '请输入客户名'
                  }
                ],
                initialValue: ''
              })(
                <Input prefix={< Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入客户名" />
              )}
            </FormItem>
            <FormItem label="总调用数" {...formItemLayout}>
              {getFieldDecorator('add_total', {
                rules: [
                  {
                    required: false
                  }
                ],
                initialValue: '100000000'
              })(
                <Select onChange={this.select_total}>
                  <Option value="100000000">1亿</Option>
                  <Option value="500000000">5亿</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              )}
            </FormItem>
            {
              this.state.show_custom ?
              <FormItem label="请输入总调用数" {...formItemLayout}>
                {getFieldDecorator('custom_total', {
                  rules: [
                    {
                      required: true,
                      message: '请输入数字类型的总调用数',
                      pattern: new RegExp('^[0-9]*$')
                    }
                  ],
                  initialValue: ''
                })(
                  <Input prefix={< Icon type="form" style={{ fontSize: 13 }} />} />
                )}
              </FormItem>
              : null
            }
            <div style={{
              textAlign: 'center',
              margin: '10px'
            }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" style={{
                marginLeft: '40px'
              }} loading={this.state.add_loading}>确认</Button>
            </div>
          </Form>
        </Modal>
        <Modal title="更新客户限额" visible={this.state.edit_visible} onCancel={this.handleCancel} footer={null}>
          <FormItem label="现有总调用数" {...formUpdateLayout}>
            <span>{this.state.edit_info.total}</span>
          </FormItem>
          <Form onSubmit={this.handleEdit.bind(this)}>
            <FormItem label="新增总调用数" {...formItemLayout}>
              {getFieldDecorator('edit_total', {
                rules: [
                  {
                    required: true,
                    message: '请输入数字类型的总调用数',
                    pattern: new RegExp('^[0-9]*$')
                  }
                ],
                initialValue: this.state.edit_info.total
              })
              (
                <Input prefix={< Icon type="form" style={{ fontSize: 13 }} />} />
              )
            }
            </FormItem>
            <div style={{
              textAlign: 'center',
              margin: '10px'
            }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" style={{
                marginLeft: '40px'
              }} loading={this.state.edit_loading}>确认</Button>
            </div>
          </Form>
        </Modal>
        <Modal title="删除客户" visible={this.state.del_visible} confirmLoading={this.state.del_loading} onOk={this.handleOk} onCancel={this.handleCancel} okText="确认" cancelText="取消">
          <p>确定删除{this.state.del_info.company}客户吗？</p>
        </Modal>
        <Modal title="更新客户license" visible={this.state.update_visible} confirmLoading={this.state.update_loading} onOk={this.handleUpdate} onCancel={this.handleCancel} okText="确认" cancelText="取消" footer={null}>
          <Form onSubmit={this.handleUpdate.bind(this)}>
            <FormItem label="客户名" {...formUpdateLayout}>
              <span>{this.state.update_info.company}</span>
            </FormItem>
            <FormItem label="license到期时间" {...formUpdateLayout}>
              {getFieldDecorator('date-picker', config)(<DatePicker disabledDate={this.disabledDate} renderExtraFooter={this.extraTime} showToday={false}/>)}
            </FormItem>
            <FormItem label="每天调用频率限制" {...formUpdateLayout}>
              {getFieldDecorator('license_hour_limit', {
                rules: [
                  {
                    required: false
                  }
                ],
                initialValue: this.state.update_info.license_hour_limit
              })(
                <Select >
                  <Option value="50">50</Option>
                  <Option value="200">200</Option>
                  <Option value="500">500</Option>
                  <Option value="0">不限</Option>
                </Select>
              )}
            </FormItem>
            <div style={{
              textAlign: 'center',
              margin: '10px'
            }}>
              <Button onClick={this.handleCancel}>取消</Button>
              <Button type="primary" htmlType="submit" style={{
                marginLeft: '40px'
              }} loading={this.state.update_loading}>确认</Button>
            </div>
          </Form>
        </Modal>
        <Modal title={`${this.state.update_info.company}新License信息`} visible={this.state.new_visible} onOk={this.handleCancel} onCancel={this.handleCancel} okText="关闭" footer={null}>
          <p style={{ 'wordBreak': 'break-all' }}>新license : {this.state.new_info.license}</p>
          <br />
          <p>新license到期时间 : {this.state.new_info.license_etime}</p>
        </Modal>
        <style>
        </style>
      </div>
    )
  }
}

export default ThreatInfoCustomer = Form.create({})(ThreatInfoCustomer)
