const path = require("path");
var os = require("os");
var resolve = (p) => path.resolve(__dirname, p);

const CopyWebpackPlugin = require("copy-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const WebpackAutoInject = require("webpack-auto-inject-version");
const webpack = require("webpack");

const mashupname = require("./package.json").name;
const friendlyname = require("./package.json").friendlyname;

const version = require("./package.json").version;
const filename = mashupname + ".qext";
const filenamejs = mashupname + ".js";
const description = require("./package.json").description;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin"); // installed via npm
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ZipFilesPlugin = require("webpack-zip-files-plugin");


module.exports = env => {
  return {
    entry: "./src/main.js",
    mode: "development",
    output: {
      filename: filenamejs,
      libraryTarget: "amd",
      path: path.resolve(__dirname, "dist")
    },
    devtool: "inline-source-map",
    // watch: true,
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: ["node_modules"]
    },
    optimization: {
      // minimizer: [
      //   new TerserPlugin({
      //     test: /\.js(\?.*)?$/i,
      //     cache: true,
      //     parallel: true
      //   })
      // ]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(["css-loader", "sass-loader"])
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: ExtractTextPlugin.extract(["url-loader?limit=100000"])
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: "file-loader",
          options: {
            objectAssign: "Object.assign"
          }
        }
      ]
    },
    resolve: {
      extensions: [".js"],
      alias: {
        "public": resolve("./public"),
        "@": resolve("src")
      }
    },
    externals: [
      "qlik",
      "js/qlik",
      "jquery",
      "client.utils/routing"
    ],
    devServer: {
      historyApiFallback: true,
      noInfo: true,
    },
    performance: {
      hints: false,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ExtractTextPlugin({ filename: "style.css" }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require("cssnano"),
        cssProcessorPluginOptions: {
          preset: ["default", { discardComments: { removeAll: true } }],
        },
        canPrint: true
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CopyWebpackPlugin(
        [
          { from: "extension.qext", to: filename },
          { from: "token.json", to: "token.json" }
        ],
        {
          copyUnmodified: false,
        }
      ),
      new WebpackAutoInject({
        components: {
          AutoIncreaseVersion: false,
        }
      }),
      new ReplaceInFileWebpackPlugin([{
        dir: "dist",
        files: [filename],
        rules: [{
          search: "VERSIONNUMBER",
          replace: version,
        },
        {
          search: "MASHUPNAME",
          replace: friendlyname,
        },
        {
          search: "BUILDDESCRIPTION",
          replace: description,
        }]
      }]),
      new CopyWebpackPlugin(
        [{
          from: "dist",
          to: `${os.homedir()}/Documents/Qlik/Sense/Extensions/${mashupname}`,
          force: true,
        }],
        {
          copyUnmodified: false,
          ignore: ["*.hot-update.*"]
        }
      ),
      new ZipFilesPlugin({
        entries: [{ src: "./dist/", dist: mashupname + "/" }],
        output: mashupname + "_" + version,
        format: "zip",
      })
    ]
  };
};