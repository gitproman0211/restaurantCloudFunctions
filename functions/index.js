
const functions = require('firebase-functions');
var restaurant1="7JqUizFVXo0cfyxORyLr";
var restaurant2="7KWYsmiTVvme0l5nq535";
var restaurant3="f64jyVjSUoCFXBj3C7nv";
var restaurant4= "nyeDOMRL4N9RB9A2teER";
var restaurant5="zFuvsnmMq0meASJqKqmT";
var admin = require("firebase-admin");
var serviceAccount = require("./services.json");
admin.initializeApp(
    {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restaurantapp-65d0e.firebaseio.com"
}
);
var db = admin.firestore();
var tokens=[];
var tokensR1=[];
var tokensR2=[];
var tokensR3=[];
var tokensR4=[];
var tokensR5=[];
var userTokens=[];
var notificationMessage="";


const fcm = admin.messaging();

const options = {
  priority: "normal",
  timeToLive: 60 * 60 * 24
};
const payload = {
  notification: {
    title: "Nueva notificación",
    body: "Pedido nuevo recibido",
  },
};
async function fetchUserTokens(){
  var temp=[];
  userTokens=[];

  var staffRef = await db.collection("users").get();
  staffRef.forEach((doc) => {
    temp.push(doc.data());
  });
  // console.log(temp);
  for(let i=0;i<temp.length;i++){
    userTokens.push(temp[i]["token"]);
  }
  console.log("user tokens");
  console.log(userTokens);
}
async function fetchNotificationMessage(){
  const messageRef = db.collection('notification').doc('dwpLs97JleIhbpm9jqUY');
  const doc = await messageRef.get();
 notificationMessage=doc.data()["message"];
  console.log("Notification Message");
  console.log(notificationMessage);
}
async function fetchTokens(){
  var temp=[];
  tokens=[];
  tokensR1=[];
  tokensR2=[];
  tokensR3=[];
  tokensR4=[];
  tokensR5=[];
  var staffRef = await db.collection("staff").get();
  staffRef.forEach((doc) => {
    temp.push(doc.data());
  });
  // console.log(temp);
  for(let i=0;i<temp.length;i++){
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager"))
      tokens.push(temp[i]["token"]);
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager" && temp[i]["restaurantId"]===restaurant1)){

        tokensR1.push(temp[i]["token"]);
    }
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager" && temp[i]["restaurantId"]===restaurant2)){

      tokensR2.push(temp[i]["token"]);
    }
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager" && temp[i]["restaurantId"]===restaurant3)){

      tokensR3.push(temp[i]["token"]);
    }
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager" && temp[i]["restaurantId"]===restaurant4)){

      tokensR4.push(temp[i]["token"]);
    }
    if(temp[i]["status"]==="owner"|| (temp[i]["status"]==="manager" && temp[i]["restaurantId"]===restaurant5)){

      tokensR5.push(temp[i]["token"]);
    }
  }
  console.log("restaurant1 tokens");
  console.log(tokensR1);
  console.log("restaurant2 tokens");
  console.log(tokensR2);
  console.log("restaurant3 tokens");
  console.log(tokensR3);
  console.log("restaurant4 tokens");
  console.log(tokensR4);
  console.log("restaurant5 tokens");
  console.log(tokensR5);
}
async function sendToDevice(tokens){
  console.log("sending notifications to device");
  console.log("printing list of tokens notifications are being sent to ");
  console.log(tokens);
  await fcm.sendToDevice(tokens.filter((value)=>value!==undefined),payload,options)
}
async function sendToAllUserDevices(tokens,notificationMessage){
  const payload = {
    notification: {
      title: "Nueva notificación",
      body: notificationMessage,
    },
  };
  console.log("sending notifications to all user devices");
  console.log("printing list of tokens notifications are being sent to ");
  console.log(tokens);
  await fcm.sendToDevice(tokens.filter((value)=>value!==undefined),payload,options)
}
// exports.sendNotification = functions.firestore
//     .document(`orders/{newOrderId}`)
//     .onCreate(async (snap, context) => {
//       sendToDevice().then(val=>respond.send(val)).catch(e=>response.send(e.toString()));
//     });
exports.sendNotificationR1 = functions.https.onRequest (async(request, response) => {
   await fetchTokens();
    await sendToDevice(tokensR1);
});
exports.sendNotificationR2 = functions.https.onRequest (async(request, response) => {
  await fetchTokens();
  await sendToDevice(tokensR2);
});
exports.sendNotificationR3 = functions.https.onRequest (async(request, response) => {
  await fetchTokens();
  await sendToDevice(tokensR3);
});
exports.sendNotificationR4 = functions.https.onRequest (async(request, response) => {
  await fetchTokens();
  await sendToDevice(tokensR4);
});
exports.sendNotificationR5 = functions.https.onRequest (async(request, response) => {
  await fetchTokens();
  await sendToDevice(tokensR5);
});
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
}

exports.sendNotificationToAllUsers = functions.runWith(runtimeOpts).https.onRequest (async(request, response) => {
  await fetchUserTokens();
  await fetchNotificationMessage();
  await sendToAllUserDevices(userTokens,notificationMessage);
});