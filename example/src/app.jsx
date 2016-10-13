/**
 *
 * Sample application only with pure React component.
 * (No Redux dependency)
 *
 */

import React, {Component} from 'react'
import ReactDOM from 'react-dom'

import CyNetworkViewerComponent from 'cy-network-viewer-component'

// Sample data in Cytoscape.js format
const networkData = require('./sample.json')


const style = {
  width: '100%',
  height: '100%',
  backgroundColor: '#404040'
}

const appStyle = {
  backgroundColor: '#404040',
  color: '#EEEEEE',
  width: '100%',
  height: '100%',

}

const titleStyle = {
  fontWeight: 100,
  fontFamily: 'HelvaticaNeu',
  color: '#AAAAAA',
  paddingLeft: '1em',
  paddingTop: '0.5em'
}

function selectNodes(networkId, nodeIds) {
  console.log('Custom select function called!!')
}

const myCustomEventHandlers = {
  selectNodes: selectNodes
}

class App extends Component {

  render() {


    console.log('handler-------')
    console.log(myCustomEventHandlers)


    return (
      <div style={appStyle}>
        <h2 style={titleStyle}>Rendering sample with React only</h2>
        <CyNetworkViewerComponent
          networkId='renderer1'
          renderer='cytoscape'
          network={networkData}
          style={style}

          eventHandlers={myCustomEventHandlers}
        />
      </div>
    )
  }

}


ReactDOM.render(
  <App />,
  document.getElementById('viewer')
);
