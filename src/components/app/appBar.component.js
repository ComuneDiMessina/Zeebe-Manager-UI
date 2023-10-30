import React, { Component, Fragment } from 'react';
import {BrowserRouter as Router,Route, Switch as SwitchRouter,Link } from "react-router-dom";
import { push } from 'connected-react-router'
import './app.style.css';
import WorkflowView from '../monitoring/workflow/workflow.component';
import WorkflowDetailView from '../monitoring//workflow/workflowDetail.component';
import InstanceView from '../monitoring/instance/instance.component';
import InstanceDetailView from '../monitoring/instance/instanceDetail.component';
import JobView from '../monitoring/job/job.component';
import IncidentView from '../monitoring/incident/incident.component';
import MessageView from '../monitoring/message/message.component';
import TopologyView from '../monitoring/topology/topology.component';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import ArrowIcon from '@material-ui/icons/ArrowBack';
import Toolbar from '@material-ui/core/Toolbar';


class AppBarView extends Component {

  state = {
    value: 0
  }

  render() {


    const handleChange = (event, newValue) => {
      this.setState({ value: newValue })
      //setValue(newValue);
    };

    return(
        <Router>
                <Fragment>
                  <AppBar  position="static" color="default">
                    <Toolbar>
                      <IconButton className="buttonBackStyle" variant="fab" title="torna alla pagina principale" aria-label="Back" onClick={() => this.props.goBack()}>
                        <ArrowIcon />
                      </IconButton>
                      <Tabs className="collapse navbar-collapse" value={null}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="nav tabs example"
                        centered>
                        <Tab label="Workflows" component={Link} to="/monitoring" />
                        <Tab label="Instances" component={Link} to="/monitoring/instances" />
                        <Tab label="Incidents" component={Link} to="/monitoring/incidents" />
                        <Tab label="Jobs" component={Link} to="/monitoring/jobs" />
                        <Tab label="Messages" component={Link} to="/monitoring/messages" />
                        <Tab label="Topology" component={Link} to="/monitoring/topology" />
                      </Tabs>
                    </Toolbar>
                  </AppBar>
                  <SwitchRouter>
                    <Route exact path='/monitoring' component={WorkflowView} />
                    <Route exact path='/monitoring/workflows/:id' component={WorkflowDetailView} />
                    <Route exact path="/monitoring/instances" component={InstanceView} />
                    <Route exact path="/monitoring/instances/:id" component={InstanceDetailView} />
                    <Route exact path='/monitoring/jobs' component={JobView} />
                    <Route exact path='/monitoring/incidents' component={IncidentView} />
                    <Route exact path='/monitoring/messages' component={MessageView} />
                    <Route exact path='/monitoring/topology' component={TopologyView} />
                  </SwitchRouter>
                </Fragment>
                </Router>
              )

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
)(AppBarView)