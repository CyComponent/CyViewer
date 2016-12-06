import React, {Component} from 'react'
import cytoscape from 'cytoscape'
import * as config from './CytoscapeJsConfig'
import {Set} from 'immutable'


/**
 * Renderer using Cytoscape.js
 *
 */
class CytoscapeJsRenderer extends Component {

  constructor(props) {
    super(props)

    this.state = {
      rendered: false,
      currentLayout: null
    }
  }


  updateCyjs = network => {

    // React only when network data is available.
    if(network === undefined || network === null) {
      return
    }

    // At least executed one time.
    this.setState({rendered: true})

    const cy = this.state.cyjs
    cy.remove(cy.elements('node'))
    cy.remove(cy.elements('edge'))
    cy.add(network.elements.nodes)
    cy.add(network.elements.edges)
    cy.fit()
    this.setEventListener()
    console.log("=========== CytoscapeJS rendered network data ==========");
  }

  componentDidMount() {

    // Create Cytoscape.js instance here, only once!
    let visualStyle = this.props.networkStyle.style

    // Use default visual style if not available.
    if(visualStyle === undefined || visualStyle === null) {
      visualStyle = config.DEF_VS
    }

    const cy = cytoscape(
      Object.assign(
        {
          container: this.cyjs,
          elements: [],
          style: visualStyle,
          layout: {
            name: config.DEF_LAYOUT
          }
        }))

    this.state.cyjs = cy

    // Render actual network
    this.updateCyjs(this.props.network)

    console.log('* Cytoscape.js renderer initialized: ' + cy.version)
  }


  shouldComponentUpdate(nextProps, nextState) {
    return false

  }

  componentWillReceiveProps(nextProps) {
    console.log("=========== WILL PROPS");
    console.log(nextProps);

    const command = nextProps.command
    if(nextProps.command !== this.props.command) {
      this.runCommand(command);
    }

    return


    this.applyLayout(nextProps.rendererOptions.layout)

    // Style
    let visualStyle = nextProps.networkStyle
    if(visualStyle === undefined || visualStyle === null) {
      visualStyle = config.DEF_VS
    } else {
      visualStyle = visualStyle.style
    }
    this.state.cyjs.style(visualStyle)


    if (nextProps === undefined || nextProps.network === undefined) {
      console.log("=========== NO DATA");
      return
    }

    if (nextProps.network === this.props.network
      && this.state.rendered === true) {
      return
    }
    this.updateCyjs(nextProps.network)
  }

  runCommand = command => {

    // Execute Cytoscape command
    if (command === null) {
      console.log('===No command===');
      return
    }

    console.log('########## Handling Command:')
    console.log(command)

    // Disable handler
    this.state.cyjs.off(config.SUPPORTED_EVENTS, this.cyEventHandler)

    const cy = this.state.cyjs

    const commandName = command.command
    const commandParams = command.parameters

    if (commandName === 'fit') {
      cy.fit()
    } else if (commandName === 'zoomIn') {
      cy.zoom(cy.zoom() * 1.2)
    } else if (commandName === 'zoomOut') {
      cy.zoom(cy.zoom() * 0.8)
    } else if (commandName === 'findPath') {
      const startId = commandParams.startId
      const endId = commandParams.endId

      this.findPath(startId, endId)
    }

    // Callback
    this.props.eventHandlers.commandFinished(command);

    // Enable it again
    this.state.cyjs.on(config.SUPPORTED_EVENTS, this.cyEventHandler)
  }

  applyLayout = layout => {
    if(layout !== undefined && this.state.currentLayout !== layout) {
      this.state.cyjs.layout({
        name: layout
      })
      this.setState({currentLayout: layout})
    }
  }

  findPath = (s, g) => {
    const aStar = this.state.cyjs.elements().aStar({ root: "#" + s, goal: "#"+ g });
    aStar.path.select();
  }


  cyEventHandler = event => {

    console.log("*********** CyjsEvent Handler called!")

    const cy = this.state.cyjs

    const eventType = event.originalEvent.type;
    const target = event.cyTarget;

    if(target === undefined || target === null) {
      return
    }

    const nodeProps = {}
    const edgeProps = {}

    switch (eventType) {
      case config.CY_EVENTS.boxstart:
        this.setState({boxSelection: true})
        break;

      case config.CY_EVENTS.boxselect:

        // Handle multiple selection
        if(this.state.boxSelection) {
          const nodes = cy.$('node:selected').map(node=> {

            const nodeData = node.data()
            nodeProps[nodeData.id] = nodeData

            return nodeData.id});
          const edges = cy.$('edge:selected').map(edge=>edge.data().id);

          this.props.eventHandlers.selectNodes(nodes, nodeProps)
          this.props.eventHandlers.selectEdges(edges)
          this.setState({ boxSelection: false });
        }
        break;
      case config.CY_EVENTS.select:
        if(!this.state.boxSelection) {
          if (target.isNode()) {
            const nodeData = target.data()
            const nodeId = nodeData.id
            nodeProps[nodeId] = nodeData
            this.props.eventHandlers.selectNodes([nodeId], nodeProps)
          } else {
            const edgeData = target.data()
            const edgeId = edgeData.id
            edgeProps[edgeId] = edgeData
            this.props.eventHandlers.selectEdges([edgeId], edgeProps)
          }
        }
        break;
      case config.CY_EVENTS.unselect:
        if(target.isNode()) {
          this.props.eventHandlers.deselectNodes([target.data().id])
        } else {
          this.props.eventHandlers.deselectEdges([target.data().id])
        }
        break;

      default:
        break;
    }

  }

  /**
   * Translate Cytoscape.js events into action calls
   */
  setEventListener() {
    const cy = this.state.cyjs
    cy.on(config.SUPPORTED_EVENTS, this.cyEventHandler)
  }


  render() {
    console.log('----- Base tag rendered (should be called only once)-----')

    return (
      <div ref={(cyjs) => this.cyjs = cyjs} style={this.props.style} />
    )
  }
}

export default CytoscapeJsRenderer
