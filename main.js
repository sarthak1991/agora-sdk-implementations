// GOTO: Bottom of the paage to see Step 1 and start reading the code.
// Used Jquery to make writing code quicker and more readable
import $ from "jquery";

// Importing Agora SDKs
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

import { AIDenoiserExtension } from "agora-extension-ai-denoiser";
import VirtualBackgroundExtension from "agora-extension-virtual-background";

// Importing Generator function to Generate the UID and RTC Token
import generate from "./helpers/generators";
import {
  acquireRecording,
  startWebRecording,
  stopWebRecording,
  createRtmpConverter,
  deleteRtmpConverter,
  createCloudPlayer,
  deleteCloudPlayer,
} from "./helpers/restfulControllers";
import CONSTANTS from "./helpers/CONSTS";

// eac91002da8b4caabfdde1753ad8dd90

// Later: It wasn't in the requirements but allow user to enter his channel of choice as we are using cutom tokens using our own token generator serviced by our own HTTPS Enabled NodeJS Server.
const CHANNEL = CONSTANTS.CHANNEL;

// placeholder variables
let localTracks = [];
let remoteUsers = {};
let UID = "";

let userUID = null;

let dataFromStreamCreate = null;
let dataFromMediaPull = null;

/**
 * Step 0
 * - Create RTC Client
 * - Enable Volume Indicators from the client (Used in checking for active speaker)
 */
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
// const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

// Example of geo-restricting the app.
AgoraRTC.setArea("ASIA");

client.enableAudioVolumeIndicator();

/**
 * Step 3.1:
 * - Connect the client to the call
 * - Create Audio and Video tracks
 */

const init_rtc = async (uid, token) => {
  [UID, localTracks] = await Promise.all([
    // join the channel
    client.join(CONSTANTS.APPID, CONSTANTS.CHANNEL, token, uid),
    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAndCameraTracks(),
  ]);
  return [UID, localTracks];
};

let isBackgroundApplied = false;

const setupVirtualBackground = async () => {
  const extension = new VirtualBackgroundExtension();
  if (!extension.checkCompatibility()) {
    console.error("Virtual Background is not supported in this browser!");
    return null;
  }

  AgoraRTC.registerExtensions([extension]);
  const processor = extension.createProcessor();
  await processor.init();

  return processor;
};

const changeBackground = async (processor, type, value) => {
  if (!processor) {
    console.error("Virtual Background processor is not initialized.");
    return;
  }

  if (type === "none") {
    await processor.disable();
    isBackgroundApplied = false;
  } else {
    if (type === "blur") {
      await processor.setOptions({ type: "blur", blurDegree: value });
    } else if (type === "color") {
      await processor.setOptions({ type: "color", color: value });
    }
    await processor.enable();
    isBackgroundApplied = true;
  }

  updateChangeBackgroundButton();
};

const updateChangeBackgroundButton = () => {
  const $btn = $("#change-bg-btn");
  if (isBackgroundApplied) {
    $btn.text("Remove Background");
  } else {
    $btn.text("Change Background");
  }
};

/**
 * Step 3.2:
 * Initialize the signaling SDK
 * - Login to sdk
 * - Create chat channel
 * - Join chat channel
 * - Handle user cases
 */
