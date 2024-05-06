import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "57263a211c2f40a4a3c32d5431f09dcd ";
const TOKEN =
  "007eJxTYHhzrD/onew93yTNUzYxLap3t3nNlzmjO/9v9qY9r67OW2WpwGBqbmRmnGhkaJhslGZikGiSaJxsbJRiamJsmGZgmZKc4rTOIq0hkJHh7YSFLIwMEAjiszIUF5VkZDMwAAD9gSHm";
const CHANNEL = "srthk";

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
                        <div class="video-player" id="user-${UID}" style="  height: 90vh;
                        width: 1400px;"></div>
                  </div>`;
    $("#video-streams").append(player);

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(error);
  }
};

let joinStream = async () => {
  try {
    console.log("Clicked join stream");
    await joinAndDisplayLocalStream();
    console.log("Have we reached here? ");
    $("#join-btn").hide();
    $("#stream-controls").show();
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
                        <div class="video-player" id="user-${user.uid}" style="  height: 90vh;
                        width: 1400px;"></div> 
                 </div>`;
    $("#video-streams").append(player);

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
  $("#video-streams").html("");
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    $(e.target).text("Mic on");
    $(e.target).css("background-color", "cadetblue");
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
    $(e.target).css("background-color", "cadetblue");
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
