import { Icon, Table, Button, Tooltip, DatePicker, Breadcrumb, Modal, Form, Input, Popconfirm } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import request from "@api/tools/request"
import moment from 'moment'
const FormItem = Form.Item
const { TextArea } = Input


class ProductUpdateRecord extends React.Component {
  state = {
    loading: true,
    add_loading: false,
    proto_type: '',
    proto_name: '',
    visible: false,
    update_record_list: [],
    edit_record: {}
  }
  componentWillMount() {
    const proto_type = location.hash.replace(/#/g, '').split('/').pop()
    let proto_name = ''
    switch (proto_type) {
    case 'atd':
      proto_name = 'ATD'
      break
    case 'cache':
      proto_name = 'API加速'
      break
    case 'gateway':
      proto_name = 'API网关'
      break
    }
    this.setState({
      proto_type,
      proto_name
    })
  }
  componentDidMount() {
    this.get_update_record_list()
  }
  get_update_record_list = (date) => {
    request('/dashboard/product/update_record', 'get')
      .then(res => {
        this.setState({ loading: false })
        if (res && !res.code) {
          this.setState({ update_record_list: res.data[this.state.proto_type] })
        } else {
          this.setState({ update_record_list: [], })
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
  showModal = () => {
    this.setState({
      visible: true,
      edit_record: {}
    })
  }
  handleCancel = () => {
    this.setState({
      visible: false
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((error, value) => {
      if (!error) {
        this.setState({ add_loading: true })
        value.date = value.date.format('YYYY-MM-DD')
        if (this.state.edit_record.id) {
          value.id = this.state.edit_record.id
          request('/dashboard/product/update_record', 'put', {}, value)
            .then(res => {
              if (res) {
                this.setState({ add_loading: false, visible: false })
                Modal.success({
                  title: '修改成功',
                })
                this.props.form.resetFields()
                this.get_update_record_list()
              } else {
                this.setState({ add_loading: false })
                let text = '网络错误，请稍后再试'
                if (res && res.message) {
                  text = res.message
                }
                Modal.warning({
                  title: text,
                })
              }
            })
        } else {
          request('/dashboard/product/update_record', 'post', {}, value)
            .then(res => {
              if (res && !res.code) {
                this.setState({ add_loading: false, visible: false })
                Modal.success({
                  title: '添加成功',
                })
                this.props.form.resetFields()
                this.get_update_record_list()
              } else {
                this.setState({ add_loading: false })
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

      }
    })
  }
  editModal = (data) => {
    this.setState({ edit_record: data, visible: true })
  }
  handleDelete = (data) => {
    request('/dashboard/product/update_record', 'delete', {}, data)
      .then(res => {
        if (res && !res.code) {
          Modal.success({
            title: '删除成功',
          })
          this.get_update_record_list()
        } else {
          this.setState({ add_loading: false })
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
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 4
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 18
        }
      }
    }
    const columns = [
      {
        title: '更新版本',
        dataIndex: 'version',
        key: 'version',
        width: '120px'
      }, {
        title: '标题',
        dataIndex: 'name',
        key: 'name'
      }, {
        title: '更新内容',
        dataIndex: 'content',
        key: 'content',
        render: (text) => {
          return <pre>{text}</pre>
        }
      }, {
        title: '更新时间',
        dataIndex: 'date',
        key: 'date',
        width: '150px'
      }, {
        title: '操作',
        key: 'action',
        width: '100px',
        render: (text, record) => {
          return <span>
            <Tooltip title="编辑" placement="topRight">
              <a onClick={this.editModal.bind(this, record)}><Icon type="edit" style={{ fontSize: 13, marginRight: '13px' }} /></a>
            </Tooltip>
            <Tooltip title="删除" placement="topRight">
              <Popconfirm title="确定删除吗?" onConfirm={this.handleDelete.bind(this, record)} okText="确定" cancelText="取消">
                <a><Icon type="delete" style={{ fontSize: 13, marginRight: '13px' }} /></a>
              </Popconfirm>
            </Tooltip>
          </span>
        }
      }
    ]
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>{this.state.proto_name}产品更新记录</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <Button onClick={this.showModal} type="primary" style={{
            margin: '0px 0px 12px 0px'
          }}>添加记录</Button>
          <div className="overflow_auto">
            <Table rowKey="staff_email" style={{ minWidth: '600px' }} dataSource={this.state.update_record_list} columns={columns} bordered loading={this.state.loading} />
          </div>
        </div>
        <Modal title="添加记录" visible={this.state.visible} onCancel={this.handleCancel} footer={null}>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label="产品" {...formItemLayout}>
              {getFieldDecorator('product', {
                initialValue: this.state.proto_type
              })(
                <span>{this.state.proto_name}</span>
              )}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入标题'
                  }
                ],
                initialValue: this.state.edit_record.name || ''
              })(
                <Input placeholder="请输入标题" />
              )}
            </FormItem>
            <FormItem label="内容" {...formItemLayout}>
              {getFieldDecorator('content', {
                rules: [
                  {
                    required: true,
                    message: '请输入内容'
                  }
                ],
                initialValue: this.state.edit_record.content || ''
              })(
                <TextArea rows={6} placeholder="请输入内容" />
              )}
            </FormItem>
            <FormItem label="版本号" {...formItemLayout}>
              {getFieldDecorator('version', {
                rules: [
                  {
                    required: true,
                    message: '请输入版本号'
                  }
                ],
                initialValue: this.state.edit_record.version || 'V'
              })(
                <Input placeholder="请输入版本号" />
              )}
            </FormItem>
            <FormItem label="日期" {...formItemLayout}>
              {getFieldDecorator('date', {
                rules: [
                  {
                    type: 'object',
                    required: true,
                    message: '请选择license到期时间'
                  }
                ],
                initialValue: this.state.edit_record.date ? moment(this.state.edit_record.date, 'YYYY-MM-DD') : moment(Date())
              })(
                <DatePicker />
              )}
            </FormItem>
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
      </div>
    )
  }
}

export default ProductUpdateRecord = Form.create({})(ProductUpdateRecord)
