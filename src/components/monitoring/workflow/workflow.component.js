import React, { Component } from 'react';
import '../monitor.style.css';
import $ from 'jquery';
import withStyles from '@material-ui/core/styles/withStyles'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Close from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { FormGroup } from '@material-ui/core';
import { FormControl } from '@material-ui/core';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid'
import { Link} from "react-router-dom";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Paper } from 'material-ui';
import {store} from '../../../store'



const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    /* backgroundColor: theme.palette.background.paper, */
  }
})

class WorkflowView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageWorkflow: 0,
    rowsPerPageWorfklow: 20,
    errorText: null,
    openDialogNewDeployment: false,
    openDialogErrorServer: false,
    countWorkflows: 0,
    workflows: [],
    direction:{
      workflowKey:'asc',
      bpmnProcessId:'asc',
      version:'asc',
      countRunning:'asc',
      countEnded:'asc'
    }

  }

  async componentDidMount() {

    await this.getWorkflowsList()

  }

  async getWorkflowsList() {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var workflowsItem = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/workflows",obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (workflowsItem == 500 || workflowsItem.status==500)
      this.setState({ openDialogErrorServer: true })
    else {
      this.setState({ workflows: workflowsItem.workflows, countWorkflows: workflowsItem.count })
    }
  }


  uploadModels() {

    var self = this;

    var fileUpload = document.getElementById('documentToUpload');

    var filesToUpload = {
      files: []
    }


    var processUploadedFile = function (fileUpload, index) {
      return function (e) {
        var binary = '';
        var bytes = new Uint8Array(e.target.result);
        var len = bytes.byteLength;
        for (var j = 0; j < len; j++) {
          binary += String.fromCharCode(bytes[j]);
        }

        var currentFile = {
          filename: fileUpload.files[index].name,
          mimeType: fileUpload.files[index].type,
          content: btoa(binary)
        }

        filesToUpload.files.push(currentFile);

        // if all files are processed - do the upload
        if (filesToUpload.files.length == fileUpload.files.length) {
          self.uploadFiles(filesToUpload);
        }
      };
    }

    // read all selected files
    if (typeof FileReader === 'function' && fileUpload.files.length > 0) {
      var index;
      for (index = 0; index < fileUpload.files.length; ++index) {

        var reader = new FileReader();
        reader.onloadend = processUploadedFile(fileUpload, index);
        reader.readAsArrayBuffer(fileUpload.files[index]);
      }
    }
    else {
      this.setState({ openDialogErrorServer: true, openDialogNewDeployment: false })
    }

  }


  uploadFiles(filesToUpload) {

    fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/workflows/",
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json; charset=utf-8',
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
        body: JSON.stringify(filesToUpload),
        crossDomain: true
      }
    ).then(promise => promise.json()).then(response => {
      if (response.status == 200) {
        this.setState({ openDialogNewDeployment: false })
        $('#successPanel').show();
      }
      else {
        this.setState({ openDialogNewDeployment: false })
        if (response.error != null)
          this.setState({ errorText: response.error })
        else
          this.setState({ errorText: "Operazione non riuscita." })
        $('#errorPanel').show();
      }
    })
      .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

  }


  handleChangePage = (event, pageWorkflow) => {
    this.setState({ pageWorkflow });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPageWorfklow: event.target.value });
  };

  sortBy(key){
    
    var workflows = this.state.workflows
    var direction = {...this.state.direction}
    workflows = workflows.sort(
      (a,b)=>(
      this.state.direction[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      direction[key]=this.state.direction[key] === 'asc' ?'desc' : 'asc'
    this.setState({workflows,direction})
  }


  render() {

    const { classes } = this.props
    const { rowsPerPageWorfklow, pageWorkflow } = this.state


    return (<div className={classes.root}>

      <Dialog
        open={this.state.openDialogErrorServer}
        onClose={() => this.setState({ openDialogErrorServer: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">ATTENZIONE</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="logoutDialogText" id="alert-dialog-description">
            <p style={{ textAlign: "center" }}><strong>Operazione non riuscita.</strong></p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogErrorServer: false })} variant="contained">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={this.state.openDialogNewDeployment}
        onClose={() => this.setState({ openDialogNewDeployment: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">New Deployment</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="logoutDialogText" id="alert-dialog-description">

            <FormControl>
              <FormGroup>
                <label htmlFor="my-input">Deployment resources</label>
                <input id="documentToUpload" class="form-control" name="Upload files" type="file" multiple="multiple" accept=".bpmn20.xml, .bpmn, .xml" />
              </FormGroup>
            </FormControl>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogNewDeployment: false })} variant="contained">
            Chiudi
          </Button>
          <Button className="buttonDeployment" onClick={() => this.uploadModels()} variant="contained">
            Deploy
          </Button>
        </DialogActions>
      </Dialog>


        <div className="divButtonDeploy">

          <div id="errorPanel" class="alert alert-danger alert-dismissible fade show" style={{ display: "none" }} role="alert">
            <strong>Error:</strong> <span id="errorText">{this.state.errorText}</span>
            <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
          </div>

          <div id="successPanel" className="alert alert-success alert-dismissible fade show" style={{ display: "none" }} role="alert">
            <strong>Success:</strong> <span id="successText">New deployment created.</span>(<a href="#" onClick={event => { event.preventDefault(); this.getWorkflowsList() }}>Click on refresh</a>)
              <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
          </div>

     
            <Button onClick={() => this.setState({ openDialogNewDeployment: true })} className="buttonDeployment" variant="contained" color="primary">
              New Deployment
           </Button>
        </div>

          <div style={{ marginRight: "15px", marginLeft: "15px" }}>

          <Grid container spacing={3}>
  <Grid item xs={12} sm={12}>

            <span>{this.state.countWorkflows} workflows</span>
            
            <Table id="tableWorkflows" >
              <TableHead>
                <TableRow className="tableRow">
                  <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('workflowKey')}>Workflow Key</TableCell>
                  <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('bpmnProcessId')}>BPMN process id</TableCell>
                  <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('version')}>Version</TableCell>
                  <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('countRunning')}>#active</TableCell>
                  <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('countEnded')}>#ended</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.workflows != [] ?
                  this.state.workflows.slice(pageWorkflow * rowsPerPageWorfklow, pageWorkflow * rowsPerPageWorfklow + rowsPerPageWorfklow).map(row => (
                    <TableRow className="tableRow">
                      <TableCell className="tableStyle" ><Link to={"/monitoring/workflows/"+row.workflowKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.workflowKey}</span></Link></TableCell>
                      <TableCell className="tableStyle">{row.bpmnProcessId}</TableCell>
                      <TableCell className="tableStyle"> {row.version}</TableCell>
                      <TableCell className="tableStyle"> {row.countRunning}</TableCell>
                      <TableCell className="tableStyle"> {row.countEnded}</TableCell>
                    </TableRow>
                  )) : null}
              </TableBody>
              {this.state.workflows != [] ?
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={this.state.workflows.length}
                      rowsPerPage={rowsPerPageWorfklow}
                      rowsPerPageOptions={[20]}
                      page={pageWorkflow}
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
         

    </div>)

  }


}

const mapStateToProps = () => ({
})

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WorkflowView))