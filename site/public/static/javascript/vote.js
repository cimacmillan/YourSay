
  // <p>{this.props.opinion.first_name} - {this.props.opinion.occupation} - {this.props.opinion.company} </p>

class UpvoteButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      toggle: props.voted_for
    };
    this.onClick = this.onClick.bind(this)
  }

  onClick(){

    let toggle = !this.state.toggle;

    this.setState({
      toggle: toggle
    })

    let id = this.props.id;

    let data = {
      argument_id: id,
      toggle: toggle
    }

    $.post("/vote_arg", data, (data, status) => {
      if(data == "success") {

        this.props.load_data();
      }
    })

    // console.log(this.props.load_data)
  }

  render () {
    var image = "img/upvote_blank.png";
    var animation = ""

    if (this.state.toggle) {
      image = "img/upvote_selected.png";
      animation = "animated bounceIn"
    }
    return <img id="vote_upvote" class={"align-self-center " + animation} src={image} alt="up" height="auto" width="42" onClick={this.onClick}/>
  }
}

class VoteOpinion extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    let popover = <ReactBootstrap.Popover id="popover-basic" title={this.props.opinion.name}>
                    {this.props.opinion.occupation} at {this.props.opinion.occupation_location}
                    </ReactBootstrap.Popover>

    let for_against = this.props.for ? "opinion_for" : "opinion_against";

    return  <div class="p-3">
              <div class={"card " + for_against}>
              <div class="media">

                <ReactBootstrap.OverlayTrigger trigger="hover" placement="right" overlay={popover}>
                  <img class="align-self-center m-2 image-cropper shadow" src={this.props.opinion.image_url}/>
                </ReactBootstrap.OverlayTrigger>

                <div class="align-self-center media-body p-2">
                  <p><small>{this.props.opinion.comment}</small></p>
                </div>

                <div class="align-self-center m-2">
                  <UpvoteButton voted_for={this.props.opinion.voted_for} load_data={this.props.load_data} id={this.props.opinion.id}/>
                  <p class="p-0 m-0"><small>{this.props.opinion.votes_for}</small></p>
                </div>

              </div>
              </div>
            </div>
  }
}

class VoteProgess extends React.Component {
  render() {

    let boundary = 18;
    let total_votes = this.props.votes_for + this.props.votes_against;
    let votes_for_per = Math.floor((this.props.votes_for / total_votes) * 100);
    if(total_votes == 0) votes_for_per = 50;
    if (votes_for_per > (100 - boundary)) votes_for_per = (100 - boundary);
    if (votes_for_per < boundary) votes_for_per = boundary;
    let votes_against_per = 100 - votes_for_per;
    let for_string = votes_for_per + "%";
    let against_string = votes_against_per + "%";

    var bar_class = "progress-bar-striped progress-bar-animated";

    if(this.props.finished) {
      bar_class = "";
    }

    let component = this;

    return  <div id="home_vote_progress" class="progress shadow">
              <div class={"progress-bar bg-success " + bar_class} role="progressbar" style={{width: for_string}} aria-valuenow={votes_for_per} aria-valuemin="0" aria-valuemax="100">For {this.props.votes_for}</div>
              <div class={"progress-bar bg-danger " + bar_class} role="progressbar" style={{width: against_string}} aria-valuenow={votes_against_per} aria-valuemin="0" aria-valuemax="100">Against {this.props.votes_against}</div>
            </div>
  }
}

