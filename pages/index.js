import React, { Component } from "react";
import { Layout } from "antd";

import Map from "../components/map";
import styles from "./index.module.css";

const { Sider, Content } = Layout;

class HomePage extends Component {
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
        <Sider>Sider</Sider>
        <Layout>
          <Content className={styles.content}>
            <Map
              nodes={nodes}
              channels={channels}
              selectedNode={selectedNode}
              onClickNode={this.handleSelectNode}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

HomePage.getInitialProps = async function() {
  return {
    nodes: {
      a: {
        id: "a",
        coordinates: [-118.59397, 33.4672],
        channels: [1, 2]
      },
      b: {
        id: "b",
        coordinates: [-2.858620657849378, 53.3363751054422],
        channels: [1]
      },
      c: {
        id: "c",
        coordinates: [-1.71034578407216, 55.03708486080194],
        channels: [2]
      }
    },
    channels: {
      1: {
        id: 1,
        peer0: "a",
        peer1: "b"
      },
      2: {
        id: 2,
        peer0: "a",
        peer1: "c"
      }
    }
  };
};

export default HomePage;
