import React, { Component} from 'react';
import {  Route, Switch as SwitchRouter} from "react-router-dom";
import './app.style.css';
import HomeView from '../home/home.component';
import LoginView from '../login/login.component'
import CallbackPage from '../../utilities/callback';
import LogoutCallbackPage from '../../utilities/logoutCallback';
import ErrorNotFoundPage from './notFound.component'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import userManager from "../../utilities/userManager";
import PrivateRoute from '../../middlewares/privateRoute'
import PrivateHomeRoute from '../../middlewares/PrivateHomeRoute'
import { push } from 'connected-react-router'
import AppBarView from './appBar.component'


class App extends Component {

  state = {
    value: 0
  }


  componentDidMount() {
    //this.auth()
    this.checkRenew();
  }

  checkRenew() {
    var mgr = userManager;
    mgr.events.addAccessTokenExpiring(function () {
      mgr.revokeAccessToken();
    });

  }

  checkUser() {

    if (this.props.oidcReducer.user != null)
      return true
    else
      return false
  }

  checkAdmin() {

    if (this.props.oidcReducer.user != null && this.props.user.isAdmin)
      return true
    else
      return false
  }

  render() {

    const { value } = this.state

    const handleChange = (event, newValue) => {
      this.setState({ value: newValue })
      //setValue(newValue);
    };

    return (
      <div className="appStyle">

        <SwitchRouter>
          <Route exact={true} path="/" component={LoginView} />
          <Route path="/callback" component={CallbackPage} />
          <Route exact={true} path="/logoutCallback" component={LogoutCallbackPage} />
          <PrivateRoute exact={true} authed={this.checkUser()} path="/home" component={HomeView} />
          {/*  <PrivateRoute exact={true} authed={this.checkAdmin()} path="/monitoring" component={MonitorView} /> */}

            <PrivateHomeRoute
              path="/monitoring"
              authed={this.checkAdmin()}
              component={AppBarView} 
            />
        <PrivateRoute path="*" authed={this.checkUser()} component={ErrorNotFoundPage}/>
        </SwitchRouter>

      </div>

    );
  }
}

const mapStateToProps = ({ user, oidcReducer }) => ({
  user: {
    username: user.username,
    isAuthed: true,
    authorized: user.authorized,
    token: user.token,
    isAdmin: user.isAdmin,
    isReader: user.isReader,
    isEditor: user.isEditor
  },
  oidcReducer
})

const mapDispatchToProps = dispatch => bindActionCreators({

  goBack: () => push("/home")
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)