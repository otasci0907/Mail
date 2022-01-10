document.addEventListener('DOMContentLoaded', function() {
console.log("LOADED CONTENT!");
// Use buttons to toggle between views
document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
document.querySelector('#compose').addEventListener('click', compose_email);

// By default, load the inbox
load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(element => {
        if (mailbox != "sent") {
          sender_recipients = element.sender;
        } else {
          sender_recipients = element.recipients;
        }
        if (mailbox == "inbox") {
          if (element.read) is_read = "read";
          else is_read = "";
        } else is_read = "";
        var item = document.createElement("div");
        item.className = `card ${is_read} text-dark items border-dark`;

        item.innerHTML = `<div class="card-body" id="item-${element.id}" style="margin-top: 15px;">

        ${sender_recipients} <br> ${element.subject} <br> ${element.timestamp}
      </div>`;
        document.querySelector("#emails-view").appendChild(item);
        item.addEventListener("click", () => {
          displayMail(element.id, mailbox);
        });
      });
    });
}

//Display the incoming email
function displayMail(id, mailbox){
    fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
    document.querySelector("#emails-view").innerHTML = "";
    //Create div to show email Detailss
    var data = document.createElement("div");
    data.innerHTML = `
    <strong>From:</strong> ${email.sender}<br>
    <strong>To:</strong> ${email.recipients}<br>
    <strong>Subject:</strong> ${email.subject}<br>
    <strong>Timestamp:</strong> ${email.timestamp}<br>
    <hr>
    ${email.body} <hr>`;
    document.querySelector("#emails-view").appendChild(data);
    // Mailbox page was from sent then don't display Button
    if(mailbox == "sent"){
      return;
    }
    //Creating button of Archive
    let archive = document.createElement("btn");
    archive.className = `btn btn-outline-info my-2`;
    archive.addEventListener("click", () => {
      makeArchive(id,email.archived);
      //change button text
      if(archive.innerText == "Archive")
        archive.innerText = "Unarchive";
      else
        archive.innerText = "Archive";
    });
    //Creating reply icon
    let reply = document.createElement("div");
    reply.innerHTML = `<svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-arrow-90deg-left" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-top:10px;">
    <path fill-rule="evenodd" d="M6.104 2.396a.5.5 0 0 1 0 .708L3.457 5.75l2.647 2.646a.5.5 0 1 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0z"/>
    <path fill-rule="evenodd" d="M2.75 5.75a.5.5 0 0 1 .5-.5h6.5a2.5 2.5 0 0 1 2.5 2.5v5.5a.5.5 0 0 1-1 0v-5.5a1.5 1.5 0 0 0-1.5-1.5h-6.5a.5.5 0 0 1-.5-.5z"/>
    </svg> <p><strong>Reply</strong></p>`;
    reply.addEventListener('click', () => {
    replyToMail(email.sender, email.subject, email.body, email.timestamp);
    });
    document.querySelector("#emails-view").appendChild(reply);
    if (!email.archived) archive.textContent = "Archive";
    else archive.textContent = "Unarchive";
    document.querySelector("#emails-view").appendChild(archive);
    markRead(id);
  });
}
//Function to make reply
function replyToMail(to,subject,body,timestamps){
  compose_email();
  if (subject.slice(0,4) != "Re: "){
    subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = to;
  document.querySelector("#compose-subject").value = subject;
  message = `On ${timestamps} ${to} wrote:\n${body}\n`;
  document.querySelector("#compose-body").value = message;
}
}

//Archive function
function makeArchive(id,value){
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({archived: !value,}),
  });
  if(value == 0){
    load_mailbox("archive");
  }else{
    load_mailbox("inbox");
  }
}

//Function to mark email on read
function markRead(id){
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({read: true,}),
  });
}

/*____END____*/
