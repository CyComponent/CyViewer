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
  console.log(nodeProps[nodeIds[0]])

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
    <h2 style={props.titleStyle}>AtgO rendered by new viewer</h2>
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


const sizeCalculator = ele => {
  const size = ele.data('Size')
  if(size !== undefined) {
    return Math.log(size) * 30
  } else {
    return 10
  }
}

const fontSizeCalculator = ele => {
  const size = ele.data('Size')
  if(size !== undefined) {
    const fontSize = Math.log(size) / 2
    return fontSize + 'em'
  } else {
    return '1em'
  }
}

const edgeColor = '#AAAAAA'

const visualStyle = {
  style: [
    {
      "selector" : "node",
      "css" : {
        "font-family" : "SansSerif",
        "shape" : "ellipse",
        "background-color" : 'mapData(score, 0, 1, white, #0033FF)',
        "width" : sizeCalculator,
        "text-margin-x": '1em',
        "text-valign" : "center",
        "text-halign" : "right",
        "color": 'white',
        "min-zoomed-font-size": '1em',
        "font-size" : fontSizeCalculator,
        "height" : sizeCalculator,
        "content" : "data(Manual_Name)",
        "text-wrap": 'wrap',
        "text-max-width": '40em'
      }
    },
    {
      "selector" : "node:selected",
      "css" : {
        "background-color" : "red",
        "color" : "red"
      }
    },
    {
      "selector" : "edge",
      "css" : {
        "opacity": 0.5,
        "line-color" : edgeColor,
        "source-arrow-shape": 'triangle',
        "mid-source-arrow-shape": 'triangle',
        "source-arrow-color": edgeColor,
        "mid-source-arrow-color": edgeColor,
        "color" : "white"
      }
    },
    {
      "selector" : "edge:selected",
      "css" : {
        "line-color" : "red",
        "color" : "white",
        "source-arrow-color": "red",
        "mid-source-arrow-color": "red",
        "width": '1em'
      }
    },
  ]
}


const renderPage = (network, command) => {
  ReactDOM.render(
    <App
      network={network}
      networkType={'cyjs'}
      style={style}
      eventHandlers={custom}
      appStyle={appStyle}
      titleStyle={titleStyle}
      networkStyle={visualStyle}
      command={command}
      rendererOptions={{layout: 'concentric'}}
    />,
    document.getElementById(TAG)
  );
};

const url = 'http://public.ndexbio.org/rest/network/507d3d72-14e5-11e6-a1f8-06603eb7f303/asCX';

const cyjsUrl = 'https://raw.githubusercontent.com/idekerlab/ontology-data-generators/master/atgo.cyjs'

// Download the data and run the app
fetch(cyjsUrl)
    .then(response => (response.json()))
    .then(network => {
      renderPage(network, null);
    });