class VoteBody extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      argument_for_input: "",
      argument_against_input: ""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleArgumentSubmit = this.handleArgumentSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleArgumentSubmit(event) {
    if (event.key === 'Enter') {

      if(event.target.value.length == 0) return;

      let for_against = (event.target.name == "argument_for_input") ? 0 : 1;

      console.log("submitting argument " + for_against + " - "+ event.target.value);

      let data = {
        vote_id: this.props.id,
        for_against: for_against,
        argument: event.target.value
      }

      let state_name = event.target.name;

      $.post(
        "/vote_arg_submit", data, ((data, status) => {

            if(status == "success") {
              this.setState({[state_name]: ""});
              this.props.load_data();
            }

            console.log(data, status)
        }).bind(this))

    }
  }

  render() {

    var divs = [];
    var i = 0;
    for(i = 0; i < this.props.bullet.length; i++){
      divs.push(
        <li key={i}>{this.props.bullet[i]}</li>
      );
    }

    let for_class = this.props.voted_for ? " active" : ""
    let against_class = this.props.voted_against ? " active" : ""

    var diff = (new Date(this.props.date).getTime() - new Date().getTime());
    let finished = (diff < 0);


    let vote_button = <div>
                        <hr/>
                        <div class="text-center">
                          <h5 class="card-title">Vote</h5>
                          <p class="card-text">It may take some moments for your vote to register</p>
                        </div>

                        <div class="btn-group special btn-group-toggle" data-toggle="buttons">
                          <label class={"btn btn-success btn-lg btn-block" + for_class} onClick={this.props.vote_for}>
                            <input type="radio" name="options" id="option1" autoComplete="off"/> For
                          </label>
                          <label class={"btn btn-danger btn-lg btn-block" + against_class} onClick={this.props.vote_against}>
                            <input type="radio" name="options" id="option2" autoComplete="off"/> Against
                          </label>
                        </div>
                      </div>

    if (finished) vote_button = <div> </div>

    var opinions_for_jsx = [];
    var opinions_against_jsx = [];

    console.log(this.props.opinions_for);

    this.props.opinions_for.sort((a, b) => {
      if(a.votes_for > b.votes_for) {
        return -1;
      }
      return 1;
    });
    this.props.opinions_against.sort((a, b) => {
      if(a.votes_for > b.votes_for) {
        return -1;
      }
      return 1;
    });

    for(var i = 0; i < this.props.opinions_for.length; i++) {
      opinions_for_jsx.push(<VoteOpinion key={this.props.opinions_for[i].id} opinion={this.props.opinions_for[i]} for={true} load_data={this.props.load_data}/>);
    }

    for(var i = 0; i < this.props.opinions_against.length; i++) {
      opinions_against_jsx.push(<VoteOpinion key={this.props.opinions_against[i].id} opinion={this.props.opinions_against[i]} for={false} load_data={this.props.load_data}/>);
    }

    return <div class="card-body">

            <div class="text-center ">
              <h5 class="card-title">{this.props.title}</h5>
              <p class="card-text">{this.props.summary}</p>
            </div>

            <hr/>
            <h5 class="card-title">Brief Summary</h5>
            <ul class="card-text"> {divs} </ul>
            <a href={this.props.full_text_link}>Link to full text</a>


            <div class="text-center row">
              <div class="col-md">
                <hr/>
                <h5>Arguments <div class="text-success"> For </div> </h5>
                <hr/>
                <div class="opinion_scroll">
                  {opinions_for_jsx}
                </div>

                <input type="text" class="form-control" name="argument_for_input" placeholder="Write your argument for" onChange={this.handleChange} value={this.state.argument_for_input} onKeyDown={this.handleArgumentSubmit}/>

              </div>
              <div class="col-md">
                <hr/>
                <h5>Arguments <div class="text-danger"> Against </div> </h5>
                <hr/>
                <div class="opinion_scroll">
                  {opinions_against_jsx}
                </div>

                <input type="text" class="form-control" name="argument_against_input" placeholder="Write your argument against" onChange={this.handleChange} value={this.state.argument_against_input} onKeyDown={this.handleArgumentSubmit}/>

              </div>
            </div>

            <hr/>

            <div class="text-center ">
              <h5 class="card-title">Turnout</h5>
            </div>
            <VoteProgess date={this.props.date} votes_for={this.props.votes_for} votes_against={this.props.votes_against} finished={finished}/>

            {vote_button}

           </div>
  }
}

