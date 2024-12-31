// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

class UpdateBuildTimePlugin {
    constructor() {
        this.lastBuildTime = null;
    }

    apply(compiler) {
        compiler.hooks.watchRun.tapAsync('UpdateBuildTimePlugin', (compiler, callback) => {
            const buildTime = new Date();

            if (buildTime - this.lastBuildTime > 5000) {
                const buildTimeFileContent = `export const BUILD_TIME = new Date('${buildTime.toISOString()}');`;
                fs.writeFileSync(path.resolve(__dirname, 'src', 'front_end', 'build_time.ts'), buildTimeFileContent);
                this.lastBuildTime = buildTime;
            }

            callback();
        });
    }
}
module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src/front_end'), // Base directory for entry and loaders
    entry: './main.ts', // Relative to the `context`
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src')
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    },
    plugins: [
        new UpdateBuildTimePlugin()
    ]
};
