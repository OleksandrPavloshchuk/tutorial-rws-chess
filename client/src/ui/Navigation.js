import React from 'react';

export default function Navigation(props) { 
    return   <nav className="navbar navbar-light bg-light navbar-small"><Logo/>{props.children}</nav>;
}

function Logo(props) { 
    return <span className="navbar-brand"><span role="img" aria-label="RWS">🍀</span></span>; 
}
