import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import { getConfigFileParsingDiagnostics } from 'typescript';

export default (
    config: webpack.Configuration,
    options: CustomWebpackBrowserSchema,
    targetOptions: TargetOptions
) => {
    if (config.module && config.module.rules) {
        // config.module.rules.push(
        //   {
        //     test: /\.(s*)css$/,
        //     use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }]
        // },
        // {
        //     test: /\.(png|jpg|svg)$/,
        //     loader: 'file-loader'
        // }
        // // {
        // //     test: /\.(woff|woff2|eot|ttf|otf)$/,
        // //     type: 'asset/resource',
        // // }
        // );
    }
  
  
  return config;
}