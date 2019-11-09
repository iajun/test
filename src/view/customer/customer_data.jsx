import {
  Breadcrumb,
  Table,
  DatePicker,
  Tabs,
  Tooltip,
  Modal,
  Row,
  Col,
  Icon
} from 'antd'
import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import request from "@api/tools/request"
import {  int_thousand  } from "@cpt/format"
import moment from 'moment'
import echarts from 'echarts'
const TabPane = Tabs.TabPane

export default class CustomerData extends React.Component {
  state = {
    mode: 'top',
    loading: true,
    pagination: false,
    visible: false,
    data_sum: [],
    customerlist: [],
    panes: [],
    activeKey: moment().subtract(1, 'day').format('YYYY-MM-DD'),
    sortedInfo: { order: 'ascend', columnKey: 'expire' },
    more_info: '',
    policy_visible: false
  }
  changeTab = (e) => {
    this.setState({ sortedInfo: { order: 'ascend', columnKey: 'expire' } })
    this.setState({ loading: true, activeKey: e })
    const params = {}
    params.start = e
    params.end = e
    this.get_customerdata(params)
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
          this.get_customerdata(params)
        }
      }
      this.setState({ panes })
      this.setState({ activeKey: dateString })
      this.setState({ sortedInfo: { order: 'ascend', columnKey: 'expire' } })
    }
  }
  disabledDate = (current) => {
    // Can not select days
    return current && current.valueOf() > moment().subtract(1, 'day').format('x')
  }
  sortChange = (pagination, filters, sorter) => {
    this.setState({
      sortedInfo: sorter,
    })
  }
  handleCancel = () => {
    this.setState({ policy_visible: false })
  }
  // policy score 情况
  policy_score = (more_info) => {
    this.setState({ policy_visible: true, more_info }, function () {
      // policy 分布
      if (more_info.threat_policy.length > 0) {
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
        this.setState({ more_info })
      }
      if (more_info.threat_score.length > 0) {
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
      tooltip: {
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
      series: [
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
  format_policy = function (arr, type) {
    let data = [];
    let temp = {};
    arr.forEach(function (item) {
      if (temp[item[type]]) {
        temp[item[type]] += item.count - 0
      } else {
        temp[item[type]] = item.count - 0
      }
    })
    for (const key of Object.keys(temp)) {
      if (type == 'policy') {
        data.push({
          policy: key,
          count: temp[key]
        })
      } else {
        data.push({
          range: key,
          count: temp[key]
        })
      }
    }
    return data
  }
  componentDidMount() {
    localStorage.removeItem('customer_scroll')
    localStorage.removeItem('customer_date')
    localStorage.removeItem('customer_period')
    localStorage.removeItem('customer_domain')
    localStorage.removeItem('customer_pagination')
    const panes = this.state.panes
    for (let i = 15; i > 0; i--) {
      const title = moment().subtract(i, 'day').format('YYYY-MM-DD')
      panes.push({ title, key: title })
      if (i == 1) {
        const params = {}
        params.start = title
        params.end = title
        this.get_customerdata(params)
      }
    }
    this.setState({ panes })
    this.setState({ activeKey: moment().subtract(1, 'day').format('YYYY-MM-DD') })
  }
  get_customerdata = (params) => {
    let type_params = Object.assign({}, params)
    type_params.type = 'customer'
    Promise.all([request('/dashboard/customer/data', 'get', params),
    request('/dashboard/customer/data', 'get', type_params)])
      .then(res => {
        if (res && !res.code) {
          const customer_data = res[0]
          const new_customer_data = res[1]
          const customer_name = []
          const data_sum = []
          const temp = {}
          for (var i = 0; i < customer_data.length; i++) {
            if (!temp[customer_data[i].name]) {
              customer_name.push(customer_data[i].name)
              temp[customer_data[i].name] = 1
            }
          }
          for (var i = 0; i < customer_name.length; i++) {
            const name = customer_name[i]
            let has_new = false
            let new_index = 0
            new_customer_data.forEach(function (item, index) {
              if (item.name == name) {
                has_new = true
                new_index = index
              }
            })
            if (has_new) {
              new_customer_data[new_index].domain = new_customer_data[new_index].domain_count - 0;
              new_customer_data[new_index].expired_day = Number(new_customer_data[new_index].expired_day);
              data_sum.push(new_customer_data[new_index])
            } else {
              data_sum.push({
                name,
                'log_count': 0,
                'attack_source_count': 0,
                'attack_count': 0,
                'flow_count': 0,
                'domain': 0,
                'mark': '',
                'expired_day': 0,
                'threat_policy': [],
                'threat_score': []
              })
              customer_data.forEach(function (elem, index) {
                if (elem.name == name) {
                  data_sum[i].log_count += elem.log_count - 0
                  data_sum[i].attack_source_count += elem.attack_source_count - 0
                  data_sum[i].attack_count += elem.attack_count - 0
                  data_sum[i].flow_count += elem.flow_count - 0
                  data_sum[i].domain++
                  data_sum[i].mark = elem.mark
                  data_sum[i].expired_day = elem.expired_day - 0
                  data_sum[i].threat_policy = data_sum[i].threat_policy.concat(elem.threat_policy)
                  data_sum[i].threat_score = data_sum[i].threat_score.concat(elem.threat_score)
                }
              })
              // 格式化 threat_policy/threat_score
              data_sum[i].threat_policy = this.format_policy(data_sum[i].threat_policy, 'policy')
              data_sum[i].threat_score = this.format_policy(data_sum[i].threat_score, 'range')
            }
          }
          this.setState({ data_sum, loading: false })
          if (data_sum.length > 50) {
            this.setState({
              pagination: {
                total: data_sum.length,
                showTotal: (total, range) => `本页为第 ${range[0]}-${range[1]} 个客户，共 ${total} 个客户`,
                pageSize: 50
              },
            })
          } else {
            this.setState({
              pagination: false,
            })
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
    const { mode } = this.state
    let { sortedInfo } = this.state
    sortedInfo = sortedInfo || {}
    const columns = [
      {
        title: `客户名（${this.state.data_sum.length}个）`,
        dataIndex: 'name',
        width: '135px',
        render: (text, record) => {
          let data = { name: text, mark: record.mark }
          data = JSON.stringify(data)
          if (record.expired_day) {
            return <Link to={`/index/customer/data/${data}`}><Tooltip title={"已到期" + record.expired_day + "天"}><span style={{ color: 'red' }}>{text}</span></Tooltip></Link>
          } else {
            return <Link to={`/index/customer/data/${data}`}><span style={{ color: '#20a0ff' }}>{text}</span></Link>
          }
        }
      }, {
        title: `到期情况`,
        dataIndex: 'expire',
        key: 'expire',
        width: '100px',
        sorter: (a, b) => a.expired_day - b.expired_day,
        sortOrder: sortedInfo.columnKey === 'expire' && sortedInfo.order,
        render: (text, record) => {
          if (record.expired_day) {
            return <span style={{ color: 'red' }}>{"已到期" + record.expired_day + "天"}</span>
          } else {
            return <span style={{ color: 'green' }}>正常</span>
          }
        }
      }, {
        title: '接入域名数（个）',
        dataIndex: 'domain',
        key: 'domain',
        sorter: (a, b) => a.domain - b.domain,
        sortOrder: sortedInfo.columnKey === 'domain' && sortedInfo.order,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '原始日志总量（条）',
        dataIndex: 'log_count',
        key: 'log_count',
        sorter: (a, b) => a.log_count - b.log_count,
        sortOrder: sortedInfo.columnKey === 'log_count' && sortedInfo.order,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击源总量（个）',
        dataIndex: 'attack_source_count',
        key: 'attack_source_count',
        sorter: (a, b) => a.attack_source_count - b.attack_source_count,
        sortOrder: sortedInfo.columnKey === 'attack_source_count' && sortedInfo.order,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '受攻击次数（次）',
        dataIndex: 'attack_count',
        key: 'attack_count',
        sorter: (a, b) => a.attack_count - b.attack_count,
        sortOrder: sortedInfo.columnKey === 'attack_count' && sortedInfo.order,
        render: (text) => (
          int_thousand(text)
        )
      }, {
        title: '攻击流量（B）',
        dataIndex: 'flow_count',
        key: 'flow_count',
        sorter: (a, b) => a.flow_count - b.flow_count,
        sortOrder: sortedInfo.columnKey === 'flow_count' && sortedInfo.order,
        render: (text) => (
          int_thousand(text)
        )
      },
      {
        title: '更多',
        key: 'action',
        width: '45px',
        render: (text, record) => (
          <div>
            <Tooltip title="Policy命中与威胁得分情况"><a className="pie-icon" onClick={this.policy_score.bind(this, record)}><Icon type="pie-chart" /></a></Tooltip>
          </div>
        )
      }
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
    return (
      <div>
        <Breadcrumb style={{
          margin: '12px 0'
        }}>
          <Breadcrumb.Item>客户运营情况</Breadcrumb.Item>
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
                  <Table rowKey="name" style={{ minWidth: '600px' }} dataSource={this.state.data_sum} columns={columns} bordered pagination={this.state.pagination}
                    onChange={this.sortChange} loading={this.state.loading} />
                </div>
              </TabPane>)}
          </Tabs>
        </div>
        <Modal title={`${this.state.more_info.name} Policy命中&威胁得分情况`} visible={this.state.policy_visible} onCancel={this.handleCancel} footer={null} width="760px">
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
                    <Col span={24} style={{ height: '160px' }} id="policy_pie"></Col>
                  </Row>
                  : null
              }
              <Row>
                <Col span={24}>
                  <Table rowKey="policy" dataSource={this.state.more_info.threat_policy} columns={policy_columns} bordered pagination={false} />
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
                    <Col span={24} style={{ height: '160px' }} id="score_pie"></Col>
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