const init_rtm = async (uid) => {
  let rtmClient = AgoraRTM.createInstance(CONSTANTS.APPID);

  rtmClient.on("ConnectionStateChange", (newState, reason) => {
    console.log(
      "RTM connection state changed to" + newState + "reason:" + reason
    );
  });

  console.log("This is the type of RTM UID -=-=-=-=-=-=-=-=-=-=-=-=-");
  console.log(typeof uid);

  let token = await generate.rtmToken(uid);
  await rtmClient.login({ uid, token });
  console.log(`rtm client login successful`);

  let chatChannel = await rtmClient.createChannel(CONSTANTS.CHANNEL);

  // Join the chat channel
  await chatChannel.join();

  // Listen for messages in the chat channel
  chatChannel.on("ChannelMessage", (message, memberId) => {
    console.log(`Received message from ${memberId}: ${message}`);
    displayChatMessage(memberId, message);
  });

  const displayChatMessage = (memberId, message) => {
    const chatLog = document.getElementById("chat-log");
    const messageElement = document.createElement("div");
    messageElement.textContent = `${memberId}: ${JSON.stringify(message.text)}`;
    chatLog.appendChild(messageElement);
  };

  const sendChatMessage = async () => {
    const chatInput = document.getElementById("chat-input");
    const messageText = chatInput.value.trim();
    if (messageText !== "") {
      try {
        const message = { text: messageText }; // Create a plain object with a 'text' property
        await chatChannel.sendMessage(message);
        chatInput.value = "";
      } catch (error) {
        console.log("Error sending chat message:", error);
      }
    }
  };

  document
    .getElementById("send-btn")
    .addEventListener("click", sendChatMessage);

  return rtmClient;
};
/**
 *
 * Step 3:
 * - Write logic for when a user joins video call.
 * - Handle user published and user left cases
 * - initialize RTC and RTM SDKs and handle user events for both
 * - Check if the user volume level is above 10. If it is, highlight the user with a yellow border.
 * - Next Steps: --> Check Step 3.1 (init_rtc) and Step 3.2 (init_rtm)
 */
