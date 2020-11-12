import React from 'react';
import Navigation from './Navigation';

export default props => <div className="container col-md-6">
	  <Navigation/>
    <button onClick={e => props.app.dispatch({type:"UI_OPEN_SESSION"})} className="btn btn-outline-primary col-auto">Enter</button>
</div>;
