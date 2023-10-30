import React, { Component } from 'react';
import '../monitor.style.css';
import withStyles from '@material-ui/core/styles/withStyles'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import { Link} from "react-router-dom";
import {store} from '../../../store'


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%'
/*     backgroundColor: theme.palette.background.paper, */
  }
})

class IncidentView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageIncident: 0,
    rowsPerPageIncident: 20,
    errorText: null,
    openDialogErrorServer: false,
    incidentsObj: { incidents: [], countIncidents: 0 },
    direction:{
      key:'asc',
      workflowInstanceKey:'asc',
      bpmnProcessId:'asc',
      workflowKey:'asc',
      errorType:'asc',
      state:'asc',
      createdTime:'asc'
    }

  }

  async componentDidMount() {

    await this.getIncidentsList()

  }


  async getIncidentsList() {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var incidentsItem = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/incidents",obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (incidentsItem == 500 || incidentsItem.status == 500)
      this.setState({ openDialogErrorServer: true })
    else {
      this.setState({ incidentsObj: { incidents: incidentsItem.incidents, countIncidents: incidentsItem.count } })
    }

  }


  handleChangePage = (event, pageIncident) => {
    this.setState({ pageIncident });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPageIncident: event.target.value });
  };

  sortBy(key){
    
    var incidentsObj = {...this.state.incidentsObj}
    var direction = {...this.state.direction}
    incidentsObj.incidents = incidentsObj.incidents.sort(
      (a,b)=>(
      this.state.direction[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      direction[key]=this.state.direction[key] === 'asc' ?'desc' : 'asc'
    this.setState({incidentsObj,direction})
  }


  render() {

    const { classes } = this.props
    const {rowsPerPageIncident,pageIncident } = this.state

    return (<div className={classes.root}>

      <Dialog
        open={this.state.openDialogErrorServer}
        onClose={() => this.setState({ openDialogErrorServer: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">ATTENZIONE</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">
            <p style={{ textAlign: "center" }}><strong>Operazione non riuscita.</strong></p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogErrorServer: false })} variant="contained">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ marginRight: "15px", marginLeft: "15px", paddingTop: "15px" }}>
      <Grid container spacing={3}>
  <Grid item xs={12}>
<span>{this.state.incidentsObj.countIncidents} open incidents</span>

<Table id="tableWorkflows" >
  <TableHead>
    <TableRow className="tableRow">
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('key')}>Incident Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('workflowInstanceKey')}>Workflow Instance Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('bpmnProcessId')}>BPMN process id</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('workflowKey')}>Workflow Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('errorType')}>Error Type</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('state')}>State</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList cellIncident" onClick={()=>this.sortBy('createdTime')}>Created Time</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {this.state.incidentsObj.incidents != [] ?
      this.state.incidentsObj.incidents.slice(pageIncident * rowsPerPageIncident, pageIncident * rowsPerPageIncident + rowsPerPageIncident).map(row => (
        <TableRow className="tableRow">
           <TableCell className="tableStyle cellIncident">{row.key}</TableCell>
          <TableCell className="tableStyle cellIncident" ><Link to={"/monitoring/instances/"+row.workflowInstanceKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.workflowInstanceKey}</span></Link></TableCell>
          <TableCell className="tableStyle cellIncident">{row.bpmnProcessId}</TableCell>
          <TableCell className="tableStyle cellIncident"> <Link to={"/monitoring/workflows/"+row.workflowKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.workflowKey}</span></Link></TableCell>
          <TableCell className="tableStyle cellIncident"> {row.errorType}</TableCell>
          <TableCell className="tableStyle cellIncident"> {row.state}</TableCell>
          <TableCell className="tableStyle cellIncident"> {row.createdTime}</TableCell>
        </TableRow>
      )) : null}
  </TableBody>
  {this.state.incidentsObj.incidents != [] ?
    <TableFooter>
      <TableRow>
        <TablePagination
          count={this.state.incidentsObj.incidents.length}
          rowsPerPage={rowsPerPageIncident}
          rowsPerPageOptions={[20]}
          page={pageIncident}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        /* ActionsComponent={TablePaginationActionsWrapped} */
        />
      </TableRow>
    </TableFooter> : null}
</Table>
</Grid>
</Grid>

</div>

    </div>
    )

  }


}

export default (withStyles(styles)(IncidentView))