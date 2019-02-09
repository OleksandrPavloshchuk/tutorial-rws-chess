import React from 'react';

import Logo from './Logo';

export default function Navigation(props) { 
    return (
        <nav className="navbar navbar-light bg-light navbar-small"><Logo/>{props.children}</nav>
    );
}


