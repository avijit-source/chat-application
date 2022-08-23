const socket = io();

const $messageform = document.getElementById("form-submit");
const $messageforminput = document.getElementById("input-form");
const $messagesendbtn = document.getElementById("btn-submit");
const $locationsendbtn = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const $emoji = document.querySelectorAll("#emoji");
const $onlinebtn = document.getElementById("online-mobile-btn");


let mobileshowsidebarflag = false;
// templates

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationmessageTemplate = document.getElementById("location-message-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// options

const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = () =>{
    // new msg
    const $newMessage = $messages.lastElementChild;
    // height of new message

    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin;
    
    // visible height
    const visibleHeight = $messages.offsetHeight;
   
    // container height

    const containerHeight = $messages.scrollHeight;


    // how far have i scrolled

    const scrolloffset = $messages.scrollTop+visibleHeight;
    
    if(containerHeight-newMessageHeight<=scrolloffset){
        $messages.scrollTop = $messages.scrollHeight
    }
            
}

socket.on("message",(message)=>{
    const html =  Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll()
})

socket.on("locationmessage",(message)=>{
    console.log(message);
    const html = Mustache.render(locationmessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll()
})

socket.on("roomdata",({room,users})=>{
     const html = Mustache.render(sidebarTemplate,{
        room,users
     })
     document.getElementById("sidebar").innerHTML = html
})

$messageform.addEventListener("submit",(event)=>{
    event.preventDefault();
    $messagesendbtn.setAttribute("disabled","disabled")
    const val = $messageforminput.value;
    socket.emit("messageSend",val,(error)=>{
        $messagesendbtn.removeAttribute("disabled");
        $messageforminput.value="";
        $messageforminput.focus();
        if(error){
            console.log(error);
        }
        console.log("message sent successfully");
    })
})

$emoji.forEach(emoji=>{
    emoji.addEventListener("click",function(e){
        const emojival = e.target.innerHTML;
        let val = $messageforminput.value;
        val+=` ${emojival}`;
        $messageforminput.value = val;
    })
})




$locationsendbtn.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("geolocation not available in your browser");
    }
    $locationsendbtn.setAttribute("disabled","disabled");
    navigator.geolocation.getCurrentPosition(position=>{
        const coords = {latitude:position.coords.latitude,longitude:position.coords.longitude};
        socket.emit("location",coords,(message)=>{
            console.log(message);
        });
        $locationsendbtn.removeAttribute("disabled");
    })
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error);
        location.href = "/";
    }
})
$onlinebtn.addEventListener("click",(e)=>{
     if(!mobileshowsidebarflag){
        document.getElementById("sidebar").style.display="block";
        mobileshowsidebarflag = true;
        e.target.innerHTML = "hide sidebar"
     }else{
        document.getElementById("sidebar").style.display="none";
        mobileshowsidebarflag = false;
        e.target.innerHTML = "online users"
     }
})