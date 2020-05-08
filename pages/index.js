import React, { Component } from "react";
import _ from "lodash";
import { Layout } from "antd";
import fetch from "isomorphic-unfetch";
import dynamic from "next/dynamic";

import Map from "../components/Map";
import TokenSelector from "../components/TokenSelector";
import NodeDetails from "../components/NodeDetails";
import styles from "./index.module.css";

const NodeTable = dynamic(() => import("../components/NodeTable"), {
  ssr: false,
});
const { Sider, Content } = Layout;

const BASE_URL = process.env.SERVER || "http://localhost:8000";

const getSelectedChannels = _.memoize((selectedToken, channels) => {
  return _.pickBy(
    channels,
    (channel) => channel.tokenAddress === selectedToken
  );
});

class Index extends Component {
  constructor(props) {
    super(props);

    const { tokens } = props;
    this.state = {
      selectedNode: null,
      selectedToken: tokens[0].address,
    };
  }

  handleSelectToken = (token) => {
    this.setState({
      selectedToken: token,
    });
  };

  handleSelectNode = (node) => {
    this.setState({
      selectedNode: node,
    });
  };

  render() {
    const { nodes, channels, tokens } = this.props;
    const { selectedNode, selectedToken } = this.state;
    const selectedChannels = getSelectedChannels(selectedToken, channels);

    return (
      <Layout>
        <Sider theme={"light"} width={300}>
          <TokenSelector
            tokens={tokens}
            selectedToken={selectedToken}
            onChange={this.handleSelectToken}
          />
          <NodeTable nodes={nodes} onSelectNode={this.handleSelectNode} />
        </Sider>
        <Layout>
          <Content className={styles.content}>
            <Map
              nodes={nodes}
              channels={selectedChannels}
              selectedNode={selectedNode}
              onSelectNode={this.handleSelectNode}
            />
            <NodeDetails
              selectedNode={selectedNode}
              selectedToken={selectedToken}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

Index.getInitialProps = async function () {
  const res = await fetch(`${BASE_URL}/db`);
  const json = await res.json();
  const { nodes, channels, tokens } = json;

  return {
    tokens,
    nodes: _.keyBy(nodes, "id"),
    channels: _.keyBy(channels, "id"),
  };
};

export default Index;
