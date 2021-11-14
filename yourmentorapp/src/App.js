import React from "react"

class App extends React.Component {
  state = {
    name: "RAHUL VERMA"
  }

  componentDidMount() {
    fetch("http://localhost:3000")
      .then(res => res.json())
      .then(data => this.setState({ name: data.name }))
  }

  render() {
    return (
      <h1>mera naam {this.state.name} hea!</h1>
    )
  }
}

export default App;