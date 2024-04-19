import React, { useState } from "react";

function Navbar() {

    return (
        <nav className="navbar">
            <ul>
                <li>
                    <button>
                        Processes
                    </button>
                </li>
                <li>
                    <button>
                        Performance
                    </button>
                </li>
                <li>
                    <button>
                        Sensors
                    </button>
                </li>
                <li>
                    <button>
                        Disks
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;