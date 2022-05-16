document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  load_mailbox('inbox');
});

function load_mailbox(mailbox) {
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      var div=document.createElement('div')
      div.className='list'
      if(email.read)
      {
        div.style.background='lightgray';
      }
      div.innerHTML=`<span><strong>${email.sender}</strong> ${email.subject}</span>  <span>${email.spam}</span> <span class="timestamp">${email.timestamp}<span>`
      div.addEventListener('click',()=>load_mail(email,mailbox));
      document.querySelector('#emails-view').append(div)
    });
  });
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function load_mail(email,mailbox){
  document.querySelector('#detailed-view').style.display = 'block';
  document.querySelector('#detailed-view').innerHTML="";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  fetch(`/emails/${email.id}`,{
    method:'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(mail => {
    var content=document.createElement('div')
    content.className='content'
    var details_div=document.createElement('div')
    details_div.className='details'
    details_div.innerHTML=`
      <span><strong>From: </strong>${mail.sender}</span>
      <span><strong>To: </strong>${mail.recipients}</span>
      <span><strong>Subject: </strong>${mail.subject}</span>
      <span><strong>Timestamp: </strong>${mail.timestamp}</span>`
    
    var reply_btn_div=document.createElement('div')
    var reply_btn=document.createElement('button')
    reply_btn.innerHTML='Reply'
    reply_btn.id='reply'
    reply_btn.className='btn btn-sm btn-outline-primary'
    reply_btn.addEventListener('click',()=>{
      compose_email()
      if(mailbox==='sent')
        document.querySelector('#compose-recipients').value=mail.recipients;
      else
        document.querySelector('#compose-recipients').value=mail.sender;
      document.querySelector('#compose-recipients').disabled=true;
      if (mail.subject.slice(0,4)==='Re: ')
      {
        document.querySelector('#compose-subject').value=mail.subject;
      }
      else // Adding "Re: " in subject if not already present
      {
        document.querySelector('#compose-subject').value=`Re: ${mail.subject}`
      }
      document.querySelector('#compose-body').value=`On ${mail.timestamp} ${mail.sender} wrote:  ${mail.body}\n`
    })
    
    reply_btn_div.style.padding='8px'
    reply_btn_div.append(reply_btn)
    details_div.append(reply_btn_div)
    content.append(details_div);

    if(mailbox!=='sent') // Displaying archive/unarchive button only if an email is not sent one
    {
      var archive_btn_div=document.createElement('div')
      archive_btn_div.className='archive';
      var archive_btn = document.createElement('button')
      if(!mail.archived)
      {
        archive_btn.innerHTML='Archive'
      }
      else{
        archive_btn.innerHTML='Unarchive'
      }
      archive_btn.className='btn btn-sm btn-outline-primary'
      archive_btn.addEventListener('click',()=>{
        fetch(`/emails/${mail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !mail.archived
          })
        })
        .then(
          ()=>load_mailbox('inbox')
        )
      })
      archive_btn_div.append(archive_btn);
      content.append(archive_btn_div);
    }
    var para=document.createElement('p')
    para.innerHTML=mail.body
    document.querySelector('#detailed-view').append(content);
    document.querySelector('#detailed-view').append(document.createElement('hr'));
    document.querySelector('#detailed-view').append(para);
  })
  .catch(error => {
    document.querySelector('#detailed-view').innerHTML=error
  })
}

function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-recipients').disabled=false;
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('form').onsubmit= () =>{
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      if(result.error)
      {
        alert(result.error)
      }
      else{
        alert(result.message)
        load_mailbox('sent')
      }
    })
    .catch(error => {
      alert(error)
    })
    return false;
  }
}