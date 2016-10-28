import React, {Component} from 'react'
import cytoscape from 'cytoscape'
import * as config from './CytoscapeJsConfig'
import {Set} from 'immutable'


class CytoscapeJsRenderer extends Component {

  constructor(props) {
    super(props)

    this.state = {
      rendered: false,
      currentLayout: null
    }
  }


  updateCyjs(network) {
    if(network === undefined || network === null) {
      return;
    }
    this.state.rendered = true

    // Case 1: network has Style section
    let visualStyle = network.style
    let layoutFlag = false

    if (visualStyle === undefined || visualStyle === null || visualStyle === {}) {

      if(visualStyle === null) {
        layoutFlag = true
      }
    } else {
    }

    const cy = this.state.cyjs
    cy.remove(cy.elements('node'))
    cy.remove(cy.elements('edge'))
    cy.add(network.elements.nodes)
    cy.add(network.elements.edges)
    cy.fit()
    console.log("=========== CytoscapeJS rendered network data ==========");
  }

  componentDidMount() {
    // Create Cytoscape.js instance here, only once!
    let visualStyle = this.props.networkStyle

    if(visualStyle === undefined || visualStyle === null) {
      visualStyle = config.DEF_VS
    } else {
      visualStyle = visualStyle.style
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
    this.setEventListener(cy)
    this.state.cyjs = cy
    this.updateCyjs(this.props.network)
    console.log('* Cytoscape.js initialized!')
  }


  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log("###### Checking props ########")
  //   return nextProps.network !== this.props.network;
  // }

  componentWillReceiveProps(nextProps) {
    console.log("=========== WILL PROPS");
    const command = nextProps.command
    this.runCommand(command);
    this.applyLayout(nextProps.rendererOptions.layout)

    console.log(nextProps);
    // Style
    let visualStyle = nextProps.networkStyle
    console.log("NEXT style: ------------")
    console.log(visualStyle)

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

    console.log("===Executing command: " + command);
    const cy = this.state.cyjs

    if (command === 'fit') {
      cy.fit()
    } else if (command === 'zoomIn') {
      cy.zoom(cy.zoom() * 1.2)
    } else if (command === 'zoomOut') {
      cy.zoom(cy.zoom() * 1.2)
    }

    this.props.eventHandlers.commandFinished(command);
  }

  applyLayout = layout => {
    if(layout !== undefined && this.state.currentLayout !== layout) {
      this.state.cyjs.layout({
        name: layout
      })
      this.setState({currentLayout: layout})
    }
  }


  /**
   * Translate Cytoscape.js events into action calls
   */
  setEventListener(cy) {

    cy.on(config.SUPPORTED_EVENTS, event => {
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
    })
  }


  render() {
    console.log('----- @Render called in leaf component-----')
    console.log(this.props.eventHandlers)

    return (
      <div ref={(cyjs) => this.cyjs = cyjs} style={this.props.style} />
    )
  }
}

export default CytoscapeJsRenderer
