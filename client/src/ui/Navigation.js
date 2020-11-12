import React from 'react';

export default props => <nav className="navbar navbar-light bg-light navbar-small"><Logo/>{props.children}</nav>;

const Logo = props => <span className="navbar-brand"><span role="img" aria-label="RWS">🍀</span></span>; 
