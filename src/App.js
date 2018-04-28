import React, { Component } from 'react';
import styled from 'styled-components';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import SearchPage from './searchPage/Search.page';
import CrimeTrend from './crimeTrendPage/CrimeTrend.page';

const Pad = styled.div`    
    padding: 20px 0;

    @media only screen and (max-width: 768px) {
        margin: 0;
        padding: 0;
    }
`;


class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Pad>
                        <Route exact path="/" component={SearchPage} />
                        <Route exact path="/crime-trend" component={CrimeTrend} />
                    </Pad>
                </div>
            </Router>
        );
    }
}

export default App;
