# CyViewer

A React component for network data visualization using Cytoscape.js.

## What's this?
This is a pure React component for visualizing graph data sets.
Designed to consume CX as the input data. 
 
## How to use
To build and use this component, you need Node.js. 

```/example``` directory contains simple application using this React 
component.

To start, just cd to the directory and run:

```
npm install && npm run dev
```

and then open ```http://localhost:8080/```


## Frameworks Used:

### Dependency
- React.js
- Immutable.js
- Cytoscape.js

### Development Tools
- Webpack
- Babel (es6,jsx supported!)
- ESLint
- Jest for testing

## Commands

```
npm run build - Build the component into /build
npm run clean - Remove anything in /build
npm run lint - Run eslint, will not cause npm to exit with an error
npm run test - Run eslint followed by jest, may cause npm to exit with an error (for travis)
npm run coverage - Run jest's coverage tool
```
