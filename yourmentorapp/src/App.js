import React from "react"
import {Helmet} from "react-helmet";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import PreferencesForm from "./components/PreferencesForm";

function App() {
  return (
    
    <div className="App">
      <NavBar/>
      <LoginForm/>
    </div>
  )
}

export default App;