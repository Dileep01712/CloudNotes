import React from 'react'

const About = (props) => {

  return (
    <>
      <div className="signup-container mx-auto" id='About' style={{ width: '90%', color: props.mode === 'light' ? 'black' : 'white' }}>
        <div>
          <h1>Welcome to CloudNotes!</h1>
          <p>At CloudNotes, we're dedicated to providing you with a seamless and secure platform for storing your notes on the cloud. Our application is designed with simplicity and functionality in mind, allowing you to effortlessly create, update, and delete your notes from any device, anywhere.</p>
        </div>
        <div>
          <h3>What Sets Us Apart?</h3>
          <ul>
            <li>Cross-Platform Accessibility: Access your notes seamlessly across various platforms, including desktop, tablet, and mobile. Your notes are always at your fingertips, whether you're at home, in the office, or on the go.</li>
            <li>User-Friendly Interface: Our intuitive and user-friendly interface ensures that managing your notes is a breeze. Focus on what matters – your thoughts – without the hassle.</li>
            <li>Secure Cloud Storage:Your notes are precious, and we take their security seriously. Enjoy the peace of mind that comes with storing your notes in our secure cloud storage environment.</li>
          </ul>
        </div>
        <div>
          <h3>Get Started Today!</h3>
          <p>Join our community of users who are already experiencing the convenience of cloud-based note management. Create your account today and elevate your note-taking experience to new heights.</p>
          <p>Thank you for choosing CloudNotes!</p>
        </div>
      </div>
    </>
  )
}

export default About
