// Original position will be used when layout is positions are available
const DEF_LAYOUT = 'preset'

// Default background color
const DEF_BG_COLOR = '#FFFFFF'

const CY_EVENTS = {
  select: 'select',
  unselect: 'unselect',
  add: 'add',
  remove: 'remove',

  boxselect: 'boxselect',
  boxstart: 'boxstart'
}

const DEF_VS = [
  {
    selector: 'node',
    style: {
      'background-color': 'white',
      'background-opacity': '0',
      'width': '0.8em',
      'height': '0.8em',
      'border-width': '4px',
      'border-color': '#4580CC',
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': '0',
      'background-opacity': '1',
      'background-color': 'orange',
      'width': '1em',
      'height': '1em',
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': 'white',
      'width': '1px',
      'opacity': '0.5'
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': 'white',
      'width': '1px',
      'opacity': '0.5'
    }
  }
]

// Events handled by this renderer
const SUPPORTED_EVENTS = 'data select unselect add remove boxselect boxstart'

export { SUPPORTED_EVENTS, CY_EVENTS, DEF_BG_COLOR, DEF_LAYOUT, DEF_VS}
