
import { setUser, auth } from '../../modules/user'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React from 'react'
import './login.style.css'
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions';
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import withStyles from '@material-ui/core/styles/withStyles'
import Image from '../../assets/logo.jpg'
import userManager from "../../utilities/userManager";
import { version } from "../../../package.json"

const styles = theme => ({
  card: {
    maxWidth: 416,
    margin:"0 auto"
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    backgroundSize: 'contain'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: "green",
  },
  button: {
    backgroundColor:"green",
    '&:hover':{
      backgroundColor:"#1E8EBC !important"
    }
  }
})

export class LoginView extends React.Component {

  constructor() {

    super()
  }

  state = {};

  onLoginClick(e) {
    e.preventDefault();
   userManager.signinRedirect();

  }

  render() {

    const { classes } = this.props
    const subheader = {version}
    
    return (


      <main className="main">
      <Card className={classes.card}>
      <CardHeader
        avatar={
          <Avatar aria-label="Recipe" className={classes.avatar}>
            ZM
          </Avatar>
        }
/*         action={
          <IconButton aria-label="Settings">
            <MoreVertIcon />
          </IconButton>
        } */
        title="Zeebe Manager"
        subheader={"Currently v" + version}
      />
      <CardMedia
        className={classes.media}
        image= {Image}
        title="Zeebe Logo"
      />
{/*       <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
        </Typography> 
      </CardContent> */}
      <CardActions>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={ (e) => {this.onLoginClick(e)}}>
              Accedi
            </Button>
      </CardActions>
    </Card>
    </main>

    )
  }
}

LoginView.propTypes = {
  classes: PropTypes.object.isRequired
}


const mapStateToProps = ({ user,oidcReducer }) => ({
  username: user.username,
  oidcReducer
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setUser,
      auth,
     goHome: () => push('/home')
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LoginView))
 