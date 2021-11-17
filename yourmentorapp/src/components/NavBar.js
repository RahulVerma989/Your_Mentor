import React from 'react';

const NavBar = () => {
    return(
        <div>
            <div id='Logo'>LOGO</div>
            <ul>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/forum'>forum</Link></li>
                <li><Link to='/Mentoring'>Mentoring</Link></li>
                <li><Link to='/Login'>Login</Link></li>
            </ul>
        </div>
    );
};

modules.export = NavBar;