class VoteHeader extends React.Component {

  constructor(props){
    super(props);

    let countdown = new Date(props.date).getTime();

    this.state = {
      countDownDate: countdown,
      countDownText: this.get_printed_difference_text(countdown),
    }

    const component = this;
    // Update the count down every 1 second
    var x = setInterval(function() {
      component.setState({
        countDownText: component.get_printed_difference_text(component.state.countDownDate),
      })
    }, 1000);

  }

  get_printed_difference_text(compare) {
    var now = new Date().getTime();

    var distance = compare - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var text = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

    if (distance < 0) {
      text = "Finished";
    }

    return text;

  }

  render() {

    let type_id_class = "vote_type" + this.props.type_id;

    return <h5 class="card-header container-fluid" id={type_id_class}>
            <div class="row">
              <div class="col">
                {this.props.type}
              </div>

              <div class="col">
                <div class="row justify-content-end pr-3">
                  {this.state.countDownText}
                </div>
              </div>
            </div>
          </h5>
  }
}

class Vote extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      bill: null
    }

    this.load_data();

    var x = setInterval(function() {
      this.load_data();
    }.bind(this), 5000);

  }

  load_data() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('id');

    if (myParam == null || myParam.length == 0 || !isNormalInteger(myParam)) {
        window.location.href = "/home";
    }

    let url_request = "/bill_data/" + myParam;
    let component = this;

    $.get(url_request, null, (data, status) => {

      data.bill.bulleted_list = data.bill.bulleted_list.split("\n");

      component.setState({
        loading: false,
        bill: data.bill
      })

    });
  }

  send_vote(data) {


    $.post("/vote_bill", data, (data, status) => {
      if(data == "success") {
        this.load_data();
      }

    })
  }

  vote_for() {
    if(this.state.bill.voted_for) return;

    // this.setState({loading: true})

    let data = {
      vote_id: this.state.bill.id,
      for_against: 0
    }

    this.send_vote(data)

  }

  vote_against() {
    if(this.state.bill.voted_against) return;

    // this.setState({loading: true})

    let data = {
      vote_id: this.state.bill.id,
      for_against: 1
    }

    this.send_vote(data)
  }

  render() {

    if (this.state.loading) {
      return  <div class="container-fluid pt-5">
                <div class="row justify-content-center">
                  <div id="login_button_loading" class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
    }

    let bill_type = {
      0: "Parliamentary Bill",
      1: "Organisation Decision"
    }

    return <div class="p-3 animated fadeIn">
              <div class="card">
                <VoteHeader type={bill_type[this.state.bill.type]} date={this.state.bill.date} type_id={this.state.bill.type}/>
                <VoteBody title={this.state.bill.title}
                          summary={this.state.bill.summary}
                          bullet={this.state.bill.bulleted_list}
                          full_text_link={this.state.bill.text_link}
                          date={this.state.bill.date}
                          votes_for={this.state.bill.votes_for}
                          votes_against={this.state.bill.votes_against}
                          voted_for={this.state.bill.voted_for}
                          voted_against={this.state.bill.voted_against}

                          opinions_for={this.state.bill.arguments_for}
                          opinions_against={this.state.bill.arguments_against}

                          vote_for={this.vote_for.bind(this)}
                          vote_against={this.vote_against.bind(this)}

                          load_data={this.load_data.bind(this)}

                          id={this.state.bill.id}
                          />
            </div>
          </div>
  }
}

class Opinion {
    constructor(first_name, occupation, company, image_url, votes, voted_for, text) {
        this.first_name = first_name;
        this.occupation = occupation;
        this.company = company;
        this.image_url = image_url;
        this.votes = votes;
        this.voted_for = voted_for;
        this.text = text;
    }
}

//https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}



ReactDOM.render(
  <Vote/>,
  document.getElementById('inject_vote')
);
