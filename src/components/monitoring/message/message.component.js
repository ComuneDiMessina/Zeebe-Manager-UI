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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Close from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import { FormGroup } from '@material-ui/core';
import {store} from '../../../store'


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%'
/*     backgroundColor: theme.palette.background.paper, */
  }
})

class MessageView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageMessage: 0,
    rowsPerPageMessage: 20,
    errorText: null,
    openDialogErrorServer: false,
    openDialogPublishMessage:false,
    messagesObj:{messages:[],countMessages:0},
    publishMessage: {message:{messageName:"",correlationKey:""},timeToLive:"PT0S"},
    direction:{
      name:'asc',
      correlationKey:'asc',
      messageId:'asc',
      state:'asc',
      timestamp:'asc'
    }

  }

  async componentDidMount() {

    await this.getMessagesList()

  }


  async getMessagesList() {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var messagesItem = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/messages",obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (messagesItem == 500 || messagesItem.status == 500)
      this.setState({ openDialogErrorServer: true })
    else {
      this.setState({ messagesObj: { messages: messagesItem.messages, countMessages: messagesItem.count } })
    }

  }


  handleChangePage = (event, pageMessage) => {
    this.setState({ pageMessage });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPageMessage: event.target.value });
  };

  showVariableForm(index) {
    var varForm = document.getElementById('variable-form-' + index);
    varForm.classList.remove("d-none");
  }

  getVariablesDocument() {
    var formCount = 10;
    var variableCount = 0;
    var variableDocument = '{';
    var i;
    for (i = 1; i <= formCount; i++) {
      var varName = document.getElementById('variable-form-' + i + '-name').value;
      var varValue = document.getElementById('variable-form-' + i + '-value').value;
      if (varValue.length == 0) {
        varValue = null;
      }
      if (varName.length > 0) {
        if (variableCount > 0) {
          variableDocument += ',';
        }
        variableDocument += '"' + varName + '":' + varValue;
        variableCount += 1;
      }
    }
    variableDocument += '}';
    return variableDocument;
  }


  async publishMessage() {


    var variables = this.getVariablesDocument()
  
    var data = {
      name: this.state.publishMessage.message.messageName,
      correlationKey: this.state.publishMessage.message.correlationKey,
      payload: variables,
      timeToLive: this.state.publishMessage.timeToLive
    };
    
    await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/messages/",
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json; charset=utf-8',
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
      body: JSON.stringify(data),
      crossDomain: true
    }
  ).then(promise => promise.json()).then(response => {
    if (response.status == 200) {
      this.setState({ openDialogPublishMessage: false})
      $('#successPanel').show();
    }
    else {
      this.setState({ openDialogPublishMessage: false })
      if (response.error != null)
        this.setState({ errorText: response.error })
      else
        this.setState({ errorText: "Operazione non riuscita." })
      $('#errorPanel').show();
    }
  })
    .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })
    
  }

  sortBy(key){
    
    var messagesObj = {...this.state.messagesObj}
    var direction = {...this.state.direction}
    messagesObj.messages = messagesObj.messages.sort(
      (a,b)=>(
      this.state.direction[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      direction[key]=this.state.direction[key] === 'asc' ?'desc' : 'asc'
    this.setState({messagesObj,direction})
  }


  render() {

    const { classes } = this.props
    const {rowsPerPageMessage,pageMessage} = this.state

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

      
      <Dialog
        open={this.state.openDialogPublishMessage}
        onClose={() => this.setState({ openDialogPublishMessage: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">New Message</h2></DialogTitle>
        <DialogContent>
          {this.state.publishMessage.message != null ? (
            <DialogContentText className="styleDialogText" id="alert-dialog-description">


              <FormGroup className="form-group">
                <label class="col-form-label">Message Name</label>
                <input class="form-control-variable" type="text" value={this.state.publishMessage.message.messageName}
                  onChange={(event) => {
                    var publishMessage = { ...this.state.publishMessage }
                    publishMessage.message.messageName = event.target.value
                    this.setState({ publishMessage })
                  }
                  } />
              </FormGroup>

              <FormGroup className="form-group">
                <label class="col-form-label">Correlation Key</label>
                <input class="form-control-variable" type="text" value={this.state.publishMessage.message.correlationKey}
                  onChange={(event) => {
                    var publishMessage = { ...this.state.publishMessage }
                    publishMessage.message.correlationKey = event.target.value
                    this.setState({ publishMessage })
                  }
                  } />
              </FormGroup>

              <FormGroup>

                <label class="col-form-label">Variables</label>
                <div id="variable-form">
                  <div class="form-row" id="variable-form-1">
                    <div class="form-group col-md-4">
                      <input id="variable-form-1-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-1-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-1-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(2)}>+
                       </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-2">
                    <div class="form-group col-md-4">
                      <input id="variable-form-2-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-2-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-2-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(3)}>+
                     </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-3">
                    <div class="form-group col-md-4">
                      <input id="variable-form-3-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-3-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-3-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(4)}>+
                    </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-4">
                    <div class="form-group col-md-4">
                      <input id="variable-form-4-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-4-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-4-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(5)}>+
                      </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-5">
                    <div class="form-group col-md-4">
                      <input id="variable-form-5-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-5-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-5-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(6)}>+
                    </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-6">
                    <div class="form-group col-md-4">
                      <input id="variable-form-6-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-6-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-6-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(7)}>+
                     </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-7">
                    <div class="form-group col-md-4">
                      <input id="variable-form-7-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-7-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-7-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(8)}>+
                    </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-8">
                    <div class="form-group col-md-4">
                      <input id="variable-form-8-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-8-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-8-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(9)}>+
                     </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-9">
                    <div class="form-group col-md-4">
                      <input id="variable-form-9-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-9-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-9-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(10)}>+
                     </button>
                    </div>
                  </div>
                  <div class="form-row d-none" id="variable-form-10">
                    <div class="form-group col-md-4">
                      <input id="variable-form-10-name" type="text" class="form-control" placeholder="name" />
                    </div>
                    <div class="form-group col-md-7">
                      <input id="variable-form-10-value" type="text" class="form-control" placeholder="value (JSON)" />
                    </div>
                    <div class="form-group col-md-1">
                      <button id="variable-form-10-button" class="btn btn-outline-primary" onClick={() => this.showVariableForm(11)}
                        disabled>+
                     </button>
                    </div>
                  </div>
                </div>
              </FormGroup>

              <FormGroup className="form-group">
                <label class="col-form-label">Time-to-Live</label>
                <input id="message-ttl" class="form-control-variable" type="text" value={this.state.publishMessage.timeToLive}  onChange={(event) => {
                    var publishMessage = { ...this.state.publishMessage }
                    publishMessage.timeToLive = event.target.value
                    this.setState({ publishMessage })
                }}></input>
              </FormGroup>

            </DialogContentText>) : null}
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogPublishMessage: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.publishMessage()} variant="contained">
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      <div className="divButtonDeploy">

<div id="errorPanel" class="alert alert-danger alert-dismissible fade show" style={{ display: "none" }} role="alert">
  <strong>Error:</strong> <span id="errorText">{this.state.errorText}</span>
  <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
</div>

<div id="successPanel" className="alert alert-success alert-dismissible fade show" style={{ display: "none" }} role="alert">
  <strong>Success:</strong> <span id="successText">New message created.</span>(<a href="#" onClick={event => { event.preventDefault(); this.getMessagesList() }}>Click on refresh</a>)
    <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
</div>


  <Button onClick={() => this.setState({ openDialogPublishMessage: true })} className="buttonDeployment" variant="contained" color="primary">
    New Message
 </Button>
</div>

      <div style={{ marginRight: "15px", marginLeft: "15px" }}>

      <Grid container spacing={3}>
  <Grid item xs={12}>
<span>{this.state.messagesObj.countMessages} messages</span>

<Table id="tableWorkflows" >
  <TableHead>
    <TableRow className="tableRow">
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('name')}>Name</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('correlationKey')}>Correlation Key</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('messageId')}>Message Id</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('state')}>State</TableCell>
      <TableCell style={{cursor:"pointer"}} className="tableMonitorList" onClick={()=>this.sortBy('timestamp')}>Time</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {this.state.messagesObj.messages != [] ?
      this.state.messagesObj.messages.slice(pageMessage * rowsPerPageMessage, pageMessage * rowsPerPageMessage + rowsPerPageMessage).map(row => (
        <TableRow className="tableRow">
           <TableCell className="tableStyle">{row.name}</TableCell>
           <TableCell className="tableStyle">{row.correlationKey}</TableCell>
          <TableCell className="tableStyle" ><span onClick={event => { event.preventDefault(); /* this.getWorkflowDetail(row.workflowKey) */ }} style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.messageId}</span></TableCell>
          <TableCell className="tableStyle"> {row.state}</TableCell>
          <TableCell className="tableStyle"> {row.timestamp}</TableCell>
        </TableRow>
      )) : null}
  </TableBody>
  {this.state.messagesObj.messages != [] ?
    <TableFooter>
      <TableRow>
        <TablePagination
          count={this.state.messagesObj.messages.length}
          rowsPerPage={rowsPerPageMessage}
          rowsPerPageOptions={[20]}
          page={pageMessage}
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

export default (withStyles(styles)(MessageView))