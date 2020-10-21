import React from 'react';
import ReactDOM from 'react-dom';
import data from '../data/ranking.json'
import Ranking from './ranking';
import Header from './header';


console.log(data);

function App() {
    return (
        <div className="container">
            <Header />
            <Ranking ranking={data} />
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
