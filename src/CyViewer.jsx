import React, {Component, PropTypes} from 'react'
import Immutable, {Map} from 'immutable'
import shortid from 'shortid'

// Actual renderer.  For now, it is Cytoscpae.js
import CytoscapeJsRenderer from './CytoscapeJsRenderer'

// Base style for the region for the network renderer
const STYLE = { width: '100%', height: '100%' };

const TYPE_CX = 'cx'
const TYPE_CYJS = 'cyjs'


// Empty Cytocape.js network
const EMPTY_NET = {
  data: {},
  elements: {
    nodes: [],
    edges: []
  }
}

/**
 *
 * These handlers provide access to renderer's internal state.
 * For example, you can implement your own function responds to
 * the node selection event in Cytoscape.js
 *
 * (If you are a Redux user, these are actions for Redux's
 * network data store)
 *
 * Default event handlers below are empty functions.
 * You SHOULD provide actual implementations of these functions
 * if you want to respond to these events from the network renderer.
 *
 */
const DEF_EVENT_HANDLERS = Immutable.fromJS({

  /**
   * Node(s) are selected in the view
   *
   * @param nodeIds - Array of selected node IDs
   * @param properties - Optional:
   *   Object contains node properties. (Key is ID)
   */
  selectNodes: (nodeIds, properties = {}) => {
    console.log('selectNodes called.')
    console.log(nodeIds)
  },

  /**
   * Edge(s) are selected in the view
   *
   * @param edgeIds - Array of selected edge IDs
   * @param properties - Optional:
   *   Object contains edge properties. (Key is ID)
   */
  selectEdges: (edgeIds, properties = {}) => {
    console.log('selectEdges called.')
  },

  /**
   * Node(s) are deselected in the view
   *
   * @param nodeIds - Array of unselected node IDs
   */
  deselectNodes: (nodeIds) => {
    console.log('deselectNodes called.')
  },

  /**
   * Edge(s) are deselected in the view
   *
   * @param edgeIds - Array of unselected edge IDs
   */
  deselectEdges: (edgeIds) => {
    console.log('deselectEdges called.')
  },

  /**
   * Position of nodes are changed by user actions
   * (usually done by mouse drag)
   *
   * @param nodePositions - Object that has (x, y) positions of nodes.
   *   e.g. { id1: [x1-pos, y1-pos], id2: [x2-pos, y2-pos],...}
   *   where xn-pos and yn-pos
   *   are numbers represent (x,y) position of node with ID n.
   */
  changeNodePositions: (nodePositions) => {
    console.log('changeNodePositions called.')
  },

  /**
   * This will be called after executing renderer native commands,
   * such as automatic layout or animation.
   *
   * @param lastCommand - command executed (Command name as String)
   * @param status - Optional: result of the command execution
   */
  //
  commandFinished: (lastCommand, status = {}) => {
    console.log('Command Finished: ' + lastCommand);
    console.log(status);
  },

  // Are there any other important events we should handle...?
});


/**
 * Base component of the network viewer
 *
 * This encapsulate the actual renderer component and
 * hides their raw API.
 */
class CyViewer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cyjsNetwork: null,
      networkId: null,
    }
  }

  /**
   * Convert CX into Cytoscape.js using external service.
   *
   * @param cxNetwork - CX data as an array
   */
  cx2js = cxNetwork => {
    if(cxNetwork.length === 0) {
      return;
    }

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

    fetch(this.props.serviceUrl, params)
      .then(response => {
        return response.json()
      })
      .then(json => {
        // TODO: are there any better way to handle this?
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

    if(this.props.networkType === TYPE_CX) {
      this.cx2js(this.props.network);
    } else {
      this.setState({
        cyjsNetwork: this.props.network,
        networkId: shortid.generate()
      })
    }
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.networkType === TYPE_CX && this.props.network !== nextProps.network) {
      console.log('NEED update')
      this.cx2js(nextProps.network);
    } else {
      // This is a Cytoscape.js network
      // this.setState({
      //   networkId: shortid.generate()
      // })
    }

    if (nextProps.network === this.props.network) {
      console.log("GOt SAME NET data!!!");
    } else {
      console.log("@ID UPDATED");
      this.setState({
        networkId: shortid.generate()
      })

    }
  }


  render() {
    if(this.props.network === null) {
      return (<div></div>)
    }



    // TODO: how can I avoid using state for storing native network data?
    let network = this.state.cyjsNetwork

    if(this.props.networkType === TYPE_CYJS) {
      network = this.props.network
    }


    if(network === null || network === undefined) {
      network = EMPTY_NET
    } else if(network.elements === undefined || network.elements === null) {
      network = EMPTY_NET
    }


    // Check style is in the network object or not
    let vs = {
      name: this.state.networkId,
      style: network.style
    };
    if(this.props.networkStyle !== undefined) {
      vs = this.props.networkStyle
      vs.name = this.state.networkId
    }

    return (
      <CytoscapeJsRenderer
        {...this.props}
        network={network}
        networkId={this.state.networkId}
        eventHandlers={this.buildEventHanders()}
        networkStyle={vs}
      />
    )
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


CyViewer.propTypes = {
  // Network data in CX
  network: PropTypes.any,

  // Type of network data.  Default is CX.
  networkType: PropTypes.string,

  // Style of the area used by the renderer
  style: PropTypes.object,

  // Style for the network, which is RENDERER DEPENDENT, not CSS
  networkStyle: PropTypes.object,

  // Event handlers for actions for the network, such as selection.
  eventHandlers: PropTypes.object.isRequired,

  // Optional parameters for the renderer
  rendererOptions: PropTypes.object,

  // Command for renderer to be executed next.
  // This is null except when something is actually running in renderer
  command: PropTypes.object,

  // Service URL to convert CX into native format
  serviceUrl: PropTypes.string
};


CyViewer.defaultProps = {
  network: null,
  networkType: TYPE_CX,
  command: null,
  style: STYLE,
  eventHandlers: DEF_EVENT_HANDLERS.toJS(),
  rendererOptions: {},
  serviceUrl: 'http://ci-dev-serv.ucsd.edu:3001/cx2cyjs'
};

export default CyViewer