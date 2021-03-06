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
const CleanWebpackPlugin = require("clean-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ZipFilesPlugin = require("webpack-zip-files-plugin");
const UploaderPlugin = require("./UploaderPlugin");


module.exports = () => {
  return {
    entry: ["babel-polyfill", "./src/main.js"],
    mode: "production",
    output: {
      filename: "bundle.js",
      libraryTarget: "amd",
      path: path.resolve(__dirname, "dist")
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
        [
          { from: "wrapper.prod.js", to: filenamejs },
          { from: "extension.qext", to: filename },
          { from: "token.json", to: "token.json" },
          {
            from: "dist",
            to: `${os.homedir()}/Documents/Qlik/Sense/Extensions/${mashupname}`,
            force: true,
          }
        ],
        {
          copyUnmodified: false,
          ignore: ["*.hot-update.*"]
        }
      ),
      new ZipFilesPlugin({
        entries: [{ src: "./dist/", dist: mashupname + "/" }],
        output: mashupname + "_" + version,
        format: "zip",
      }),
      new UploaderPlugin()
    ]
  };
};