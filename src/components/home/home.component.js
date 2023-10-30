import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import base64 from 'base-64'
import utf8 from 'utf8'
import { setAdmin, unSetUser } from '../../modules/user'
import userManager from "../../utilities/userManager";
import * as ApiService from '../../utilities/api.js'
import './home.style.css';
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/xml/xml'
import $ from 'jquery';
import CustomModeler from '../../custom-modeler';
import diagramXML from '../../resources/newDiagram.bpmn';
import {
  debounce
} from 'min-dash';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcone from '@material-ui/icons/Add';
import FolderIcon from '@material-ui/icons/FolderOpen'
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import OpenDiagramIcon from '@material-ui/icons/OpenInBrowser'
import HistoryIcon from '@material-ui/icons/History'
import SaveIcon from '@material-ui/icons/Save'
import SaveAsIcon from '@material-ui/icons/SaveOutlined'
import ImageIcone from '@material-ui/icons/Image'
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import BrushIcon from '@material-ui/icons/Brush'
import FormatAlignLeft from '@material-ui/icons/FormatAlignLeft'
import FormatAlignCenter from '@material-ui/icons/FormatAlignCenter'
import FormatAlignRight from '@material-ui/icons/FormatAlignRight'
import PublishIcon from '@material-ui/icons/Publish'
import MonitorIcon from '@material-ui/icons/Timeline'
import AssignmentIcon from '@material-ui/icons/Assignment';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';

import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import LogoutIcon from '@fortawesome/fontawesome-free/svgs/solid/sign-out-alt.svg'
import Viewer from 'bpmn-js/lib/NavigatedViewer'

import Checkbox from '@material-ui/core/Checkbox';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import ReactFileReader from 'react-file-reader'

import minimapModule from 'diagram-js-minimap';
var downloadLink = $('#js-download-diagram');
var downloadSvgLink = $('#js-download-svg');

const COLORS = [{
  value: 0,
  fill: 'white',
  stroke: 'black'
}, {
  value: 1,
  fill: 'rgb(187, 222, 251)',
  stroke: 'rgb(30, 136, 229)'
}, {
  value: 2,
  fill: 'rgb(255, 224, 178)',
  stroke: 'rgb(251, 140, 0)'
}, {
  value: 3,
  fill: 'rgb(200, 230, 201)',
  stroke: 'rgb(67, 160, 71)'
}, {
  value: 4,
  fill: 'rgb(255, 205, 210)',
  stroke: 'rgb(229, 57, 53)'
}, {
  value: 5,
  fill: 'rgb(225, 190, 231)',
  stroke: 'rgb(142, 36, 170)'
}];

const options = [
  { value: 0, label: " ", className: "colorWhite" },
  { value: 1, label: " ", className: "colorBlue" },
  { value: 2, label: " ", className: "colorOrange" },
  { value: 3, label: " ", className: "colorGreen" },
  { value: 4, label: " ", className: "colorRed" },
  { value: 5, label: " ", className: "colorPurple" }
]


class HomeView extends Component {
  constructor(props) {
    super(props);

    this._onSelect = this._onSelect.bind(this)
    //this.handleLeavePage = this.handleLeavePage.bind(this)

  }

  state = {

    container: null,
    bpmnModeler: null,
    codemirror: null,
    logoutDialog: false,
    checkSave: true,
    checkSaveDiagram: false,
    checkSaveSvg: true,
    checkSaveAs: true,
    checkDeploy:false,
    openDialogErrorServer: false,
    openDialogSave: false,
    openDialogSaveAs: false,
    openDialogSuccess: false,
    openDialogDeploySuccess: false,
    openDialogReading: false,
    openTaskDialog: false,
    openDialogTaskSuccess:false,
    selected: null,
    listDiagram: [],
    logDiagram: [],
    taskList: [],
    groupList: [],
    userList: [],
    activeDiagramName: "",
    objectSave: { filename: "", comment: "" },
    elementSelected: null,
    checkSelected: false,
    checkTable: true,
    checkListGroup: false,
    checkListUser: false,
    checkRiepilogo: false,
    selected: [], //array di TaskList
    selectedGroup: [],
    selectedUser: [],
    objSelectedTask: null,
    objSelectedGroup: null,
    objSelectedUser: null
  }

  checkSession() {

    var mgr = userManager;

    var iframes = document.getElementsByTagName('iframe');
    if (iframes && iframes.length > 0 && iframes[0]) iframes[0].src = iframes[0].src + "?client_id=" + mgr._settings._client_id + "&redirect_uri=" + mgr._settings._redirect_uri;

  }

  onLogoutButtonClick = () => {
    this.setState({ logoutDialog: true })
  }

  logoutFunction() {

    this.props.unSetUser()
    var token = this.props.oidcReducer.user.id_token
    window.removeEventListener('beforeunload', this.handleLeavePage)
    userManager.signoutRedirect({ 'id_token_hint': token });

  }

  componentWillMount() {
    /*loadChannels().then(result => {

    });*/
    this.checkSession();
    window.removeEventListener('beforeunload', this.handleLeavePage)


  }

  componentDidMount() {


    var container = $('#js-drop-zone');

    if (this.props.user.isAdmin || this.props.user.isEditor) {
      
      var bpmnModeler = new CustomModeler({
        container: '#js-canvas',
        propertiesPanel: '#js-properties-panel',
            additionalModules: [
              minimapModule
            ] 
      })

    document.getElementsByClassName('djs-minimap')[0].style.right='300px';

      /*  const minimap = bpmnModeler.get('minimap');
       console.log(minimap) */


      bpmnModeler.on('commandStack.changed', this.exportArtifacts);


    }
    else if (this.props.user.isReader) {

  

      var bpmnModeler = new Viewer({
        container: '#js-canvas',
        additionalModules: [
          minimapModule
        ] 
      });
      $('#note').html("<button id='js-open-diagram'>Open BPMN diagram from git</button>");
      $('#js-open-diagram').click((e) => {
        e.stopPropagation(); e.preventDefault(); this.getListDiagram();
      });

    }
    else {
      var bpmnModeler = new Viewer({
        container: '#js-canvas',
        additionalModules: [
          minimapModule
        ] 
      });
      $('#note').html("<button id='js-open-diagram'>Open BPMN diagram from git</button>");
      $('#js-open-diagram').click((e) => {
        e.stopPropagation(); e.preventDefault(); this.getListDiagram();
      });
    }

    container.removeClass('with-diagram');
    $('.tablinks')[0].click();

    downloadLink.addClass('active');
    downloadSvgLink.addClass('active');

    var codemirror = this.intanceCodeMirror()
    codemirror.on('change', (cMirror) => {
      // get value right from instance

      if (document.activeElement.localName == "textarea") {
        this.openDiagram(cMirror.getValue())
      }

      this.saveSVG(function (err, svg) {
      })

    })

    this.setState({ container: container, bpmnModeler: bpmnModeler, codemirror: codemirror })



    window.addEventListener('beforeunload', this.handleLeavePage);


  }

