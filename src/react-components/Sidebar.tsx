import * as React from "react";
import * as Router from "react-router-dom"
// @ts-ignore
import logo from "../../assets/company-logo.svg"

export function Sidebar () {
    return (
        <aside id="sidebar">
            <img id="company-logo" src={logo} alt="Construction Company"/>
            <ul id="nav-buttons">
                 <Router.Link to="/">
                    <li><span className="material-icons-round">apartment</span>Projects</li>
                </Router.Link>
                <Router.Link to="/project">
                    <li><span className="material-icons-round">people</span>Users</li>
                </Router.Link>
            </ul>
        </aside>
    )
}