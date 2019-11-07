import {
  Breadcrumb,
  Icon,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Tooltip,
  Row,
  Col
} from 'igroot'
import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { request } from '../../../../apis/request'
import { int_thousand } from '../../../../components/format'
import Cookies from 'universal-cookie'
import moment from 'moment'
import echarts from 'echarts'
const cookies = new Cookies()

export default class DomainData extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      pagination: false,
      visible: false,
      domain_data: [],
      name: '',
      mark: '',
      more_info: '',
      edit_mark: false,
      temp_mark: '',
      mark_loading: false,
      policy_visible: false
    }
  }
  // more info
  moreModal = (more_info) => {
    this.setState({ more_visible: true, more_info, edit_mark: false, temp_mark: '' })
  }
  handleCancel = () => {
    this.setState({ more_visible: false, policy_visible: false})
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
          Modal.warning({
            title: text,
          })
        }
      })
  }
  markChange = (e) => {
    this.setState({ temp_mark: e.target.value })
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
  get_deal_msg = (data) => {
    const engine_type = { 1: '实时引擎', 2: '深度引擎', 4: '学习引擎'}
    let msg = []
    for (let i = 1; i <=4; i++) {
      if (i == 3) continue
      if (i & data) {
        msg.push(engine_type[i])
      }
    }
    return msg.length == 0 ? '暂未应用于引擎' : msg.join('、')
  }
  componentWillMount() {
    const StateParams = JSON.parse(this.props.match.params.name)
    this.setState({ name: StateParams.name, mark: StateParams.mark })
    // 记录域名
    localStorage.setItem('customer_domain', this.props.match.params.domain)
    window.scrollTo(0, 0)
  }
  componentDidMount() {
    const params = {}
    params.name = this.state.name
    params.mark = this.state.mark
    params.domain = this.props.match.params.domain
    this.get_singledata(params)
  }
  get_singledata = (params) => {
    request('/dashboard/customer/data', 'get', params)
      .then(res => {
        // console.log(res);
        this.setState({ loading: false })
        if (res && !res.code) {
          this.setState({ domain_data: res, })
          if (res.length > 50) {
            this.setState({
              pagination: { pageSize: 50 },
            })
          } else {
            this.setState({
              pagination: false,
            })
          }
        } else {
          this.setState({ domain_data: [], })
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
    const columns = [
      {
        title: '日期',
        dataIndex: 'date',
      }, {
        title: '原始日志总量（条）',
        dataIndex: 'log_count',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击源总量（个）',
        dataIndex: 'attack_source_count',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '受攻击次数（次）',
        dataIndex: 'attack_count',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击流量（B）',
        dataIndex: 'flow_count',
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '处理方式',
        dataIndex: 'deal_action',
        width: '120px',
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
        dataIndex: 'attack_reason',
        width: '200px',
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
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>
            <Link to={'/index/customer/data'}><span style={{ color: '#20a0ff' }}>客户运营情况</span></Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/index/customer/data/${this.props.match.params.name}`}><span style={{ color: '#20a0ff' }}>{this.state.name}</span></Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.match.params.domain}</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{
          padding: 24,
          background: '#fff',
          minHeight: 360
        }}>
          <div className="overflow_auto">
            <Table rowKey="date" style={{ minWidth: '860px' }} dataSource={this.state.domain_data} columns={columns} bordered pagination={this.state.pagination} loading={this.state.loading} />
          </div>
        </div>
        <Modal title={`${this.state.more_info.date  } 运营情况`} visible={this.state.more_visible} onCancel={this.handleCancel} footer={null}>
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
        <Modal title={`${this.state.more_info.name  } Policy命中&威胁得分情况`} visible={this.state.policy_visible} onCancel={this.handleCancel} footer={null} width="760px">
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
        <style>
          {`
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
