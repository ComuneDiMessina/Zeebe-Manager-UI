import React from 'react'
import { bindActionCreators } from 'redux'

import { push } from "connected-react-router"
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import withStyles from '@material-ui/core/styles/withStyles'

const styles = theme => ({
    
    root: {
        flexGrow: 1,
      },
      paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }
  })

export class ErrorNotFound extends React.Component {
 
  constructor(props){
    super(props)
  }

  componentDidMount() {
    setTimeout(() => {this.props.goHome()
    }, 5000)
  }

  render() {
    
    const {classes} = this.props

    return (
        <main className="main">
        <Grid container spacing={3}>
        <Grid item xs>
        </Grid>
        <Grid item xs>
        </Grid>
        <Grid item xs>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
        </Grid>
        <Grid item xs={6}>
          <h1 style={{ textAlign: 'center' }}>Siamo spiacenti,ma la pagina richiesta non è stata trovata su questo
            server. </h1>
            <h3 style={{ textAlign: 'center' }}> Verrai automaticamente rediretto sulla Home Page</h3>
        </Grid>
        <Grid item xs>
        </Grid>
      </Grid>
      </main>

    )
  }

}


const mapStateToProps = ({}) => ({})




const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      goHome: () => push('/home'),
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ErrorNotFound))
