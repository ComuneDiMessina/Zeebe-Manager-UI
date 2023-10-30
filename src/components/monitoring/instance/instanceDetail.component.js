import React, { Component } from 'react';
import { Link } from "react-router-dom";
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
import Search from '@material-ui/icons/Search';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { FormGroup, Paper } from '@material-ui/core';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import {store} from '../../../store'
import minimapModule from 'diagram-js-minimap';


const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    /* backgroundColor: theme.palette.background.paper, */
  }
})

class InstanceDetailView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageVariable: 0,
    pageAuditLog: 0,
    pageIncident: 0,
    pageJob: 0,
    pageMessageSub: 0,
    pageTimer: 0,
    pageCalledWorkflow:0,
    rowsPerPageVariable: 7,
    rowsPerPageAuditLog: 7,
    rowsPerPageIncident: 7,
    rowsPerPageJob: 7,
    rowsPerPageMessageSub: 7,
    rowsPerPageTimer: 7,
    rowsPerPageCalledWorkflow:7,
    publishMessage: {message:null,timeToLive:"PT0S"},
    updateVariable: null,
    resolveIncident:null,
    selectedJob:null,
    errorText: null,
    successText:null,
    openDialogSetVariable: false,
    openDialogErrorServer: false,
    openDialogUpdateVariable: false,
    openDialogHistoryVariable:false,
    openDialogResolveIncident:false,
    openDialogCompleteJob:false,
    openDialogFailJob:false,
    openDialogThrowErrorJob:false,
    openDialogPublishMessage: false,
    showDetail: true,
    container: null,
    bpmnViewer: null,
    instanceDetail: null,
    directionVariables:{
      scopeKey:'asc',
      elementId:'asc',
      name:'asc',
      value:'asc',
      timestamp:'asc'
    },
    directionAudit:{
      elementId:'asc',
      key:'asc',
      flowScopeKey:'asc',
      state:'asc',
      elementName:'asc',
      bpmnElementType:'asc',
      timestamp:'asc'
    },
    directionIncidents:{
      elementId:'asc',
      elementInstanceKey:'asc',
      key:'asc',
      errorType:'asc',
      errorMessage:'asc',
      state:'asc',
      createdTime:'asc'
    },
    directionSubscriptions:{
      elementId:'asc',
      elementInstanceKey:'asc',
      messageName:'asc',
      correlationKey:'asc',
      state:'asc',
      timestamp:'asc'
    },
    directionJobs:{
      elementId:'asc',
      elementInstanceKey:'asc',
      key:'asc',
      jobType:'asc',
      retries:'asc',
      worker:'asc',
      state:'asc',
      timestamp:'asc'
    },
    directionTimers:{
      elementId:'asc',
      elementInstanceKey:'asc',
      dueDate:'asc',
      repetitions:'asc',
      state:'asc',
      timestamp:'asc'
    },
    directionCalledWorkflowInstances:{
      elementId:'asc',
      elementInstanceKey:'asc',
      childWorkflowInstanceKey:'asc',
      childBpmnProcessId:'asc',
      childState:'asc',
    }

  }

  async componentDidMount() {

    await this.getInstanceDetail(this.props.match.params.id, null)

  }


  async getInstanceDetail(key, method) {

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
      var instanceDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/instances/" + key,obj)
        .then(response => { return response.json() })
        .catch(error => { console.log(error); return 500 })
      if (instanceDetail == 500 || instanceDetail.status == 500) {
        this.setState({ errorText: instanceDetail.message, showDetail: false })
        $('#errorPanel').show();
      }
      else {
        $('#buttonVariables').click()
        var bpmnViewer = new Viewer({
          container: '#js-canvas-monitor',
          width: '100%',
          height: '100%',
          additionalModules: [
            minimapModule
          ] 
        });
        this.setState({ instanceDetail: instanceDetail, bpmnViewer: bpmnViewer, showDetail: true })
        this.openDiagram(instanceDetail.resource)
      }
    }
    else {
      var instanceDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/instances/" + key,obj)
        .then(response => { return response.json() })
        .catch(error => { console.log(error); return 500 })
      if (instanceDetail == 500 || instanceDetail.status == 500) {
        this.setState({ errorText: instanceDetail.message, showDetail: false })
        $('#errorPanel').show();
      }
      else {
        $('#buttonVariables').click()
        var bpmnViewer = new Viewer({
          container: '#js-canvas-monitor',
          width: '100%',
          height: '100%',
          additionalModules: [
            minimapModule
          ] 
        });
        this.setState({ instanceDetail: instanceDetail, bpmnViewer: bpmnViewer, showDetail: true })
        this.openDiagram(instanceDetail.resource)
      }
    }

  }

  async refreshinstanceDetail(key) {

    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token
      }
    }

    var instanceDetail = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/instances/" + key,obj)
      .then(response => { return response.json() })
      .catch(error => { console.log(error); return 500 })
    if (instanceDetail == 500 || instanceDetail.status == 500)
      this.setState({ openDialogErrorServer: true })
    else {
      $('#buttonVariables').click()
      this.setState({ instanceDetail: instanceDetail })
      this.openDiagram(instanceDetail.resource)
    }

  }

  openDiagram(xml) {

    var instanceDetail = this.state.instanceDetail
    var eventBus = this.state.bpmnViewer.get("eventBus");
    var overlays = this.state.bpmnViewer.get("overlays");

    this.state.bpmnViewer.importXML(xml, (err) => {

      this.addMarkers(this.state.bpmnViewer)
    });

    var bpmnElementInfo = {};
    for(let i=0;i < instanceDetail.instance["bpmnElementInfos"].length; i++){
      var elementId=instanceDetail.instance["bpmnElementInfos"][i].elementId
      bpmnElementInfo[elementId]=instanceDetail.instance["bpmnElementInfos"][i].info
    }

    var infoOverlayId;

    eventBus.on("element.hover", function(e) {
      var elementId = e.element.id;

      var info = bpmnElementInfo[elementId];
      if (info) {
          infoOverlayId = overlays.add(elementId, {
              position: {
                  bottom: -5,
                  left: 0
              },
              html: '<div class="bpmn-info">' + info + '</div>'
          });
      }
  });

  eventBus.on("element.out", function(e) {
    if (infoOverlayId) {
        overlays.remove(infoOverlayId);
    }
});

  }

  addMarkers(viewer) {
    var instanceDetail = this.state.instanceDetail
    var canvas = viewer.get('canvas');
    var overlays = viewer.get('overlays');
    var injector = viewer.get('injector');
    var elementRegistry = injector.get('elementRegistry');
    var graphicsFactory = injector.get('graphicsFactory');

    // zoom to fit full viewport
    canvas.zoom('fit-viewport');

    for (let i = 0; i < instanceDetail.instance["elementInstances"].length; i++) {
      this.addElementInstanceCounter(overlays, instanceDetail.instance["elementInstances"][i].elementId, instanceDetail.instance["elementInstances"][i].activeInstances, instanceDetail.instance["elementInstances"][i].endedInstances);
    }


    for (let j = 0; j < instanceDetail.instance["activeActivities"].length; j++) {
      var elementId = instanceDetail.instance["activeActivities"][j];
      this.addElementInstanceActiveMarker(canvas, elementId);
    }

    for (let k = 0; k < instanceDetail.instance["incidentActivities"].length; k++) {
      var elementId = instanceDetail.instance["incidentActivities"][k];
      this.addElementInstanceIncidentMarker(canvas, elementId);
    }

    for (let z = 0; z < instanceDetail.instance["incidents"].length; z++) {
      var elementId = instanceDetail.instance["incidents"][z].elementId;
      if (!instanceDetail.instance["incidents"][z].resolved)
        this.addIncidentMarker(overlays, elementId)
    }

    for (let r = 0; r < instanceDetail.instance["takenSequenceFlows"].length; r++) {
      var flow = instanceDetail.instance["takenSequenceFlows"][r];
      this.markSequenceFlow(elementRegistry, graphicsFactory, flow);

    }



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
    //canvas.addMarker(elementId, 'bpmn-element-active');

    var canvas = this.state.bpmnViewer.get('canvas');
    var overlays = this.state.bpmnViewer.get('overlays');
    var instanceDetail = this.state.instanceDetail
    var eventBus = this.state.bpmnViewer.get("eventBus");

    var bpmnElementInfo = {};
    for(let i=0;i < instanceDetail.instance["bpmnElementInfos"].length; i++){
      var elementId=instanceDetail.instance["bpmnElementInfos"][i].elementId
      bpmnElementInfo[elementId]=instanceDetail.instance["bpmnElementInfos"][i].info
    }

    var infoOverlayId;

    eventBus.on("element.hover", function(elementId) {

      var info = bpmnElementInfo[elementId];
      if (info) {
          infoOverlayId = overlays.add(elementId, {
              position: {
                  bottom: -5,
                  left: 0
              },
              html: '<div class="bpmn-info">' + info + '</div>'
          });
      }
  });
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


   addElementSelectedMarker(elementId) {
    var canvas = this.state.bpmnViewer.get('canvas');
    canvas.addMarker(elementId, 'bpmn-element-selected');
  }

  removeElementSelectedMarker(elementId) {
    var canvas = this.state.bpmnViewer.get('canvas');
    canvas.removeMarker(elementId, 'bpmn-element-selected');
  }


  handleChangeVariablePage = (event, pageVariable) => {
    this.setState({ pageVariable });
  };

  handleChangeRowsPerVariablePage = event => {
    this.setState({ rowsPerPageVariable: event.target.value });
  };

  handleChangeAuditPage = (event, pageAuditLog) => {
    this.setState({ pageAuditLog });
  };

  handleChangeRowsPerAuditPage = event => {
    this.setState({ rowsPerPageAuditLog: event.target.value });
  };

  handleChangeIncidentPage = (event, pageIncident) => {
    this.setState({ pageIncident });
  };

  handleChangeRowsPerIncidentPage = event => {
    this.setState({ rowsPerPageIncident: event.target.value });
  };

  handleChangeJobPage = (event, pageJob) => {
    this.setState({ pageJob });
  };

  handleChangeRowsPerJobPage = event => {
    this.setState({ rowsPerPageJob: event.target.value });
  };

  handleChangeMessageSubPage = (event, pageMessageSub) => {
    this.setState({ pageMessageSub });
  };

  handleChangeRowsPerMessageSubPage = event => {
    this.setState({ rowsPerPageMessageSub: event.target.value });
  };

  handleChangeTimerPage = (event, pageTimer) => {
    this.setState({ pageTimer });
  };

  handleChangeRowsPerTimerPage = event => {
    this.setState({ rowsPerPageTimer: event.target.value });
  };

  handleChangeCalledWorkflowPage = (event, calledWorkflow) => {
    this.setState({ calledWorkflow });
  };

  handleChangeRowsPerCalledWorkflowPage = event => {
    this.setState({ rowsPerPageCalledWorkflow: event.target.value });
  };

  async setVariable() {

    var scopeKeyElement = document.getElementById("variable-scopeKey");
    var scopeKey = scopeKeyElement.options[scopeKeyElement.selectedIndex].value;

    var name = document.getElementById("variable-name").value;

    var newValue = document.getElementById("variable-value").value;

    var data = '{"' + name + '":' + newValue + '}';

    var local = document.getElementById("variable-local").checked;

    var url = window.ENV.REACT_APP_SIMPLE_MONITOR + '/rest/api/instances/' + scopeKey + "/set-variables";

    if (local) {
      url = url + "-local";
    }

    await fetch(url,
      {
        method: 'put',
        headers: { 'Content-Type': 'application/json; charset=utf-8',
                   'x-auth-token': store.getState().oidcReducer.user.id_token,
                   'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
        body: data,
        crossDomain: true
      }
    ).then(promise => promise.json()).then(response => {
      if (response.status == 200) {
        this.setState({ openDialogSetVariable: false,successText:"Variable set." })
        $('#successPanel').show();
      }
      else {
        this.setState({ openDialogSetVariable: false })
        if (response.error != null)
          this.setState({ errorText: response.error })
        else
          this.setState({ errorText: "Operazione non riuscita." })
        $('#errorPanel').show();
      }
    })
      .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })
  }

  async cancelInstance() {

    var key = this.state.instanceDetail.instance.workflowInstanceKey

    await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/instances/" + key,
      {
        method: 'delete',
        headers: { 'Content-Type': 'application/json; charset=utf-8',
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
        crossDomain: true
      }
    ).then(promise => promise.json()).then(response => {
      if (response.status == 200) {
        this.setState({ openDialogCancelInstance: false,successText:"Instance canceled." })
        $('#successPanel').show();
      }
      else {
        this.setState({ openDialogCancelInstance: false })
        if (response.error != null)
          this.setState({ errorText: response.error })
        else
          this.setState({ errorText: "Operazione non riuscita." })
        $('#errorPanel').show();
      }
    })
      .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

  }

  async updateVariable(scopeKey, name) {

    var newValue = document.getElementById("variable-new-value-" + scopeKey + "-" + name).value;

    var data = '{"' + name + '":' + newValue + '}';


    await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/instances/" + scopeKey + "/set-variables",
      {
        method: 'put',
        body: data,
        headers: { 'Content-Type': 'application/json; charset=utf-8',
        'x-auth-token': store.getState().oidcReducer.user.id_token,
        'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
        crossDomain: true
      }
    ).then(promise => promise.json()).then(response => {
      if (response.status == 200) {
        this.setState({ openDialogUpdateVariable: false,successText:"Variable updated." })
        $('#successPanel').show();
      }
      else {
        this.setState({ openDialogUpdateVariable: false })
        if (response.error != null)
          this.setState({ errorText: response.error })
        else
          this.setState({ errorText: "Operazione non riuscita." })
        $('#errorPanel').show();
      }
    })
      .catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })
  }


  resolveJobIncident(incidentKey, jobKey) {

		var remainingRetries = document.getElementById("remaining-retries-" + incidentKey).value;
	
		this.resolveIncident(incidentKey, jobKey, remainingRetries);
}

 resolveWorkflowInstanceIncident(incidentKey) {
  this.resolveIncident(incidentKey, null, null);
}

