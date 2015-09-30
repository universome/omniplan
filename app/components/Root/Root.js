import React from 'react';
import R from 'ramda';

class Root extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
    	let PROD = this.props.PROD;
    	let host = PROD ? '' : 'http://localhost:8080';
        
        return (
            <html>
                <head>
                    <meta charSet="utf-8"></meta>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
                    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
                    <title>Market Omniplan</title>
                    <link rel="stylesheet" href={`${host}/app.css`} />
                    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,100,500' rel='stylesheet' type='text/css' />
                </head>
                <body>
                    <main id="main"></main>
                    <script src={`${host}/vendor.js`}></script>
                    <script src={`${host}/app.js`}></script>
                </body>
            </html>
        );
    }
}

export default Root;
