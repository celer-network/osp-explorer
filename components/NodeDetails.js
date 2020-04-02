import React, { Component } from "react";
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
    const { selectedNode } = this.props;

    return (
      <Descriptions layout="vertical" column={1} bordered={true} size="small">
        <Descriptions.Item label="ETH Address">
          {selectedNode.id}
        </Descriptions.Item>
        <Descriptions.Item label="Hostname">
          {selectedNode.hostname}
        </Descriptions.Item>
        <Descriptions.Item label="Port">{selectedNode.port}</Descriptions.Item>
        <Descriptions.Item label="Token Type">
          {selectedNode.tokenType}
        </Descriptions.Item>
        <Descriptions.Item label="Accept Connection">
          {selectedNode.acceptConnection ? "Yes" : "No"}
        </Descriptions.Item>
        <Descriptions.Item label="Payments processed">
          {selectedNode.paymentNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Available Balance">
          {selectedNode.availableBalance}
        </Descriptions.Item>
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
        onClose={this.handleClose}
        mask={false}
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
