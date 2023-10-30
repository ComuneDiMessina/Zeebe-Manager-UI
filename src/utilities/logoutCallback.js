import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

class CallbackPage extends React.Component {


  render() {

    this.props.dispatch(push("/"));
    // just redirect to '/' in both cases
    return (
      <div>Redirecting...</div>
    )
  }
}

export default connect()(CallbackPage);