let joinAndDisplayLocalStream = async (uid, token) => {
  try {
    client.on("user-published", handleUserJoined);

    client.on("user-left", handleUserLeft);

    client.on("stream-message", onStreamMessage);

    $("#screen-share-btn").on("click", toggleScreenShare);

    let rtm_uid = uid.toString();

    const [UID, localTracks] = await init_rtc(uid, token);
    console.log(`This is the local tracks-=-=-=-=-`);
    console.log(localTracks);
    console.log(`This is the local tracks-=-=-=-=-`);
    await init_rtm(rtm_uid);

    // TEST-=-=-=-=-=-=-=-=-=-DENOISER START-=-=-=-=-=-=-=-=-=-=-=-=-

    console.log(`TEST-=-=-=-=-=-=-=-=-=-DENOISER-=-=-=-=-=-=-=-=-=-=-=-=-`);

    const denoiser = new AIDenoiserExtension({
      assetsPath: "./node_modules/agora-extension-ai-denoiser/external",
    });

    // Register the extension
    AgoraRTC.registerExtensions([denoiser]);
    // (Optional) Listen for the callback reporting that the Wasm files fail to load

    // Create a processor
    const denoiserProcessor = denoiser.createProcessor({
      wasmValidation: false,
    });
    // Enable the extension by default
    denoiserProcessor.enable();

    localTracks[0]
      .pipe(denoiserProcessor)
      .pipe(localTracks[0].processorDestination);
    await denoiserProcessor.enable();

    // TEST-=-=-=-=-=-=-=-=-=-DENOISER END -=-=-=-=-=-=-=-=-=-=-=-=-

    const virtualBgProcessor = await setupVirtualBackground();

    if (virtualBgProcessor) {
      localTracks[1]
        .pipe(virtualBgProcessor)
        .pipe(localTracks[1].processorDestination);
    }

    // Modify the change background button event listener
    $("#change-bg-btn").on("click", () => {
      if (isBackgroundApplied) {
        changeBackground(virtualBgProcessor, "none");
      } else {
        $("#bg-options").toggle();
      }
    });

    $("#blur-bg-btn").on("click", () => {
      changeBackground(virtualBgProcessor, "blur", 2);
      $("#bg-options").hide();
    });

    // Modified color picker event handling
    $("#color-picker").on("input", (e) => {
      const color = e.target.value;
      changeBackground(virtualBgProcessor, "color", color);
    });

    $("#color-picker-form").on("submit", (e) => {
      e.preventDefault();
      const color = $("#color-picker").val();
      changeBackground(virtualBgProcessor, "color", color);
      $("#bg-options").hide();
    });

    // New event listener for Enter key
    $("#color-picker").on("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const color = e.target.value;
        changeBackground(virtualBgProcessor, "color", color);
        $("#bg-options").hide();
      }
    });

    // Initialize button text
    updateChangeBackgroundButton();

    // Background button handling end

    client.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        // console.log(`UID ${volume.uid} Level ${volume.level}`);
        // console.log("check this out");
        const activeSpeakerUid = volume.uid;

        console.log(`uid --> ${volume.uid}`);
        const activeSpeakerLevel = volume.level;

        if (activeSpeakerLevel > 10) {
          const activeSpeakerContainer = $(
            `#user-container-${activeSpeakerUid}`
          );
          // console.log("activeSpeakerUid", activeSpeakerUid);
          // console.log("activeSpeakerLevel", activeSpeakerLevel);
          // console.log("activeSpeakerContainer", activeSpeakerContainer);
          if (activeSpeakerContainer.length > 0) {
            const activeSpeaker = activeSpeakerContainer.find(".video-player");
            if (activeSpeaker.length > 0) {
              activeSpeaker.css("border", "thick solid yellow");
            }
          }
        } else {
          // Remove highlight from all speakers
          $(".video-player").css("border", "");
        }
      });
    });

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                        <div class="uid-label">${UID}</div>
                  </div>`;
    $("#video-call").append(player);

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0], localTracks[1]]);
  } catch (err) {
    console.log("There has been an error");
    console.log(err);
  }
};
/**
 *
 * Step 2:
 * - Join Stream.
 * - Handle hiding and showing HTML elements and buttons as appropriate
 * - Next Step -> joinAndDisplayLocalStream
 *
 */
let joinStream = async (role) => {
  try {
    // generate UID and RTC token using custom logic written in ./helpers.generators.js | Split the logic into a different file to keep this file lean
    let stringUid = generate.numericUID();
    let uid = Number(stringUid);
    console.log("This is the type of UID -=-=-=-=-=-=-=-=-=-=-=-=-");
    console.log(typeof uid);
    userUID = uid;
    let rtcToken = await generate.rtcToken(CONSTANTS.CHANNEL, uid, role);

    $("#screen-share-btn").show();

    console.log(`rtcToken --> `, rtcToken);
    console.log("UID", uid);

    console.log("Clicked join stream");

    await joinAndDisplayLocalStream(uid, rtcToken);

    console.log("Have we reached here? ");
    $("#chat-container").show();
    $("#stream-controls").show();
    $("#stream-join-buttons").hide();
    $("#stream-button-container").css("display", "none");
    $(".layout-btn").css("display", "block");
    $("#video-call-container").show();
  } catch (error) {
    console.log("There has been an error");
    console.log(error);
  }
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  try {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      if (user.videoTrack) {
        let $player = $(`#user-container-${user.uid}`);
        if ($player.length > 0) {
          $player.remove();
        }

        let $newPlayer =
          $(`<div class="video-container" id="user-container-${user.uid}">
                              <div class="video-player" id="user-${user.uid}"></div>
                              <div class="uid-label">${user.uid}</div>
                            </div>`);
        $("#video-call").append($newPlayer);

        user.videoTrack.play(`user-${user.uid}`);
        console.log(`Remote user ${user.uid} video track played`);
      } else {
        console.warn(`Remote user ${user.uid} video track is not available`);
      }
    }

    if (mediaType === "audio") {
      if (user.audioTrack) {
        user.audioTrack.play();
        console.log(`Remote user ${user.uid} audio track played`);
      } else {
        console.warn(`Remote user ${user.uid} audio track is not available`);
      }
    }

    console.log(
      `Successfully subscribed to ${mediaType} track of user ${user.uid}`
    );
  } catch (error) {
    console.error(
      `Error handling ${mediaType} track of user ${user.uid}:`,
      error
    );
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  $(`#user-container-${user.uid}`).remove();
};

