import React, {Component, PropTypes} from 'react'
import Immutable, {Map} from 'immutable'

import CytoscapeJsRenderer from './CytoscapeJsRenderer'


// Default rendering engine name, Cytoscape.js
const REDERER_CY = 'cytoscape';

// Other renderer example, but not implemented yet
const REDERER_D3_FORCE = 'd3-force';

// Base style for the region for the network renderer
const STYLE = {
  width: '100%',
  height: '100%'
};


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
  selectNodes: (networkId, nodeIds) => {console.log('selectNodes called.')},
  selectEdges: (networkId, edgeIds) => {console.log('selectEdges called.')},

  // Nodes/edges unselected
  deselectNodes: (networkId, nodeIds) => {console.log('deselectNodes called.')},
  deselectEdges: (networkId, edgeIds) => {console.log('deselectEdges called.')},

  // Node positions changed (usually done by mouse drag)
  changeNodePositions: (networkId, nodePositions) => {console.log('changeNodePositions called.')},


  // Are there any other important events generated in the renderer...?
});


/**
 * Base class for the network viewer component
 *
 * This encapsulate the actual renderer component and
 * hides their raw API.
 */
class CyNetworkViewerComponent extends Component {

  render() {
    const eventHandlers = this.buildEventHanders();
    const props = this.props
    const id = props.networkId;

    if (this.props.renderer === REDERER_CY) {
      return (
        <CytoscapeJsRenderer
          {...props}
          key={id}
          eventHandlers={eventHandlers}

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
    if(handlers === undefined || handlers === null) {
      return DEF_EVENT_HANDLERS.toJS()
    }

    // Use default + user provided handlers.
    return DEF_EVENT_HANDLERS.mergeDeep(handlers).toJS()
  }
}

CyNetworkViewerComponent.propTypes = {

  // Immutable ID to be used as the unique identifier in the DOM
  networkId: PropTypes.string.isRequired,

  // Event handlers for actions for the network, such as selection.
  eventHandlers: PropTypes.object.isRequired,

  // Network data in THE RENDERER'S DATA FORMAT. MAY NOT CX!
  network: PropTypes.object,

  // Style of the area used by the renderer
  style: PropTypes.object,

  // Style for the network, which is RENDERER DEPENDENT, not CSS
  networkStyle: PropTypes.object,

  // ID of the renderer.  Default is Cytoscape.js
  renderer: PropTypes.string,

  // Optional parameters for the renderer
  rendererProps: PropTypes.object
};

/**
 * Default values
 */
CyNetworkViewerComponent.defaultProps = {
  renderer: REDERER_CY,
  style: STYLE,
  eventHandlers: DEF_EVENT_HANDLERS.toJS()
};

export default CyNetworkViewerComponent