/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

self.addEventListener('fetch', () => {
  const urlParams = new URLSearchParams(location.search);
  self.firebaseConfig = Object.fromEntries(urlParams);
});

const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

firebase.initializeApp(self.firebaseConfig || defaultConfig);

const messaging = firebase.messaging();

const incrementUnreadCount = async () => {
  const windowClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  if (windowClients.length > 0) {
    windowClients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_MESSAGE",
      });
    });
  } else {
    const broadcast = new BroadcastChannel("unread-messages");
    broadcast.postMessage({
      type: "INCREMENT_COUNT",
    });
  }
};


messaging.onBackgroundMessage(async(payload) => {
  const notificationTitle = payload.notification.title;

  const notificationOptions = {
    body: payload.notification.body,
    icon: "./favicon/favicon-48x48.png",
  };

  await incrementUnreadCount();

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener("notificationclick", function (event) {
  event.notification.close();
});