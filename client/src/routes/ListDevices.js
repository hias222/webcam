import React, { useEffect, useState, useRef } from "react";

import io from "socket.io-client";

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



const ListDevices = (props) => {
    const classes = useStyles();
    const [printvideodevices, setVideodevices] = useState([
        { label: "Loading ...", deviceId: "" }
    ]);
    const [loading, setLoading] = React.useState(true);
    const [printaudiodevices, setAudiodevices] = useState([]);
    const videodevices = [];
    const audiodevices = [];
    const [rooms, setRooms] = useState([]);
    const history = useHistory();
    const socketRef = useRef();

    var constraints = {
        video: true,
        audio: true
    };

    var localVideoref = useRef(null);

    // for selects
    const [cameraConfig, setCameraConfig] = React.useState({ 'video': '', "audio": '', "room": '', "resolution": '720' });
    const [viewConfig, setViewConfig] = React.useState('');

    function create(cameraID) {
        history.push(`/room/${cameraConfig.video}`);
    }

    function serve() {
        if (cameraConfig.video === 'false') {
            alert("choose a video device")
        } else {
            history.push(`/stream/${cameraConfig.room}/${cameraConfig.video}/${cameraConfig.audio}/${cameraConfig.resolution}`);
        }
    }

    function view() {
        history.push(`/view/${cameraConfig.room}/${cameraConfig.resolution}`);
    }

    const handleChangeVideo = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'video': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    const handleChangeResolution = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'resolution': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    const handleChangeAudio = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'audio': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    const handleChangeRoom = (event) => {
        const name = event.target.value;
        var temp = { ...cameraConfig, 'room': name }
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
        navigator.mediaDevices.enumerateDevices().then(devices => {
            var tmpDef = { 'video': 'false', "audio": 'false', "room": 'cam1' }
            setCameraConfig(tmpDef);

            devices.forEach(function (device, index) {
                if (device.kind === 'videoinput') {
                    videodevices.push(device)
                }

                if (device.kind === 'audioinput') {
                    audiodevices.push(device)
                }
            });
            setVideodevices(videodevices)
            setAudiodevices(audiodevices)
            setLoading(false);
        })


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

        async function getMedia(constraints) {
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log(stream.getAudioTracks()[0].getCapabilities());
                localVideoref.current.srcObject = stream;
                localVideoref.current.muted = true;
            } catch (err) {
                /* handle the error */
                console.log(err);
            }
        }

        getMedia(constraints);

        return function cleanup() {
            console.log("cleanup todo ")
        }

    }, []);

    return (
        <div className={classes.root}>
            <Paper className={classes.paper2}>
                <Grid container spacing={2} key={6000} >
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>Stream Camera - Chack Access tom camera and mic devices in browser </Paper>
                    </Grid>


                    <Grid item xs={2}>
                        <FormControl className={classes.formControl1}>
                            <InputLabel htmlFor="room-native-simple">Stream</InputLabel>
                            <Select enabled={loading}
                                value={cameraConfig.room}
                                onChange={handleChangeRoom}
                                displayEmpty
                            >
                                <MenuItem key={5201} value={'cam1'}>cam1</MenuItem>
                                <MenuItem key={5202} value={'cam2'}>cam2</MenuItem>
                                <MenuItem key={5203} value={'cam3'}>cam3</MenuItem>
                                <MenuItem key={5204} value={'cam4'}>cam4</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={2}>
                        <FormControl className={classes.formControl1}>
                            <InputLabel htmlFor="room-native-simple">Resolution</InputLabel>
                            <Select enabled={loading}
                                value={cameraConfig.resolution}
                                onChange={handleChangeResolution}
                                displayEmpty
                            >
                                <MenuItem key={5301} value={'720'}>720p</MenuItem>
                                <MenuItem key={5302} value={'1080'}>1080p</MenuItem>
                                <MenuItem key={5303} value={'575'}>575p</MenuItem>
                                <MenuItem key={5304} value={'0'}>nothing</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={5}>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="video-native-simple">Video</InputLabel>
                            <Select enabled={loading}
                                onChange={handleChangeVideo}
                                value={cameraConfig.video}
                                displayEmpty
                            >
                                <MenuItem value="false">
                                    <em>None</em>
                                </MenuItem>
                                {printvideodevices.map((device, index) => {
                                    return (
                                        <MenuItem key={index + 5100} value={device.deviceId}>{device.label}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={5}>

                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="audio-native-simple">Audio</InputLabel>
                            <Select enabled={loading}
                                onChange={handleChangeAudio}
                                value={cameraConfig.audio}
                                displayEmpty
                            >
                                <MenuItem value="false">
                                    <em>None</em>
                                </MenuItem>
                                {printaudiodevices.map((device, index) => {
                                    return (
                                        <MenuItem key={index + 5100} value={device.deviceId}>{device.label}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>


                    </Grid>

                    <Grid item xs={2}>
                        <Button onClick={() => { serve() }} >Play</Button>
                    </Grid>

                    <Grid item xs={2} key={6001}>
                        <Button onClick={() => { create() }} >Room</Button>
                    </Grid>

                    <Grid item xs={8} key={6002}>
                        <Paper></Paper>
                    </Grid>

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
            <Grid >
                <video ref={localVideoref} autoPlay ></video>
            </Grid>
        </div>
    );
};

export default ListDevices;
