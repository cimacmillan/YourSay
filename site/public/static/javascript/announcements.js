
class Announcement extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return <div class="p-3" dangerouslySetInnerHTML={{ __html: this.props.html}}/>
  }
};

class Announcements extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {


    let components = this.props.announcements.map(
      (announcement) => {
        return <Announcement html={announcement.html}/>;
      }
    );

    return <div class="row p-5 justify-content-center animated fadeIn">
            <div class="text-center ">
              {components}
            </div>
           </div>
  }
};

class AnnouncementLoadingFailure extends React.Component {
  render() {
    return <div class="row p-5 justify-content-center animated fadeIn">
            <div class="text-center ">
              <h3>Could not load announcements</h3>
            </div>
           </div>
  }
}

$.get("/announcement_data", null, (data, status) => {
  console.log(data);
  console.log(status);
  if(status == 'success') {
    // Assuming my own html isn't a virus
    ReactDOM.render(
      <Announcements announcements={data.announcements}/>,
      document.getElementById('inject_announcements')
    );
  } else {
    ReactDOM.render(
      <AnnouncementLoadingFailure/>,
      document.getElementById('inject_announcements')
    );
  }
});
