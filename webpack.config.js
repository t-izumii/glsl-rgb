// webpack.config.js
const path = require('path');

module.exports = {
    entry: './js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.glsl$/,
                use: [
                    'raw-loader', // まずraw-loaderで文字列として読み込む
                    'glslify-loader', // その後glslify-loaderで処理
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.glsl'],
    },
    watch: true, // ここでwatchを有効にする
};