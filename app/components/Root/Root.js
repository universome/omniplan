import React from 'react';
import R from 'ramda';

class Root extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        return (
            <html>
                <head>
                    <meta charSet="utf-8"></meta>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
                    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
                    <meta name="description" content="Netberry"></meta>
                    <title>Market Omniplan</title>
                    <link rel="stylesheet" href="http://localhost:8080/app.css" />
                    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,100,500' rel='stylesheet' type='text/css' />
                </head>
                <body>
                    <main id="main"></main>
                    <script src="http://localhost:8080/vendor.js"></script>
                    <script src="http://localhost:8080/app.js"></script>
                </body>
            </html>
        );
    }
}

export default Root;
