import React from "react";
import Graph from "./Graph";

interface MemoryProps {
    memoryUsage: number[];
}



const Memory: React.FC<MemoryProps> = ({ memoryUsage }) => {




    return (
        <div>
            <Graph currentValue={memoryUsage} maxValue={100} />
        </div>
    );
}

export default Memory;
