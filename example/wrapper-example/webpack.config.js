var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, "src/SimpleNetworkViewer.jsx"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "SimpleNetworkViewer.js",
    library: "SimpleNetworkViewer",
    libraryTarget: "umd",
  },
  resolve: {
    root: __dirname,
    moduleDirectories: ["node_modules", "./src"]
  },
  module: {
    loaders: [
      {
         test: /\.jsx?$/,
         exclude: /node_modules/,
         loaders: ['react-hot', 'babel?presets[]=es2015&presets[]=react']
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.(png|jpg|jpeg|svg)$/,
        exclude: /node_modules/,
        loaders: ["url"]
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};
