import React, { useEffect, useState } from "react";

import { useHistory } from "react-router-dom";
import { Button, Grid } from "@material-ui/core";

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));



const ListDevices = (props) => {
    const classes = useStyles();
    const [printvideodevices, setVideodevices] = useState([
        { label: "Loading ...", deviceId: "" }
    ]);
    const [loading, setLoading] = React.useState(true);

    const [camaraConfig, setCameraConfig] = React.useState();

    const [printaudiodevices, setAudiodevices] = useState([]);
    const videodevices = [];
    const audiodevices = [];

    const history = useHistory();

    function create(cameraID) {
        history.push(`/room/${camaraConfig.video}`);
    }

    function serve() {
        history.push(`/stream/${camaraConfig.video}/${camaraConfig.audio}`);
    }

    const handleChangeVideo = (event) => {
        const name = event.target.value;
        var temp = { ...camaraConfig, 'video': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    const handleChangeAudio = (event) => {
        const name = event.target.value;
        var temp = { ...camaraConfig, 'audio': name }
        setCameraConfig(temp)
        console.log(temp)
    };

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            var tmpDef = { 'video': false, "audio": false }
            setCameraConfig(tmpDef);

            devices.forEach(function (device, index) {
                if (device.kind === 'videoinput') {
                    videodevices.push(device)
                }

                if (device.kind === 'audioinput') {
                    audiodevices.push(device)
                }
                //console.log(device.kind + ": " + device.label +
                //  " id = " + device.deviceId);
            });
            setVideodevices(videodevices)
            setAudiodevices(audiodevices)
            setLoading(false);
        })


    }, []);

    return (
        <div>

            <Grid container key={6000} >
                <Grid item xs={12}>

                    <p  >Devices</p>
                </Grid>

                <Grid item xs={12}>

                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="video-native-simple">Video</InputLabel>
                        <Select enabled={loading}
                            onChange={handleChangeVideo}
                        >
                            {printvideodevices.map((device, index) => {
                                return (
                                    <MenuItem key={index + 5100} value={device.deviceId}>{device.label}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="audio-native-simple">Audio</InputLabel>
                        <Select enabled={loading}
                            onChange={handleChangeAudio}
                        >
                            {printaudiodevices.map((device, index) => {
                                return (
                                    <MenuItem key={index + 5100} value={device.deviceId}>{device.label}</MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                </Grid>

                <Grid item xs={6}>
                    <Button onClick={() => { serve() }} >Play</Button>
                </Grid>

                <Grid item xs={6} key={6001}>
                    <Button onClick={() => { create() }} >Room</Button>
                </Grid>
            </Grid>

        </div>
    );
};

export default ListDevices;
