import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

function Proc() {
  const [processes, setProcesses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const processes = await invoke("get_processes");
        setProcesses(processes);
      } catch (error) {
        console.error(error);
        setError("Error: Failed to fetch process information");
      }
    };

    fetchProcesses();

    const intervalId = setInterval(fetchProcesses, 1000);

    return () => clearInterval(intervalId);
  }, []);



  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>user</th>
            <th>pid</th>
            <th>ppid</th>
            <th>name</th>
            <th>state</th>

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Proc;
