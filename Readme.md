# Samples to transport Webcam

The Idea is to stream the webcam out of the browser to another pc/laptop inside the same lan

ToDos:

* prpare RPI with the webcam - still an error - can't choose the cam
* prepare server with right certs (Chrome!))
* install software out of webcam repo
* test it

## documentation

* <https://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection>
* <https://w3c.github.io/webrtc-pc/#simple-peer-to-peer-example>
* <https://github.com/adrigardi90/video-chat>
* <https://www.npmjs.com/package/vue-webrtc>

## Install

## use webRTC with simple-peer

* <https://www.npmjs.com/package/simple-peer#in-node>
* <https://github.com/coding-with-chaim/group-video-final/tree/master/client>
* <https://www.youtube.com/watch?v=R1sfHPwEH7A>
* <https://planb.nicecupoftea.org/2020/05/29/zoom-on-a-pi-4-4gb/>
* <https://dustinoprea.com/2014/05/21/lightweight-live-video-in-a-webpage-with-gstreamer-and-webrtc/>
* <http://4youngpadawans.com/stream-live-video-to-browser-using-gstreamer/>

### Resolution on rpi

#### set video mode

Prepare static display. Display is not needed on reboot.

* sudo /opt/vc/bin/tvservice -d /boot/edid.dat
* and add hdmi_edid_file=1 to config.txt.


### disable wlan sleep mode

iwconfig
iw wlan0 set power_save off
--> rc.local

#### set camera mode

```bash
v4l2-ctl --set-fmt-video=width=1280,height=720,pixelformat="H264" -d /dev/video0
v4l2-ctl --set-fmt-video=width=1280,height=720 -d /dev/video0
```
has no influence on browser

### Check camera

#### browser

use [de.webcam.de](https://de.webcamtests.com/)

#### local

raspivid -o vid.h264 -w 1280 -h 720
sudo apt install gpac

MP4Box -add vid.h264 -new /dev/null

## Other possible software stacks

### vue-webrtc

see example inside npm package
vue create sample ...

### peerjs

* <https://www.youtube.com/watch?v=DvlyzDZDEq4>
* <https://github.com/WebDevSimplified/Zoom-Clone-With-WebRTC>

### mjpeg-streamer

<https://www.sigmdel.ca/michel/ha/rpi/streaming_en.html>