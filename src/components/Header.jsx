// Headers.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/order">Order</a></li>
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/bill">Bill</a></li>
                </ul>
            </nav>
        </div>
    );
};

export default Header;
