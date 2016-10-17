/**
 *
 * Sample application only with pure React component.
 * (No Redux dependency)
 *
 */

import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import CyNetworkViewerComponent from 'cy-network-viewer-component'

// Sample network data in Cytoscape.js JSON format
const networkData = require('./sample.json');

// HTML section to be used for rendering component
const TAG = 'viewer';



/**
 * Custom action to handle node selection event in the renderer
 */
function selectNodes(networkId, nodeIds) {
  console.log('====== Custom node select function called! ========');
  console.log('Network ID: ' + networkId)
  console.log('Selected Node ID: ' + nodeIds)
}

function selectEdges(networkId, edgeIds) {
  console.log('====== Custom edge select function called! ========');
  console.log('Network ID: ' + networkId)
  console.log('Selected Edge ID: ' + edgeIds)
}

// Then use it as a custom handler
const custom = {
  selectNodes: selectNodes,
  selectEdges: selectEdges
};


// Application implemented as a stateless functional component
const App = props =>
  <section style={props.appStyle}>
    <h2 style={props.titleStyle}>Rendering sample with React only</h2>
    <CyNetworkViewerComponent
      {...props}
      networkId='renderer1'
      renderer='cytoscape'
    />
  </section>


// Styles
const appStyle = {
  backgroundColor: '#404040',
  color: '#EEEEEE',
  width: '100%',
  height: '100%',
};

const style = {
  width: '100%',
  height: '100%',
  backgroundColor: '#404040'
};

const titleStyle = {
  fontWeight: 100,
  fontFamily: 'HelvaticaNeu',
  color: '#BBBBBB',
  paddingLeft: '0.8em',
  paddingTop: '0.4em'
};

ReactDOM.render(
  <App
    network={networkData}
    style={style}
    eventHandlers={custom}
    appStyle={appStyle}
    titleStyle={titleStyle}
  />,
  document.getElementById(TAG)
);
