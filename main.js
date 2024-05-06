import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

const APP_ID = "57263a211c2f40a4a3c32d5431f09dcd";
const TOKEN =
  "007eJxTYHhzrD/onew93yTNUzYxLap3t3nNlzmjO/9v9qY9r67OW2WpwGBqbmRmnGhkaJhslGZikGiSaJxsbJRiamJsmGZgmZKc4rTOIq0hkJHh7YSFLIwMEAjiszIUF5VkZDMwAAD9gSHm";
const CHANNEL = "srthk";
const APP_CERTIFICATE = "6aed87b0a44b4e0d9c016a463cceab3b";

const generateRTMAppId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  for (let i = 0; i < 6; i++) {
    uid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `USR-${uid}`;
};

const suid = generateRTMAppId();
console.log(`suid
'
'
'
'
'
'
'
'
'
'
'
'
`);
console.log(suid);
let role = "publisher"; // or'subscriber'
let expireTime = 3600; // token expires in 1 hour

// const agoraToken = await AgoraRTM.generateToken(
//   APP_ID,
//   APP_CERTIFICATE,
//   suid,
//   (role = role),
//   (expireTime = expireTime)
// );

// const test = await AgoraRTM.generateRTMAppId();
// console.log(`test
// '
// '
// '
// '
// '
// '
// '
// '
// '
// '
// '
// '
// `);
// console.log(test);

// console.log(agoraToken);

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};
let UID = "";

client.enableAudioVolumeIndicator();

let joinAndDisplayLocalStream = async () => {
  try {
    client.on("user-published", handleUserJoined);

    client.on("user-left", handleUserLeft);

    [UID, localTracks] = await Promise.all([
      // join the channel
      client.join(APP_ID, CHANNEL, TOKEN, null),
      // create local tracks, using microphone and camera
      AgoraRTC.createMicrophoneAndCameraTracks(),
    ]);

    // const agoraRTM_Client = await AgoraRTM.createInstance(APP_ID);
    // await agoraRTM_Client.login({
    //   uid: generateRTMAppId(),
    //   token:
    //     "007eJxTYBCfVKvvbZxhW/JwvZspV8jq9RnSs382Xl5y4HPQa6sdARsUGEzNjcyME40MDZON0kwMEk0SjZONjVJMTYwN0wwsU5JTStQt0xoCGRnYD4ezMjKwMjAyMDGA+AwMAEdhHGU=",
    // });
    // const agoraRTM_Channel = await agoraRTM_Client.createChannel(CHANNEL);
    // await agoraRTM_Channel.join();

    // console.log(`RTM CLIENT
    // '
    // '

    // '
    // '
    // '`);
    // console.log(agoraRTM_Client);
    // console.log(`channel
    // '
    // '

    // '
    // '
    // '`);
    // console.log(agoraRTM_Channel);

    client.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        console.log(`UID ${volume.uid} Level ${volume.level}`);
        console.log("check this out");
        const activeSpeakerUid = volume.uid;
        const activeSpeakerLevel = volume.level;

        if (activeSpeakerLevel > 0) {
          const activeSpeakerContainer = $(
            `#user-container-${activeSpeakerUid}`
          );
          console.log("activeSpeakerUid", activeSpeakerUid);
          console.log("activeSpeakerLevel", activeSpeakerLevel);
          console.log("activeSpeakerContainer", activeSpeakerContainer);
          if (activeSpeakerContainer.length > 0) {
            const activeSpeaker = activeSpeakerContainer.find(".video-player");
            if (activeSpeaker.length > 0) {
              activeSpeaker.css("border", "thick solid red");
            }
          }
        } else {
          // Remove highlight from all speakers
          $(".video-player").css("border", "");
        }
      });
    });

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}" style="  height: 50vh; width: 90vw;"></div>
                  </div>`;
    $("#video-call").append(player);

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(err);
  }
};

let joinStream = async () => {
  try {
    console.log("Clicked join stream");
    await joinAndDisplayLocalStream();
    console.log("Have we reached here? ");
    $("#join-btn").hide();
    $("#stream-controls").show();
    $(".stream-control-button").show();
  } catch (error) {
    console.log("There has been an error");
    console.log(error);
  }
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = $(`#user-container-${user.uid}`);
    if (player.length > 0) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}" style="height: 50vh; width: 90vw;"></div> 
                 </div>`;
    $("#video-call").append(player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  $(`#user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  $("#join-btn").show();
  $("#stream-controls").hide();
  $(".stream-control-button").hide();
  $("#video-call").html("");
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    $(e.target).text("Mic on");
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[0].setMuted(true);
    $(e.target).text("Mic off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    $(e.target).text("Camera on");
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[1].setMuted(true);
    $(e.target).text("Camera off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

$("#join-btn").on("click", joinStream);
$("#leave-btn").on("click", leaveAndRemoveLocalStream);
$("#mic-btn").on("click", toggleMic);
$("#camera-btn").on("click", toggleCamera);
