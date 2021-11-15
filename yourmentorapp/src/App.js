import React from "react"

class App extends React.Component {
  state = {
    name: "JOHN DOE"
  }

  componentDidMount() {
    fetch("http://localhost:3001")
      .then(res => res.json())
      .then(data => this.setState({ name: data.name }))
  }

  render() {
    return (
      <h1>Hello {this.state.name}!</h1>
    )
  }
}

export default App;