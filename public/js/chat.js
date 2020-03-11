const socket = io();

const $chatForm = document.querySelector("#chat-form");
const $chatFormInput = document.querySelector("input");
const $chatFormButton = document.querySelector("button");

const $sendLocationButton = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm:ss a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", url => {
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.text,
    createdAt: moment(url.createdAt).format("hh:mm:ss a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$chatForm.addEventListener("submit", e => {
  e.preventDefault();
  $chatFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.messageInput.value;

  socket.emit("sendMessage", message, serverMessage => {
    $chatFormButton.removeAttribute("disabled", "disabled");
    $chatFormInput.value = "";
    $chatFormInput.focus();
    console.log(serverMessage);
  });
});

$sendLocationButton.addEventListener("click", e => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    const {
      coords: { latitude, longitude }
    } = position;
    socket.emit(
      "sendLocation",
      `https://google.com/maps?q=${longitude},${latitude}`,
      serverMessage => {
        $sendLocationButton.removeAttribute("disabled", "disabled");
        console.log(serverMessage);
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  alert(error);
  location.href = "/";
});
