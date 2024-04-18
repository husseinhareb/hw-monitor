import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");

  async function greet() {
    try {
      const processes = await invoke("get_processes");
      console.log(processes); // For debugging purposes
      // Update state with the received data
      // You can modify this part based on your requirement
      setGreetMsg(JSON.stringify(processes));
    } catch (error) {
      console.error(error);
      setGreetMsg("Error: Failed to fetch process information");
    }
  }
  
  return (
    <div className="container">
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
