
class VotingCard extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      countDownDate: new Date(props.date).getTime(),
      countDownText: this.get_printed_difference_text(new Date(props.date).getTime()),
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
    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = compare - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    var text = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      text = "Finished";
    }

    return text;

  }

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
    var vote_button_text = "Vote";
    if(this.state.countDownText == "Finished") {
      bar_class = "";
      vote_button_text = "Info";
    }

    let component = this;

    let vote_type_id = "vote_type" + this.props.type_id;

    return <div class="p-3 animated fadeIn">
              <div class="card">
                <h5 class="card-header container-fluid" id={vote_type_id}>
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
                  <div class="card-body">
                    <h5 class="card-title">{this.props.title}</h5>
                    <p class="card-text">{this.props.summary}</p>
                    <div id="home_vote_progress" class="progress shadow">
                      <div class={"progress-bar bg-success " + bar_class} role="progressbar" style={{width: for_string}} aria-valuenow={votes_for_per} aria-valuemin="0" aria-valuemax="100">For {this.props.votes_for}</div>
                      <div class={"progress-bar bg-danger " + bar_class} role="progressbar" style={{width: against_string}} aria-valuenow={votes_against_per} aria-valuemin="0" aria-valuemax="100">Against {this.props.votes_against}</div>
                    </div>
                    <div class="pt-3 container-fluid">
                      <div class="row justify-content-end">

                        <button id="home_vote_button"class="btn text-white" onClick={() => {
                          let url = "vote?id=" + this.props.id;
                          window.location.href = "/" + url;
                        }}>{vote_button_text}</button>

                      </div>
                    </div>
                  </div>
            </div>
          </div>
  }

}

class HomePage extends React.Component {


  constructor(props){
    super(props);

    this.state = {
      loading: true

    }

    this.load_data();

    var x = setInterval(function() {
      this.load_data();
    }.bind(this), 5000);


  }

  load_data () {
    $.get("/bill_data", null, (data, status) => {
      this.setState({
        loading: false,
        data: data
      })
    });
  }

  // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
  similarity(s1, s2, editDistance) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  render() {

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('search');
    const finished = urlParams.get('finished');

    if (this.state.loading) {
        return  <div class="container-fluid pt-5">
                  <div class="row justify-content-center">
                    <div id="login_button_loading" class="spinner-border" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                  </div>
                </div>
    }

    let data = this.state.data;

    //Filters Date
    if(finished == "true") {

      data.bills = data.bills.filter(function(a) {
        var diff = (new Date(a.date).getTime() - new Date().getTime());
        let finished = (diff < 0);
        return finished;
      });

    } else {

      data.bills = data.bills.filter(function(a) {
        var diff = (new Date(a.date).getTime() - new Date().getTime());
        let finished = (diff < 0);
        return !finished;
      });
    }

    let similarity = this.similarity;
    let editDistance = this.editDistance;

    if(myParam != null && myParam.length > 0) {
      // Order by edit distance
      data.bills.sort(function(a, b) {

            let similarity_a = similarity(a.title, myParam, editDistance);
            let similarity_b = similarity(b.title, myParam, editDistance);
            return similarity_b - similarity_a;
      })

    }

    let bill_type = {
      0: "Parliamentary Bill",
      1: "Organisation Decision"
    }
    let bills_react = data.bills.map((bill) => {
      return <VotingCard key={bill.id}
                  id={bill.id}
                  type={bill_type[bill.type]}
                  type_id={bill.type}
                  title={bill.title}
                  summary={bill.summary}
                  date={bill.date}
                  votes_for={bill.votes_for}
                  votes_against={bill.votes_against}
      />
    })

    return <div> {bills_react} </div>
  }
}

ReactDOM.render(
  <HomePage/>,
  document.getElementById('inject_home')
);
