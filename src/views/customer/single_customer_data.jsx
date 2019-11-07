import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Input,
  DatePicker,
  Tooltip,
  Tabs,
  Radio,
  Row,
  Col,
  message
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { request } from '../../../../apis/request'
import { int_thousand, formatDig, formatDate, formatWeeks } from '../../../../components/format'
import Cookies from 'universal-cookie'
import moment from 'moment'
import echarts from 'echarts'
const cookies = new Cookies()
const TabPane = Tabs.TabPane
message.config({
  top: 100,
  duration: 1.6,
})

export default class SingleCustomerData extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mode: 'top',
      loading: true,
      pagination: false,
      visible: false,
      single_data: [],
      panes: [],
      activeKey: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      name: '',
      mark: '',
      period: 'day',
      selectTime: null,
      more_info: '',
      edit_mark: false,
      temp_mark: '',
      mark_loading: false,
      moretime_visible: false,
      moretime_info: '',
      more_type: [],
      more_deal: [],
      more_status: [],
      policy_visible: false
    }
  }
  changeTab = (e) => {
    this.setState({ loading: true, activeKey: e })
    const params = {}
    params.name = this.state.name
    params.mark = this.state.mark
    if (this.state.period == 'day') {
      params.start = e
      params.end = e
    } else if (this.state.period == 'week') {
      params.start = (`${e  }`).split(' ~ ')[0]
      params.end = (`${e  }`).split(' ~ ')[1]
      params.sum = true
    }
    this.get_singledata(params)
    // 清除位置信息
    localStorage.removeItem('customer_scroll')
    localStorage.removeItem('customer_domain')
  }
  onChange = (date, dateString) => {
    if (date) {
      this.setState({ selectTime: moment(date) })
      let panes = this.state.panes
      panes = []
      this.setState({ panes })
      if (this.state.period == 'day') {
        for (var i = 15; i > 0; i--) {
          const title = moment(date).subtract(i - 1, 'day').format('YYYY-MM-DD')
          panes.push({ title, key: title })
          if (i == 1) {
            const params = {}
            params.name = this.state.name
            params.mark = this.state.mark
            params.start = title
            params.end = title
            this.get_singledata(params)
          }
        }
        this.setState({ panes })
        this.setState({ activeKey: dateString })
        this.setState({ time: date })
      } else if (this.state.period == 'week') {
        const time = moment(date).format('x')
        const year = moment(date).format('YYYY')
        let weekStart = []
        let weekEnd = []
        for (var i of formatWeeks(year)) {
          let start = i[0], end = i[1]
          if (start <= time) {
            weekStart.push(start)
            weekEnd.push(end)
          }
        }
        if (weekStart.length > 8 && weekEnd.length > 8) {
          weekStart = weekStart.slice(-8)
          weekEnd = weekEnd.slice(-8)
        }
        for (i = 0; i < weekStart.length; i++) {
          const title = `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}`
          panes.push({ title, key: title })
          if (i == weekStart.length - 1) {
            const params = {}
            params.name = this.state.name
            params.mark = this.state.mark
            params.start = formatDate(weekStart[i])
            params.end = formatDate(weekEnd[i])
            params.sum = true
            this.get_singledata(params)
            this.setState({ activeKey: `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}` })
          }
        }
        this.setState({ panes })
      }
      // 清除位置信息
      localStorage.removeItem('customer_scroll')
      localStorage.removeItem('customer_domain')
    } else {
      this.setState({ selectTime: null })
    }
  }
  disabledDate = (current) => {
    // Can not select days
    return current && current.valueOf() > moment().subtract(1, 'day').format('x')
  }
  // change period
  handlePeriodChange = (e) => {
    this.setState({ selectTime: null })
    this.setState({ period: e.target.value })
    let panes = this.state.panes
    panes = []
    this.setState({ panes })
    if (e.target.value == 'day') {
      for (var i = 15; i > 0; i--) {
        const title = moment(this.state.activeKey.split('~')[1].trim()).subtract(i - 1, 'day').format('YYYY-MM-DD')
        if (moment(title).unix() < moment().startOf('day').unix()) {
          panes.push({ title, key: title })
        }
        if (i == 1) {
          const params = {}
          params.name = this.state.name
          params.mark = this.state.mark
          params.start = moment(this.state.activeKey.split('~')[0].trim()).format('YYYY-MM-DD')
          params.end = moment(this.state.activeKey.split('~')[0].trim()).format('YYYY-MM-DD')
          this.get_singledata(params)
          this.setState({ activeKey: moment(this.state.activeKey.split('~')[0].trim()).format('YYYY-MM-DD') })
        }
      }
      this.setState({ panes })
    } else if (e.target.value == 'week') {
      const time = moment(this.state.activeKey).format('x')
      const year = moment(this.state.activeKey).format('YYYY')
      let weekStart = []
      let weekEnd = []
      for (var i of formatWeeks(year)) {
        let start = i[0], end = i[1]
        if (start <= time) {
          weekStart.push(start)
          weekEnd.push(end)
        }
      }
      if (weekStart.length > 8 && weekEnd.length > 8) {
        weekStart = weekStart.slice(-8)
        weekEnd = weekEnd.slice(-8)
      }
      for (i = 0; i < weekStart.length; i++) {
        const title = `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}`
        panes.push({ title, key: title })
        if (i == weekStart.length - 1) {
          const params = {}
          params.name = this.state.name
          params.mark = this.state.mark
          params.start = formatDate(weekStart[i])
          params.end = formatDate(weekEnd[i])
          params.sum = true
          this.get_singledata(params)
          this.setState({ activeKey: `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}` })
        }
      }
      this.setState({ panes })
    }
    // 清除位置信息
    localStorage.removeItem('customer_scroll')
    localStorage.removeItem('customer_domain')
  }
  // more info
  moreModal = (more_info) => {
    localStorage.removeItem('customer_scroll')
    localStorage.setItem('customer_domain', more_info.domain)
    this.setState({ more_visible: true, more_info, edit_mark: false, temp_mark: '' })
  }
  moretimeModal = (moretime_info) => {
    localStorage.removeItem('customer_scroll')
    localStorage.setItem('customer_domain', moretime_info.domain)
    const more_attacktype = []
    const more_dealaction = []
    const more_status = []
    if (!!moretime_info.attack_reason) {
      for (const key of Object.keys(moretime_info.attack_reason)) {
          let temp_reason = []
          moretime_info.attack_reason[key].forEach(function (item) {
              temp_reason.push(item.reason)
          })
          temp_reason =  temp_reason.join('、 ')
        more_attacktype.push({
          'key': key,
          'date': key,
          'value': temp_reason
        })
      }
      this.setState({ more_type: more_attacktype })
    } else {
      this.setState({ more_type: [] })
    }
    if (!!moretime_info.deal_action) {
      for (const key of Object.keys(moretime_info.deal_action)) {
        more_dealaction.push({
          'key': key,
          'date': key,
          'value': moretime_info.deal_action[key],
          'deal_action_block': moretime_info.deal_action_block[key],
          'deal_action_user': moretime_info.deal_action_user[key]
        })
      }
      this.setState({ more_deal: more_dealaction })
    } else {
      this.setState({ more_deal: [] })
    }
    if (!!moretime_info.status) {
      for (const key of Object.keys(moretime_info.status)) {
        more_status.push({
          'key': key,
          'date': key,
          'value': moretime_info.status[key]
        })
      }
      this.setState({ more_status })
    } else {
      this.setState({ more_status: [] })
    }
    this.setState({ moretime_visible: true, moretime_info, })
  }
  // policy score 情况
  policy_score = (more_info) => {
    localStorage.removeItem('customer_scroll')
    localStorage.setItem('customer_domain', more_info.domain)
    this.setState({ policy_visible: true, more_info },function () {
      // policy 分布
      if (more_info.threat_policy.length>0) {
        let policy_legend = []
        let policy_data = []
        more_info.threat_policy.forEach(function (item) {
          policy_legend.push(item.policy)
          policy_data.push({
            name: item.policy,
            value: item.count
          })
        })
        const policyChart = echarts.init(document.getElementById('policy_pie'))
        const policyOption = this.setPieOption(policy_legend, policy_data, 'Policy命中分布')
        policyChart.setOption(policyOption)
      }
      // 威胁得分 分布
      if (!Number(more_info.attack_count)) {
        more_info.threat_score = []
        this.setState({more_info})
      }
      if (more_info.threat_score.length>0) {
        let score_legend = []
        let score_data = []
        more_info.threat_score.reverse()
        more_info.threat_score.forEach(function (item) {
          score_legend.push(item.range)
          score_data.push({
            name: item.range,
            value: item.count
          })
        })
        const scoreChart = echarts.init(document.getElementById('score_pie'))
        const scoreOption = this.setPieOption(score_legend, score_data, '威胁得分分布')
        scoreChart.setOption(scoreOption)
      }
    })
  }
  setPieOption = (legend, data, name) => {
    return {
      tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 0,
          top: 20,
          bottom: 20,
          itemWidth: 10,
          itemHeight: 10,
          data: legend,
      },
      series : [
          {
              name: name,
              type: 'pie',
              center: ['40%', '50%'],
              radius: ['60%', '80%'],
              label: {
                  normal: {
                      show: false
                  }
              },
              labelLine: {
                  normal: {
                      show: false
                  }
              },
              data: data,
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              }
          }
      ]
    }
  }
  handleCancel = () => {
    this.setState({ more_visible: false, moretime_visible: false, policy_visible: false })
  }
  editMark = () => {
    this.setState({ edit_mark: true })
  }
  cancelMark = () => {
    this.setState({ edit_mark: false })
  }
  confirmMark = () => {
    this.setState({ mark_loading: true })
    const url = `/dashboard/customer/${  this.state.more_info.lid  }/data`
    request(url, 'put', {}, { mark: this.state.temp_mark })
      .then(res => {
        // console.log(res);
        this.setState({ mark_loading: false })
        if (res && !res.code) {
          this.setState({ edit_mark: false })
          const temp_moreinfo = this.state.more_info
          temp_moreinfo.mark = res.mark
          this.setState({ more_info: temp_moreinfo })
        } else {
          this.setState({ mark_loading: false })
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })
  }
  markChange = (e) => {
    this.setState({ temp_mark: e.target.value })
  }
  // 表格筛选，排序，分页改变
  tableChange = (pagination, filters, sorter) => {
    if (pagination.current) {
      const newpag = this.state.pagination
      newpag.current = pagination.current
      this.setState({ pagination: newpag })
      localStorage.setItem('customer_pagination', pagination.current)
    }
    localStorage.removeItem('customer_scroll')
    localStorage.removeItem('customer_domain')
  }
  componentWillMount() {
    const StateParams = JSON.parse(this.props.match.params.name)
    this.setState({ name: StateParams.name, mark: StateParams.mark })
    // localstorage是否有日期，时间跨度，域名信息；没有给默认值
    let customer_date = localStorage.getItem('customer_date')
    let customer_period = localStorage.getItem('customer_period')
    if (!customer_date) {
      customer_date = this.state.activeKey
    }
    if (customer_period) {
      this.setState({
        period: customer_period
      })
    } else {
      customer_period = this.state.period
    }
    const panes = this.state.panes
    if (customer_period == 'day') {
      for (var i = 15; i > 0; i--) {
        const title = moment(customer_date).subtract(i - 1, 'day').format('YYYY-MM-DD')
        panes.push({ title, key: title })
        if (i == 1) {
          const params = {}
          params.name = StateParams.name
          params.mark = StateParams.mark
          params.start = title
          params.end = title
          this.get_singledata(params, true)
        }
      }
      this.setState({ panes })
      this.setState({ activeKey: customer_date })
    } else if (customer_period == 'week') {
      const time = moment(customer_date.split('~')[0].trim()).format('x')
      const year = moment(customer_date.split('~')[0].trim()).format('YYYY')
      let weekStart = []
      let weekEnd = []
      for (var i of formatWeeks(year)) {
        let start = i[0], end = i[1]
        if (start <= time) {
          weekStart.push(start)
          weekEnd.push(end)
        }
      }
      if (weekStart.length > 8 && weekEnd.length > 8) {
        weekStart = weekStart.slice(-8)
        weekEnd = weekEnd.slice(-8)
      }
      for (i = 0; i < weekStart.length; i++) {
        const title = `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}`
        panes.push({ title, key: title })
        if (i == weekStart.length - 1) {
          const params = {}
          params.name = StateParams.name
          params.mark = StateParams.mark
          params.start = formatDate(weekStart[i])
          params.end = formatDate(weekEnd[i])
          params.sum = true
          this.get_singledata(params, true)
          this.setState({ activeKey: `${formatDate(weekStart[i])  } ~ ${  formatDate(weekEnd[i])}` })
        }
      }
      this.setState({ panes })
    }

  }
  get_deal_msg = (data) => {
    const engine_type = { 1: '实时引擎', 2: '深度引擎', 4: '学习引擎'}
    let msg = []
    for (let i = 1; i <=4; i++) {
      if (i == 3) continue
      if (i & data) {
        msg.push(engine_type[i])
      }
    }
    return msg.length == 0 ? '无' : msg.join('、')
  }
  componentWillUnmount() {
    // 离开页面记录日期，周期，滚动
    localStorage.setItem('customer_date', this.state.activeKey)
    localStorage.setItem('customer_period', this.state.period)
    const scrollTop = window.pageYOffset || document.body.scrollTop
    localStorage.setItem('customer_scroll', scrollTop)
  }
  get_singledata = (params, first_loading) => {
    request('/dashboard/customer/data', 'get', params)
      .then(res => {
        // console.log(res);
        this.setState({ loading: false })
        if (res && !res.code) {
          this.setState({ single_data: res, })
          if (res.length > 50) {
            if (first_loading) {
              this.setState({
                pagination: {
                  total: res.length,
                  showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 个域名，共 ${total} 个域名`,
                  pageSize: 50,
                  current: localStorage.getItem('customer_pagination') - 0
                },
              })
            } else {
              this.setState({
                pagination: {
                  total: res.length,
                  showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 个域名，共 ${total} 个域名`,
                  pageSize: 50,
                  current: 1
                },
              })
              localStorage.setItem('customer_pagination', 1)
            }
          } else {
            this.setState({
              pagination: false,
            })
          }
        } else {
          this.setState({ single_data: [], })
          let text = '网络错误，请稍后再试'
          if (res && res.message) {
            text = res.message
          }
          message.warning(text)
        }
      })
  }
  render() {
    localStorage.getItem('customer_scroll') ? window.scrollTo(0, localStorage.getItem('customer_scroll') - 0) : null
    const { mode } = this.state
    const moretype_columns = [
      {
        title: '日期',
        width: '100px',
        dataIndex: 'date',
      }, {
        title: '内容',
        dataIndex: 'value',
        render: (text) => (text ? text : '无')
      },
    ]
    const moredeal_columns = [
      {
        title: '日期',
        width: '100px',
        dataIndex: 'date',
      }, {
        title: '内容',
        dataIndex: 'value',
        render: (text, record) => {
          const deal_type = { 0: '无', 1: '拦截', 2: '自定义', 3: '拦截、自定义' }
          let deal_msg = ""
          switch ( text & 3 ) {
            case 1:
              deal_msg = <div> {deal_type[text & 3]} :&nbsp; { this.get_deal_msg(record.deal_action_block)} </div>
              break;
            case 2:
              deal_msg = <div> {deal_type[text & 3]} :&nbsp; { this.get_deal_msg(record.deal_action_user)} </div>
              break;
            case 3:
              deal_msg = <div> {deal_type[text & 3]} <br/> 拦截： {this.get_deal_msg(record.deal_action_user)} <br/> 自定义： {this.get_deal_msg(record.deal_action_user)} </div>
              break;
            default:
              deal_msg = deal_type[text & 3]
          }
          return deal_msg
        }
      },
    ]
    const morestatus_columns = [
      {
        title: '日期',
        width: '100px',
        dataIndex: 'date',
      }, {
        title: '内容',
        dataIndex: 'value',
        render: (text) => {
          if (text) {
            return <Table dataSource={text} columns={more_columns} bordered pagination={false} />
          } else {
            return '无'
          }
        }
      },
    ]
    const more_columns = [
      {
        title: '主机名',
        dataIndex: 'hostname',
      }, {
        title: 'ip',
        dataIndex: 'ip',
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (
          text == 'normal' ? '正常' : text
        )
      },
    ]
    const policy_columns = [
      {
        title: 'Policy',
        dataIndex: 'policy',
      }, {
        title: '次数',
        dataIndex: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (text) => (int_thousand(text))
      }
    ]
    const score_columns = [
      {
        title: '分数区间',
        dataIndex: 'range',
      }, {
        title: '次数',
        dataIndex: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (text) => (int_thousand(text))
      }
    ]
    const day_columns = [
      {
        title: `域名（${  int_thousand(this.state.single_data.length)  }个）`,
        dataIndex: 'domain',
        width: '180px',
        render: (text) => (
          <Link to={`/index/customer/data/${this.props.match.params.name}/${text}`}><span style={{ color: '#20a0ff' }}>{text}</span></Link>
        )
      }, {
        title: '原始日志总量（条）',
        dataIndex: 'log_count',
        sorter: (a, b) => a.log_count - b.log_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击源总量（个）',
        dataIndex: 'attack_source_count',
        sorter: (a, b) => a.attack_source_count - b.attack_source_count,
        // sortOrder: 'ascend',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '受攻击次数（次）',
        dataIndex: 'attack_count',
        sorter: (a, b) => a.attack_count - b.attack_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击流量（B）',
        dataIndex: 'flow_count',
        sorter: (a, b) => a.flow_count - b.flow_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '处理方式',
        dataIndex: 'deal_action',
        width: '110px',
        render: (text, record) => {
          const deal_type = { 0: '无', 1: '拦截', 2: '自定义', 3: '拦截、自定义' }
          let deal_msg = ""
          switch ( text & 3 ) {
            case 1:
              deal_msg = <div> {deal_type[text & 3]} :&nbsp; { this.get_deal_msg(record.deal_action_block)} </div>
              break;
            case 2:
              deal_msg = <div> {deal_type[text & 3]} :&nbsp; { this.get_deal_msg(record.deal_action_user)} </div>
              break;
            case 3:
              deal_msg = <div> {deal_type[text & 3]} <br/> 拦截： {this.get_deal_msg(record.deal_action_user)} <br/> 自定义： {this.get_deal_msg(record.deal_action_user)} </div>
              break;
            default:
              deal_msg = deal_type[text & 3]
          }
          return deal_msg
        }
      }, {
        title: '主要攻击类型',
        width: '150px',
        dataIndex: 'attack_reason',
        render: (text) => {
          let reason = []
          let title = ""
          if (Array.isArray(text)) {
            text.forEach(function (item) {
              reason.push(item.reason)
              if (item.attack_count) {
                title += item.reason + " : " + int_thousand(item.attack_count) + " \n"
              }
            })
          }
          return <Tooltip title={title}>{reason.join('、')}</Tooltip>
        }
      }, {
        title: '更多',
        key: 'action',
        width: '65px',
        render: (text, record) => (
          <div>
            <Tooltip title="Policy命中与威胁得分情况"><a className="pie-icon" onClick={this.policy_score.bind(this, record)}><Icon type="pie-chart" /></a></Tooltip>
            <Tooltip title="查看更多信息"><a onClick={this.moreModal.bind(this, record)}><Icon type="ellipsis" /></a></Tooltip>
          </div>
        )
      }
    ]
    const week_columns = [
      {
        title: `域名（${  int_thousand(this.state.single_data.length)  }个）`,
        dataIndex: 'domain',
        width: '180px',
        render: (text) => (
          <Link to={`/index/customer/data/${this.props.match.params.name}/${text}`}><span style={{ color: '#20a0ff' }}>{text}</span></Link>
        )
      }, {
        title: '原始日志总量（条）',
        dataIndex: 'log_count',
        sorter: (a, b) => a.log_count - b.log_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击源总量（个）',
        dataIndex: 'attack_source_count',
        sorter: (a, b) => a.attack_source_count - b.attack_source_count,
        // sortOrder: 'ascend',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '受攻击次数（次）',
        dataIndex: 'attack_count',
        sorter: (a, b) => a.attack_count - b.attack_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击流量（B）',
        dataIndex: 'flow_count',
        sorter: (a, b) => a.flow_count - b.flow_count,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '更多',
        key: 'action',
        width: '65px',
        render: (text, record) => (
          <div>
            <Tooltip title="Policy命中与威胁得分情况"><a className="pie-icon" onClick={this.policy_score.bind(this, record)}><Icon type="pie-chart" /></a></Tooltip>
            <Tooltip title="查看更多信息"><a onClick={this.moretimeModal.bind(this, record)}><Icon type="ellipsis" /></a></Tooltip>
          </div>
        )
      }
    ]
    const columns = this.state.period == 'day' ? day_columns : week_columns
    const show_mark = <div>{this.state.more_info.mark}
      <Tooltip title="编辑备注信息" >
        <a><Icon type="edit" onClick={this.editMark.bind(this)} style={{ fontSize: 14, marginLeft: '10px' }} /></a>
      </Tooltip>
    </div>
    const edit_markComponent = <div><Input defaultValue={this.state.more_info.mark} onChange={this.markChange} style={{ width: '50%' }} />
      <Button style={{ marginLeft: '12px' }} onClick={this.cancelMark.bind(this)}><Icon type="close" style={{ fontSize: 16 }} /></Button>
      <Button type="primary" style={{ marginLeft: '12px' }} onClick={this.confirmMark.bind(this)} loading={this.state.mark_loading}><Icon type="check" style={{ fontSize: 16 }} /></Button>
    </div>
    const edit_mark = this.state.edit_mark ? edit_markComponent : show_mark
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item><Link to={'/index/customer/data'}><span style={{ color: '#20a0ff' }}>客户运营情况</span></Link></Breadcrumb.Item>
          <Breadcrumb.Item>{this.state.name}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          {
            //     <Button  type='primary' style={{
            //     margin: '0px 0px 12px 0px'
            // }}><Link to={'/index/customer/data'}><Icon type="left" />返回客户运营列表</Link></Button>
          }
          <DatePicker onChange={this.onChange} disabledDate={this.disabledDate} value={this.state.selectTime} />
          <Radio.Group value={this.state.period} onChange={this.handlePeriodChange} style={{ float: 'right' }}>
            <Radio.Button value="day">天</Radio.Button>
            <Radio.Button value="week">周</Radio.Button>
          </Radio.Group>
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
                  <Table rowKey="domain" style={{ minWidth: '850px' }} dataSource={this.state.single_data} columns={columns} bordered pagination={this.state.pagination}
                    loading={this.state.loading} onChange={this.tableChange}
                    rowClassName={(record, index) => {
                      let rowclass = ''
                      record.domain == localStorage.getItem('customer_domain') ? rowclass += 'trKeep' : rowclass += ''
                      return rowclass
                    }} />
                </div>
              </TabPane>)}
          </Tabs>
          <Modal title={`${this.state.more_info.domain  } 运营情况`} visible={this.state.more_visible} onCancel={this.handleCancel} footer={null}>
            <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Col span={5}>
                <div style={{ float: 'right' }}>主机状态：</div>
              </Col>
              <Col span={19}>
                <Table dataSource={this.state.more_info.status} columns={more_columns} bordered pagination={false} />
              </Col>
            </Row>
            <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', height: '34px' }}>
              <Col span={5}>
                <div style={{ float: 'right' }}>备注：</div>
              </Col>
              <Col span={19} style={{ wordBreak: 'break-all' }}>
                {edit_mark}
              </Col>
            </Row>
          </Modal>
          <Modal title={`${this.state.moretime_info.domain  } 运营情况`} visible={this.state.moretime_visible} onCancel={this.handleCancel} footer={null}>
            <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Col span={6}>
                <div style={{ float: 'right' }}>主要攻击类型：</div>
              </Col>
              <Col span={18}>
                <Table dataSource={this.state.more_type} columns={moretype_columns} bordered pagination={false} showHeader={false} />
              </Col>
            </Row>
            <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Col span={6}>
                <div style={{ float: 'right' }}>处理方式：</div>
              </Col>
              <Col span={18}>
                <Table dataSource={this.state.more_deal} columns={moredeal_columns} bordered pagination={false} showHeader={false} />
              </Col>
            </Row>
            <Row style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Col span={6}>
                <div style={{ float: 'right' }}>主机状态：</div>
              </Col>
              <Col span={18} className="overflow_auto">
                <Table style={{ minWidth: '300px' }} dataSource={this.state.more_status} columns={morestatus_columns} bordered pagination={false} showHeader={false} />
              </Col>
            </Row>
          </Modal>
          <Modal title={`${this.state.more_info.domain  } Policy命中&威胁得分情况`} visible={this.state.policy_visible} onCancel={this.handleCancel} footer={null} width="760px">
            <Row style={{ marginBottom: '20px' }} gutter={24}>
              <Col span={13}>
                <Row style={{ marginBottom: '20px' }}>
                  <Col span={24}>
                    <div className="policy-title">Policy命中情况</div>
                  </Col>
                </Row>
                {
                  this.state.more_info.threat_policy && this.state.more_info.threat_policy.length > 0 ?
                  <Row>
                    <Col span={24} style={{height: '160px'}} id="policy_pie"></Col>
                  </Row>
                  : null
                }
                <Row>
                  <Col span={24}>
                    <Table rowKey="policy" dataSource={this.state.more_info.threat_policy} columns={policy_columns} bordered pagination={false}/>
                  </Col>
                </Row>
              </Col>
              <Col span={11}>
                <Row style={{ marginBottom: '20px' }}>
                  <Col span={24}>
                    <div className="policy-title">威胁得分分布</div>
                  </Col>
                </Row>
                {
                  this.state.more_info.threat_score && this.state.more_info.threat_score.length > 0 ?
                  <Row>
                    <Col span={24} style={{height: '160px'}} id="score_pie"></Col>
                  </Row>
                  : null
                }
                <Row>
                  <Col span={24}>
                    <Table rowKey="range" dataSource={this.state.more_info.threat_score} columns={score_columns} bordered pagination={false} />
                  </Col>
                </Row>
              </Col>
            </Row>

          </Modal>
        </div>
        <style>
          {`
                    .trKeep {
                        background-color: #f0f5ff
                    }
                    .pie-icon {
                      font-size: 18px;
                      margin-right: 8px;
                    }
                    .policy-title {
                      text-align: center;
                      font-size: 16px;
                      font-weight: bold;
                    }
                `}
        </style>
      </div>
    )
  }
}
