let path=require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV
var HtmlWebpackPlugimConfig ={
	template:'./src/index.html',
	inject:true
}
var config ={
	mode:NODE_ENV,
	entry:'./src/index.js',
	output:{
		filename:'[name]@[hash:8].js',
		chunkFilename:'[name]@[chunkhash].chunk.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
			"React": "react",
		})
	],
	module:{
		rules: [
	    	{
	    		test: /\.css$/,
	    		use:[
	    			{loader: 'style-loader'},
          			{loader: 'css-loader'},
          			{loader: 'postcss-loader'},
	    		]
	    	},
	    	{
	    		test: /\.scss/,
	    		use:[
	    			{loader: 'style-loader'},
          			{loader: 'css-loader'},
          			{loader: 'postcss-loader'},
          			{loader: 'sass-loader'},
	    		]
	    	},
	    	{
                test:/\.(js|jsx)$/,
                use: ['babel-loader'],
		        exclude: path.resolve(__dirname, 'node_modules'),
           },
	    	{
	    		test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff2)$/,
	    		loader: 'url-loader',
	    		options: {
	    			limit:1024,
	    			name:'[name]-[hash].[ext]'
	    		}
	    	}
        ]
	}
}
if(NODE_ENV == 'development') {
	config.devServer = {
		port: 9000,
		open: true,
    	inline: true,//实时刷新
	}
} else if (NODE_ENV == 'production') {
	HtmlWebpackPlugimConfig.filename= path.resolve(__dirname,'dist/index.html')
	config.output.path = path.resolve(__dirname,'dist/build')
	config.output.publicPath = 'build/'

}
config.plugins.push(new HtmlWebpackPlugin(HtmlWebpackPlugimConfig))

module.exports = config