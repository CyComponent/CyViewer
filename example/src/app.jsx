/**
 *
 * Sample application only with React component.
 * (No Redux)
 *
 */
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import CyViewer from 'cy-viewer' // The viewer React component

// HTML section to be used for rendering component
const TAG = 'viewer';

/**
 * Custom functions to handle selection events in the renderer
 */
function selectNodes(nodeIds, nodeProps) {
  console.log('====== Custom node select function called! ========');
  console.log('Selected Node ID: ' + nodeIds)
  console.log(nodeProps)
}

function selectEdges(edgeIds, edgeProps) {
  console.log('====== Custom edge select function called! ========');
  console.log('Selected Edge ID: ' + edgeIds)
  console.log(edgeProps)
}

// Then use it as a custom handler
const custom = {
  selectNodes: selectNodes,
  selectEdges: selectEdges
};


// React Application implemented as a stateless functional component
const App = props =>
  <section style={props.appStyle}>
    <h2 style={props.titleStyle}>Rendering sample with React only</h2>
    <CyViewer
      {...props}
    />
  </section>;


// Styles
const appStyle = {
  backgroundColor: '#eeeeee',
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
  height: '2em',
  margin: 0,
  fontWeight: 100,
  color: '#777777',
  paddingTop: '0.2em',
  paddingLeft: '0.8em',
};

const visualStyle = {
  style: [
    {
      "selector" : "node",
      "css" : {
        "font-family" : "SansSerif",
        "shape" : "roundrectangle",
        "background-color" : "rgb(255,255,255)",
        "width" : 55.0,
        "text-valign" : "center",
        "text-halign" : "center",
        "color" : "#666666",
        "font-size" : '0.1em',
        "height" : 20.0,
        "content" : "data(name)"
      }
    },
    {
      "selector" : "node:selected",
      "css" : {
        "background-color" : "orange",
        "color" : "white"
      }
    },
    {
      "selector" : "edge:selected",
      "css" : {
        "line-color" : "orange",
        "color" : "white"
      }
    },
  ]
}

const renderPage = cx => {
  ReactDOM.render(
    <App
      cxNetwork={cx}
      style={style}
      eventHandlers={custom}
      appStyle={appStyle}
      titleStyle={titleStyle}
      networkStyle={visualStyle}
    />,
    document.getElementById(TAG)
  );
};

const url = 'http://dev2.ndexbio.org/rest/network/e6075843-8a70-11e6-93d8-0660b7976219/asCX';


// Download the data and run the app
fetch(url)
    .then(response => (response.json()))
    .then(cxData => {
      renderPage(cxData);
    });
