import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux'
import { CallbackComponent } from "redux-oidc";
import { push } from "connected-react-router";
import { setAdmin,setReader,setEditor } from '../modules/user'
import userManager from "./userManager";

class CallbackPage extends React.Component {


  checkRole(){
  
    if(this.props.oidcReducer.user.profile.groups!=null){

      var roleArray = this.props.oidcReducer.user.profile.groups
      var checkAdmin = false
      var checkReader = false
      var checkEditor = false

      for(let i=0;i<roleArray.length;i++){
        if(roleArray[i]==window.ENV.REACT_APP_ROLE) {
          checkAdmin = true
        }
        if(roleArray[i]=="viewer") {
          checkReader = true
        }
        if(roleArray[i]=="editor") {
          checkEditor = true
        }
      }

      if(!checkEditor && !checkAdmin && !checkReader)
      {
        checkReader=true
      }

      this.props.setEditor(checkEditor)
      this.props.setAdmin(checkAdmin)  
      this.props.setReader(checkReader)

    }
    else{
      this.props.setAdmin(false)
      this.props.setReader(true)
      this.props.setEditor(false)
    }


  }


  render() {
    // just redirect to '/' in both cases
    return (

      <CallbackComponent
        userManager={userManager}
        successCallback={() =>{
          this.checkRole()
          this.props.goHome()
        }}
        errorCallback={error => {
          console.error(error);
          this.props.goLogin();
        }}
      >
        <div>Redirecting...</div>
      </CallbackComponent>
    );
  }
}




const mapStateToProps = ({ user,oidcReducer}) => ({
  user: {
    username: user.username,
    isAuthed: true,
    authorized: user.authorized,
    token: user.token,
    isAdmin:user.isAdmin,
    isReader:user.isReader,
    isEditor:user.isEditor
  },
  oidcReducer
})

const mapDispatchToProps = dispatch => bindActionCreators({

  setAdmin:(value)=>setAdmin(value),
  setReader:(value)=>setReader(value),
  setEditor:(value)=>setEditor(value),
  goHome: () => push('/home'),
  goLogin:() => push('/')


}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CallbackPage);