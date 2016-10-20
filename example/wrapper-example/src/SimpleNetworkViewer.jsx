/**
 * Wrapper for the network viewer to hide React API
 */
import React from 'react'
import ReactDOM from 'react-dom'
import Immutable, {Set} from 'immutable'


import CyNetworkViewerComponent from 'cy-network-viewer-component'


const Viewport = props =>
  <div style={props.style}>
    <CyNetworkViewerComponent
      {...props}
      renderer='cytoscape'
    />
  </div>

class SimpleNetworkViewer {

  constructor(viewportTagId, networkId, network,
              width='100%', height='700px', background='teal') {

    this.viewportStyle = {
      width: width,
      height: height,
      background: background
    }

    this.network = this.buildInitialState(network)
    this.tagId = viewportTagId
    this.networkId = networkId
  }

  buildInitialState(networkInCx) {
    return Immutable.fromJS({
      network: networkInCx,
      selected: {
        nodes: Set(),
        edges: Set()
      },
      view: {
        zoom: 1.0,
        pan: {
          x: 0,
          y: 0
        },
        style: {}
      }
    });
  }

  display() {
    console.log('*** Renderer called for ' + this.tagId);

    ReactDOM.render(
      <Viewport
        key={this.tagId}
        networkId={this.networkId}
        network={this.network}
        style={this.viewportStyle}
      />,
      document.getElementById(this.tagId)
    );
  }
}

export function create(tagId, key, network, width, height, background) {
  return new SimpleNetworkViewer(tagId, key, network, width, height, background)
}