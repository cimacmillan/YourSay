


class About extends React.Component {
  render() {
    return <div class="row p-5 justify-content-center animated fadeIn">
            <div class="text-center ">
              <hr></hr>

              <h3>What is YourSay?</h3>
              <p>
                YourSay is a proof-of-concept online direct proxy voting site, created for a University of Bristol Computer Science project by Callum Macmillan.
                Direct proxy voting is where users of the site vote on parliamentary bills themselves, instead of electing a representitive.
                Due to the political system of the UK, representitives are still required, which can be viewed on this site.
                The representitives job is to vote on parliamentary bills that perform the best by popular vote.
                Bills can be viewed and voted on the home screen. You may also submit arguments for and against each bill.
                Other matters may also be voted on like organisational or site changes.
                Once the deadline for a bill has been reached, the voting is locked. The results for each bill can be seen in the Finished Votes section of the site.
              </p>

              <hr></hr>
              <h3>How secure is YourSay?</h3>
              <p>
                This site is a proof-of-concept and does not require the necessary security for real-world voting. 
                On registration, identities are not currently verified, which means it is possible for users to create multiple accounts.
                In terms of user security, passwords are not stored and verification is done using a hashing scheme. In the instance of a full database leak, user's passwords are safe.
              </p>

              <p>
                A full implementation of this site would require intense security as well as real-world verification.
              </p>

            </div>
           </div>
  }
}

ReactDOM.render(
  <About/>,
  document.getElementById('inject_about')
);
