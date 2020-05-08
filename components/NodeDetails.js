import React, { Component } from "react";
import { formatDistance } from "date-fns";
import { Drawer, Tabs, Descriptions } from "antd";

const { TabPane } = Tabs;

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
      payments,
      initialUpdate,
      lastUpdate,
      stdOpenchanConfigs,
      adminInfo,
    } = selectedNode;

    const stdOpenchanConfig = _.find(
      stdOpenchanConfigs,
      (config) => config.tokenAddr === selectedToken
    );

    return (
      <Descriptions layout="vertical" column={1} bordered={true} size="small">
        <Descriptions.Item label="ETH Address">{id}</Descriptions.Item>
        <Descriptions.Item label="Host">{rpcHost}</Descriptions.Item>
        <Descriptions.Item label="Accept Connection">
          {openAccept ? "Yes" : "No"}
        </Descriptions.Item>
        <Descriptions.Item label="Payments processed">
          {payments}
        </Descriptions.Item>
        {lastUpdate && (
          <Descriptions.Item label="Liveness">
            Last Update:{" "}
            {formatDistance(new Date(lastUpdate), new Date(), {
              addSuffix: true,
            })}
            <br />
            Live Time:{" "}
            {formatDistance(new Date(initialUpdate), new Date(lastUpdate))}
          </Descriptions.Item>
        )}
        {stdOpenchanConfig && (
          <Descriptions.Item label="Channel Config">
            Token Address: {stdOpenchanConfig.tokenAddr}
            <br />
            Minimum Deposit: {stdOpenchanConfig.minDeposit}
            <br />
            Maximum Deposit: {stdOpenchanConfig.maxDeposit}
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
      </Descriptions>
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
            Content of Tab Pane 2
          </TabPane>
        </Tabs>
      </Drawer>
    );
  }
}
