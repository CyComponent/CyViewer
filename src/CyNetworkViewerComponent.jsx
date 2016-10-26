import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import shortid from 'shortid'

import CytoscapeJsRenderer from './CytoscapeJsRenderer'

const CX_SERVICE_URL = 'http://ci-dev-serv.ucsd.edu:3001/cx2cyjs'
// const CX_SERVICE_URL = 'http://localhost:3000/cx2cyjs'

// Default rendering engine name, Cytoscape.js
const REDERER_CY = 'cytoscape';

// Other renderer example, but not implemented yet
const REDERER_D3_FORCE = 'd3-force';

// Base style for the region for the network renderer
const STYLE = {
  width: '100%',
  height: '100%'
};

const EMPTY_NET = {
  data: {},
  elements: {
    nodes: [],
    edges: []
  }
}


/**
 *
 * Default event handlers that are empty functions.
 * This provides an access to renderer's internal state
 * to other components.
 *
 * If you use Redux, these are actions for the network model.
 *
 * By default, these do nothing.  User of this component SHOULD
 * provide proper functions to call functions to update upstream
 * data model.
 *
 */
const DEF_EVENT_HANDLERS = Immutable.fromJS({

  // Selection of nodes/edges
  selectNodes: (nodeIds, properties = {}) => {
    console.log('selectNodes called.')
  },
  selectEdges: (edgeIds, properties = {}) => {
    console.log('selectEdges called.')
  },

  // Nodes/edges unselected
  deselectNodes: (nodeIds) => {
    console.log('deselectNodes called.')
  },
  deselectEdges: (edgeIds) => {
    console.log('deselectEdges called.')
  },

  // Node positions changed (usually done by mouse drag)
  changeNodePositions: (nodePositions) => {
    console.log('changeNodePositions called.')
  },


  // Are there any other important events generated in the renderer...?
});


/**
 * Base class for the network viewer component
 *
 * This encapsulate the actual renderer component and
 * hides their raw API.
 */
class CyNetworkViewerComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cyjsNetwork: null,
      networkId: shortid.generate(),
    }
  }

  // TODO: make this a parameter
  cx2js = cxNetwork => {
    console.log('========== API call for cx to CYJS')
    console.log(cxNetwork)

    const params = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cxNetwork)
    }

    fetch(CX_SERVICE_URL, params)

      .then(response => {
        return response.json()
      })
      .then(json => {
        console.log('got restlt in CYJS')
        console.log(json)
        this.setState({
          cyjsNetwork: json,
          networkId: shortid.generate()
        })
      })
      .catch(error => {
        throw error;
      })
  }


  componentWillMount() {
    this.cx2js(this.props.cxNetwork);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.cxNetwork !== nextProps.cxNetwork) {
      console.log('NEED update')
      this.cx2js(nextProps.cxNetwork);
    }
  }


  render() {
    const eventHandlers = this.buildEventHanders();
    const props = this.props

    let network = this.state.cyjsNetwork

    console.log('!!!ORIGINAL ***************')
    console.log(this.props.eventHandlers)
    console.log(eventHandlers);

    if(network === null) {
      network = EMPTY_NET
    }

    let vs = {
      style: network.style
    }

    if(this.props.networkStyle !== undefined) {
      vs = this.props.networkStyle
    }

    console.log(vs)


    if (this.props.renderer === REDERER_CY) {
      return (
        <CytoscapeJsRenderer
          {...props}
          network={network}
          networkId={this.state.networkId}
          eventHandlers={eventHandlers}
          networkStyle={vs}
        />
      )
    } else {
      return (
        <h1>Renderer not available</h1>
      )
    }
  }

  buildEventHanders() {
    const handlers = this.props.eventHandlers;
    if (handlers === undefined || handlers === null) {
      return DEF_EVENT_HANDLERS.toJS()
    }

    // Use default + user provided handlers.
    return DEF_EVENT_HANDLERS.mergeDeep(handlers).toJS()
  }
}

CyNetworkViewerComponent.propTypes = {

  // Event handlers for actions for the network, such as selection.
  eventHandlers: PropTypes.object.isRequired,

  // Network data in CX
  cxNetwork: PropTypes.array,

  // Style of the area used by the renderer
  style: PropTypes.object,

  // Style for the network, which is RENDERER DEPENDENT, not CSS
  networkStyle: PropTypes.object,

  // ID of the renderer.  Default is Cytoscape.js
  renderer: PropTypes.string,

  // Optional parameters for the renderer
  rendererOptions: PropTypes.object,

  // Command for renderer to be executed next.
  // This is null except when something is actually running in renderer
  command: PropTypes.string
};

/**
 * Default values
 */
CyNetworkViewerComponent.defaultProps = {
  command: null,
  renderer: REDERER_CY,
  style: STYLE,
  eventHandlers: DEF_EVENT_HANDLERS.toJS(),
  rendererOptions: {}
};

export default CyNetworkViewerComponent