  handleLeavePage(e) {
    const confirmationMessage = 'Dialog text here';
    e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
    return confirmationMessage;              // Gecko, WebKit, Chrome <34
  }

  exportArtifacts = debounce(() => {

    this.saveSVG((err, svg) => {
      this.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });


    this.saveDiagram((err, xml) => {
      this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });

  }, 500);

  saveSVG(done) {
    this.state.bpmnModeler.saveSVG(done);
  }

  saveDiagram(done) {

  this.state.bpmnModeler.saveXML({ format: true }, (err, xml) => {

    this.state.codemirror.setValue(xml);
    this.state.codemirror.refresh();
    done(err, xml);
  });
  } 

  


  setEncoded(link, name, data) {

    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }



  intanceCodeMirror() {

    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("xmlviewer"), {
      value: '',
      autoCloseTags: true,
      dragDrop: true,
      allowDropFileTypes: ['text/plain'],
      lineWrapping: true,
      lineNumbers: true,
      readOnly: this.props.user.isReader,
      mode: {
        name: 'application/xml',
        htmlMode: false
      }

    });
    myCodeMirror.setSize("100%", "100%")
    return myCodeMirror
  }


  openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }


  createNewDiagram() {

    this.state.codemirror.setValue(diagramXML);
    this.state.codemirror.refresh();
    this.openDiagram(diagramXML);
  }

  openDiagram(xml) {


    this.state.bpmnModeler.importXML(xml, (err) => {
      if (err) {
        console.log(err)
        this.state.container
          .removeClass('with-diagram')
          .addClass('with-error');

        //this.state.container.find('.error pre').text(err.message);
        document.getElementById("errorText").value = err.message
        //document.getElementById("js-download-diagram").style.display="none";
        //document.getElementById("js-download-svg").style.display = "none";
        this.setState({ checkSaveSvg: true, checkSave: true, checkSaveAs: true })

      } else {

        this.state.container
          .removeClass('with-error')
          .addClass('with-diagram');
        //this.state.bpmnModeler.get('minimap').open();
        document.getElementById("buttonXML").style.visibility = "visible";
        //document.getElementById("footer").style.visibility="visible";
        //document.getElementById("footer-hidden").style.visibility="visible";
        document.getElementById("js-download-svg").style.display = "unset";
        //this.setState({checkSave:false,checkSaveSvg:false})
        this.setState({ checkSaveSvg: false, checkSaveAs: false })
      }

    });

}



  clickOnTablinks(e) {

    this.openTab(e, e.target.innerHTML);

    if (e.target.innerHTML == "XML")
      this.state.codemirror.refresh();

  }


  async clickEncoded(data) {

    var file = this.state.objectSave.filename
    var comment = this.state.objectSave.comment

    var bytes = utf8.encode(data)
    var encodedData = base64.encode(bytes)

    var Name = this.props.oidcReducer.user.profile.given_name
    var LastName = this.props.oidcReducer.user.profile.family_name
    var email = this.props.oidcReducer.user.profile.email

    console.log(this.props.oidcReducer)
    var body = { filename: file, authorName: Name + " " + LastName, authorEmail: email, base64EncodedFile: encodedData, saveComment: comment }

    await ApiService.saveFile(body).then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {

        this.setState({ openDialogSave: false, openDialogSaveAs: false, checkSave: false, activeDiagramName: file, objectSave: { filename: file, comment: "" }, checkSaveDiagram: false, openDialogSuccess: true })
        return responseJson.status

      }
      else {
        var newObj = { ...this.state.objectSave }
        newObj.comment = "";
        this.setState({ objectSave: newObj, openDialogSave: false, openDialogSaveAs: false, checkSaveDiagram: false, openDialogErrorServer: true })
      }
    }
      , error => {
        console.log(error)
        var newObj = { ...this.state.objectSave }
        newObj.comment = "";
        this.setState({ objectSave: newObj, openDialogSave: false, openDialogSaveAs: false, checkSaveDiagram: false, openDialogErrorServer: true })
      }).catch(err => {
        console.log(err)
        var newObj = { ...this.state.objectSave }
        newObj.comment = "";
        this.setState({ objectSave: newObj, openDialogSave: false, openDialogSaveAs: false, checkSaveDiagram: false, openDialogErrorServer: true })
        return false
      }
      )


  }


  async getListDiagram() {

    await ApiService.listDiagram().then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {


        this.setState({ listDiagram: responseJson.data, checkTable: true, openDialogReading: true })
        return responseJson.data

      }
      else
        this.setState({ openDialogErrorServer: true })
    }
      , error => {
        console.log(error)
        this.setState({ openDialogErrorServer: true })

      }).catch(err => {
        console.log(err)
        this.setState({ openDialogErrorServer: true })
        return false
      }
      );

  }


  async selectDiagram(filename) {


    await ApiService.encodedFile(filename).then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {

        var encodedData = responseJson.data.base64EncodedFile
        var bytes = base64.decode(encodedData);
        var diagram = utf8.decode(bytes);

        var codM = this.state.codemirror
        codM.setValue(diagram);
        codM.refresh()


        this.openDiagram(diagram)
        this.setState({ openDialogReading: false, activeDiagramName: filename, objectSave: { filename: filename, comment: "" }, checkSave: false, checkSaveAs: false, codemirror: codM })
        return diagram

      }
      else
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })
    }
      , error => {
        console.log(error)
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })
      }).catch(err => {
        console.log(err)
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })
        return false
      }
      )
  }


  async selectVersion(commitSha, file) {

    var Name = this.props.oidcReducer.user.profile.given_name
    var LastName = this.props.oidcReducer.user.profile.family_name
    var email = this.props.oidcReducer.user.profile.email
    var message = "Revert di versione: " + commitSha

    var body = { commitSha: commitSha, filename: file, author: Name + " " + LastName, email: email, message: message }


    await ApiService.checkoutFile(body).then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {

        this.selectDiagram(file)

      }
      else
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })
    }
      , error => {
        console.log(error)
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })

      }).catch(err => {
        console.log(err)
        this.setState({ openDialogReading: false, activeDiagramName: "", openDialogErrorServer: true })
        return false
      }
      )

  }



  async viewLogDiagram(filename) {

    await ApiService.logDiagram(filename).then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {

        var arrayLog = responseJson.data
        this.setState({ checkTable: false, checkStorico: true, logDiagram: arrayLog })
        return arrayLog

      }
      else
        this.setState({ openDialogReading: false, activeDiagramName: "", logDiagram: [], openDialogErrorServer: true })
    }
      , error => {
        console.log(error)
        this.setState({ openDialogReading: false, activeDiagramName: "", logDiagram: [], openDialogErrorServer: true })
      }).catch(err => {
        console.log(err)
        this.setState({ openDialogReading: false, activeDiagramName: "", logDiagram: [], openDialogErrorServer: true })
        return false
      }
      )

  }



  async deployDiagram(data) {

    var diagramName = 'diagram.bpmn'

    var bytes = utf8.encode(data)
    var encodedData = base64.encode(bytes)


    var body = { diagramName: diagramName, base64EncodedDiagram: encodedData }

    await ApiService.deployFile(body).then(responseJson => {

      if (responseJson.status == 202 || responseJson.status == 200) {

        this.setState({ openDialogDeploySuccess: true,checkDeploy:false })
        return responseJson.status

      }
      else {

        this.setState({ openDialogErrorServer: true,checkDeploy:false })
      }
    }
      , error => {
        console.log(error)
        this.setState({ openDialogErrorServer: true,checkDeploy:false })

      }).catch(err => {
        console.log(err)
        this.setState({ openDialogErrorServer: true,checkDeploy:false })
        return false
      }
      )

  }


  async goMonitoringApp() {
   
    var obj = {  
      method: 'GET',
      headers: {
        'x-auth-token': this.props.oidcReducer.user.id_token,
        'Authorization': 'Bearer '+this.props.oidcReducer.user.access_token
      }
    }

    var response = await fetch(window.ENV.REACT_APP_SIMPLE_MONITOR + "/rest/views/workflows/",obj).then(response => { return response }).catch(error => { console.log(error); return 500 })
    if (response != 500)
      window.location.href = window.ENV.REACT_APP_DOMAIN_FE + "/monitoring"
    else
      this.setState({ openDialogErrorServer: true })

  }



  /*FUNZIONALITA' COLORI DIAGRAMMA*/
  _onSelect(option) {

    var selectedElements = this.state.bpmnModeler.get('selection')

    if (selectedElements._selectedElements.length > 0) {
      var element = option.value
      var color = {}

      for (let i = 0; i < COLORS.length; i++) {
        if (COLORS[i].value == element) {
          color.stroke = COLORS[i].stroke
          color.fill = COLORS[i].fill
        }
      }

      const modeling = this.state.bpmnModeler.get('modeling');
      modeling.setColor(selectedElements._selectedElements, {
        stroke: color.stroke,
        fill: color.fill
      });

    }

  }

  async getListTask() {

    var token = this.props.oidcReducer.user.id_token

    /* var response = await fetch(window.ENV.REACT_APP_SERVER_BACKEND + "/tasklist")
      .then(response => response.json())
      .then(res => {
        console.log(res)
        return res
      })
      .catch(error => { console.log(error); return 500 })

    console.log("response " + response.status);
    if (response.status == 200 && response.data.length > 0) {
      this.setState({ openTaskDialog: true, taskList: response.data })
    }
    else if (response == 500)
      this.setState({ openDialogErrorServer: true })
    else
      this.setState({ openDialogErrorServer: true }) */



      var response = await fetch(window.ENV.REACT_APP_TASK_API+"/api/tasks/groups/list",{
          method:'GET',
         headers:{
    "x-auth-token":token}
        }).then(response=>{return response.text()}).catch(error=>{console.log(error);return 500})
		
		var risposta=JSON.parse(response)

          if(risposta.length>0)
            {
              this.setState({openTaskDialog: true,taskList:risposta}) 
            }
          else if(risposta==500)
         this.setState({openDialogErrorServer: true}) 
         else
         this.setState({openDialogErrorServer: true}) 
     

  }

  async getListGroup() {


    var token = this.props.oidcReducer.user.id_token

    /* var response = await fetch(window.ENV.REACT_APP_SERVER_BACKEND + "/grouplist")
      .then(response => response.json())
      .then(res => {
        console.log(res)
        return res
      })
      .catch(error => { console.log(error); return 500 })

    console.log("response " + response.status);
    if (response.status == 200 && response.data.length > 0) {
      this.setState({ checkListGroup: true, groupList: response.data })
    }
    else if (response == 500)
    this.setState({ openTaskDialog: false, openDialogErrorServer: true})
    else
    this.setState({ openTaskDialog: false, openDialogErrorServer: true}) */


     var response = await fetch(window.ENV.REACT_APP_TASK_API+"/api/ljsa/groups",{
          method:'GET',
         headers:{
    "x-auth-token":token}
        }).then(response=>{return response.text()}).catch(error=>{console.log(error);return 500})
      
	    var risposta=JSON.parse(response)
	  
          if(risposta.length>0)
            {
               this.setState({ checkListGroup: true, groupList: risposta }) 
            }
          else if(risposta==500)
         this.setState({ openTaskDialog: false, openDialogErrorServer: true})
         else
         this.setState({ openTaskDialog: false, openDialogErrorServer: true}) 
     

  }

  async getListUserByGroup() {

    var token = this.props.oidcReducer.user.id_token

    /* var response = await fetch(window.ENV.REACT_APP_SERVER_BACKEND + "/userlist", {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.state.objSelectedGroup.wso2name }),
    })
      .then(response => response.json())
      .then(res => {
        console.log(res)
        return res
      })
      .catch(error => { console.log(error); return 500 })

    console.log("response " + response.status);
    if (response.status == 200 && response.data.length > 0) {
      this.setState({ checkListGroup: false, checkListUser: true, userList: response.data })
    }
    else if (response == 500)
    this.setState({ openTaskDialog: false, openDialogErrorServer: true})
    else
    this.setState({ openTaskDialog: false, openDialogErrorServer: true}) */


    var response = await fetch(window.ENV.REACT_APP_TASK_API+"/api/ljsa/groups/"+this.state.objSelectedGroup.wso2name+"/users",{
      method:'GET',
     headers:{
"x-auth-token":token}
    }).then(response=>{return response.text()}).catch(error=>{console.log(error);return 500})
  var risposta=JSON.parse(response)
      if(risposta.length>0)
        {
           this.setState({ checkListGroup: false, checkListUser: true, userList: risposta })
        }
      else if(risposta==500)
     this.setState({ openTaskDialog: false, openDialogErrorServer: true})
     else
     this.setState({ openTaskDialog: false, openDialogErrorServer: true})
 
  }

  async assignTask() {

    var token = this.props.oidcReducer.user.id_token
    
    /* var response = await fetch(window.ENV.REACT_APP_SERVER_BACKEND + "/assigntask", {
      method: 'put',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: this.state.objSelectedTask.key, username: this.state.objSelectedUser, group: this.state.objSelectedGroup.wso2name }),
    })
      .then(response => response.json())
      .then(res => {
        console.log(res)
        return res
      })
      .catch(error => { console.log(error); return 500 })

    console.log("response " + response.status);
    if (response.status == 200) {
      this.setState({  openTaskDialog: false,openDialogTaskSuccess:true})
      
    }
    else if (response == 500)
      this.setState({ openTaskDialog: false, openDialogErrorServer: true})
    else
      this.setState({ openTaskDialog: false, openDialogErrorServer: true}) */

      var response = await fetch(window.ENV.REACT_APP_TASK_API+"/api/ljsa/"+this.state.objSelectedTask.key+"/changeclaim",{
      method:'PUT',
     headers:{
"Content-Type": "application/json",
"x-auth-token":token},
 body: JSON.stringify({ key: this.state.objSelectedTask.key, username: this.state.objSelectedUser, group: this.state.objSelectedGroup.wso2name })
    }).then(response=>{return response}).catch(error=>{console.log(error);return 500})
      if(response.status==200)
        {
           this.setState({  openTaskDialog: false,openDialogSuccess:true})
        }
      else if(response==500)
     this.setState({ openTaskDialog: false, openDialogErrorServer: true})
     else
     this.setState({ openTaskDialog: false, openDialogErrorServer: true})
 
  }

  handleFiles = (files) => {

    var file = files.fileList[0].name
    var n = files.base64.lastIndexOf('base64,');
    var result = files.base64.substring(n + 7);
    var bytes = base64.decode(result);
    var diagram = utf8.decode(bytes);

    var codM = this.state.codemirror
    codM.setValue(diagram);
    codM.refresh()

    this.setState({codemirror:codM,checkSave:true,objectSave: { filename: file, comment: "" }})
    this.openDiagram(diagram);

  }
  
  render() {

 /*    $('#create-new-diagram').click((e) => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({ checkSaveAs: false, checkSave: true, objectSave: { filename: "", comment: "" } })
      this.createNewDiagram();
    }); */

    var xmlDone = (err, xml) => {
      this.clickEncoded(err ? null : xml);
      this.openDiagram(xml)
      $('.tablinks')[0].click();
    };

    var deployDone = (err, xml) => {
      this.deployDiagram(err ? null : xml)

    }

    /*
    $("#openFileFromFS").click(() => {
      $("input[id='my_file']").click();
  }); 
  */
  
  /*
  $("#my_file").on('change',(e) =>{
   
    this.openFileFromInput(e);
  });
  */

    /*    $('#js-download-diagram').click((e) => {
         e.preventDefault()
         this.saveDiagram(xmlDone); 
       });   */


    var svgDone = (err, svg) => {
      this.setEncoded($('#js-download-svg'), 'diagram.svg', err ? null : svg);
    };

    $('#js-download-svg').click((e) => {
      $('.tablinks')[0].click();
      this.saveSVG(svgDone);
    });

    $('#logout').click((e) => {
      this.onLogoutButtonClick()
    });

/*  $('body').click((e) => {
      if(e.target.id=="camunda-taskSelectType"){

        var selectedElement= this.state.bpmnModeler.get('selection').get();
        var modeling = this.state.bpmnModeler.get('modeling');

      const bo = selectedElement[0].businessObject

      // CREATE extensionElements
      let extensionElements = bo.extensionElements

      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, this.state.bpmnModeler.get('bpmnFactory'));
        modeling.updateProperties(selectedElement[0],{ extensionElements: extensionElements });
      }
      // create taskDefinition
      let taskDefinition = getTaskDefinition(selectedElement[0]);

      if (!taskDefinition) {
        taskDefinition = elementHelper.createElement('zeebe:TaskDefinition', { }, extensionElements, this.state.bpmnModeler.get('bpmnFactory'));
        extensionElements.values=taskDefinition
      }
      
      taskDefinition["type"]='fff'
      var arrayValues=[]
      arrayValues.push(taskDefinition)
      extensionElements.values=arrayValues
      modeling.updateProperties(selectedElement[0],selectedElement[0]);
    

    }}); 

    function getTaskDefinition(element) {
      const bo = element.businessObject;
      return (getElements(bo, 'zeebe:TaskDefinition') || [])[0];
    }

    function getElements(bo, type, prop) {
      const elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
      return !prop ? elems : (elems[0] || {})[prop] || [];
    } */


    const handleClickTask = (event, key) => {
      console.log(key)
      var arrayTasklist = this.state.taskList
      console.log(key, arrayTasklist)
      let newSelected = [];

      newSelected.push(key)

      for (let i = 0; i < arrayTasklist.length; i++) {
        if (arrayTasklist[i].key == key) {
          this.setState({ objSelectedTask: arrayTasklist[i] })
        }
      }

      this.setState({ selected: newSelected })
      console.log(this.state.objSelectedTask)

    };

    const handleClickGroup = (event, id) => {
      console.log(id)
      var arrayGrouplist = this.state.groupList
      console.log(id, arrayGrouplist)
      let newSelected = [];

      newSelected.push(id)

      for (let i = 0; i < arrayGrouplist.length; i++) {
        if (arrayGrouplist[i].id == id) {
          this.setState({ objSelectedGroup: arrayGrouplist[i] })
        }
      }

      this.setState({ selectedGroup: newSelected })
      console.log(this.state.objSelectedGroup)

    };

    const handleClickUser = (event, username) => {
      console.log(username)
      var arrayUserlist = this.state.userList
      console.log(username, arrayUserlist)
      let newSelected = [];

      newSelected.push(username)

      for (let i = 0; i < arrayUserlist.length; i++) {
        if (arrayUserlist[i] == username) {
          this.setState({ objSelectedUser: arrayUserlist[i] })
        }
      }

      this.setState({ selectedUser: newSelected })
      console.log(this.state.objSelectedUser)

    };

    const isSelected = key => this.state.selected.indexOf(key) !== -1;

    const isGSelected = id => this.state.selectedGroup.indexOf(id) !== -1;

    const isUSelected = username => this.state.selectedUser.indexOf(username) !== -1;


    return (
      <body>

        <Dialog
          open={this.state.logoutDialog}
          onClose={() => this.setState({ logoutDialog: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog"> ZEEBE MANAGER LOGOUT</h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <p style={{ textAlign: "center" }}><strong>Sei sicuro di effettuare il logout?</strong></p>
              <div style={{ textAlign: "center" }}>
                <Button className="buttonStyle" onClick={() => this.setState({ logoutDialog: false })} variant="contained" style={{ float: "left" }}>
                  NO
          </Button>
                <Button className="buttonStyle" onClick={() => this.logoutFunction()} variant="contained" color="primary" autoFocus style={{ float: "right" }}>
                  SI
          </Button>
              </div>
            </DialogContentText>
          </DialogContent>
        </Dialog>

        <Dialog
          open={this.state.openDialogSuccess}
          onClose={() => this.setState({ openDialogSuccess: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog"></h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <p style={{ textAlign: "center" }}><strong>Salvataggio effettuato con successo.</strong></p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" onClick={() => this.setState({ openDialogSuccess: false })} variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openDialogDeploySuccess}
          onClose={() => this.setState({ openDialogDeploySuccess: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog"></h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <p style={{ textAlign: "center" }}><strong>Deploy effettuato con successo.</strong></p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" onClick={() => this.setState({ openDialogDeploySuccess: false })} variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.openDialogTaskSuccess}
          onClose={() => this.setState({ openDialogTaskSuccess: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog"></h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <p style={{ textAlign: "center" }}><strong>Assegnazione effettuato con successo.</strong></p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" onClick={() => this.setState({ openDialogTaskSuccess: false })} variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>

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
          open={this.state.openDialogSave}
          onClose={() => {
            if(!this.state.checkSaveDiagram){
            var newObj = { ...this.state.objectSave }
            newObj.comment = "";
            this.setState({ openDialogSave: false, objectSave: newObj })
            }
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">SALVATAGGIO</h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <Grid container spacing={24} >

                <Grid item xs={12} >
                  <TextField
                    error={this.state.objectSave.filename == "" ? true : false}
                    id="standard-password-input"
                    label="Nome file"
                    required
                    value={
                      this.state.objectSave.filename
                    }
                    disabled
                    onChange={e => {
                      let ObjCopy = Object.assign({}, this.state.objectSave)
                      ObjCopy.filename =
                        e.target.value
                      this.setState({ ObjCopy })
                      this.state.objectSave.filename = e.target.value

                    }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} >
                  <TextField
                    error={this.state.objectSave.comment == "" ? true : false}
                    id="outlined-multiline-static"
                    label="Commento"
                    multiline={true}
                    rowsMax="4"
                    value={
                      this.state.objectSave.comment
                    }
                    onChange={e => {
                      let ObjCopy = Object.assign({}, this.state.objectSave)
                      ObjCopy.comment =
                        e.target.value
                      this.setState({ ObjCopy })
                      this.state.objectSave.comment = e.target.value

                    }}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" disabled={this.state.objectSave.filename == "" || this.state.objectSave.comment == "" ? true : false || this.state.checkSaveDiagram} onClick={() => { this.setState({ checkSaveDiagram: true }); this.saveDiagram(xmlDone) }} variant="contained">
              {this.state.checkSaveDiagram ? <CircularProgress size={20} className='colorSecondary' /> : <SaveIcon fontSize="small" />}
              Salva
          </Button>
            <Button className="buttonStyle" onClick={() => {
              if(!this.state.checkSaveDiagram){
              var newObj = { ...this.state.objectSave }
              newObj.comment = "";
              this.setState({ openDialogSave: false, objectSave: newObj })
              }
            }} variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>


        <Dialog
          open={this.state.openDialogSaveAs}
          onClose={() => {
            if(!this.state.checkSaveDiagram)
            var newObj = { ...this.state.objectSave }
            newObj.comment = "";
            this.setState({ openDialogSaveAs: false, objectSave: newObj })
          }
          }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">SALVATAGGIO</h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <Grid container spacing={24} >

                <Grid item xs={12} >
                  <TextField
                    error={this.state.objectSave.filename == "" ? true : false}
                    id="standard-password-input"
                    label="Nome file"
                    required
                    value={
                      this.state.objectSave.filename
                    }
                    onChange={e => {
                      let ObjCopy = Object.assign({}, this.state.objectSave)
                      ObjCopy.filename =
                        e.target.value
                      this.setState({ ObjCopy })
                      this.state.objectSave.filename = e.target.value

                    }}
                    fullWidth
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} >
                  <TextField
                    error={this.state.objectSave.comment == "" ? true : false}
                    id="outlined-multiline-static"
                    label="Commento"
                    multiline={true}
                    rowsMax="4"
                    value={
                      this.state.objectSave.comment
                    }
                    onChange={e => {
                      let ObjCopy = Object.assign({}, this.state.objectSave)
                      ObjCopy.comment =
                        e.target.value
                      this.setState({ ObjCopy })
                      this.state.objectSave.comment = e.target.value

                    }}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" disabled={this.state.objectSave.filename == "" || this.state.objectSave.comment == "" ? true : false || this.state.checkSaveDiagram} onClick={() => { this.setState({ checkSaveDiagram: true }); this.saveDiagram(xmlDone) }} variant="contained">
              {this.state.checkSaveDiagram ? <CircularProgress size={20} className='colorSecondary' /> : <SaveIcon fontSize="small" />}
              Salva
          </Button>
            <Button className="buttonStyle" onClick={() => {
              if(!this.state.checkSaveDiagram){
              var newObj = { ...this.state.objectSave }
              newObj.comment = "";
              this.setState({ openDialogSaveAs: false, objectSave: newObj })
            }
            }
            } variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>


        <Dialog
          open={this.state.openDialogReading}
          onClose={() => this.setState({ openDialogReading: false })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><h2 className="titleTextDialog">SELEZIONA DIAGRAMMA</h2></DialogTitle>
          <DialogContent>
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <Grid container spacing={24}>

                <Paper >
                  {this.state.checkTable &&
                    <Table >
                      <TableHead>
                        <TableRow>
                          <TableCell className="tableStyle">Nome file</TableCell>
                          <TableCell className="tableStyle">Ultima versione</TableCell>
                          <TableCell className="tableStyle">Visualizza storico</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.listDiagram.map(row => (
                          <TableRow key={row.filename}>
                            <TableCell className="tableStyle" component="th" scope="row">
                              {row.filename}
                            </TableCell>
                            <TableCell className="tableStyle"><IconButton onClick={() => this.selectDiagram(row.filename)} ><OpenDiagramIcon fontSize="small" /></IconButton></TableCell>
                            <TableCell className="tableStyle"><IconButton onClick={() => this.viewLogDiagram(row.filename)} ><HistoryIcon fontSize="small" /></IconButton></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  }
                  {!this.state.checkTable &&
                    <Table >
                      <TableHead>
                        <TableRow>
                          <TableCell className="tableStyle">Commento versione</TableCell>
                          <TableCell className="tableStyle">Modificato da</TableCell>
                          <TableCell className="tableStyle">Email</TableCell>
                          {this.props.user.isReader ? null : <TableCell className="tableStyle">Seleziona versione</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.logDiagram.map(row => (
                          <TableRow key={row.comment}>
                            <TableCell className="tableStyle" component="th" scope="row">
                              {row.comment}
                            </TableCell>
                            <TableCell className="tableStyle" component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell className="tableStyle" component="th" scope="row">
                              {row.email}
                            </TableCell>
                            {this.props.user.isReader ? null : <TableCell className="tableStyle"><IconButton onClick={() => this.selectVersion(row.commitSha, row.fileName)} ><OpenDiagramIcon fontSize="small" /></IconButton></TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  }
                </Paper>
              </Grid>

            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="buttonStyle" style={{ display: this.state.checkTable ? "none" : "initial" }} onClick={() => this.setState({ checkTable: true })} variant="contained">
              Indietro
          </Button>
            <Button className="buttonStyle" onClick={() => this.setState({ openDialogReading: false })} variant="contained">
              Chiudi
          </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          id="taskDialog"
          open={this.state.openTaskDialog}
          onClose={() => this.setState({ openTaskDialog: false, checkListGroup: false, checkListUser: false, checkRiepilogo: false, objSelectedGroup: null, objSelectedTask: null, selected: [], selectedGroup: [] })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
                maxHeight: 'none',
            }
          }}
          maxWidth="lg"
        >
          <DialogTitle className="styleDialogTitle" id="alert-dialog-title"><CloseIcon style={{ cursor: "pointer", color: "white", float: "left" }} onClick={() => { this.setState({ openTaskDialog: false, checkListGroup: false, checkListUser: false, checkRiepilogo: false, objSelectedGroup: null, objSelectedTask: null, selected: [], selectedGroup: [] }) }} /><h2 className="titleTextDialog">ASSEGNA TASK</h2></DialogTitle>
          <DialogContent >
            <DialogContentText className="styleDialogText" id="alert-dialog-description">
              <Grid justify='center' container spacing={24}>

                <Paper>
                  {this.state.checkListGroup == false && this.state.checkListUser == false && this.state.checkRiepilogo == false ?

                    (<Table style={{tableLayout:"fixed"}}>
                      <TableHead>
                        <TableRow>
                          <TableCell className="tableStyle">Select Task</TableCell>
                          <TableCell className="tableStyle">Payload</TableCell>
                          <TableCell className="tableStyle">Name</TableCell>
                          <TableCell className="tableStyle">Assignee</TableCell>
                          <TableCell className="tableStyle">Candidate Group</TableCell>
                          <TableCell className="tableStyle">Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.taskList.map(row => {

                          const isItemSelected = isSelected(row.key)

                          return (


                            <TableRow onClick={event => handleClickTask(event, row.key)}
                              role="checkbox"
                              aria-checked={isItemSelected} selected={isItemSelected} key={row.key}>
                              <TableCell className="tableStyle" component="th" scope="row">
                                <Checkbox checked={isItemSelected} />
                              </TableCell>
                              <TableCell style={{whiteSpace:"nowrap",overflow:"hidden"}} className="tableStyle">
                                {row.payload.length>30?
                                 <Tooltip style={{maxWidth:"none"}} title={row.payload} placement="bottom-start"><span>{row.payload}</span></Tooltip>
                                 :
                                 row.payload
                                }
                              </TableCell>
                              <TableCell className="tableStyle">{row.name}</TableCell>
                              <TableCell className="tableStyle">{row.assignee==null?"not assigned":row.assignee}</TableCell>
                              <TableCell className="tableStyle">{row.candidateGroup==null?"not assigned":row.candidateGroup}</TableCell>
                              <TableCell className="tableStyle">{new Date(row.timestamp).toISOString()}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>)
                    :
                    this.state.checkListGroup == true ?
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell className="tableStyle">Select Group</TableCell>
                            <TableCell className="tableStyle">Name</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.groupList.map(row => {

                            const isGroupSelected = isGSelected(row.id)

                            return (


                              <TableRow onClick={event => handleClickGroup(event, row.id)}
                                role="checkbox"
                                aria-checked={isGroupSelected} selected={isGroupSelected} key={row.id}>
                                <TableCell className="tableStyle" component="th" scope="row">
                                  <Checkbox checked={isGroupSelected} />
                                </TableCell>
                                <TableCell className="tableStyle">{row.name}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                      :
                      this.state.checkRiepilogo ?
                        <div>
                          <Card>
                            <CardHeader
                              className="cardHeaderStyle"
                              title="Task details" />
                            <CardContent className="cardContentStyle">
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell className="tableStyle">Payload</TableCell>
                                    <TableCell className="tableStyle">Name</TableCell>
                                    <TableCell className="tableStyle">Assignee</TableCell>
                                    <TableCell className="tableStyle">Candidate Group</TableCell>
                                    <TableCell className="tableStyle">Date</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow key={this.state.objSelectedTask.key}>
                                     <TableCell style={{whiteSpace:"nowrap",overflow:"hidden"}} className="tableStyle">
                                {this.state.objSelectedTask.payload.length>30?
                                 <Tooltip style={{maxWidth:"none"}} title={this.state.objSelectedTask.payload} placement="bottom-start"><span>{this.state.objSelectedTask.payload}</span></Tooltip>
                                 :
                                 this.state.objSelectedTask.payload
                                }
                                </TableCell>
                                    <TableCell className="tableStyle">{this.state.objSelectedTask.name}</TableCell>
                                    <TableCell className="tableStyle">{this.state.objSelectedTask.assignee==null?"not assigned":this.state.objSelectedTask.assignee}</TableCell>
                                    <TableCell className="tableStyle">{this.state.objSelectedTask.candidateGroup==null?"not assigned":this.state.objSelectedTask.candidateGroup}</TableCell>
                                    <TableCell className="tableStyle">{new Date(this.state.objSelectedTask.timestamp).toISOString()}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          <Divider className="dividerStyle" />

                          <Card>
                            <CardHeader
                              className="cardHeaderStyle"
                              title="Group and User details" />
                            <CardContent className="cardContentStyle">
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell className="tableStyle">Group name</TableCell>
                                    <TableCell className="tableStyle">Username</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow key={this.state.objSelectedGroup.id}>
                                    <TableCell className="tableStyle">{this.state.objSelectedGroup.name}</TableCell>
                                    <TableCell className="tableStyle">{this.state.objSelectedUser}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                        </div>

                        :
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell className="tableStyle">Select User</TableCell>
                              <TableCell className="tableStyle">Username</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.userList.map(row => {

                              console.log(row)
                              const isUserSelected = isUSelected(row)

                              return (


                                <TableRow onClick={event => handleClickUser(event, row)}
                                  role="checkbox"
                                  aria-checked={isUserSelected} selected={isUserSelected} key={row}>
                                  <TableCell className="tableStyle" component="th" scope="row">
                                    <Checkbox checked={isUserSelected} />
                                  </TableCell>
                                  <TableCell className="tableStyle">{row}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>

                  }
                </Paper>

              </Grid>

            </DialogContentText>
          </DialogContent>
          <Divider />
          <DialogActions>
            {this.state.checkListGroup == true && this.state.checkListUser == false ?
              <Button className="buttonStyle" onClick={() => this.setState({ checkListGroup: false, objSelectedGroup: null, selectedGroup: [] })} variant="contained">
                Indietro
          </Button>
              :
              this.state.checkListUser == true && this.state.checkRiepilogo == false ?
                <Button className="buttonStyle" onClick={() => this.setState({ checkListUser: false, checkListGroup: true, objSelectedUser: null, selectedUser: [] })} variant="contained">
                  Indietro
          </Button>
                :
                this.state.checkRiepilogo == true ?
                  <Button className="buttonStyle" onClick={() => this.setState({ checkListGroup: false, checkListUser: true, checkRiepilogo: false })} variant="contained">
                    Indietro
      </Button>
                  : null
            }
            {this.state.checkListGroup == false && this.state.checkListUser == false && this.state.checkRiepilogo == false ? (
              <Button style={{ float: "left" }} disabled={this.state.selected.length == 0 ? true : false} className="buttonStyle" onClick={() => this.getListGroup()} variant="contained">
                Vai alla scelta del gruppo
          </Button>) :
              this.state.checkListUser ?
                <Button disabled={this.state.selectedUser.length == 0 ? true : false} className="buttonStyle" onClick={() => this.setState({ checkListUser: false, checkRiepilogo: true })} variant="contained">
                  Vai al riepilogo
       </Button>
                :
                this.state.checkRiepilogo ?
                  <Button className="buttonStyle" color="primary" onClick={() => this.assignTask()} variant="contained">
                    Conferma
         </Button>
                  :
                  <Button disabled={this.state.selectedGroup.length == 0 ? true : false} className="buttonStyle" /* style={{ display: this.state.checkTable ? "none" : "initial" }} */ onClick={() => this.getListUserByGroup()} variant="contained">
                    Vai alla scelta dell'utente
       </Button>
            }
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.checkDeploy}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow:"none"
            }
          }} 
        >
          <DialogContent >
            <DialogContentText >
            <CircularProgress color="inherit" />
            </DialogContentText>
          </DialogContent>
        </Dialog>

        <div className="toolbar">

          <IconButton id="create-new-diagram" className="toolbarImage" title="Create new BPMN diagram" onClick={(e) => { e.stopPropagation();
      e.preventDefault(); this.setState({ checkSaveAs: false, checkSave: true, objectSave: { filename: "", comment: "" } }); this.createNewDiagram();}}  style={{ display: this.props.user.isReader ? "none" : "initial" }}>
            <AddIcone fontSize="small" />{''}
          </IconButton>
          <ReactFileReader fileTypes={[".bpmn",".xml"]} base64={true} multipleFiles={false} handleFiles={this.handleFiles}>
          <IconButton id="openFileFromFS" className="toolbarImage" title="open BPMN diagram from local file system">
            <FolderIcon fontSize="small" />{''}
          </IconButton>
         </ReactFileReader>

          <IconButton onClick={() => { this.getListDiagram() }} id="openFile" className="toolbarImage" title="Open BPMN diagram from git">
            <FolderSharedIcon fontSize="small" />{''}
          </IconButton>
          {/*  <input type="file" id="my_file" accept="text/xml, .bpmn" style={{display:"none"}} /> */}

          <span className="separator"></span>

          <IconButton onClick={() => {/*this.saveDiagram(xmlDone)*/this.setState({ openDialogSave: true }) }} disabled={this.state.checkSave} className="toolbarImage" title="Save diagram" style={{ display: this.props.user.isReader ? "none" : "initial" }}>
            <SaveIcon fontSize="small" />{''}
          </IconButton>

          <IconButton onClick={() => { this.setState({ openDialogSaveAs: true }) }} disabled={this.state.checkSaveAs} className="toolbarImage" title="Save diagram as..." style={{ display: this.props.user.isReader ? "none" : "initial" }}>
            <SaveAsIcon fontSize="small" />{''}
          </IconButton>

          <IconButton onClick={() => {this.setState({checkDeploy:true}), this.saveDiagram(deployDone) }} disabled={this.state.checkSaveAs || this.state.checkDeploy} className="toolbarImage" title="Deploy diagram" style={{ display: this.props.user.isReader ? "none" : "initial" }}>
            <PublishIcon fontSize="small" />{''}
          </IconButton>

          <a id="js-download-svg" style={{ pointerEvents: this.state.checkSaveSvg ? "none" : "unset" }}><IconButton disabled={this.state.checkSaveSvg} className="toolbarImage" title="Save as SVG image">
            <ImageIcone fontSize="small" />{''}
          </IconButton></a>

          <span className="separator" style={{ display: this.props.user.isReader ? "none" : "initial" }}></span>

          <IconButton className="toolbarImage" disabled={this.state.checkSaveAs} title="Undo last action" style={{ display: this.props.user.isReader ? "none" : "initial" }} onClick={e => {
            e.preventDefault()
            this.state.bpmnModeler.get('commandStack').undo();
          }}>
            <UndoIcon fontSize="small" />{''}
          </IconButton>

          <IconButton className="toolbarImage" disabled={this.state.checkSaveAs} style={{ display: this.props.user.isReader ? "none" : "initial" }} title="Redo last action" onClick={e => {
            e.preventDefault()
            this.state.bpmnModeler.get('commandStack').redo();
          }}>
            <RedoIcon fontSize="small" />{''}
          </IconButton>

          {!this.props.user.isReader ?
            (<Dropdown disabled={this.state.checkSaveAs} style={{ display: this.props.user.isReader ? "none" : "initial" }} arrowClosed={<IconButton title="Set element color" className="toolbarImage" disabled={this.state.checkSaveAs}><BrushIcon fontSize="small" /></IconButton>}
              arrowOpen={<IconButton title="Set element color" className="toolbarImage" disabled={this.state.checkSaveAs}><BrushIcon fontSize="small" /></IconButton>} options={options} onChange={this._onSelect} controlClassName='colorControl' placeholder="">
            </Dropdown>) : null
          }

          <span className="separator" style={{ display: this.props.user.isReader ? "none" : "initial" }}></span>

          <IconButton className="toolbarImage" disabled={this.state.checkSaveAs} style={{ display: this.props.user.isReader ? "none" : "initial" }} title="Align elements left" onClick={e => {
            e.preventDefault()
            const selection = this.state.bpmnModeler.get('selection').get();
            this.state.bpmnModeler.get('alignElements').trigger(selection, 'left');
          }}>
            <FormatAlignLeft fontSize="small" />{''}
          </IconButton>

          <IconButton className="toolbarImage" disabled={this.state.checkSaveAs} style={{ display: this.props.user.isReader ? "none" : "initial" }} title="Align elements center" onClick={e => {
            e.preventDefault()
            const selection = this.state.bpmnModeler.get('selection').get();
            this.state.bpmnModeler.get('alignElements').trigger(selection, 'center');
          }}>
            <FormatAlignCenter fontSize="small" />{''}
          </IconButton>

          <IconButton className="toolbarImage" disabled={this.state.checkSaveAs} style={{ display: this.props.user.isReader ? "none" : "initial" }} title="Align elements center" onClick={e => {
            e.preventDefault()
            const selection = this.state.bpmnModeler.get('selection').get();
            this.state.bpmnModeler.get('alignElements').trigger(selection, 'right');
          }}>
            <FormatAlignRight fontSize="small" />{''}
          </IconButton>

          <span className="separator"></span>

          {this.props.user.isAdmin &&

            <IconButton className="toolbarImage" title="Assign task " onClick={() => {  this.setState({checkRiepilogo:false, checkListGroup: false, checkListUser: false, objSelectedGroup: null, objSelectedTask: null, selected: [], selectedGroup: [] }), this.getListTask() }}>
              <AssignmentIcon fontSize="small" />{''}
            </IconButton>
          }

          {this.props.user.isAdmin &&

            <IconButton className="toolbarImage" title="Monitoring " onClick={e => {
              e.preventDefault(),
                this.goMonitoringApp()
            }}>
              <MonitorIcon fontSize="small" />{''}
            </IconButton>
          }

          <a id="logout"><IconButton className="toolbarImage" title="Logout">
            <img src={LogoutIcon} width="20" height="20" />{''}
          </IconButton></a>

        </div>

        <div id="Diagram" className="tabcontent">
          <div className="content with-diagram" id="js-drop-zone">
            <div className="message intro">
              <div id="note" className="note">
                <button id="js-open-diagram" onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.getListDiagram();
                }}>Open BPMN diagram from git</button> or <button id="js-create-diagram" onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.setState({ checkSaveAs: false });
                  this.createNewDiagram();
                }}>create a new diagram</button> to get started.
                  </div>
            </div>

            <div className="message error">
              <div className="note">
                <p>Ooops, we could not display the BPMN 2.0 diagram.</p>

                <div className="details">
                  <span>Import Error Details</span>
                  <textarea className="textareaError" id="errorText"></textarea>
                </div>
              </div>
            </div>

            <div className="canvas" id="js-canvas">
            </div>

            <div className="properties-panel-parent showPanel" id="js-properties-panel" style={{ visibility: this.props.user.isReader ? "hidden" : "initial" }}></div>

          </div>
        </div>

        <div id="XML" className="tabcontent">

          <textarea id="xmlviewer">

          </textarea>
        </div>

        <div className="tab">
          <button className="tablinks" onClick={(e) => { e.preventDefault(); this.clickOnTablinks(e) }}>Diagram</button>
          <button id="buttonXML" className="tablinks" onClick={(e) => { e.preventDefault(); this.clickOnTablinks(e) }} style={{ visibility: "hidden" }}>XML</button>

          {/*   <div className="login-container" style={{float:"right"}}>
                <a id="logout" className="tablinks" title="logout" style={{cursor:"pointer",backgroundColor:"#ccc"}}><img src={LogoutIcon} width="20" height="20"/></a>
                </div> */}

        </div>

      </body>

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

  unSetUser,
  setAdmin: (value) => setAdmin(value),
  goMonitoring: () => push('/monitoring'),


}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeView)