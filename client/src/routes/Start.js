import React from "react";
import { Button, Grid, Icon, Paper } from "@material-ui/core"

import PresentToAllIcon from '@material-ui/icons/PresentToAll';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 280,
    },
    formControl1: {
        margin: theme.spacing(1),
        minWidth: 110,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    paper2: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 700,
    },
    paper3: {
        height: 50,
        width: 100,
    },
}));

const Start = (props) => {

    const history = useHistory();
    const classes = useStyles();

    function getview() {
        history.push(`/getview`);
    }

    function getserve() {
        history.push(`/getserve`);
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper2}>
                <Grid container justify="center" spacing={2} key={6000} >
                    <Grid item>
                        <Button fullWidth onClick={() => { getserve() }} >
                            <Paper className={classes.paper3} >
                                <Grid>
                                    Present
                                </Grid>
                                <Grid item xs={12}>
                                    <PresentToAllIcon />
                                </Grid>
                            </Paper>
                        </Button>
                    </Grid>
                    <Grid item >
                        <Button fullwidth onClick={() => { getview() }} >
                            <Paper className={classes.paper3}>
                                <Grid>View
                            </Grid>
                                <Grid>
                                    <VisibilityIcon />
                                </Grid>
                            </Paper>
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    )
}

export default Start