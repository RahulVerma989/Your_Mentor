import React from 'react';
import { useEffect } from 'react';
import { ReactDOM } from 'react';
import { Form, Field } from "@progress/kendo-react-form";
import styled from 'styled-components';
// import countries from "./countries";

const emailValidator = (value) => (
    new RegExp(/\S+@\S+\.\S+/).test(value) ? "" : "Please enter a valid email."
);
const requiredValidator = (value) => {
    return value ? "" : "This field is required";
}
  
function LoginForm() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    // const [country, setCountry] = React.useState("");
    const [acceptedTerms, setAcceptedTerms] = React.useState(false);
    
    const handleSubmit = (data,event) => {
        console.log(`
          Email: ${data.email}
          Password: ${data.password}
          Accepted Terms: ${data.acceptedTerms}
          `);
    
        event.preventDefault();
    }
    
    return (
        <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>

      <label>
        Email:
        <input
          name="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required />
      </label>

      <label>
        Password:
        <input
          name="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required />
      </label>

      <label>
        <input
          name="acceptedTerms"
          type="checkbox"
          onChange={e => setAcceptedTerms(e.target.value)}
          required />
        I accept the terms of service
      </label>

      <button>Submit</button>
    </form>
    )
}

export default LoginForm;

const form = styled.form`
    display: flex;
    flex-direction: column;
    width: 400px;
    min-width: 100px;
    min-height: 400px;
    padding: 20px 40px 40px 40px;
    border-radius: 6px;
    box-shadow: 0px 8px 36px #222;
    background-color: #fefefe;

h1 {
    display: flex;
    justify-content: center;
    font-family: "Segoe UI", "Ubuntu", "Roboto", "Open Sans", "Helvetica Neue", sans-serif;
    font-size: 2em;
    font-weight: lighter;
    margin-top: 0.25em;
    color: #222;
    letter-spacing: 2px;
    }
`
const label = styled.div `
    margin-bottom: 0.5em;
    color: #444;
    font-weight: lighter;
`