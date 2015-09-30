const PORT = process.env.PORT || 49494;

global.config = {
    API_URL: `http:\/\/localhost:${PORT}`
}

import React from 'react';
import Application from 'components/Application';

React.render(<Application />, document.getElementById('main'));
