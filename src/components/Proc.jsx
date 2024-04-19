import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

function Proc() {
  const [greetMsg, setGreetMsg] = useState('');
  const [processes, setProcesses] = useState([]);

  async function getProcesses() {
    try {
      const processes = await invoke("get_processes");
      console.log(processes); // For debugging purposes
      setProcesses(processes);
    } catch (error) {
      console.error(error);
      setGreetMsg("Error: Failed to fetch process information");
    }
  }

  return (
    <div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          getProcesses();
        }}
      >
        <button type="submit">Fetch Processes</button>
      </form>

      <p>{greetMsg}</p>

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
