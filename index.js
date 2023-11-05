let peerconnection;
let localstream;
let remotestream;

let servers = {
    iceServers: [ // Fix typo, it should be iceServers
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] // Fix 'url' to 'urls'
        }
    ]
};

/*
stun1.l.google.com: 173.194.193.127
stun2.l.google.com: 172.253.112.127
*/

let init = async () => {
    localstream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    document.getElementById('user-1').srcObject = localstream;
};

let createpeerconnection = async (sdpType) => {
    peerconnection = new RTCPeerConnection(servers);

    remotestream = new MediaStream();
    document.getElementById('user-2').srcObject = remotestream;

    localstream.getTracks().forEach((track) => {
        peerconnection.addTrack(track, localstream);
    });

    peerconnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remotestream.addTrack(track);
        });
    };

    peerconnection.onicecandidate = async (event) => {
        if (event.candidate) {
            document.getElementById(sdpType).value = JSON.stringify(peerconnection.localDescription); // Fixed 'Document' to 'document' and 'setLocalDescription' to 'localDescription'
        }
    };
};

let createOffer = async () => {
    createpeerconnection('offer-sdp');

    let offer = await peerconnection.createOffer();
    await peerconnection.setLocalDescription(offer);
    document.getElementById('offer-sdp').value = JSON.stringify(offer);
};

let createAnswer = async () => {
    createpeerconnection('answer-sdp');

    let offer = document.getElementById('offer-sdp').value;
    if (!offer) return alert('Retrieve offer from peer first....');

    offer = JSON.parse(offer);
    await peerconnection.setRemoteDescription({ type: 'offer', sdp: offer.sdp }); // Set type to 'offer' and fix sdp
    let answer = await peerconnection.createAnswer();
    await peerconnection.setLocalDescription(answer);
    document.getElementById('answer-sdp').value = JSON.stringify(answer);
};

let addAnswer = async () => {
    let answer = document.getElementById('answer-sdp').value; // Declare answer variable
    if (!answer) return alert('Retrieve answer from peer first....');

    answer = JSON.parse(answer);
    if (!peerconnection.currentRemoteDescription) {
        peerconnection.setRemoteDescription({ type: 'answer', sdp: answer.sdp }); // Set type to 'answer' and fix sdp
    }
};

init();

document.getElementById('create-offer').addEventListener('click', createOffer);
document.getElementById('create-answer').addEventListener('click', createAnswer);
document.getElementById('add-answer').addEventListener('click', addAnswer);
