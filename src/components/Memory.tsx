import React from "react";
import Graph from "./Graph";

interface MemoryProps {
    memoryUsage: number[];
}



const Memory: React.FC<MemoryProps> = ({ memoryUsage }) => {




    return (
        <div>
            <Graph graphValue={memoryUsage} />
        </div>
    );
}

export default Memory;
