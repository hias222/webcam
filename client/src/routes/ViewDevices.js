import React, { useEffect, useState, useRef } from "react";

import io from "socket.io-client";

import Start from './Start'

import { useHistory } from "react-router-dom";
import { Button, Grid } from "@material-ui/core";

import Paper from '@material-ui/core/Paper';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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
    }
}));



const ViewDevices = (props) => {
    const classes = useStyles();

    const [loading, setLoading] = React.useState(true);
    const videodevices = [];
    const audiodevices = [];
    const [rooms, setRooms] = useState([]);
    const history = useHistory();
    const socketRef = useRef();

    // for selects
    const [cameraConfig, setCameraConfig] = React.useState({ 'video': '', "audio": '', "room": '', "resolution": '720' });
    const [viewConfig, setViewConfig] = React.useState('');

    function view() {
        history.push(`/view/${cameraConfig.room}/${cameraConfig.resolution}`);
    }

    const handleChangeResolution = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'resolution': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    const handleViewRoom = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'room': name }
        setCameraConfig(temp)
        setViewConfig(name)
        console.log(temp)
    };

    useEffect(() => {

        socketRef.current = io.connect(process.env.REACT_APP_WSURL, {
            path: "/peerws/socket.io"
        });

        socketRef.current.emit("query rooms");

        socketRef.current.on("all users", () => {
            console.log("receive all users")
        })

        socketRef.current.on("list rooms", rooms => {
            const queryrooms = [];
            console.log("list rooms " + rooms)
            if (rooms) {
                rooms.forEach(function (room, index) {
                    queryrooms.push(room)
                });
            }
            var viewrooms = (queryrooms === undefined) ? ['empty'] : queryrooms;
            setRooms(viewrooms)
        })

        return function cleanup() {
            console.log("cleanup todo ")
        }

    }, []);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper2}>
                <Grid container spacing={2} key={6000} >

                <Start></Start>  

                    <Grid item xs={12}>
                        <Paper className={classes.paper}>View Camera </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="room-native-simple">Camera</InputLabel>

                            <Select enabled={loading}
                                labelId="room-native-simple"
                                id="room-native-simple"
                                displayEmpty
                                value={viewConfig}
                                onChange={handleViewRoom}
                            >
                                {rooms.map((room, index) => {
                                    return (
                                        <MenuItem key={index + 4200} value={room}>{room}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl className={classes.formControl1}>
                            <InputLabel htmlFor="room-native-simple">Resolution</InputLabel>
                            <Select enabled={loading}
                                value={cameraConfig.resolution}
                                onChange={handleChangeResolution}
                                displayEmpty
                            >
                                <MenuItem key={5501} value={'720'}>720p</MenuItem>
                                <MenuItem key={5502} value={'1080'}>1080p</MenuItem>
                                <MenuItem key={5503} value={'575'}>575p</MenuItem>
                                <MenuItem key={5504} value={'0'}>nothing</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                        <Button onClick={() => { view() }} >Play</Button>
                    </Grid>

                    <Grid item xs={8} key={6003}>
                        <Paper></Paper>
                    </Grid>
                </Grid>
            </Paper>
          
        </div>
    );
};

export default ViewDevices;
