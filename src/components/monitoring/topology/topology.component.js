import React, { Component } from 'react';
import '../monitor.style.css';
import withStyles from '@material-ui/core/styles/withStyles'
import * as ApiService from '../../../utilities/api.js'
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
import { Link} from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';



const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%'
/*     backgroundColor: theme.palette.background.paper, */
  }
})

class TopologyView extends Component {

  constructor(props) {
    super(props);
  }

  state = {

    pageJob: 0,
    rowsPerPageJob: 10,
    dataMonitoring: null,
    selectedBroker: null,
    errorText: null,
    openDialogErrorServer: false,
    openDialogMonitoring:false

  }

  async componentDidMount() {

    await this.getMonitoring()

  }


  async getMonitoring(){

    await ApiService.monitoring().then(responseJson=>{

      if (responseJson.status == 200 && responseJson.data.brokers != null) {

        this.setState({ dataMonitoring: responseJson.data, openDialogMonitoring: true, selectedBroker: responseJson.data.brokers[0] })
        return responseJson.data

      }
      else {

        this.setState({ openDialogErrorServer: true })
      }

    }, error => {
      console.log(error)
      this.setState({ openDialogErrorServer: true })

    }).catch(err => {
      console.log(err)
      this.setState({ openDialogErrorServer: true })
      return false
    }
    )

}



  handleChangePage = (event, pageJob) => {
    this.setState({ pageJob });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };


  render() {

    const { classes } = this.props
    const {rowsPerPageJob,pageJob } = this.state

    const handleChange = name => event => {
        var array = this.state.dataMonitoring.brokers
        for (let i = 0; i < array.length; i++) {
          if (array[i].nodeId.toString() == event.target.value)
            this.setState({ selectedBroker: array[i] })
        }
      };

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

<Grid style={{ textAlign: "center" }} item xs={6} sm={3}>
  {this.state.dataMonitoring != null &&
    <TextField
      select
      label="Lista Broker"
      value={this.state.selectedBroker.nodeId}
      onChange={handleChange('broker')}
      SelectProps={{
        native: true,
      }}
      helperText="Seleziona broker da monitorare"
      margin="normal"
      variant="outlined"
    >
      {this.state.dataMonitoring.brokers.map(option => (
        <option value={option.nodeId}>
          {option.nodeId}
        </option>
      ))}
    </TextField>}
</Grid>

<Grid style={{ textAlign: "center" }} item xs={6} sm={3}>
  {this.state.dataMonitoring != null &&
    <TextField
      id="standard-name"
      label="ClusterSize"
      value={this.state.dataMonitoring.clusterSize}
      disabled
      margin="normal"
    />
  }
</Grid>
<Grid style={{ textAlign: "center" }} item xs={6} sm={3}>
  {this.state.dataMonitoring != null &&
    <TextField
      id="standard-name"
      label="PartitionsCount"
      value={this.state.dataMonitoring.partitionsCount}
      disabled
      margin="normal"
    />
  }
</Grid>
<Grid style={{ textAlign: "center" }} item xs={6} sm={3}>
  {this.state.dataMonitoring != null &&
    <TextField
      id="standard-name"
      label="ReplicationFactor"
      value={this.state.dataMonitoring.replicationFactor}
      disabled
      margin="normal"
    />
  }
</Grid>

</Grid>

{this.state.selectedBroker != null &&
<Grid style={{ paddingTop: "4%" }} container spacing={3}>
  <Grid item xs={12} sm={12}>


      <Table id="tableWorkflows">
        <TableHead>
          <TableRow className="tableRow" >
            <TableCell className="tableMonitorList">NodeId</TableCell>
            <TableCell className="tableMonitorList">Address</TableCell>
            <TableCell className="tableMonitorList">Host</TableCell>
            <TableCell className="tableMonitorList">Port</TableCell>
            <TableCell className="tableMonitorList">Partitions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow className="tableRow" key={this.state.selectedBroker.nodeId}>
            <TableCell className="tableStyle" component="th" scope="row">
              {this.state.selectedBroker.nodeId}
            </TableCell>
            <TableCell className="tableStyle">{this.state.selectedBroker.address}</TableCell>
            <TableCell className="tableStyle">{this.state.selectedBroker.host}</TableCell>
            <TableCell className="tableStyle">{this.state.selectedBroker.port}</TableCell>
            <TableCell className="tableStyle">{JSON.stringify(this.state.selectedBroker.partitions)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

  </Grid>
</Grid>}

</div>
    </div>
    )

  }


}

export default (withStyles(styles)(TopologyView))