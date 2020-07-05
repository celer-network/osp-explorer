import React, { Component } from 'react';
import _ from 'lodash';
import { StaticMap } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoiZnpodSIsImEiOiJjazg2bXd1NG4wNWZ3M2Vwc3NqcmR3aDdmIn0.A-KahdW0A_TfMhUZHmYVig';

const INITIAL_VIEW_STATE = {
  longitude: -3,
  latitude: 52,
  zoom: 3,
  pitch: 0,
  bearing: 0,
};

const NODE_COLOR = {
  default: [255, 140, 0],
  selected: [4, 51, 255],
  unselected: [255, 140, 0, 0],
};
const CHANNEL_COLOR = {
  default: [0, 0, 0],
  unselected: [0, 0, 0, 0],
};

const NODE_LAYER_ID = 'nodes';
const CHANNEL_LAYER_ID = 'channels';

const getConnectedNodes = (node, channels) => {
  const connectedNodes = {};

  _.get(node, 'channels', []).forEach((channelID) => {
    const channel = channels[channelID];
    if (!channel) {
      return;
    }

    connectedNodes[channel.peers[0]] = true;
    connectedNodes[channel.peers[1]] = true;
  });

  return connectedNodes;
};

const getConnectedChannels = (node) => {
  const connectedChannels = {};

  _.get(node, 'channels', []).forEach((channelID) => {
    connectedChannels[channelID] = true;
  });

  return connectedChannels;
};

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleClick = (info) => {
    const { onSelectNode } = this.props;
    const { layer, object } = info;
    const layerID = _.get(layer, 'id');

    if (layerID === NODE_LAYER_ID) {
      onSelectNode(object);
    } else {
      onSelectNode(null);
    }
  };

  handleHover = (info) => {
    const { x, y, object } = info;
    this.setState({ x, y, hoveredObject: object });
  };

  renderTooltip() {
    const { x, y, hoveredObject } = this.state;
    console.log(hoveredObject, x, y);
    return (
      hoveredObject && (
        <div className="map-tooltip" style={{ left: x, top: y }}>
          <span>{hoveredObject.rpcHost || hoveredObject.id}</span>
        </div>
      )
    );
  }

  renderLayers() {
    const { nodes, channels, selectedNode } = this.props;
    const connectedNodes = getConnectedNodes(selectedNode, channels);
    const connectedChannels = getConnectedChannels(selectedNode);

    return [
      new ScatterplotLayer({
        id: NODE_LAYER_ID,
        data: Object.values(nodes),
        autoHighlight: true,
        radiusScale: 20,
        getColor: (d) => {
          if (!selectedNode) {
            return NODE_COLOR.default;
          }

          if (d.id === selectedNode.id) {
            return NODE_COLOR.selected;
          }

          if (connectedNodes[d.id]) {
            return NODE_COLOR.default;
          }

          return NODE_COLOR.unselected;
        },
        getRadius: 1000,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 10,
        getPosition: (d) => d.coordinates,
        onHover: this.handleHover,
      }),
      new LineLayer({
        id: CHANNEL_LAYER_ID,
        data: Object.values(channels),
        opacity: 0.8,
        getSourcePosition: (d) => nodes[d.peers[0]].coordinates,
        getTargetPosition: (d) => nodes[d.peers[1]].coordinates,
        getColor: (d) => {
          if (!selectedNode || connectedChannels[d.id]) {
            return CHANNEL_COLOR.default;
          }

          return CHANNEL_COLOR.unselected;
        },
        getWidth: 3,
        pickable: true,
        onHover: this.handleHover,
      }),
    ];
  }

  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={this.renderLayers()}
        onClick={this.handleClick}
        getCursor={() => 'default'}
      >
        <StaticMap reuseMaps mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        {this.renderTooltip()}
      </DeckGL>
    );
  }
}
