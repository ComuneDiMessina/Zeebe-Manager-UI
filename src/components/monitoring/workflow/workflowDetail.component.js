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
import Viewer from 'bpmn-js/lib/NavigatedViewer'
import Grid from '@material-ui/core/Grid';
import Close from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { FormGroup, Paper } from '@material-ui/core';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import { Link } from "react-router-dom";
import {store} from '../../../store'
import minimapModule from 'diagram-js-minimap';


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    /* backgroundColor: theme.palette.background.paper, */
  }
})

class WorkflowDetailView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageInstance: 0,
    pageSub: 0,
    pageTimer: 0,
    rowsPerPageInstance: 7,
    rowsPerPageSub: 7,
    rowsPerPageTimer: 7,
    publishMessage: {message:null,timeToLive:"PT0S"},
    errorText: null,
    successText:null,
    openDialogNewInstance: false,
    openDialogErrorServer: false,
    openDialogPublishMessage: false,
    showDetail: true,
    container: null,
    bpmnViewer: null,
    workflowDetail: null,
    directionInstances:{
      workflowInstanceKey:'asc',
      state:'asc',
      startTime:'asc'
    },
    directionSubscriptions:{
      elementId:'asc',
      messageName:'asc',
      state:'asc',
      timestamp:'asc'
    },
    directionTimers:{
      elementId:'asc',
      dueDate:'asc',
      repetitions:'asc',
      state:'asc',
      timestamp:'asc'
    }

  }

  async componentDidMount() {

    await this.getWorkflowDetail(this.props.match.params.id, null)

  }


  async getWorkflowDetail(key, method) {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var operation = null
    operation = method
    if (operation == null) {
      var workflowDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/workflows/" + key,obj)
        .then(response => { return response.json() })
        .catch(error => { console.log(error); return 500 })
      if (workflowDetail == 500 || workflowDetail.status == 500) {
        this.setState({ errorText: workflowDetail.message, showDetail: false })
        $('#errorPanel').show();
      }
      else {
        $('#buttonInstances').click()
        var bpmnViewer = new Viewer({
          container: '#js-canvas-monitor',
          width: '100%',
          height: '100%',
          additionalModules: [
            minimapModule
          ] 
        });
        this.setState({ workflowDetail: workflowDetail, bpmnViewer: bpmnViewer, showDetail: true })
        this.openDiagram(workflowDetail.resource)
      }
    }
    else {
      var workflowDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/workflows/" + key,obj)
        .then(response => { return response.json() })
        .catch(error => { console.log(error); return 500 })
      if (workflowDetail == 500 || workflowDetail.status == 500) {
        this.setState({ errorText: workflowDetail.message, showDetail: false })
        $('#errorPanel').show();
      }
      else {
        $('#buttonInstances').click()
        var bpmnViewer = new Viewer({
          container: '#js-canvas-monitor',
          width: '100%',
          height: '100%',
          additionalModules: [
            minimapModule
          ] 
        });
        this.setState({ workflowDetail: workflowDetail, bpmnViewer: bpmnViewer, showDetail: true })
        this.openDiagram(workflowDetail.resource)
      }
    }

  }

  async refreshWorkflowDetail(key) {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var workflowDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/workflows/" + key,obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (workflowDetail == 500 || workflowDetail.status == 500)
      this.setState({ openDialogErrorServer: true })
    else {
      $('#buttonInstances').click()
      this.setState({ workflowDetail: workflowDetail })
      this.openDiagram(workflowDetail.resource)
    }

  }

  openDiagram(xml) {

    this.state.bpmnViewer.importXML(xml, (err) => {

      this.addMarkers(this.state.bpmnViewer)
    });

  }

  addMarkers(viewer) {
    var workflowDetail = this.state.workflowDetail
    var canvas = viewer.get('canvas');
    var overlays = viewer.get('overlays');
    var injector = viewer.get('injector');
    var elementRegistry = injector.get('elementRegistry');
    var graphicsFactory = injector.get('graphicsFactory');

    // zoom to fit full viewport
    canvas.zoom('fit-viewport');

    for (let i = 0; i < workflowDetail["instance.elementInstances"].length; i++) {
      this.addElementInstanceCounter(overlays, workflowDetail["instance.elementInstances"][i].elementId, workflowDetail["instance.elementInstances"][i].activeInstances, workflowDetail["instance.elementInstances"][i].endedInstances);
    }

    for (let i = 0; i < workflowDetail["instances"].length; i++) {

      if (workflowDetail["instances"][i].activeActivities != null)
        for (let j = 0; j < workflowDetail["instances"][i].activeActivities.length; j++) {
          var elementId = workflowDetail["instances"][i].activeActivities[j];
          this.addElementInstanceActiveMarker(canvas, elementId);
        }

      if (workflowDetail["instances"][i].incidentActivities != null)
        for (let k = 0; k < workflowDetail["instances"][i].incidentActivities.length; k++) {
          var elementId = workflowDetail["instances"][i].incidentActivities[k];
          this.addElementInstanceIncidentMarker(canvas, elementId);
        }

      if (workflowDetail["instances"][i].incidents != null)
        for (let z = 0; z < workflowDetail["instances"][i].incidents.length; z++) {
          var elementId = workflowDetail["instances"][i].incidents[z].activityId;
          if (!workflowDetail["instances"][i].incidents[z].isResolved)
            this.addIncidentMarker(overlays, elementId)
        }

      if (workflowDetail["instances"][i].takenSequenceFlows != null)
        for (let r = 0; r < workflowDetail["instances"][i].takenSequenceFlows.length; r++) {
          var flow = workflowDetail["instances"][i].takenSequenceFlows[r];
          this.markSequenceFlow(elementRegistry, graphicsFactory, flow);
        }

    }

  }


 async createInstance(key) {

    var data = this.getVariablesDocument()

    await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/workflows/" + key,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json; charset=utf-8',
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
        body: data,
        crossDomain: true
      }
    ).then(promise => promise.json()).then(response => {
      if (response.status == 200) {
        this.setState({ openDialogNewInstance: false,successText:"New instance created." })
        $('#successPanel').show();
      }
      else {
        this.setState({ openDialogNewInstance: false })
        if (response.error != null)
          this.setState({ errorText: response.error })
        else
          this.setState({ errorText: "Operazione non riuscita." })
        $('#errorPanel').show();
      }
    })
      .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

  }


  openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontentMonitor");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinksMonitor");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

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

  addElementInstanceCounter(overlays, elemenId, active, ended) {
    var style = ((active > 0) ? "bpmn-badge-active" : "bpmn-badge-inactive");

    overlays.add(elemenId, {
      position: {
        top: -25,
        left: 0
      },
      html: '<span class="' + style + '" data-toggle="tooltip" data-placement="bottom" title="active | ended">'
        + active + ' | ' + ended
        + '</span>'
    });
  }

  addElementInstanceActiveMarker(canvas, elementId) {
    canvas.addMarker(elementId, 'bpmn-element-active');
  }

  addElementInstanceIncidentMarker(canvas, elementId) {
    canvas.addMarker(elementId, 'bpmn-element-incident');
  }

  addIncidentMarker(overlays, elemenId) {
    overlays.add(elemenId, {
      position: {
        top: -25,
        right: 10
      },
      html: '<span class="bpmn-badge-incident" data-toggle="tooltip" data-placement="bottom" title="incident">'
        + "⚡"
        + '</span>'
    });
  }

  markSequenceFlow(elementRegistry, graphicsFactory, flow) {
    var element = elementRegistry.get(flow);
    var gfx = elementRegistry.getGraphics(element);

    this.colorSequenceFlow(graphicsFactory, element, gfx, '#52b415');
  }

  colorSequenceFlow(graphicsFactory, sequenceFlow, gfx, color) {
    var businessObject = sequenceFlow.businessObject,
      di = businessObject.di;

    di.set('stroke', color);
    di.set('fill', color);

    graphicsFactory.update('connection', sequenceFlow, gfx);
  }

  handleChangeInstancePage = (event, pageInstance) => {
    this.setState({ pageInstance });
  };

  handleChangeRowsPerInstancePage = event => {
    this.setState({ rowsPerPageInstance: event.target.value });
  };

  handleChangeSubPage = (event, pageSub) => {
    this.setState({ pageSub });
  };

  handleChangeRowsPerSubPage = event => {
    this.setState({ rowsPerPageSub: event.target.value });
  };

  handleChangeTimerPage = (event, pageTimer) => {
    this.setState({ pageTimer });
  };

  handleChangeRowsPerTimerPage = event => {
    this.setState({ rowsPerPageTimer: event.target.value });
  };

  sortBy(key,tab){
    
    if(tab=='Instances')
    {
    var workflowDetail = {...this.state.workflowDetail}
    var directionInstances = {...this.state.directionInstances}
    workflowDetail.instances = workflowDetail.instances.sort(
      (a,b)=>(
      this.state.directionInstances[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      directionInstances[key]=this.state.directionInstances[key] === 'asc' ?'desc' : 'asc'
    this.setState({workflowDetail,directionInstances})
    }
    else if(tab=='Subscriptions'){

    var workflowDetail = {...this.state.workflowDetail}
    var directionSubscriptions = {...this.state.directionSubscriptions}
    workflowDetail.messageSubscriptions = workflowDetail.messageSubscriptions.sort(
      (a,b)=>(
      this.state.directionSubscriptions[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      directionSubscriptions[key]=this.state.directionSubscriptions[key] === 'asc' ?'desc' : 'asc'
    this.setState({workflowDetail,directionSubscriptions})
    }
    else if(tab=='Timers'){

      var workflowDetail = {...this.state.workflowDetail}
      var directionTimers = {...this.state.directionTimers}
      workflowDetail.timers = workflowDetail.timers.sort(
        (a,b)=>(
        this.state.directionTimers[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
        
        ))
        directionTimers[key]=this.state.directionTimers[key] === 'asc' ?'desc' : 'asc'
      this.setState({workflowDetail,directionTimers})
      }
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
      this.setState({ openDialogPublishMessage: false,successText:"Message published."})
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


  render() {

    const { classes } = this.props
    const { rowsPerPageInstance, pageInstance, pageSub, rowsPerPageSub, pageTimer, rowsPerPageTimer } = this.state



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
        open={this.state.openDialogNewInstance}
        onClose={() => this.setState({ openDialogNewInstance: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">New Instance</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">

            <FormGroup style={{ alignContent: "center" }}>

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


          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogNewInstance: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.createInstance(this.state.workflowDetail.workflow.workflowKey)} variant="contained">
            Create
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



      <div className="divButtonInstance">

        <div id="errorPanel" class="alert alert-danger alert-dismissible fade show" style={{ display: "none" }} role="alert">
          <strong>Error:</strong> <span id="errorText">{this.state.errorText}</span>
          <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
        </div>

        <div id="successPanel" className="alert alert-success alert-dismissible fade show" style={{ display: "none" }} role="alert">
          <strong>Success:</strong> <span id="successText">{this.state.successText}</span>(<a href="#" onClick={event => { event.preventDefault(); this.refreshWorkflowDetail(this.state.workflowDetail.workflow.workflowKey) }}>Click on refresh</a>)
              <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
        </div>

        {this.state.showDetail ?
          <Button onClick={() => this.setState({ openDialogNewInstance: true })} className="buttonDeployment" variant="contained" color="primary">
            New Instance
              </Button> : null}
      </div>

      {this.state.showDetail ?
        <div style={{ marginRight: "15px", marginLeft: "15px" }}>

          <Grid container spacing={5} className="styleViewerWorkflow">
            <Grid item xs={12} sm={3}>
              <Paper style={{boxShadow:"none"}}>
              {this.state.workflowDetail != null ? (
                <Table /* style={{ width: "18%" }} */>
                  <TableBody>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Key</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.workflowDetail.workflow.workflowKey}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">BPMN process id</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.workflowDetail.workflow.bpmnProcessId}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Versione</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.workflowDetail.workflow.version}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">#active</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.workflowDetail.workflow.countRunning}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">#ended</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.workflowDetail.workflow.countEnded}</TableCell>
                      </TableRow>
                    </TableHead>
                  </TableBody>
                </Table>) : null}
                </Paper>
            </Grid>
            <Grid item xs={12} sm={9}>
            <Paper style={{boxShadow:"none",height:"100%"}}>
              <div className="content with-diagram" id="js-drop-zone-monitor">
                <div className="canvas" id="js-canvas-monitor"></div>
              </div>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>

<Paper style={{boxShadow:"none"}}>
              <div class="tabMonitor">
                <button id="buttonInstances" className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Instances') }}>Instances</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Subscriptions') }}>Message Subscriptions</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Timers') }}>Timers</button>
              </div>

              <div id="Instances" class="tabcontentMonitor">
                <span>{this.state.workflowDetail != null ? this.state.workflowDetail.instances.length : 0} instances</span>

                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                    <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('workflowInstanceKey','Instances')}>Workflow Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('state','Instances')} >State</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('startTime','Instances')}>Start Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.workflowDetail != null && this.state.workflowDetail.instances != [] ?
                      this.state.workflowDetail.instances.slice(pageInstance * rowsPerPageInstance, pageInstance * rowsPerPageInstance + rowsPerPageInstance).map(row => (
                        <TableRow className="tableRow">
                          <TableCell><Link to={"/monitoring/instances/" + row.workflowInstanceKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.workflowInstanceKey}</span></Link></TableCell>
                          <TableCell>{row.state}</TableCell>
                          <TableCell> {row.startTime}</TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.workflowDetail != null && this.state.workflowDetail.instances != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.workflowDetail.instances.length}
                          rowsPerPage={rowsPerPageInstance}
                          rowsPerPageOptions={[7]}
                          page={pageInstance}
                          onChangePage={this.handleChangeInstancePage}
                          onChangeRowsPerPage={this.handleChangeRowsPerInstancePage}
                        /* ActionsComponent={TablePaginationActionsWrapped} */
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Subscriptions" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle tableStyle" onClick={()=>this.sortBy('elementId','Subscriptions')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle tableStyle" onClick={()=>this.sortBy('messageName','Subscriptions')}>Message Name</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle tableStyle" onClick={()=>this.sortBy('state','Subscriptions')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle tableStyle" onClick={()=>this.sortBy('timestamp','Subscriptions')}>Time</TableCell>
                      <TableCell className="tableInstancesStyle tableStyle"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.workflowDetail != null && this.state.workflowDetail.messageSubscriptions != [] ?
                      this.state.workflowDetail.messageSubscriptions.slice(pageSub * rowsPerPageSub, pageSub * rowsPerPageSub + rowsPerPageSub).map(row => (
                        <TableRow className="tableRow">
                          <TableCell className="tableStyle tableStyleButton">{row.elementId}</TableCell>
                          <TableCell className="tableStyle tableStyleButton">{row.messageName}</TableCell>
                          <TableCell className="tableStyle tableStyleButton"> {row.state}</TableCell>
                          <TableCell className="tableStyle tableStyleButton"> {row.timestamp}</TableCell>
                          <TableCell className="tableStyle tableStyleButton">
                            {row.open == true ?
                              <Button onClick={() =>{
                                let messaggio = Object.assign(new Object(),row)
                                let publishMessage = { ...this.state.publishMessage }
                                publishMessage.message = messaggio
                              this.setState({ publishMessage, openDialogPublishMessage: true })
                              }}
                              className="buttonTable" variant="contained" color="primary">Publish Message</Button> : null}
                          </TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.workflowDetail != null && this.state.workflowDetail.messageSubscriptions != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.workflowDetail.messageSubscriptions.length}
                          rowsPerPage={rowsPerPageSub}
                          rowsPerPageOptions={[7]}
                          page={pageSub}
                          onChangePage={this.handleChangeSubPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerSubPage}
                        /* ActionsComponent={TablePaginationActionsWrapped} */
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Timers" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('elementId','Timers')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('dueDate','Timers')}>Due Date</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('repetitions','Timers')}>Repetitions</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('state','Timers')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" onClick={()=>this.sortBy('timestamp','Timers')}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.workflowDetail != null && this.state.workflowDetail.timers != [] ?
                      this.state.workflowDetail.timers.slice(pageTimer * rowsPerPageTimer, pageTimer * rowsPerPageTimer + rowsPerPageTimer).map(row => (
                        <TableRow className="tableRow">
                          <TableCell>{row.elementId}</TableCell>
                          <TableCell>{row.dueDate}</TableCell>
                          <TableCell>{row.repetitions}</TableCell>
                          <TableCell> {row.state}</TableCell>
                          <TableCell> {row.timestamp}</TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.workflowDetail != null && this.state.workflowDetail.timers != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.workflowDetail.timers.length}
                          rowsPerPage={rowsPerPageTimer}
                          rowsPerPageOptions={[7]}
                          page={pageTimer}
                          onChangePage={this.handleChangeTimerPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerTimerPage}
                        /* ActionsComponent={TablePaginationActionsWrapped} */
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>
              </Paper>
            </Grid>
          </Grid>


        </div> : null}


    </div>)

  }


}

export default (withStyles(styles)(WorkflowDetailView))