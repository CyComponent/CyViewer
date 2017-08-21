import React, {Component} from 'react'
import cytoscape from 'cytoscape'

import * as config from './CytoscapeJsConfig'

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
      currentLayout: null,
      allElements: null,
      genes: null,
      zoom: false
    }
  }


  updateCyjs = network => {
    this.updateCyjsInternal(network, null)
  }

  updateCyjsInternal = (network, cyjs) => {

    // React only when network data is available.
    if(network === undefined || network === null) {
      return
    }

    if(network.elements.nodes.length === 0) {
      return
    }

    console.log("CYJS UPDATE function for ------------------------------------------------------------------------------------------");
    console.log(network)

    let cy = null

    if(cyjs == null) {
      cy = this.state.cyjs
    } else {
      cy = cyjs
    }

    cy.startBatch();

    var t0 = performance.now();

    cy.remove(cy.elements('node'))
    cy.remove(cy.elements('edge'))
    cy.add(network.elements.nodes)
    cy.add(network.elements.edges)

    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")

    const genes = cy.elements('node[type = \'g\']')
    genes.addClass('invisible')

    this.setState({
      allElements: cy.elements(),
      genes: genes
    })

    t0 = performance.now();
    const layout = this.props.rendererOptions.layout
    if(layout !== undefined && layout !== null) {
      this.applyLayout(layout)
    }
    cy.fit()
    this.setEventListener(cy)

    t1 = performance.now();
    console.log("Call layout 2 took " + (t1 - t0) + " milliseconds.")

    cy.endBatch();

    // At least executed one time.
    this.setState({rendered: true})
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
          hideEdgesOnViewport: true,
          hideLabelsOnViewport: true,
          wheelSensitivity: 0.5,
          layout: {
            name: config.DEF_LAYOUT
          }
        }))
    this.state.cyjs = cy

    // Render actual network
    this.updateCyjsInternal(this.props.network, cy)
  }


  shouldComponentUpdate(nextProps, nextState) {
    // Update is controlled by componentWillReceiveProps()
    return false
  }

  /**
   * This is the main function to determin whether update is necessary or not.
   */
  componentWillReceiveProps(nextProps) {
    console.log("\n\n%CyView update------------------------------------------------------------------------------------------");

    console.log(this.props)
    console.log(nextProps)

    // Check status of network data
    if (nextProps === undefined || nextProps.network === undefined) {
      console.log("=========== NO DATA");
      return
    }

    let commandExecuted = false

    const command = nextProps.command
    if(command !== this.props.command) {
      this.runCommand(command);
    }

    // this.applyLayout(nextProps.rendererOptions.layout)


    // Check visual style
    const newVs = nextProps.networkStyle

    if(newVs !== undefined || newVS !== null) {
      const name = this.props.networkStyle.name
      const newName = newVs.name

      if(name !== newName) {
        console.log("=========== <<<<<<< Apply NEW Style =========================================");
        this.state.cyjs.style(newVs.style)
      }
    }

    if (nextProps.network === this.props.network) {
      console.log("=========== SAME NET");
      return
    }

    if(this.props.networkId === nextProps.networkId) {
      console.log("=========== SAME DATA");
      return
    }

    this.updateCyjs(nextProps.network)
    // console.log("=========== Applying layout after!");
    // this.applyLayout(nextProps.rendererOptions.layout)

    // const command = nextProps.command
    // if(command !== this.props.command) {
    //   this.runCommand(command);
    // }
  }

  runCommand = command => {

    console.log('++++++++++++ COMMAND +++++++++')

    // Execute Cytoscape command
    if (command === null) {
      console.log('===No command===');
      return
    }

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
      console.log('+++ SELECT>>>>>>>>>>>>>>>>>>> +++++++++')

      const idList = commandParams.idList
      const edges = commandParams.edges

      console.log(idList)
      console.log(edges)

      cy.startBatch()



      let selected = idList.map(id => (id.replace(/\:/, '\\:')))
      selected = selected.map(id=>('#' + id))

      const strVal = selected.toString()
      console.log(strVal)

      const target = cy.elements(strVal)

      console.log("******** TARGETS")
      console.log(target)

      // cy.elements().addClass('faded')
      // target.removeClass('faded')
      target.select()

      // Select edges

      if(edges !== undefined && edges !== null) {
        let sources = edges.map(edge => (edge.source.replace(/\:/, '\\:')))
        sources = sources.map(source=>('#' + source))

        let ts = edges.map(edge => (edge.target.replace(/\:/, '\\:')))
        ts = ts.map(target=>('#' + target))

        for(let i=0; i< sources.length; i++) {


          console.log('New E: ')
          if(sources[i].startsWith('#GO') && ts[i].startsWith('#GO')) {
            const s = cy.$(sources[i])
            const t = cy.$(ts[i])

            const e = s.edgesWith(t)
            console.log(s)
            console.log(t)
            console.log(e)

            e.select()
          }
        }
      }

      cy.fit(target)

      cy.endBatch()

    } else if(commandName === 'focus') {

      console.log('+++ Focus to a node +++++++++')

      const idList = commandParams.idList

      let selected = idList.map(id => (id.replace(/\:/, '\\:')))
      selected = selected.map(id=>('#' + id))
      const strVal = selected.toString()


      cy.startBatch();

      if(this.state.lastFocus !== undefined) {
        this.state.lastFocus.removeClass('focused')
      }

      const target = cy.elements(strVal)

      this.setState({
        lastFocus: target
      })

      var t0 = performance.now();

      // this.state.allElements.addClass('faded')
      //this.state.allElements.removeClass('focused')

      //target.removeClass('faded')
      target.addClass('focused')

      const w = cy.width()
      const h = cy.height()
      let padding = 100
      if(w > h) {
        padding = h * 0.2
      } else {
        padding = w * 0.2
      }

      cy.fit(target, padding)

      var t1 = performance.now();
      console.log("Call to FOCUS took " + (t1 - t0) + " milliseconds.")

      cy.endBatch();

      console.log('++++++++++++ FIT OK4 +++++++++')

    } else if (commandName === 'filter') {
      const options = commandParams.options

      const filterType = options.type


      if(filterType === 'numeric') {
        const range = options.range
        const toBeShown = cy.elements(range)

        cy.edges().addClass('dark')

        console.log("**shown edges")
        console.log(toBeShown)
        toBeShown.removeClass('dark')
        console.log('++++++++++++ hidden2!! +++++++++')
      }
    }

    // Callback
    this.props.eventHandlers.commandFinished(command);

    // Enable it again
    this.state.cyjs.on(config.SUPPORTED_EVENTS, this.cyEventHandler)
  }

  applyLayout = layout => {
    console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++APPLY LAY +++++++++')
    console.log(layout)

    const cy = this.state.cyjs;

    if(layout !== undefined) {
      cy.layout({
          name: layout
        })

      this.setState({currentLayout: layout})
    }
  }

  findPath = (s, g) => {
    const aStar = this.state.cyjs.elements().aStar({ root: "#" + s, goal: "#"+ g });
    const path = aStar.path

    path.select()
    this.state.cyjs.fit(path)
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
  setEventListener = cy => {
    cy.on(config.SUPPORTED_EVENTS, this.cyEventHandler)

    cy.on('tap', e => {
      if( e.cyTarget === cy ){

        cy.startBatch();
        this.state.allElements.removeClass('focused');
        cy.endBatch();
      }
    })

    // document.addEventListener('mousewheel', e => {
    //
    //   setTimeout(() => {
    //     cy.startBatch();
    //     const zoomLevel = cy.zoom()
    //     // console.log(zoomLevel)
    //
    //     if (zoomLevel > 0.1) {
    //       this.state.genes.classes()
    //     } else {
    //       this.state.genes.addClass('invisible')
    //     }
    //
    //     cy.endBatch();
    //   }, 300)
    //
    // })

  }


  render() {
    console.log('----- Base tag rendered (should be called only once)-----')

    return (
      <div ref={(cyjs) => this.cyjs = cyjs} style={this.props.style} />
    )
  }
}

export default CytoscapeJsRenderer
