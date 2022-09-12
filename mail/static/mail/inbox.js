document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#email-details').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(){

  // Collect the data from the fields
  const formRecipients = document.querySelector('#compose-recipients').value;
  const formSubject = document.querySelector('#compose-subject').value;
  const formBody = document.querySelector('#compose-body').value;
  console.log(formRecipients, formSubject, formBody);
  console.info(formRecipients);
  
  // Send the data to the API to generate an email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: formRecipients,
        subject: formSubject,
        body: formBody
    })
  })
  .then(response => response.json())
  .then(result => {
          load_mailbox('sent');
          console.log(result);
      });
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#email-details').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mails into mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Call a function for each email of the mailbox
    emails.forEach(function(email){

      // Create the container to gather information of email list
      const element = document.createElement('div');

      // Add the class email-read to change background if email already read
      element.classList.add('emailbox');
      if (email.read){
        element.classList.toggle('email-read');
      }
      
      // Display on the email list each email including sender, subject and timestamp
      element.innerHTML = 
      `<div class="email-sender">${email.sender}</div>
      <div class="email-subject">${email.subject}</div>
      <div class="email-timestamp">${email.timestamp}</div>`

      // Add new emails in the div to each mailbox
    document.querySelector('#emails-view').append(element);

    // Listen for a click on a specific email
    element.addEventListener('click', function() {
      // Display the email details
      display_email(email.id);
      // Change the status to "Read"
      read_email(email.id);
    });
  });
})}

function display_email(email_id){
    
    // show the div for email-details and hide the other blocks
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-details').style.display = 'block';

    // Call the API to get the details of the email
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        // Create the container to show the email details
        const element = document.createElement('div');
        const recipients = email.recipients.join(', ');

        // Add some HTML in the container to display the information of a specific email
        element.innerHTML = `<div class="details-section">
        <div class="details"><span class="label-details">From: </span>${email.sender}</div>
        <div class="details"><span class="label-details">To: </span>${recipients}</div>
        <div class="details"><span class="label-details">Subject: </span>${email.subject}</div>
        <div class="details"><span class="label-details">Timestamp: </span>${email.timestamp}</div>
    </div>

    <div class="action-buttons">
        <div class="reply-button"><button class="btn btn-outline-primary">Reply</button></div>
        <div class="archive-button"><button class="btn btn-outline-secondary" id="archive">Archive</button></div>
    </div>
    
    <div class="body-section">
        <div class="body">
            <p>${email.body}</p>
        </div>
    </div>`
    
    // Add the new HTML to the div email-details
    document.querySelector('#email-details').append(element);

    // Action to reply to an email
    const reply = document.querySelector('.reply-button')
    reply.addEventListener('click', function(){
      console.log('reply button clicked');
      reply_email(email_id);
    })

    // Check if email is actually archived
    if(email.archived == false){

    // If not archived, Action to archive email
    const archive = document.querySelector('.archive-button')
    archive.innerHTML=`<div class="archive-button"><button class="btn btn-outline-secondary" id="archive">Archive</button></div>`
    archive.addEventListener('click', function(){
      archive_email(email.id);
    })

    // If archived, Action to unarchive email
    } else {
    const archive = document.querySelector('.archive-button')
    archive.innerHTML=`<div class="archive-button"><button class="btn btn-outline-secondary" id="archive">Unarchive</button></div>`
    archive.addEventListener('click', function(){
      unarchive_email(email.id);
    })
  }})
}

function read_email(email_id){
  // Change the status to Read = true
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archive_email(email_id){
  // Archive an email by changing status Archive = True
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(result => {
    // Then load the Archive Mailbox
    load_mailbox('archive');
  });
  return false;
}

function unarchive_email(email_id){
  // Unarchive an email by changing status Archive = False
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(result => {
    // Then load the Inbox Mailbox
    load_mailbox('inbox');
  });
  return false;
}

function reply_email(email_id){
  // Retrieve details of a specific email
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email =>{
  
      // Load the form
      compose_email()

      // Then prepopulate the fields with the data retrieved
      document.querySelector('#compose-recipients').value = email.sender;

      // Check if first reply
      if (email.subject.slice(0, 3) === 'Re:'){
        document.querySelector('#compose-subject').value = email.subject;
      } else {
        document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
      }
      document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + email.body;
    })
}