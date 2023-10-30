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

class JobView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageJob: 0,
    rowsPerPageJob: 20,
    errorText: null,
    openDialogErrorServer: false,
    jobsObj:{jobs:[],countJobs:0},
    direction:{
      key:'asc',
      jobType:'asc',
      workflowInstanceKey:'asc',
      retries:'asc',
      state:'asc',
      timestamp:'asc'
    }

  }

  async componentDidMount() {

    await this.getJobsList()

  }


  async getJobsList() {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var jobsItem = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/jobs",obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (jobsItem == 500 || jobsItem.status == 500)
      this.setState({ openDialogErrorServer: true })
    else {
      this.setState({ jobsObj: { jobs: jobsItem.jobs, countJobs: jobsItem.count } })
    }

  }


  handleChangePage = (event, pageJob) => {
    this.setState({ pageJob });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  sortBy(key){
    
    var jobsObj = {...this.state.jobsObj}
    var direction = {...this.state.direction}
    jobsObj.jobs = jobsObj.jobs.sort(
      (a,b)=>(
      this.state.direction[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      direction[key]=this.state.direction[key] === 'asc' ?'desc' : 'asc'
    this.setState({jobsObj,direction})
  }


  render() {

    const { classes } = this.props
    const {rowsPerPageJob,pageJob } = this.state

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
<span>{this.state.jobsObj.countJobs} open jobs</span>

<Table id="tableWorkflows" >
  <TableHead>
    <TableRow className="tableRow">
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('key')}>Job Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('jobType')}>Job Type</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('workflowInstanceKey')}>Workflow Instance Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('retries')}>Retries</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('state')}>State</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('timestamp')}>Time</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {this.state.jobsObj.jobs != [] ?
      this.state.jobsObj.jobs.slice(pageJob * rowsPerPageJob, pageJob * rowsPerPageJob + rowsPerPageJob).map(row => (
        <TableRow className="tableRow">
           <TableCell className="tableStyle">{row.key}</TableCell>
           <TableCell className="tableStyle">{row.jobType}</TableCell>
          <TableCell className="tableStyle" ><Link to={"/monitoring/instances/" + row.workflowInstanceKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.workflowInstanceKey}</span></Link></TableCell>
          <TableCell className="tableStyle">{row.retries}</TableCell>
          <TableCell className="tableStyle"> {row.state}</TableCell>
          <TableCell className="tableStyle"> {row.timestamp}</TableCell>
        </TableRow>
      )) : null}
  </TableBody>
  {this.state.jobsObj.jobs != [] ?
    <TableFooter>
      <TableRow>
        <TablePagination
          count={this.state.jobsObj.jobs.length}
          rowsPerPage={rowsPerPageJob}
          rowsPerPageOptions={[20]}
          page={pageJob}
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

export default (withStyles(styles)(JobView))