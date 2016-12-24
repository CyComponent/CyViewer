import React, {Component} from 'react'
import cytoscape from 'cytoscape'
import * as config from './CytoscapeJsConfig'
import Immutable, {Set, Map} from 'immutable'


/**
 * Renderer using Cytoscape.js
 *
 */
class CytoscapeJsRenderer extends Component {

  constructor(props) {
    super(props)

    this.state = {
      cyjs: null,
      rendered: false,
      currentLayout: null
    }
  }


  updateCyjs = network => {
    this.updateCyjsInternal(network, null)
  }

  updateCyjsInternal = (network, cyjs) => {

    // React only when network data is available.
    console.log("=========== S1 @@@@@@@@@@@@@@@@@@@@@=");
    if(network === undefined || network === null) {
      return
    }

    console.log("=========== S2 @@@@@@@@@@@@@@@@@@@@@=");

    // At least executed one time.
    this.setState({rendered: true})

    let cy = null

    if(cyjs == null) {
      cy = this.state.cyjs
    } else {
      cy = cyjs
    }

    cy.remove(cy.elements('node'))
    cy.remove(cy.elements('edge'))
    cy.add(network.elements.nodes)
    cy.add(network.elements.edges)
    cy.fit()
    this.setEventListener(cy)
    console.log("=========== CytoscapeJS rendered network data ==========");
  }

  componentDidMount() {

    // Create Cytoscape.js instance here, only once!
    let visualStyle = this.props.networkStyle.style
    console.log("######### Original style name:");
    console.log(this.props.networkStyle.name)

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


    console.log('@* Cytoscape.js renderer initialized')
    console.log(cy)
    console.log(this.state)

    // Render actual network
    this.updateCyjsInternal(this.props.network, cy)

  }


  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  /**
   * This is the main function to determin whether update is necessary or not.
   */
  componentWillReceiveProps(nextProps) {
    console.log("=== received new props");
    console.log(nextProps);
    console.log("last---")
    console.log(this.props);

    const command = nextProps.command
    if(command !== this.props.command) {
      this.runCommand(command);
    }

      console.log("=========== Applying layout");
      this.applyLayout(nextProps.rendererOptions.layout)


    // Check visual style
    const newVs = nextProps.networkStyle

    if(newVs !== undefined || newVS !== null) {
      const name = this.props.networkStyle.name
      const newName = newVs.name

      if(name !== newName) {
        console.log("=========== Apply Style ========");
        this.state.cyjs.style(newVs.style)
      }
    }

    // Check status of network data
    if (nextProps === undefined || nextProps.network === undefined) {
      console.log("=========== NO DATA");
      return
    }

    if (nextProps.network === this.props.network) {
      return
    }

    this.updateCyjs(nextProps.network)
    console.log("=========== Applying layout after!");
    this.applyLayout(nextProps.rendererOptions.layout)
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
    this.state.cyjs.off(config.SUPPORTED_EVENTS)

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

    } else if(commandName === 'select') {
      const idList = commandParams.idList

      const firstNode = idList[0]
      console.log("2!!!!!!!!!!!! To be selected: " + firstNode)
      const targets = cy.filter('node[id_original = "' + firstNode + '"]')
      console.log(targets)

      // targets.forEach(n => {
        console.log('222++++++++++++ selected +++++++++')
        console.log(targets[0])
      // })


      const n = targets[0]
      const position  = n.position();

      console.log(cy.pan())
      console.log(position)
      console.log(cy.zoom())

      targets.select()

      cy.fit(targets, 700)


      // Zoom and pan

    }

    // Callback
    this.props.eventHandlers.commandFinished(command);

    // Enable it again
    this.state.cyjs.on(config.SUPPORTED_EVENTS, this.cyEventHandler)
  }

  applyLayout = layout => {
    if(layout !== undefined) {
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
    this.state.cyjs.off(config.SUPPORTED_EVENTS)

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

    this.state.cyjs.on(config.SUPPORTED_EVENTS, this.cyEventHandler)
  }

  /**
   * Translate Cytoscape.js events into action calls
   */
  setEventListener(cy) {
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