const onStreamMessage = async (uid, stream) => {
  // if (uid != {pusher bot uid}) {
  console.log(uid);
  return;
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  if (screenTrack) {
    screenTrack.stop();
    screenTrack.close();
    screenTrack = null;
  }

  await client.leave();
  $("#chat-container").hide();
  $("#stream-controls").hide();
  $("#stream-join-buttons").show();
  $("#stream-button-container").show();
  $(".layout-btn").hide();
  $("#video-call-container").hide();
  $("#video-call").html("");
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    let micSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M256 328a96.108 96.108 0 0 0 96-96V112a96 96 0 0 0-192 0v120a96.108 96.108 0 0 0 96 96m-64-216a64 64 0 0 1 128 0v120a64 64 0 0 1-128 0Z"
    />
    <path
      fill="currentColor"
      d="M400 176v56c0 79.4-64.6 144-144 144s-144-64.6-144-144v-56H80v56c0 91.653 70.424 167.154 160 175.265V496h32v-88.735c89.576-8.111 160-83.612 160-175.265v-56Z"
    />
  </svg>`;
    $(e.target).text("Mic on");
    $(e.target).prepend(micSvg);
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
    let camSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
  >
    <path
      fill="none"
      stroke="currentColor"
      d="M7 1.5H2m12.5 11v-8a1 1 0 0 0-1-1h-12a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1Zm-5-2a2 2 0 1 1 0-4a2 2 0 0 1 0 4Z"
    />
  </svg>`;
    $(e.target).text("Camera on");
    $(e.target).prepend(camSvg);
    $(e.target).css("background-color", "yellowgreen");
  } else {
    await localTracks[1].setMuted(true);
    $(e.target).text("Camera off");
    $(e.target).css("background-color", "#EE4B2B");
  }
};

let isRecording = false;
let recordingData = null;
let acquisitionData = null;

const toggleRecording = async (e) => {
  const $button = $(e.target);

  const disableButton = () => {
    $button.prop("disabled", true);
    $button.css("opacity", "0.5");
  };

  const enableButton = () => {
    $button.prop("disabled", false);
    $button.css("opacity", "1");
  };

  const setButtonError = (message) => {
    $button.text(`❌ ${message}`);
    setTimeout(() => {
      $button.text(isRecording ? "Stop Recording" : "Start Recording");
    }, 3000);
  };

  disableButton();

  if (!isRecording) {
    try {
      const recordingUID = generate.numericUID();
      const data = await acquireRecording(
        CONSTANTS.APPID,
        CONSTANTS.CHANNEL,
        recordingUID
      );

      if (data) {
        acquisitionData = { ...data, recordingUID };
        console.log("acquisitionData", acquisitionData);

        const recordingClientToken = await generate.rtcToken(
          CONSTANTS.CHANNEL,
          acquisitionData.uid,
          "audience"
        );
        recordingData = await startWebRecording(
          CONSTANTS.APPID,
          data.resourceId,
          data.cname,
          data.uid,
          recordingClientToken
        );
        console.log("data from recording =>", recordingData);

        $button.text("Stop Recording");
        $button.css("background-color", "#EE4B2B");
        isRecording = true;
      } else {
        setButtonError("Signal failed");
      }
    } catch (error) {
      console.error(
        "Error in signal acquisition or starting recording:",
        error
      );
      setButtonError("Error occurred");
    }
  } else {
    try {
      if (recordingData) {
        await stopWebRecording(
          CONSTANTS.APPID,
          recordingData.resourceId,
          recordingData.sid,
          CONSTANTS.CHANNEL,
          recordingData.uid
        );
      }
      $button.text("Start Recording");
      $button.css("background-color", ""); // Reset to default color
      isRecording = false;
      recordingData = null;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setButtonError("Error stopping");
    }
  }

  enableButton();
};

let isMediaPushing = false;

