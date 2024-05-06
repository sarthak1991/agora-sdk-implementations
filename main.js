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

    client.on("volume-indicator", (volume) => {
      console.log("Volume indicator:", volume);
      const activeSpeakerUid = volume[0].uid;
      const activeSpeakerLevel = volume[0].level;

      // Highlight the active speaker
      if (activeSpeakerLevel > 5) {
        const activeSpeakerContainer = document.getElementById(
          `user-container-${activeSpeakerUid}`
        );
        if (activeSpeakerContainer) {
          const activeSpeaker =
            activeSpeakerContainer.querySelector(".video-player");
          if (activeSpeaker) {
            activeSpeaker.style.border = "thick solid red";
          }
        }
      } else {
        // Remove highlight from all speakers
        document.querySelectorAll(".video-player").forEach((element) => {
          element.style.border = "";
        });
      }
    });

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

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
    document.getElementById("join-btn").style.display = "none";
    document.getElementById("stream-controls").style.display = "flex";
  } catch (error) {
    console.log("There has been an error");
    console.log(error);
  }
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  document.getElementById("join-btn").style.display = "block";
  document.getElementById("stream-controls").style.display = "none";
  document.getElementById("video-streams").innerHTML = "";
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "Mic off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Camera on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Camera off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

// let handleVolume = (volume) => {
//   console.log(`This is the volume`);
//   let activeSpeakerContainer = document.getElementById(
//     `user-container-${volume.uid}`
//   );
//   if (activeSpeakerContainer) {
//     let activeSpeaker = activeSpeakerContainer.querySelector(".video-player");
//     if (activeSpeaker) {
//       updateActiveSpeakerBorder(activeSpeaker, volume.level > 0);
//     }
//   }
//   console.log(volume);
// };

// let updateActiveSpeakerBorder = (element, isActive) => {
//   if (isActive) {
//     element.style.border = "thick solid red";
//   } else {
//     element.style.border = "";
//   }
// };

document.getElementById("join-btn").addEventListener("click", joinStream);
document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);
