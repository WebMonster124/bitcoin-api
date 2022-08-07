let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname + "/build",
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    host: "0.0.0.0",
    https: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        query: {
          presets: ["es2015", "react"]
        },
        exclude: /node_modules/
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              // modules: true,
              // localIdentName: '[name]'
              // localIdentName: '[path][name]__[local]--[hash:base64:5]'
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyPlugin(["src/favicon.png", "src/assets/qr-search.png"]),
    new HtmlWebpackPlugin({
      title: "BITBOX",
      template: "src/index.html",
      filename: "index.html"
    })
  ]
};
