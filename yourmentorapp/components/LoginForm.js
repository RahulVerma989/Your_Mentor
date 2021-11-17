import { React,useEffect,ReactDOM } from 'react';
import {GoogleLogin} from "react-google-login";
import {Helmet} from "react-helmet";
import { Form, Field } from "@progress/kendo-react-form";
import styled from 'styled-components';

import { Input, Anchor, Button, Div, Icon } from 'atomize';
import { iconPaths } from 'atomize';
import { Iconstyle } from 'atomize';
// import countries from "./countries"; not required for us.

// const emailValidator = (value) => (
//     new RegExp(/\S+@\S+\.\S+/).test(value) ? "" : "Please enter a valid email."
// );
// const requiredValidator = (value) => {
//     return value ? "" : "This field is required";
// }

const responseGoogle = (response) => {
  console.log(response);
}

<<<<<<< HEAD:yourmentorapp/src/components/LoginForm.js
=======
const InputWithRightButton = () => {
  return (
    <Input
      placeholder="User Name"
      p={{ x: "2.5rem" }}
      prefix={
        <Icon
          name="UserSolid"
          color="warning800"
          size="16px"
          cursor="pointer"
          pos="absolute"
          top="50%"
          left="0.75rem"
          transform="translateY(-50%)"
        />
      }
    />
  );
}

const WrappingLinks = () => {
  return (
    <Div d="flex" flexWrap="wrap">
        <Anchor href="https://www.google.com" target="_blank">
            <Button
                bg="info700"
                hoverBg="info600"
                m={{ r: "1rem", b: "1rem" }}
                cursor="pointer"
                rounded="md"
            >
                Submit
            </Button>
        </Anchor>
    </Div>
  );
}

>>>>>>> 4b7f785c3fca0dcd7079a2f8e1cb1403907f07e8:yourmentorapp/components/LoginForm.js
function LoginForm() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    // const [country, setCountry] = React.useState("");
    const [acceptedTerms, setAcceptedTerms] = React.useState(false);
    
    const handleSubmit = (data,event) => {
      event.preventDefault();
        console.log(`
          Email: ${data.email}
          Password: ${data.password}
          acceptedTerms: ${data.acceptedTerms}
          `);
    }
    
    return (
      <form onSubmit={(e) => {handleSubmit({'email':email,'password':password,'acceptedTerms':acceptedTerms},e)}}> 
      <h1>Create Account</h1>
        <div>
          <div id='googleButton'>
          <GoogleLogin
            clientId="1016584848800-h5qthn2equndp7jar5bi1mdhaeure72f.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
          </div>
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          prefix={
            <Icon
              name="UserSolid"
              color="warning800"
              size="16px"
              cursor="pointer"
              pos="absolute"
              top="50%"
              left="0.75rem"
              transform="translateY(-50%)"
            />}
          onChange={e => setEmail(e.target.value)}
          required />
<<<<<<< HEAD:yourmentorapp/src/components/LoginForm.js

=======
      </label>
      <label>
        Password:
>>>>>>> 4b7f785c3fca0dcd7079a2f8e1cb1403907f07e8:yourmentorapp/components/LoginForm.js
        <input
          name="password"
          type="password"
          placeholder = "Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required />

      <label>
        <input
          name="acceptedTerms"
          type="checkbox"
          onChange={e => setAcceptedTerms(e.target.checked)}
          required />
           I accept the terms of service of your mentor
      </label>
        {/* <Icon name="Search" size="20px" color="black" /> */}
      <button>Submit</button>
<<<<<<< HEAD:yourmentorapp/src/components/LoginForm.js
      
=======
      {/* <WrappingLinks /> */}
>>>>>>> 4b7f785c3fca0dcd7079a2f8e1cb1403907f07e8:yourmentorapp/components/LoginForm.js
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