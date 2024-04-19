import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "./components/Proc";
import Proc from "./components/Proc";
import Navbar from "./components/Navbar";
function App() {
  const [greetMsg, setGreetMsg] = useState("");


  return (
    <div className="container">
      <Navbar />
      <Proc />
    </div>
  );
}

export default App;
