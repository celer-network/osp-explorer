import React, { Component } from 'react';
import { formatDistance, format } from 'date-fns';
import { Drawer, Tabs, Descriptions, Collapse, List } from 'antd';

const { TabPane } = Tabs;
const { Panel } = Collapse;

export default class NodeDetail extends Component {
  constructor(props) {
    super(props);

    this.state = { visible: true };
  }

  componentWillReceiveProps = () => {
    this.setState({ visible: true });
  };

  handleClose = () => {
    this.setState({ visible: false });
  };

  renderInfo = () => {
    const { selectedNode, selectedToken } = this.props;
    const {
      id,
      rpcHost,
      openAccept,
      initialUpdate,
      lastUpdate,
      stdOpenchanConfigs,
      adminInfo,
      livePeriods,
      regionName,
      country,
      ip,
    } = selectedNode;

    const stdOpenchanConfig = _.find(
      stdOpenchanConfigs,
      (config) => config.tokenAddr === selectedToken
    );

    return (
      <>
        <Descriptions layout="vertical" column={1} bordered={true} size="small">
          <Descriptions.Item label="ETH Address">{id}</Descriptions.Item>
          <Descriptions.Item label="Host">
            <b>Domain:</b> {rpcHost}
            <br />
            <b>IP:</b> {ip}
            <br />
            <b>Location:</b> {`${regionName}, ${country}`}
          </Descriptions.Item>
          <Descriptions.Item label="Accept Connection">
            {openAccept ? 'Yes' : 'No'}
          </Descriptions.Item>
          {stdOpenchanConfig && (
            <Descriptions.Item label="Channel Config">
              <b>Token Address:</b> {stdOpenchanConfig.tokenAddr}
              <br />
              <b>Minimum Deposit:</b> {stdOpenchanConfig.minDeposit}
              <br />
              <b>Maximum Deposit:</b> {stdOpenchanConfig.maxDeposit}
            </Descriptions.Item>
          )}
          {adminInfo && (
            <Descriptions.Item label="Admin Info">
              {adminInfo.name}
              <br />
              {adminInfo.organization}
              <br />
              {adminInfo.address}
              <br />
              <a href={adminInfo.website} target="_blank">
                {adminInfo.website}
              </a>
              <br />
              <a href={`mailto:${adminInfo.email}`}>{adminInfo.email}</a>
            </Descriptions.Item>
          )}
          {lastUpdate && (
            <Descriptions.Item label="Liveness">
              <b>Last Update:</b>{' '}
              {formatDistance(new Date(lastUpdate), new Date(), {
                addSuffix: true,
              })}
              <br />
              <b>Live Time:</b>{' '}
              {formatDistance(new Date(initialUpdate), new Date(lastUpdate))}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Collapse>
          <Panel header="Live Periods">
            <List
              size="small"
              dataSource={livePeriods}
              renderItem={(livePeriod) => (
                <List.Item>
                  {format(new Date(livePeriod[0]), 'Pp')}
                  {' to '}
                  {format(new Date(livePeriod[1]), 'Pp')}
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      </>
    );
  };

  renderChannels = () => {
    const { selectedNode, selectedToken, nodes } = this.props;
    const { ospPeers } = selectedNode;
    const channels = _(ospPeers)
      .map((peerChannels) => {
        const { peer, balances } = peerChannels;
        const channel = _.find(
          balances,
          (balance) => balance.tokenAddr === selectedToken
        );

        if (!channel) {
          return;
        }

        return {
          ...channel,
          peer,
        };
      })
      .compact()
      .value();

    return (
      <Collapse>
        {_.map(channels, (channel) => {
          const { peer, cid, selfBalance, peerBalance } = channel;
          return (
            <Panel header={_.get(nodes[peer], 'rpcHost')}>
              <Descriptions layout="vertical" column={1} size="small">
                <Descriptions.Item label="Channel ID">{cid}</Descriptions.Item>
                <Descriptions.Item label="Self Balance">
                  {selfBalance}
                </Descriptions.Item>
                <Descriptions.Item label="Peer Balance">
                  {peerBalance}
                </Descriptions.Item>
              </Descriptions>
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  render() {
    const { selectedNode } = this.props;
    const { visible } = this.state;

    if (!selectedNode) {
      return null;
    }

    return (
      <Drawer
        title="Node Details"
        placement="right"
        visible={visible}
        mask={false}
        width={450}
        onClose={this.handleClose}
      >
        <Tabs defaultActiveKey="info">
          <TabPane tab="Info" key="info">
            {this.renderInfo()}
          </TabPane>
          <TabPane tab="Channels" key="channels">
            {this.renderChannels()}
          </TabPane>
        </Tabs>
      </Drawer>
    );
  }
}
