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
      'background-color': 'teal',
      width: '1em',
      height: '1em',
      label: 'data(name)'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': 'orange',
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#999999',
      'width': '1px',
      label: 'data(interaction)',
      'font-size': '0.1em',
      'text-rotation': 'autorotate',
      'text-wrap': 'wrap',
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': 'red',
    }
  }
];


// Events handled by this renderer
const SUPPORTED_EVENTS = 'select'
// const SUPPORTED_EVENTS = 'data select unselect add remove boxselect boxstart'

export { SUPPORTED_EVENTS, CY_EVENTS, DEF_BG_COLOR, DEF_LAYOUT, DEF_VS}