async resolveIncident(incidentKey, jobKey, remainingRetries) {

  var data = {
    jobKey: jobKey,
    remainingRetries: remainingRetries
  };

  await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/instances/" + incidentKey + "/resolve-incident",
  {
    method: 'put',
    body:  JSON.stringify(data),
    headers: { 'Content-Type': 'application/json; charset=utf-8',
                   'x-auth-token': store.getState().oidcReducer.user.id_token,
                   'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
    crossDomain: true
  }
).then(promise => promise.json()).then(response => {
  if (response.status == 200) {
    this.setState({ openDialogResolveIncident: false,successText:"Incident resolved." })
    $('#successPanel').show();
  }
  else {
    this.setState({ openDialogResolveIncident: false })
    if (response.error != null)
      this.setState({ errorText: response.error })
    else
      this.setState({ errorText: "Operazione non riuscita." })
    $('#errorPanel').show();
  }
}).catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

}


  updateVariableValue = event => {
    var updateVariable = { ...this.state.updateVariable }
    updateVariable.value = event.target.value
    this.setState({ updateVariable })
  }


  showVariableFormJob(index) {
    var varForm = document.getElementById('variable-form-' + index + '_'+this.state.selectedJob.key);
    varForm.classList.remove("d-none");
  }

  getVariablesDocumentJob(key) {
    var formCount = 10;
    var variableCount = 0;
    var variableDocument = '{';
    var i;
    for (i = 1; i <= formCount; i++) {
      var varName = document.getElementById('variable-form-' + i + '-name_' + key).value;
      var varValue = document.getElementById('variable-form-' + i + '-value_' + key).value;
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

  async completeJob(jobKey) {

    var variables = this.getVariablesDocumentJob(jobKey)

    await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/jobs/" + jobKey + "/complete",
  {
    method: 'put',
    body:  variables,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
    'x-auth-token': store.getState().oidcReducer.user.id_token,
    'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
    crossDomain: true
  }
).then(promise => promise.json()).then(response => {
  if (response.status == 200) {
    this.setState({ openDialogCompleteJob: false,successText:"Job completed." })
    $('#successPanel').show();
  }
  else {
    this.setState({ openDialogCompleteJob: false })
    if (response.error != null)
      this.setState({ errorText: response.error })
    else
      this.setState({ errorText: "Operazione non riuscita." })
    $('#errorPanel').show();
  }
}).catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

}


async throwErrorJob(jobKey) {

  var data = {errorCode:document.getElementById("error-code-" + jobKey).value}

  await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/jobs/" + jobKey + "/throw-error",
{
  method: 'put',
  body:  JSON.stringify(data),
  headers: { 'Content-Type': 'application/json; charset=utf-8',
                   'x-auth-token': store.getState().oidcReducer.user.id_token,
                   'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
  crossDomain: true
}
).then(promise => promise.json()).then(response => {
if (response.status == 200) {
  this.setState({ openDialogThrowErrorJob: false,successText:"Error thrown." })
  $('#successPanel').show();
}
else {
  this.setState({ openDialogThrowErrorJob: false })
  if (response.error != null)
    this.setState({ errorText: response.error })
  else
    this.setState({ errorText: "Operazione non riuscita." })
  $('#errorPanel').show();
}
}).catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

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


async failJob(jobKey) {


  await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/api/jobs/" + jobKey + "/fail",
{
  method: 'put',
  headers: { 'Content-Type': 'application/json; charset=utf-8',
  'x-auth-token': store.getState().oidcReducer.user.id_token,
  'Authorization': 'Bearer '+store.getState().oidcReducer.user.access_token },
  crossDomain: true
}
).then(promise => promise.json()).then(response => {
if (response.status == 200) {
  this.setState({ openDialogFailJob: false,successText:"Job failed." })
  $('#successPanel').show();
}
else {
  this.setState({ openDialogFailJob: false })
  if (response.error != null)
    this.setState({ errorText: response.error })
  else
    this.setState({ errorText: "Operazione non riuscita." })
  $('#errorPanel').show();
}
}).catch(error => { console.log(error), this.setState({ openDialogErrorServer: true }) })

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


sortBy(key,tab){
    
  if(tab=='Variables')
  {
  var instanceDetail = {...this.state.instanceDetail}
  var directionVariables = {...this.state.directionVariables}
  instanceDetail.instance.variables = instanceDetail.instance.variables.sort(
    (a,b)=>(
    this.state.directionVariables[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
    
    ))
    directionVariables[key]=this.state.directionVariables[key] === 'asc' ?'desc' : 'asc'
  this.setState({instanceDetail,directionVariables})
  }
  else if(tab=='Audit'){

  var instanceDetail = {...this.state.instanceDetail}
  var directionAudit = {...this.state.directionAudit}
  instanceDetail.instance.auditLogEntries = instanceDetail.instance.auditLogEntries.sort(
    (a,b)=>(
    this.state.directionAudit[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
    
    ))
    directionAudit[key]=this.state.directionAudit[key] === 'asc' ?'desc' : 'asc'
  this.setState({instanceDetail,directionAudit})
  }
  else if(tab=='Incidents'){

    var instanceDetail = {...this.state.instanceDetail}
    var directionIncidents = {...this.state.directionIncidents}
    instanceDetail.instance.incidents = instanceDetail.instance.incidents.sort(
      (a,b)=>(
      this.state.directionIncidents[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
      
      ))
      directionIncidents[key]=this.state.directionIncidents[key] === 'asc' ?'desc' : 'asc'
    this.setState({instanceDetail,directionIncidents})
    }
    else if(tab=='Jobs'){

      var instanceDetail = {...this.state.instanceDetail}
      var directionJobs = {...this.state.directionJobs}
      instanceDetail.instance.jobs = instanceDetail.instance.jobs.sort(
        (a,b)=>(
        this.state.directionJobs[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
        
        ))
        directionJobs[key]=this.state.directionJobs[key] === 'asc' ?'desc' : 'asc'
      this.setState({instanceDetail,directionJobs})
      }
    else if(tab=='Message'){

      var instanceDetail = {...this.state.instanceDetail}
      var directionSubscriptions = {...this.state.directionSubscriptions}
      instanceDetail.instance.messageSubscriptions = instanceDetail.instance.messageSubscriptions.sort(
        (a,b)=>(
        this.state.directionSubscriptions[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
        
        ))
        directionSubscriptions[key]=this.state.directionSubscriptions[key] === 'asc' ?'desc' : 'asc'
      this.setState({instanceDetail,directionSubscriptions})
      }
      else if(tab=='Timer'){

        var instanceDetail = {...this.state.instanceDetail}
        var directionTimers = {...this.state.directionTimers}
        instanceDetail.instance.timers = instanceDetail.instance.timers.sort(
          (a,b)=>(
          this.state.directionTimers[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
          
          ))
          directionTimers[key]=this.state.directionTimers[key] === 'asc' ?'desc' : 'asc'
        this.setState({instanceDetail,directionTimers})
        }
        else if(tab=='CalledWorkflowInstances'){

          var instanceDetail = {...this.state.instanceDetail}
          var directionCalledWorkflowInstances = {...this.state.directionCalledWorkflowInstances}
          instanceDetail.instance.calledWorkflowInstances = instanceDetail.instance.calledWorkflowInstances.sort(
            (a,b)=>(
            this.state.directionCalledWorkflowInstances[key] === 'asc' ? a[key]<b[key] : a[key]>b[key]
            
            ))
            directionCalledWorkflowInstances[key]=this.state.directionCalledWorkflowInstances[key] === 'asc' ?'desc' : 'asc'
          this.setState({instanceDetail,directionCalledWorkflowInstances})
          }
}


  render() {

    const { classes } = this.props
    const { rowsPerPageVariable, pageVariable, pageAuditLog, rowsPerPageAuditLog, pageIncident, rowsPerPageIncident, pageJob, rowsPerPageJob, pageMessageSub, rowsPerPageMessageSub, pageTimer, rowsPerPageTimer, pageCalledWorkflow,rowsPerPageCalledWorkflow } = this.state


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
        open={this.state.openDialogCancelInstance}
        onClose={() => this.setState({ openDialogCancelInstance: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Cancel Instance</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">
            <p style={{ textAlign: "center" }}><strong>Are you sure?</strong></p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogCancelInstance: false })} variant="contained">
            NO
          </Button>
          <Button className="buttonDeployment" onClick={() => this.cancelInstance()} variant="contained">
            YES
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={this.state.openDialogSetVariable}
        onClose={() => this.setState({ openDialogSetVariable: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Add Variable</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">

            <FormGroup className="form-group">
              <label class="col-form-label">Scope Key</label>
              <select id="variable-scopeKey" class="form-control-variable">
                {this.state.instanceDetail != null ? this.state.instanceDetail.instance.activeScopes.map((row) => <option value={row.scopeKey}>{row.scopeKey + " (" + row.scopeName + ")"}</option>) : null}
              </select>
            </FormGroup>

            <FormGroup className="form-group">
              <label class="col-form-label">Name</label>
              <input id="variable-name" class="form-control-variable" type="text" />
            </FormGroup>

            <FormGroup className="form-group">
              <label class="col-form-label">Value</label>
              <input id="variable-value" class="form-control-variable" type="text" />
              <small class="form-text text-muted">As JSON string (e.g. `2.1`, `"good"`, `true`).</small>
            </FormGroup>

            <FormGroup className="form-group" style={{ paddingLeft: "1.25rem" }}>
              <input type="checkbox" class="form-check-input" id="variable-local" />
              <label class="form-check-label" for="variable-local">Local</label>
              <small class="form-text text-muted">If set, the variable is created at the given scope and not
              propagated to higher or root scope.
            </small>
            </FormGroup>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogSetVariable: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.setVariable()} variant="contained">
            Set
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={this.state.openDialogUpdateVariable}
        onClose={() => this.setState({ openDialogUpdateVariable: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Update Variable</h2></DialogTitle>
        <DialogContent>
          {this.state.updateVariable!=null ? (
            <DialogContentText className="styleDialogText" id="alert-dialog-description">


              <FormGroup className="form-group">
                <label class="col-form-label">Scope Key</label>
                <input class="form-control-variable-readonly" type="text" value={this.state.updateVariable.scopeKey} readonly={true} />
              </FormGroup>

              <FormGroup className="form-group">
                <label class="col-form-label">Name</label>
                <input class="form-control-variable-readonly" type="text" value={this.state.updateVariable.name} readonly={true} />
              </FormGroup>

              <FormGroup className="form-group">
                <label class="col-form-label">New value</label>
                <input id={"variable-new-value-" + this.state.updateVariable.scopeKey + "-" + this.state.updateVariable.name} class="form-control-variable" type="text" value={this.state.updateVariable.value} onChange={this.updateVariableValue} />
                <small class="form-text text-muted">As JSON string (e.g. `2.1`, `"good"`, `true`).</small>
              </FormGroup>

            </DialogContentText>) : null}
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogUpdateVariable: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={this.updateVariable != null ? (() => this.updateVariable(this.state.updateVariable.scopeKey, this.state.updateVariable.name)) : null} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={this.state.openDialogHistoryVariable}
        onClose={() => this.setState({ openDialogHistoryVariable: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Variable Updates</h2></DialogTitle>
        <DialogContent>
          {this.state.updateVariable!=null ? (
            <DialogContentText className="styleDialogText" id="alert-dialog-description">


              <FormGroup className="form-group">
                <label class="col-form-label">Scope Key</label>
                <input class="form-control-variable-readonly" type="text" value={this.state.updateVariable.scopeKey} readonly={true} />
              </FormGroup>

              <FormGroup className="form-group">
                <label class="col-form-label">Name</label>
                <input class="form-control-variable-readonly" type="text" value={this.state.updateVariable.name} readonly={true} />
              </FormGroup>

              <table className="table-striped">
                <thead>
                  <th>Value</th>
                  <th>Time</th>
                </thead>

                {this.state.updateVariable.updates.map(row => (
                  <tr>
                    <td>{row.value}</td>
                    <td>{row.timestamp}</td>
                  </tr>
                ))}

              </table>

            </DialogContentText>) : null}
        </DialogContent>
        <DialogActions>
          <Button className="buttonDeployment" onClick={() => this.setState({ openDialogHistoryVariable: false })} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={this.state.openDialogResolveIncident}
        onClose={() => this.setState({ openDialogResolveIncident: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Resolve Incident</h2></DialogTitle>
        <DialogContent>
          {this.state.resolveIncident!=null? (
            <DialogContentText className="styleDialogText" id="alert-dialog-description">


              <FormGroup className="form-group">
                <label class="col-form-label">Make sure that you fixed the error</label>
                <input class="form-control-variable-readonly" type="text" value={this.state.resolveIncident.errorMessage} readonly={true} />
              </FormGroup>

                {this.state.resolveIncident.jobKey!=null?(
              <FormGroup className="form-group">
                <label class="col-form-label">Remaining Retries</label>
                <input id={"remaining-retries-"+this.state.resolveIncident.key} type="number" min="0" class="form-control-variable" value="1" />
              </FormGroup>):null}

            </DialogContentText>) : null}
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogResolveIncident: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={this.state.resolveIncident!=null && this.state.resolveIncident.jobKey!=null?(() => this.resolveJobIncident(this.state.resolveIncident.key, this.state.resolveIncident.jobKey)) : 
            this.state.resolveIncident!=null && this.state.resolveIncident.jobKey==null?(() => this.resolveWorkflowInstanceIncident(this.state.resolveIncident.key)):null} variant="contained">
            Resolve
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={this.state.openDialogCompleteJob}
        onClose={() => this.setState({ openDialogCompleteJob: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Complete Job</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">

            {this.state.selectedJob!=null?
            <FormGroup style={{ alignContent: "center" }}>

              <label class="col-form-label">Variables</label>
              <div id="variable-form">
                <div class="form-row" id={"variable-form-1_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-1-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-1-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-1-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(2)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-2_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-2-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-2-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-2-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(3)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-3_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-3-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-3-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-3-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(4)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-4_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-4-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-4-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-4-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(5)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-5_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-5-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-5-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-5-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(6)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-6_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-6-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-6-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-6-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(7)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-7_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-7-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-7-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-7-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(8)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-8_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-8-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-8-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-8-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(9)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-9_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-9-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-9-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-9-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(10)}>+
                </button>
                  </div>
                </div>
                <div class="form-row d-none" id={"variable-form-10_"+this.state.selectedJob.key}>
                  <div class="form-group col-md-4">
                    <input id={"variable-form-10-name_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="name" />
                  </div>
                  <div class="form-group col-md-7">
                    <input id={"variable-form-10-value_"+this.state.selectedJob.key} type="text" class="form-control" placeholder="value (JSON)" />
                  </div>
                  <div class="form-group col-md-1">
                    <button id={"variable-form-10-button_"+this.state.selectedJob.key} class="btn btn-outline-primary" onClick={() => this.showVariableFormJob(11)}
                      disabled>+
                </button>
                  </div>
                </div>
              </div>
            </FormGroup>:null}


          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogCompleteJob: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.completeJob(this.state.selectedJob.key)} variant="contained">
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={this.state.openDialogThrowErrorJob}
        onClose={() => this.setState({ openDialogThrowErrorJob: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Throw Error for Job</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">
          {this.state.selectedJob!=null?
          <div class="modal fade" id={"throwErrorModal-"+this.state.selectedJob.key} tabindex="-1" role="dialog" aria-labelledby="throwErrorModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">

    <div class="modal-content">
      <div class="modal-body">
        <div class="form-group">
          <label class="col-form-label">Error Code</label>
          <input id={"error-code-"+this.state.selectedJob.key} class="form-control-variable" type="text" />
        </div>

      </div>

    </div>
  </div>
</div>:null}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogThrowErrorJob: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.throwErrorJob(this.state.selectedJob.key)} variant="contained">
          Throw Error
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={this.state.openDialogFailJob}
        onClose={() => this.setState({ openDialogFailJob: false })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth={true}
      >
        <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">Fail Job</h2></DialogTitle>
        <DialogContent>
          <DialogContentText className="styleDialogText" id="alert-dialog-description">
            <p style={{ textAlign: "center" }}><strong>Are you sure?</strong></p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="buttonStyle" onClick={() => this.setState({ openDialogFailJob: false })} variant="contained">
            Close
          </Button>
          <Button className="buttonDeployment" onClick={() => this.failJob(this.state.selectedJob.key)} variant="contained">
            Fail
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
          <strong>Success:</strong> <span id="successText">{this.state.successText}</span>(<a href="#" onClick={event => { event.preventDefault(); this.refreshinstanceDetail(this.state.instanceDetail.instance.workflowInstanceKey) }}>Click on refresh</a>)
              <Close className="close" onClick={event => { event.preventDefault(); $('.alert').hide() }} fontSize="small" />
        </div>

        {this.state.showDetail && this.state.instanceDetail!=null ?
          <Button disabled={this.state.instanceDetail.instance.running == true ? false : true} onClick={() => this.setState({ openDialogCancelInstance: true })} style={{ marginLeft: "5px" }} className="buttonDeployment" variant="contained" color="primary">
            Cancel Instance
              </Button>
          : null}
        {this.state.showDetail && this.state.instanceDetail!=null ?
          <Button disabled={this.state.instanceDetail.instance.running == true ? false : true} onClick={() => this.setState({ openDialogSetVariable: true })} className="buttonDeployment" variant="contained" color="primary">
            Set Variable
              </Button>
          : null}
      </div>

      {this.state.showDetail ?
        <div style={{ marginRight: "15px", marginLeft: "15px" }}>

          <Grid container spacing={8} className="styleViewerInstance">
            <Grid  item xs={12} sm={4}>
            <Paper style={{boxShadow:"none"}}>
              {this.state.instanceDetail != null ? (
                <Table /* style={{ width: "18%" }} */>
                  <TableBody>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Key</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.workflowInstanceKey}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">BPMN process id</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.bpmnProcessId}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Version</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.version}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Workflow Key</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" ><Link to={"/monitoring/workflows/" + this.state.instanceDetail.instance.workflowKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{this.state.instanceDetail.instance.workflowKey}</span></Link></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">State</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.state}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Start Time</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.startTime}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableHead style={{ borderTop: "1px solid #dee2e6" }}>
                      <TableRow className="tableResultRowStyle">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">End Time</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" >{this.state.instanceDetail.instance.endTime}</TableCell>
                      </TableRow>
                    </TableHead>
                    {this.state.instanceDetail.instance.parentWorkflowInstanceKey!=null?
                    <TableHead className="tableHeadDetailWorkflow">
                      <TableRow className="tableRow">
                        <TableCell component="th" scope="row" className="tableMonitorStyle">Parent Workflow Instance</TableCell>
                        <TableCell align="right" className="tableStyle cellInstance" ><Link to={"/monitoring/instances/" + this.state.instanceDetail.instance.parentWorkflowInstanceKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{this.state.instanceDetail.instance.parentWorkflowInstanceKey}</span></Link></TableCell>
                      </TableRow>
                    </TableHead>:null}
                  </TableBody>
                </Table>) : null}
                </Paper>
            </Grid>
            <Grid item xs={12} sm={8}>
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
                <button id="buttonVariables" className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Variables') }}>Variables</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Audit') }}>Audit Log</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Incidents') }}>Incidents</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Jobs') }}>Jobs</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Message') }}>Message Subscriptions</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'Timer') }}>Timers</button>
                <button className="tablinksMonitor" onClick={event => { event.preventDefault(); this.openTab(event, 'CalledWorkflowInstances') }}>Called Workflow Instances</button>
              </div>

              <div id="Variables" class="tabcontentMonitor">

                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('scopeKey','Variables')}>Scope Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementId','Variables')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('name','Variables')}>Variable Name</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('value','Variables')}>Variable Value</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('timestamp','Variables')}>Time</TableCell>
                      <TableCell padding="none" className="tableInstancesStyle "></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.variables != [] ?
                      this.state.instanceDetail.instance.variables.slice(pageVariable * rowsPerPageVariable, pageVariable * rowsPerPageVariable + rowsPerPageVariable).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none" >{row.scopeKey}</TableCell>
                          <TableCell padding="none">
                          {row.elementId!=null?(
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}
                          </TableCell>
                          <TableCell padding="none"> {row.name}</TableCell>
                          <TableCell padding="none" > {row.value}</TableCell>
                          <TableCell padding="none" > {row.timestamp}</TableCell>
                          <TableCell padding="none" >
                            <Button onClick={() => this.setState({ updateVariable: row,openDialogHistoryVariable: true })} className="buttonTable" variant="contained" color="primary">Show History</Button>
                            <Button disabled={this.state.instanceDetail.instance.running == true ? false : true} onClick={() => this.setState({ updateVariable: row, openDialogUpdateVariable: true })} style={{ marginLeft: "5px" }} className="buttonTable" variant="contained" color="primary">Update</Button>
                          </TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.variables != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.variables.length}
                          rowsPerPage={rowsPerPageVariable}
                          rowsPerPageOptions={[7]}
                          page={pageVariable}
                          onChangePage={this.handleChangeVariablePage}
                          onChangeRowsPerPage={this.handleChangeRowsPerVariablePage}
                        /* ActionsComponent={TablePaginationActionsWrapped} */
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Audit" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementId','Audit')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('key','Audit')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('flowScopeKey','Audit')}>Flow Scope Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('state','Audit')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementName','Audit')}>Element Name</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('bpmnElementType','Audit')}>BPMN Element Type</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('timestamp','Audit')}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.auditLogEntries != [] ?
                      this.state.instanceDetail.instance.auditLogEntries.slice(pageAuditLog * rowsPerPageAuditLog, pageAuditLog * rowsPerPageAuditLog + rowsPerPageAuditLog).map(row => (
                        <TableRow className="tableWorkflows">
                          <TableCell padding="none">{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell padding="none">{row.key}</TableCell>
                          <TableCell padding="none"> {row.flowScopeKey}</TableCell>
                          <TableCell padding="none"> {row.state}</TableCell>
                          <TableCell padding="none"> {row.elementName}</TableCell>
                          <TableCell padding="none"> {row.bpmnElementType}</TableCell>
                          <TableCell padding="none"> {row.timestamp}</TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.auditLogEntries != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.auditLogEntries.length}
                          rowsPerPage={rowsPerPageAuditLog}
                          rowsPerPageOptions={[7]}
                          page={pageAuditLog}
                          onChangePage={this.handleChangeAuditPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerAuditPage}
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Incidents" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementId','Incidents')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementInstanceKey','Incidents')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('key','Incidents')}>Incident Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('errorType','Incidents')}>Error Type</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('errorMessage','Incidents')}>Error Message</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('state','Incidents')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('createdTime','Incidents')}> Created Time</TableCell>
                      <TableCell padding="none" className="tableInstancesStyle "></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.incidents != [] ?
                      this.state.instanceDetail.instance.incidents.slice(pageIncident * rowsPerPageIncident, pageIncident * rowsPerPageIncident + rowsPerPageIncident).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none">{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell  padding="none">{row.elementInstanceKey}</TableCell>
                          <TableCell  padding="none">{row.key}</TableCell>
                          <TableCell padding="none"> {row.errorType}</TableCell>
                          <TableCell padding="none" > {row.errorMessage}</TableCell>
                          <TableCell padding="none" > {row.state}</TableCell>
                          <TableCell padding="none"> {row.createdTime}</TableCell>
                          <TableCell padding="none" >
                            {row.resolved==false ?(<Button onClick={() => this.setState({ resolveIncident: row, openDialogResolveIncident: true })} className="buttonTable" variant="contained" color="primary">Resolve</Button>):null}
                          </TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.incidents != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.incidents.length}
                          rowsPerPage={rowsPerPageIncident}
                          rowsPerPageOptions={[7]}
                          page={pageIncident}
                          onChangePage={this.handleChangeIncidentPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerIncidentPage}
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Jobs" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('elementId','Jobs')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('elementInstanceKey','Jobs')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('key','Jobs')}>Job Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('jobType','Jobs')}>Job Type</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('retries','Jobs')}>Retries</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('worker','Jobs')}>Job Worker</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('state','Jobs')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} className="tableInstancesStyle" padding="none" onClick={()=>this.sortBy('state','Jobs')}>Time</TableCell>
                      <TableCell className="tableInstancesStyle" padding="none"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.jobs != [] ?
                      this.state.instanceDetail.instance.jobs.slice(pageJob * rowsPerPageJob, pageJob * rowsPerPageJob + rowsPerPageJob).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none">{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell padding="none">{row.elementInstanceKey}</TableCell>
                          <TableCell padding="none">{row.key}</TableCell>
                          <TableCell padding="none">{row.jobType}</TableCell>
                          <TableCell padding="none"> {row.retries}</TableCell>
                          <TableCell padding="none"> {row.worker}</TableCell>
                          <TableCell padding="none"> {row.state}</TableCell>
                          <TableCell padding="none"> {row.timestamp}</TableCell>
                          <TableCell padding="none">
                            {row.activatable==true ?(<Button onClick={() => this.setState({ selectedJob: row, openDialogCompleteJob: true })} className="buttonTable" variant="contained" color="primary">Complete</Button>):null}
                            {row.activatable==true ?(<Button onClick={() => this.setState({ selectedJob: row, openDialogFailJob: true })} style={{ marginLeft: "5px" }}  className="buttonTable" variant="contained" color="primary">Fail</Button>):null}
                            {row.activatable==true ?(<Button onClick={() => this.setState({ selectedJob: row, openDialogThrowErrorJob: true })} style={{ marginLeft: "5px" }}  className="buttonTable" variant="contained" color="primary">Throw Error</Button>):null}
                          </TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.jobs != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.jobs.length}
                          rowsPerPage={rowsPerPageJob}
                          rowsPerPageOptions={[7]}
                          page={pageJob}
                          onChangePage={this.handleChangeJobPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerJobPage}
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Message" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementId','Message')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('elementInstanceKey','Message')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('messageName','Message')}>Message Name</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('correlationKey','Message')}>Correlation Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('state','Message')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle " onClick={()=>this.sortBy('timestamp','Message')}>Time</TableCell>
                      <TableCell padding="none" className="tableInstancesStyle "></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.messageSubscriptions != [] ?
                      this.state.instanceDetail.instance.messageSubscriptions.slice(pageMessageSub * rowsPerPageMessageSub, pageMessageSub * rowsPerPageMessageSub + rowsPerPageMessageSub).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none" >{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell padding="none" >{row.elementInstanceKey}</TableCell>
                          <TableCell padding="none">{row.messageName}</TableCell>
                          <TableCell padding="none" >{row.correlationKey}</TableCell>
                          <TableCell padding="none" > {row.state}</TableCell>
                          <TableCell padding="none" > {row.timestamp}</TableCell>
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
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.messageSubscriptions != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.messageSubscriptions.length}
                          rowsPerPage={rowsPerPageMessageSub}
                          rowsPerPageOptions={[7]}
                          page={pageMessageSub}
                          onChangePage={this.handleChangeMessageSubPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerMessageSubPage}
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="Timer" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('elementId','Timer')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('elementInstanceKey','Timer')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('dueDate','Timer')}>Due Date</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('repetitions','Timer')}>Repetitions</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('state','Timer')}>State</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle"  onClick={()=>this.sortBy('timestamp','Timer')}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.timers != [] ?
                      this.state.instanceDetail.instance.timers.slice(pageTimer * rowsPerPageTimer, pageTimer * rowsPerPageTimer + rowsPerPageTimer).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none" >{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell padding="none" >{row.elementInstanceKey}</TableCell>
                          <TableCell padding="none" >{row.dueDate}</TableCell>
                          <TableCell padding="none" >{row.repetitions}</TableCell>
                          <TableCell padding="none" > {row.state}</TableCell>
                          <TableCell padding="none" > {row.timestamp}</TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.timers != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.timers.length}
                          rowsPerPage={rowsPerPageTimer}
                          rowsPerPageOptions={[7]}
                          page={pageTimer}
                          onChangePage={this.handleChangeTimerPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerTimerPage}
                        />
                      </TableRow>
                    </TableFooter> : null}
                </Table>
              </div>

              <div id="CalledWorkflowInstances" class="tabcontentMonitor">
                <Table id="tableWorkflows" >
                  <TableHead>
                    <TableRow className="tableRow">
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('elementId','CalledWorkflowInstances')}>Element Id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('elementInstanceKey','CalledWorkflowInstances')}>Element Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('childWorkflowInstanceKey','CalledWorkflowInstances')}>Called Workflow Instance Key</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('childBpmnProcessId','CalledWorkflowInstances')}>Called BPMN process id</TableCell>
                      <TableCell style={{cursor:"pointer"}} padding="none" className="tableInstancesStyle" onClick={()=>this.sortBy('childState','CalledWorkflowInstances')}>Called Workflow Instance State</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.instanceDetail != null && this.state.instanceDetail.instance.calledWorkflowInstances != [] ?
                      this.state.instanceDetail.instance.calledWorkflowInstances.slice(pageCalledWorkflow * rowsPerPageCalledWorkflow, pageCalledWorkflow * rowsPerPageCalledWorkflow + rowsPerPageCalledWorkflow).map(row => (
                        <TableRow className="tableRow">
                          <TableCell padding="none" >{row.elementId!=null?(
                            
                            <div><span data-toggle="tooltip" data-placement="bottom" title="Highlight element in diagram" onMouseOver={(e)=>{e.preventDefault();this.addElementSelectedMarker(row.elementId)}} onMouseOut={(e)=>{e.preventDefault();this.removeElementSelectedMarker(row.elementId)}}>
                              <Search className="iconSelectedElement" /> {row.elementId}
                            </span>
                            </div>):""}</TableCell>
                          <TableCell padding="none" >{row.elementInstanceKey}</TableCell>
                          <TableCell padding="none" ><Link to={"/monitoring/instances/" + row.childWorkflowInstanceKey}><span style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}>{row.childWorkflowInstanceKey}</span></Link></TableCell>
                          <TableCell padding="none" >{row.childBpmnProcessId}</TableCell>
                          <TableCell padding="none" > {row.childState}</TableCell>
                        </TableRow>
                      )) : null}
                  </TableBody>
                  {this.state.instanceDetail != null && this.state.instanceDetail.instance.calledWorkflowInstances != [] ?
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={this.state.instanceDetail.instance.calledWorkflowInstances.length}
                          rowsPerPage={rowsPerPageCalledWorkflow}
                          rowsPerPageOptions={[7]}
                          page={pageCalledWorkflow}
                          onChangePage={this.handleChangeCalledWorkflowPage}
                          onChangeRowsPerPage={this.handleChangeRowsPerCalledWorkflowPage}
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

export default (withStyles(styles)(InstanceDetailView))