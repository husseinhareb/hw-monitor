import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

function Proc() {
  const [processes, setProcesses] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order is ascending
  const [totalUsages, setTotalUsages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch processes
        const fetchedProcesses = await invoke("get_processes");
        const sortedProcesses = sortProcessesByColumn(fetchedProcesses, sortBy, sortOrder);
        setProcesses(sortedProcesses);
  
        // Fetch total usages
        const fetchedTotalUsages = await invoke("get_total_usages");
        setTotalUsages(fetchedTotalUsages);
        console.log(fetchedTotalUsages)

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error: Failed to fetch data");
      }
    };
  
    fetchData();
    const intervalId = setInterval(fetchData, 1000);
  
    return () => clearInterval(intervalId);
  }, [sortBy, sortOrder]);
  

  const sortProcesses = (column) => {

    const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const sortProcessesByColumn = (processes, column, order) => {
    if (!column) return processes;

    return [...processes].sort((a, b) => {
      let valueA;
      let valueB;

      if (column === "memory") {
        const parseMemoryValue = (memoryStr) => {
          const match = memoryStr.match(/([\d.]+)\s*(\w+)/);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === "gb") return value * 1024;
            if (unit === "kb") return value / 1024;
            if (unit === "mb") return value;
          }
          return parseFloat(memoryStr);
        };

        valueA = parseMemoryValue(a[column]);
        valueB = parseMemoryValue(b[column]);
      } else if (column === "pid" || column === "ppid") {
        valueA = parseInt(a[column], 10);
        valueB = parseInt(b[column], 10);
      } else if (column === 'cpu usage') {
        valueA = parseFloat(a[column], 3);
        valueB = parseFloat(b[column], 3);
      } else {
        valueA = a[column].toLowerCase();
        valueB = b[column].toLowerCase();
      }

      if (order === 'asc') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });
  };


  return (
    <div>
      <table>
        <thead>
          <tr>
            <th onClick={() => sortProcesses('user')}>user</th>
            <th onClick={() => sortProcesses('pid')}>pid</th>
            <th onClick={() => sortProcesses('ppid')}>ppid</th>
            <th onClick={() => sortProcesses('name')}>name</th>
            <th onClick={() => sortProcesses('state')}>state</th>
            <th onClick={() => sortProcesses('memory')}>{totalUsages.memory}% <br/>memory</th>
            <th onClick={() => sortProcesses('memory')}>{totalUsages.cpu}% <br/> Cpu usage</th>

          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>{process.user}</td>
              <td>{process.pid}</td>
              <td>{process.ppid}</td>
              <td>{process.name}</td>
              <td>{process.state}</td>
              <td>{process.memory}</td>
              <td>{process.cpu}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Proc;
