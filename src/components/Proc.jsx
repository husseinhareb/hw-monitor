import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

function Proc() {
  const [processes, setProcesses] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order is ascending

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const fetchedProcesses = await invoke("get_processes");
        // Sort the fetched processes based on the sorting state
        const sortedProcesses = sortProcessesByColumn(fetchedProcesses, sortBy, sortOrder);
        setProcesses(sortedProcesses);
      } catch (error) {
        console.error(error);
        setError("Error: Failed to fetch process information");
      }
    };

    fetchProcesses();

    const intervalId = setInterval(fetchProcesses, 1000);

    return () => clearInterval(intervalId);
  }, [sortBy, sortOrder]);

  const sortProcesses = (column) => {
    // If the clicked column is already the sorted column, reverse the sort order
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
            valueA = parseFloat(a[column].replace(/[^\d.]/g, ""));
            valueB = parseFloat(b[column].replace(/[^\d.]/g, ""));
        } else if (column === "pid" || column === "ppid") {
            valueA = parseInt(a[column], 10);
            valueB = parseInt(b[column], 10);
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
            <th onClick={() => sortProcesses('memory')}>memory</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Proc;
