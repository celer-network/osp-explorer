import React, { Component } from "react";
import _ from "lodash";
import { Layout } from "antd";
import fetch from "isomorphic-unfetch";

import Map from "../components/Map";
import NodeTable from "../components/NodeTable";
import NodeDetails from "../components/NodeDetails";
import styles from "./index.module.css";

const { Sider, Content } = Layout;

const BASE_URL = "http://localhost:8000";

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null
    };
  }

  handleSelectNode = node => {
    this.setState({
      selectedNode: node
    });
  };

  render() {
    const { nodes, channels } = this.props;
    const { selectedNode } = this.state;

    return (
      <Layout>
        <Sider width={300}>
          <NodeTable nodes={nodes} onSelectNode={this.handleSelectNode} />
        </Sider>
        <Layout>
          <Content className={styles.content}>
            <Map
              nodes={nodes}
              channels={channels}
              selectedNode={selectedNode}
              onSelectNode={this.handleSelectNode}
            />
            <NodeDetails selectedNode={selectedNode} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

Index.getInitialProps = async function() {
  const res = await fetch(`${BASE_URL}/db`);
  const json = await res.json();
  const { nodes, channels } = json;

  return {
    nodes: _.keyBy(nodes, "id"),
    channels: _.keyBy(channels, "id")
  };
};

export default Index;