const toggleMediaPush = async (e) => {
  const $button = $(e.target);

  const disableButton = () => {
    $button.prop("disabled", true);
    $button.css("opacity", "0.5");
  };

  const enableButton = () => {
    $button.prop("disabled", false);
    $button.css("opacity", "1");
  };

  const setButtonError = (message) => {
    $button.text(`❌ ${message}`);
    setTimeout(() => {
      $button.text(isMediaPushing ? "Stop Media Push" : "Start Media Push");
    }, 3000);
  };

  disableButton();

  if (!isMediaPushing) {
    try {
      const ImageUID = Number(userUID);
      console.log("This is the type of IMAGEUID -=-=-=-=-=-=-=-=-=-=-=-=-");
      console.log(typeof ImageUID);
      const rtcToken = await generate.rtcToken(
        CONSTANTS.CHANNEL,
        ImageUID,
        "publisher"
      );
      const streamName = generate.uid();

      console.log(
        "======------------------==============-------------=========------"
      );

      console.log("ImageUID");
      console.log(ImageUID);
      console.log("rtcToken");
      console.log(rtcToken);
      console.log("streamName");
      console.log(streamName);

      // return

      const data = await createRtmpConverter(
        streamName,
        CONSTANTS.rtmpRegion,
        CONSTANTS.APPID,
        CONSTANTS.CHANNEL,
        ImageUID,
        CONSTANTS.RTMPUrl,
        rtcToken
      );

      console.log("RTMP converter created:", data);
      dataFromStreamCreate = data;

      $button.text("Stop Media Push");
      $button.css("background-color", "#EE4B2B");
      isMediaPushing = true;
    } catch (error) {
      console.error("Failed to create RTMP converter:", error);
      setButtonError("Failed to start");
    }
  } else {
    try {
      if (dataFromStreamCreate) {
        const result = await deleteRtmpConverter(
          CONSTANTS.rtmpRegion,
          CONSTANTS.APPID,
          dataFromStreamCreate.data.converter.id
        );
        console.log("RTMP converter deleted:", result);
      }

      $button.text("Start Media Push");
      $button.css("background-color", ""); // Reset to default color
      isMediaPushing = false;
      dataFromStreamCreate = null;
    } catch (error) {
      console.error("Failed to delete RTMP converter:", error);
      setButtonError("Failed to stop");
    }
  }

  enableButton();
};

let isMediaPulling = false;

const toggleMediaPull = async (e) => {
  const $button = $(e.target);

  const disableButton = () => {
    $button.prop("disabled", true);
    $button.css("opacity", "0.5");
  };

  const enableButton = () => {
    $button.prop("disabled", false);
    $button.css("opacity", "1");
  };

  const setButtonError = (message) => {
    $button.text(`❌ ${message}`);
    setTimeout(() => {
      $button.text(isMediaPulling ? "Stop Media Pull" : "Start Media Pull");
    }, 3000);
  };

  disableButton();

  if (!isMediaPulling) {
    try {
      const region = CONSTANTS.rtmpRegion;
      const APPID = CONSTANTS.APPID;
      const InjectUrl = CONSTANTS.InjectUrl;
      const AccessChannel = CONSTANTS.CHANNEL;
      const CloudPlayerUID = generate.numericUID();
      const idleTimeout = 300;
      const hostTokenForCloudPull = await generate.rtcToken(
        AccessChannel,
        CloudPlayerUID,
        "publisher"
      );

      console.log("hostTokenForCloudPull", hostTokenForCloudPull);

      const data = await createCloudPlayer(
        region,
        APPID,
        InjectUrl,
        AccessChannel,
        CloudPlayerUID,
        hostTokenForCloudPull,
        idleTimeout
      );

      dataFromMediaPull = data;
      console.log("Cloud player created:", data);

      $button.text("Stop Media Pull");
      $button.css("background-color", "#EE4B2B");
      isMediaPulling = true;
    } catch (error) {
      console.error("Failed to create cloud player:", error);
      setButtonError("Failed to start");
    }
  } else {
    try {
      if (dataFromMediaPull) {
        const region = CONSTANTS.rtmpRegion;
        const APPID = CONSTANTS.APPID;
        const id = dataFromMediaPull.data.player.id;

        const result = await deleteCloudPlayer(region, APPID, id);
        console.log("Cloud player deleted:", result);
      }

      $button.text("Start Media Pull");
      $button.css("background-color", ""); // Reset to default color
      isMediaPulling = false;
      dataFromMediaPull = null;
    } catch (error) {
      console.error("Failed to delete cloud player:", error);
      setButtonError("Failed to stop");
    }
  }

  enableButton();
};

let screenTrack;

