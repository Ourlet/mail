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
    // Print emails
    console.log(emails);

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
      console.log(`This email ${email.id} has been clicked!`)
      console.log(`${email.id}`);
      display_email(email.id);
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
        // Print email
        console.log(email);
    
        // Create the container to show the email details
        const element = document.createElement('div');

        // Add some HTML in the container to display the information of a specific email
        element.innerHTML = `<div class="details-section">
        <div class="details"><span class="label-details">From: </span>${email.sender}</div>
        <div class="details"><span class="label-details">To: </span>${email.recepients}</div>
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

    // 
    const archive = document.querySelector('.archive-button')
    archive.addEventListener('click', function(){
      console.log('archive button clicked');
      archive_email(email.id);
    })
  })
}

function read_email(email_id){
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archive_email(email_id){
  // Archive an email 
   console.log('archive');
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(result => {
    load_mailbox('archive');
    console.log(result);
  });
  return false;
}


https://www.edreams.ch/travel/secure/?landingPageType=PASSENGER&locale=fr_CH&mktportal=kayak-flex&searchId=159415618436&searchMainProductTypeName=FLIGHT&testToken=20%23133603742043-6%2340736-12%2339739396680-5%23133534595597-22%23133628282684-19%23132753246031-13%2339739410226-18%2374177641791-7%2379846-8%23143399588788-2%23133567291254-15%23143385544855-16%23133623036599-10%23126056696621-1%2325751839532-17%23143385544861-9%23133698516031-3%23133580107943-21%23133657971882-14%23143432531467-11%23130120611667-4%23144797053552&testTokenDate=2022-08-09T09%3A02%3A20&utm_campaign=GVA-BRU&utm_content=meta-ch&utm_medium=metasearch&utm_source=kayak-flex&utm_term=flight&fareItineraryKey=0,TF&segmentKey0=1,LX2809,LX780&segmentKey1=1,LX791&utm_content=sl7zPE3zkInGT3CuuBphJQ&utm_source=momondo-flex#mytripslogin/