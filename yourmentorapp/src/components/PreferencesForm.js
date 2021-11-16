import React from 'react';
import { Div, Button, Icon } from "atomize";

 class PreferencesForm extends React.Component {

    constructor(props) {
      super(props);
      this.state = {value: 'Mechanical'};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit(event) {
    //   alert('Your favorite flavor is: ' + this.state.value);
      event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            1) What is your core branch:
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Mechanical">Computer Science</option>
              <option value="Electrical">ECE</option>
              <option value="ECE">Mechanical</option>
              <option value="Computer Science">Electrical</option>
            </select>
          </label>
          <label>
            1) What is your core branch:
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Mechanical">Computer Science</option>
              <option value="Electrical">ECE</option>
              <option value="ECE">Mechanical</option>
              <option value="Computer Science">Electrical</option>
            </select>
          </label>
          <label>
            1) What is your core branch:
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Mechanical">Computer Science</option>
              <option value="Electrical">ECE</option>
              <option value="ECE">Mechanical</option>
              <option value="Computer Science">Electrical</option>
            </select>
          </label>
          <label>
            1) What is your core branch:
            {/* <select multiple={true} value={['B', 'C']}> */}
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Mechanical">Computer Science</option>
              <option value="Electrical">ECE</option>
              <option value="ECE">Mechanical</option>
              <option value="Computer Science">Electrical</option>
            </select>
          </label>
          {/* <input type="submit" value="Submit" /> */}
          <Div d="flex">
          <Button
            h="3rem"
            p={{ x: "1.25rem" }}
            textSize="body"
            textColor="info700"
            hoverTextColor="info900"
            bg="white"
            hoverBg="info200"
            border="1px solid"
            borderColor="info700"
            hoverBorderColor="info900"
            m={{ r: "0.5rem" }}
        >
            Submit
        </Button>
         
          </Div>
        </form>
      );
    }
    
  }

export default PreferencesForm;