const toggleScreenShare = async () => {
  if (!screenTrack) {
    // Start screen sharing
    try {
      screenTrack = await AgoraRTC.createScreenVideoTrack();
      await client.unpublish(localTracks[1]); // Unpublish camera track
      await client.publish(screenTrack);

      // Replace camera video with screen share
      const playerContainer = $(`#user-container-${UID}`);
      playerContainer.find(".video-player").empty();
      screenTrack.play(`user-${UID}`);

      $("#screen-share-btn").text("Stop Sharing");
    } catch (error) {
      console.error("Error starting screen share:", error);
      screenTrack = null;
    }
  } else {
    // Stop screen sharing
    await client.unpublish(screenTrack);
    screenTrack.stop();
    screenTrack.close();
    screenTrack = null;

    // Republish camera track
    await client.publish(localTracks[1]);
    localTracks[1].play(`user-${UID}`);

    $("#screen-share-btn").text("Share Screen");
  }
};

// Placeholder functions for layout views
let setGridLayout = () => {
  console.log("SetGridLayout");
};
let setActiveSpeakerLayout = () => {
  console.log("SetActiveSpeakerLayout");
};

// User Event Handlers
$("#leave-btn").on("click", leaveAndRemoveLocalStream);
$("#mic-btn").on("click", toggleMic);
$("#camera-btn").on("click", toggleCamera);
$("#acquire-btn").on("click", toggleRecording);
$("#mediapush-toggle-btn").on("click", toggleMediaPush);
$("#mediapull-toggle-btn").on("click", toggleMediaPull);



// Keyboard shortcuts
document.addEventListener('keydown', async (event) => {
  if (event.key === 'm' || event.key === 'M') {
    // Toggle microphone
    await toggleMic({ target: $('#mic-btn')[0] });
  } else if (event.key === 'c' || event.key === 'C') {
    // Toggle camera
    await toggleCamera({ target: $('#camera-btn')[0] });
  } else if (event.key === 'Escape') {
    // Leave call
    await leaveAndRemoveLocalStream();
  }
});




// Spotlight search functionality
let isSpotlightOpen = false;

document.addEventListener('keydown', (event) => {
  // Check for Command+K (Mac) or Ctrl+K (Windows)
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    toggleSpotlight();
  }
});

function toggleSpotlight() {
  const spotlightContainer = document.getElementById('spotlight-container');
  const spotlightInput = document.getElementById('spotlight-input');
  
  if (isSpotlightOpen) {
    spotlightContainer.style.display = 'none';
  } else {
    spotlightContainer.style.display = 'flex';
    spotlightInput.focus();
  }
  
  isSpotlightOpen = !isSpotlightOpen;
}

document.getElementById('spotlight-input').addEventListener('input', filterSpotlightResults);

function filterSpotlightResults() {
  const input = document.getElementById('spotlight-input');
  const filter = input.value.toLowerCase();
  const items = document.getElementsByClassName('spotlight-item');

  for (let i = 0; i < items.length; i++) {
    const text = items[i].textContent.toLowerCase();
    if (text.includes(filter)) {
      items[i].style.display = '';
    } else {
      items[i].style.display = 'none';
    }
  }
}

document.getElementById('spotlight-results').addEventListener('click', (event) => {
  if (event.target.classList.contains('spotlight-item')) {
    const shortcut = event.target.getAttribute('data-shortcut');
    triggerShortcut(shortcut);
    toggleSpotlight();
  }
});

function triggerShortcut(shortcut) {
  switch (shortcut) {
    case 'm':
      toggleMic({ target: $('#mic-btn')[0] });
      break;
    case 'c':
      toggleCamera({ target: $('#camera-btn')[0] });
      break;
    case 'escape':
      leaveAndRemoveLocalStream();
      break;
  }
}

// Close spotlight when clicking outside
document.getElementById('spotlight-container').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    toggleSpotlight();
  }
});

// Prevent closing spotlight when clicking inside the search box
document.getElementById('spotlight-search').addEventListener('click', (event) => {
  event.stopPropagation();
});








// Gonna do some refactor

// Event handlers for layout views
$("#grid-layout-btn").on("click", setGridLayout);
$("#active-speaker-layout-btn").on("click", setActiveSpeakerLayout);

/**
 * Step 1:
 * - Assign the user the role of host or audience based on what the user clicked.
 * - Join the user to the stream
 * - Next Step --> joinStream()
 */
$("#join-as-host-btn").on("click", async () => {
  await joinStream("publisher");
});

$("#join-as-audience-btn").on("click", async () => {
  await joinStream("audience");
});


